/**
 * 堅牢な音声フォールバックシステム
 * 段階的フォールバック、エラー回復、代替手段
 */

import { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';

interface FallbackLevel {
  name: string;
  available: boolean;
  priority: number; // 1-5, 5が最優先
  testResult?: boolean;
}

interface FallbackConfig {
  enableFallback: boolean;
  maxRetries: number;
  fallbackDelay: number; // ms
  silentMode: boolean; // 完全無音モード
}

interface AudioCapabilities {
  webAudio: boolean;
  htmlAudio: boolean;
  audioContextSupport: boolean;
  mp3Support: boolean;
  codecs: string[];
  autoplayPolicy: 'allowed' | 'restricted' | 'blocked';
}

class AudioFallbackManager {
  private static instance: AudioFallbackManager | null = null;

  private fallbackLevels: FallbackLevel[] = [];
  private currentLevel: number = 0;
  private capabilities: AudioCapabilities | null = null;
  private config: FallbackConfig = {
    enableFallback: true,
    maxRetries: 3,
    fallbackDelay: 500,
    silentMode: false,
  };

  // 各フォールバックレベルでの音声インスタンス
  private audioInstances: Map<string, Map<SoundKey, HTMLAudioElement | AudioBuffer>> = new Map();
  private fallbackCallbacks: Map<string, (soundKey: SoundKey) => Promise<void>> = new Map();

  private constructor() {
    this.initializeFallbackLevels();
  }

  public static getInstance(): AudioFallbackManager {
    if (!AudioFallbackManager.instance) {
      AudioFallbackManager.instance = new AudioFallbackManager();
    }
    return AudioFallbackManager.instance;
  }

  /**
   * フォールバックレベルの初期化と検出
   */
  private async initializeFallbackLevels(): Promise<void> {
    this.capabilities = await this.detectAudioCapabilities();

    this.fallbackLevels = [
      {
        name: 'web-audio-api',
        available: this.capabilities.webAudio && this.capabilities.audioContextSupport,
        priority: 5,
      },
      {
        name: 'html-audio-element',
        available: this.capabilities.htmlAudio && this.capabilities.mp3Support,
        priority: 4,
      },
      {
        name: 'html-audio-fallback',
        available: this.capabilities.htmlAudio,
        priority: 3,
      },
      {
        name: 'visual-feedback',
        available: true, // 常に利用可能
        priority: 2,
      },
      {
        name: 'silent-mode',
        available: true, // 最終フォールバック
        priority: 1,
      },
    ];

    // 利用可能なレベルのみを残してソート
    this.fallbackLevels = this.fallbackLevels
      .filter((level) => level.available)
      .sort((a, b) => b.priority - a.priority);

    // 各レベルの実際の動作テスト
    await this.testFallbackLevels();
  }

  /**
   * ブラウザの音声機能検出
   */
  private async detectAudioCapabilities(): Promise<AudioCapabilities> {
    const capabilities: AudioCapabilities = {
      webAudio: false,
      htmlAudio: false,
      audioContextSupport: false,
      mp3Support: false,
      codecs: [],
      autoplayPolicy: 'blocked',
    };

    if (typeof window === 'undefined') return capabilities;

    // Web Audio API対応チェック
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        capabilities.webAudio = true;

        // AudioContext作成テスト
        const testContext = new AudioContextClass();
        capabilities.audioContextSupport = true;
        testContext.close();
      }
    } catch {
      capabilities.webAudio = false;
    }

    // HTMLAudioElement対応チェック
    try {
      const audio = new Audio();
      capabilities.htmlAudio = true;

      // コーデック対応チェック
      const testCodecs = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      capabilities.codecs = testCodecs.filter((codec) => audio.canPlayType(codec) !== '');
      capabilities.mp3Support = capabilities.codecs.includes('audio/mpeg');
    } catch {
      capabilities.htmlAudio = false;
    }

    // 自動再生ポリシー検出
    await this.detectAutoplayPolicy(capabilities);

    return capabilities;
  }

  /**
   * 自動再生ポリシーの検出
   */
  private async detectAutoplayPolicy(capabilities: AudioCapabilities): Promise<void> {
    if (!capabilities.htmlAudio) return;

    try {
      const audio = new Audio();
      audio.muted = true;
      audio.volume = 0;

      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
        capabilities.autoplayPolicy = 'allowed';
        audio.pause();
      }
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        capabilities.autoplayPolicy = 'restricted';
      } else {
        capabilities.autoplayPolicy = 'blocked';
      }
    }
  }

  /**
   * フォールバックレベルの実際の動作テスト
   */
  private async testFallbackLevels(): Promise<void> {
    for (const level of this.fallbackLevels) {
      try {
        level.testResult = await this.testFallbackLevel(level.name);
      } catch {
        level.testResult = false;
        level.available = false;
      }
    }

    // テスト結果でフィルタリング
    this.fallbackLevels = this.fallbackLevels.filter((level) => level.testResult);
  }

  /**
   * 個別フォールバックレベルのテスト
   */
  private async testFallbackLevel(levelName: string): Promise<boolean> {
    switch (levelName) {
      case 'web-audio-api':
        return this.testWebAudioAPI();
      case 'html-audio-element':
      case 'html-audio-fallback':
        return this.testHTMLAudio();
      case 'visual-feedback':
      case 'silent-mode':
        return true; // 常に成功
      default:
        return false;
    }
  }

  /**
   * Web Audio APIテスト
   */
  private async testWebAudioAPI(): Promise<boolean> {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();

      // 無音のAudioBufferを作成してテスト
      const buffer = context.createBuffer(1, 1, context.sampleRate);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();

      await context.close();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * HTMLAudio要素テスト
   */
  private async testHTMLAudio(): Promise<boolean> {
    try {
      const audio = new Audio();
      audio.muted = true;
      audio.volume = 0;

      // data URLを使用してテスト
      audio.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUY7Tv5Z9NEAxPpuPwtmMcBjiS1/LNeSsFJHfJ8N6QQAoUYrPv5Z9NEAxPpuPwtmMcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxPpuPwtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPwtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiS1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPv5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEA=';

      return new Promise((resolve) => {
        audio.oncanplaythrough = () => resolve(true);
        audio.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 1000); // 1秒でタイムアウト
      });
    } catch {
      return false;
    }
  }

  /**
   * 音声再生のフォールバック実行
   */
  public async playWithFallback(
    soundKey: SoundKey,
    options: { volume?: number } = {}
  ): Promise<void> {
    if (this.config.silentMode) return;

    let lastError: Error | null = null;

    for (let i = this.currentLevel; i < this.fallbackLevels.length; i++) {
      const level = this.fallbackLevels[i];

      try {
        await this.executePlayback(level.name, soundKey, options);
        return; // 成功した場合は終了
      } catch (error) {
        lastError = error as Error;

        // エラーをログに記録
        const audioError = new AudioError(
          `Fallback level '${level.name}' failed for ${soundKey}`,
          {
            action: 'audio_fallback',
            component: 'AudioFallbackManager',
            additionalData: { level: level.name, soundKey, error },
          },
          { recoverable: true, retryable: true }
        );
        handleError(audioError);

        // 次のレベルに自動フォールバック
        this.currentLevel = i + 1;

        if (this.config.fallbackDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.config.fallbackDelay));
        }
      }
    }

    // 全フォールバックが失敗した場合
    if (lastError) {
      const finalError = new AudioError(
        `All fallback levels failed for ${soundKey}`,
        {
          action: 'audio_fallback_final',
          component: 'AudioFallbackManager',
          additionalData: { soundKey, lastError },
        },
        { recoverable: false, retryable: false }
      );
      handleError(finalError);
    }

    // 最終手段：サイレントモード
    this.config.silentMode = true;
  }

  /**
   * 特定レベルでの再生実行
   */
  private async executePlayback(
    levelName: string,
    soundKey: SoundKey,
    options: { volume?: number }
  ): Promise<void> {
    switch (levelName) {
      case 'web-audio-api':
        return this.playWithWebAudio(soundKey, options);
      case 'html-audio-element':
      case 'html-audio-fallback':
        return this.playWithHTMLAudio(soundKey, options);
      case 'visual-feedback':
        return this.playWithVisualFeedback(soundKey);
      case 'silent-mode':
        return; // 何もしない
      default:
        throw new Error(`Unknown fallback level: ${levelName}`);
    }
  }

  /**
   * Web Audio APIでの再生
   */
  private async playWithWebAudio(soundKey: SoundKey, options: { volume?: number }): Promise<void> {
    // AudioManagerが利用可能かチェック
    const { audioManager } = await import('./audioManager');
    await audioManager.playSound(soundKey, { volume: options.volume });
  }

  /**
   * HTMLAudioElementでの再生
   */
  private async playWithHTMLAudio(soundKey: SoundKey, options: { volume?: number }): Promise<void> {
    const levelKey = 'html-audio';

    if (!this.audioInstances.has(levelKey)) {
      this.audioInstances.set(levelKey, new Map());
    }

    const instances = this.audioInstances.get(levelKey)!;
    let audio = instances.get(soundKey) as HTMLAudioElement | undefined;

    if (!audio) {
      audio = new Audio();
      audio.src = `/sounds/${soundKey.replace(/([A-Z])/g, '-$1').toLowerCase()}.mp3`;
      audio.preload = 'auto';
      instances.set(soundKey, audio);
    }

    audio.volume = options.volume ?? 0.5;
    audio.currentTime = 0;

    await audio.play();
  }

  /**
   * 視覚フィードバックでの再生
   */
  private async playWithVisualFeedback(soundKey: SoundKey): Promise<void> {
    // ブラウザ通知またはコンソールでフィードバック
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`音声: ${soundKey}`, {
        icon: '/icon-192x192.png',
        tag: 'tetris-audio',
        silent: true,
      });
    } else {
      console.log(`♪ Audio: ${soundKey}`);
    }
  }

  /**
   * 現在のフォールバック状態の取得
   */
  public getFallbackStatus(): {
    currentLevel: number;
    availableLevels: string[];
    capabilities: AudioCapabilities | null;
    silentMode: boolean;
  } {
    return {
      currentLevel: this.currentLevel,
      availableLevels: this.fallbackLevels.map((level) => level.name),
      capabilities: this.capabilities,
      silentMode: this.config.silentMode,
    };
  }

  /**
   * フォールバック設定の更新
   */
  public updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * フォールバックレベルのリセット
   */
  public resetFallback(): void {
    this.currentLevel = 0;
    this.config.silentMode = false;
  }

  /**
   * メモリクリーンアップ
   */
  public dispose(): void {
    for (const instances of this.audioInstances.values()) {
      for (const audio of instances.values()) {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
          audio.src = '';
        }
      }
    }
    this.audioInstances.clear();
    this.fallbackCallbacks.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const audioFallbackManager = AudioFallbackManager.getInstance();

// 便利な関数をエクスポート
export const playWithFallback = (soundKey: SoundKey, options?: { volume?: number }) =>
  audioFallbackManager.playWithFallback(soundKey, options);

export const getFallbackStatus = () => audioFallbackManager.getFallbackStatus();
export const resetAudioFallback = () => audioFallbackManager.resetFallback();
