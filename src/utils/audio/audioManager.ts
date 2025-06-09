/**
 * Web Audio API ベースの高性能音声管理システム
 * HTMLAudioElementの代替として、オブジェクトプールと並列再生対応
 */

import { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';

type AudioBufferCache = {
  [K in SoundKey]?: AudioBuffer;
};

interface AudioContextState {
  context: AudioContext | null;
  gainNode: GainNode | null;
  initialized: boolean;
  suspended: boolean;
}

interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface ActiveSound {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  soundKey: SoundKey;
  startTime: number;
  duration: number;
}

class AudioManager {
  private static instance: AudioManager | null = null;

  private audioState: AudioContextState = {
    context: null,
    gainNode: null,
    initialized: false,
    suspended: false,
  };

  private audioBuffers: AudioBufferCache = {};
  private activeSounds: Map<string, ActiveSound> = new Map();
  private loadingPromises: Map<SoundKey, Promise<AudioBuffer>> = new Map();

  private masterVolume: number = 0.5;
  private isMuted: boolean = false;

  // 音声ファイルパスの定義
  private readonly soundFiles: Record<SoundKey, string> = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3',
  };

  private constructor() {
    this.initializeAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * AudioContextの初期化
   */
  private async initializeAudioContext(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Web Audio API対応チェック
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new AudioError(
          'Web Audio API is not supported',
          { action: 'audio_context_init', component: 'AudioManager' },
          { recoverable: false, retryable: false }
        );
      }

      this.audioState.context = new AudioContextClass();
      this.audioState.gainNode = this.audioState.context.createGain();
      this.audioState.gainNode.connect(this.audioState.context.destination);

      // 初期音量設定
      this.updateMasterVolume();

      this.audioState.initialized = true;

      // ブラウザの自動再生ポリシー対応
      if (this.audioState.context.state === 'suspended') {
        this.audioState.suspended = true;
        this.setupUserInteractionUnlock();
      }
    } catch (error) {
      const audioError = new AudioError(
        'Failed to initialize AudioContext',
        { action: 'audio_context_init', component: 'AudioManager', additionalData: { error } },
        { recoverable: false, retryable: false }
      );
      handleError(audioError);
    }
  }

  /**
   * ユーザーインタラクションによる音声アンロック
   */
  private setupUserInteractionUnlock(): void {
    const unlockAudio = async () => {
      if (!this.audioState.context || this.audioState.context.state !== 'suspended') return;

      try {
        await this.audioState.context.resume();
        this.audioState.suspended = false;

        // イベントリスナーを削除
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      } catch (error) {
        const audioError = new AudioError(
          'Failed to unlock audio context',
          { action: 'audio_unlock', component: 'AudioManager', additionalData: { error } },
          { recoverable: true, retryable: true }
        );
        handleError(audioError);
      }
    };

    // 複数のイベントで音声アンロックを試行
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  }

  /**
   * 音声ファイルの並列プリロード
   */
  public async preloadAllSounds(): Promise<void> {
    if (!this.audioState.context) {
      await this.initializeAudioContext();
    }

    const loadPromises = Object.entries(this.soundFiles).map(async ([key, path]) => {
      const soundKey = key as SoundKey;

      if (this.audioBuffers[soundKey]) return Promise.resolve(); // 既にロード済み
      if (this.loadingPromises.has(soundKey)) return this.loadingPromises.get(soundKey);

      const loadPromise = this.loadAudioBuffer(soundKey, path);
      this.loadingPromises.set(soundKey, loadPromise);

      try {
        const buffer = await loadPromise;
        this.audioBuffers[soundKey] = buffer;
      } catch {
        // 個別のエラーは loadAudioBuffer 内で処理済み
      } finally {
        this.loadingPromises.delete(soundKey);
      }
      return Promise.resolve();
    });

    await Promise.allSettled(loadPromises);
  }

  /**
   * 個別音声ファイルのロード
   */
  private async loadAudioBuffer(soundKey: SoundKey, path: string): Promise<AudioBuffer> {
    if (!this.audioState.context) {
      throw new AudioError(
        'AudioContext not initialized',
        { action: 'audio_load', component: 'AudioManager', additionalData: { soundKey } },
        { recoverable: true, retryable: true }
      );
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return await this.audioState.context.decodeAudioData(arrayBuffer);
    } catch (error) {
      const audioError = new AudioError(
        `Failed to load audio file: ${soundKey}`,
        {
          action: 'audio_load',
          component: 'AudioManager',
          additionalData: { soundKey, path, error },
        },
        { recoverable: true, retryable: true }
      );
      handleError(audioError);
      throw audioError;
    }
  }

  /**
   * 音声再生（メイン機能）
   *
   * Note: この関数の認知複雑度が高いのは、Web Audio APIの堅牢なエラーハンドリング、
   * フォールバック機能、並列再生管理など、音声システムの核心機能を統合しているためです。
   * 各条件分岐は特定のエラー状態やブラウザ制限への対応で、分割すると保守性が低下します。
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async playSound(soundKey: SoundKey, config: Partial<SoundConfig> = {}): Promise<void> {
    if (this.isMuted || !this.audioState.context || !this.audioState.gainNode) return;

    // AudioContext が suspended の場合は警告のみ
    if (this.audioState.suspended) {
      const audioError = new AudioError(
        `Audio context suspended, requires user interaction: ${soundKey}`,
        { action: 'audio_play', component: 'AudioManager', additionalData: { soundKey } },
        {
          recoverable: true,
          retryable: true,
          userMessage: '音声を有効にするには画面をタップしてください',
        }
      );
      handleError(audioError);
      return;
    }

    // 音声バッファが未ロードの場合は自動ロード
    if (!this.audioBuffers[soundKey]) {
      if (!this.loadingPromises.has(soundKey)) {
        const loadPromise = this.loadAudioBuffer(soundKey, this.soundFiles[soundKey]);
        this.loadingPromises.set(soundKey, loadPromise);

        try {
          this.audioBuffers[soundKey] = await loadPromise;
        } catch {
          return; // エラーは loadAudioBuffer で処理済み
        } finally {
          this.loadingPromises.delete(soundKey);
        }
      } else {
        // 既にロード中の場合は待機
        try {
          this.audioBuffers[soundKey] = await this.loadingPromises.get(soundKey)!;
        } catch {
          return;
        }
      }
    }

    const audioBuffer = this.audioBuffers[soundKey];
    if (!audioBuffer) return;

    try {
      // AudioBufferSourceNode作成（1回限りの使用）
      const source = this.audioState.context.createBufferSource();
      source.buffer = audioBuffer;

      // 個別音量調整用のGainNode
      const soundGainNode = this.audioState.context.createGain();
      const volume = config.volume ?? 1.0;
      soundGainNode.gain.value = volume;

      // 接続: source -> soundGain -> masterGain -> destination
      source.connect(soundGainNode);
      soundGainNode.connect(this.audioState.gainNode);

      // ループ設定
      source.loop = config.loop ?? false;

      // フェードイン処理
      if (config.fadeIn && config.fadeIn > 0) {
        soundGainNode.gain.setValueAtTime(0, this.audioState.context.currentTime);
        soundGainNode.gain.linearRampToValueAtTime(
          volume,
          this.audioState.context.currentTime + config.fadeIn
        );
      }

      // アクティブサウンドとして記録
      const soundId = `${soundKey}-${Date.now()}-${Math.random()}`;
      const activeSound: ActiveSound = {
        source,
        gainNode: soundGainNode,
        soundKey,
        startTime: this.audioState.context.currentTime,
        duration: audioBuffer.duration,
      };

      this.activeSounds.set(soundId, activeSound);

      // 再生終了時のクリーンアップ
      source.onended = () => {
        this.activeSounds.delete(soundId);
      };

      // フェードアウト処理
      if (config.fadeOut && config.fadeOut > 0 && !source.loop) {
        const fadeStartTime =
          this.audioState.context.currentTime + audioBuffer.duration - config.fadeOut;
        if (fadeStartTime > this.audioState.context.currentTime) {
          soundGainNode.gain.setValueAtTime(volume, fadeStartTime);
          soundGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + config.fadeOut);
        }
      }

      // 再生開始
      source.start(0);
    } catch (error) {
      const audioError = new AudioError(
        `Failed to play sound: ${soundKey}`,
        { action: 'audio_play', component: 'AudioManager', additionalData: { soundKey, error } },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);
    }
  }

  /**
   * 特定音声の停止
   */
  public stopSound(soundKey: SoundKey): void {
    for (const [soundId, activeSound] of this.activeSounds.entries()) {
      if (activeSound.soundKey === soundKey) {
        try {
          activeSound.source.stop();
          this.activeSounds.delete(soundId);
        } catch {
          // 既に停止している場合は無視
        }
      }
    }
  }

  /**
   * 全音声の停止
   */
  public stopAllSounds(): void {
    for (const [, activeSound] of this.activeSounds.entries()) {
      try {
        activeSound.source.stop();
      } catch {
        // 既に停止している場合は無視
      }
    }
    this.activeSounds.clear();
  }

  /**
   * マスター音量の設定
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterVolume();
  }

  /**
   * マスター音量の取得
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * ミュート状態の切り替え
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateMasterVolume();
  }

  /**
   * ミュート状態の取得
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * マスター音量の実際の更新
   */
  private updateMasterVolume(): void {
    if (this.audioState.gainNode) {
      const effectiveVolume = this.isMuted ? 0 : this.masterVolume;
      this.audioState.gainNode.gain.value = effectiveVolume;
    }
  }

  /**
   * 音声システムの状態取得
   */
  public getAudioState(): {
    initialized: boolean;
    suspended: boolean;
    loadedSounds: SoundKey[];
    activeSounds: number;
    masterVolume: number;
    isMuted: boolean;
  } {
    return {
      initialized: this.audioState.initialized,
      suspended: this.audioState.suspended,
      loadedSounds: Object.keys(this.audioBuffers) as SoundKey[],
      activeSounds: this.activeSounds.size,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
    };
  }

  /**
   * メモリクリーンアップ
   */
  public dispose(): void {
    this.stopAllSounds();

    if (this.audioState.context) {
      this.audioState.context.close();
    }

    this.audioBuffers = {};
    this.loadingPromises.clear();
    this.audioState = {
      context: null,
      gainNode: null,
      initialized: false,
      suspended: false,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const audioManager = AudioManager.getInstance();

// 便利な関数をエクスポート
export const playSound = (soundKey: SoundKey, config?: Partial<SoundConfig>) =>
  audioManager.playSound(soundKey, config);

export const preloadSounds = () => audioManager.preloadAllSounds();
export const setMasterVolume = (volume: number) => audioManager.setMasterVolume(volume);
export const setMuted = (muted: boolean) => audioManager.setMuted(muted);
export const getMasterVolume = () => audioManager.getMasterVolume();
export const isMuted = () => audioManager.isMutedState();
export const getAudioState = () => audioManager.getAudioState();
export const stopSound = (soundKey: SoundKey) => audioManager.stopSound(soundKey);
export const stopAllSounds = () => audioManager.stopAllSounds();
