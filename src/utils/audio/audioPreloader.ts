/**
 * 高度な音声プリロードシステム
 * プリロード戦略、プライオリティ管理、メモリ効率化
 */

import { SoundKey } from '../../types/tetris';
import { audioManager } from './audioManager';
import { AudioError, handleError } from '../data/errorHandler';

interface PreloadStrategy {
  priority: 'immediate' | 'high' | 'normal' | 'lazy';
  timeout: number; // プリロードタイムアウト（ミリ秒）
  retryCount: number; // リトライ回数
  memoryLimit: number; // メモリ制限（MB）
}

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  inProgress: number;
  progress: number; // 0-1
}

interface SoundPriority {
  soundKey: SoundKey;
  priority: number; // 1-10, 10が最高優先度
  size?: number; // 推定ファイルサイズ（バイト）
}

class AudioPreloader {
  private static instance: AudioPreloader | null = null;

  private preloadProgress: Map<SoundKey, 'pending' | 'loading' | 'loaded' | 'failed'> = new Map();
  private loadTimestamps: Map<SoundKey, number> = new Map();
  private retryCounters: Map<SoundKey, number> = new Map();
  private memoryUsage: number = 0;

  // 音声ファイルのプライオリティ定義
  private readonly soundPriorities: SoundPriority[] = [
    { soundKey: 'pieceLand', priority: 10 }, // 最も頻繁に使用
    { soundKey: 'pieceRotate', priority: 9 },
    { soundKey: 'lineClear', priority: 8 },
    { soundKey: 'hardDrop', priority: 7 },
    { soundKey: 'tetris', priority: 6 },
    { soundKey: 'gameOver', priority: 5 }, // 使用頻度は低いが重要
  ];

  // デフォルトプリロード戦略
  private readonly strategies: Record<string, PreloadStrategy> = {
    immediate: {
      priority: 'immediate',
      timeout: 5000,
      retryCount: 3,
      memoryLimit: 50, // 50MB
    },
    normal: {
      priority: 'normal',
      timeout: 10000,
      retryCount: 2,
      memoryLimit: 30, // 30MB
    },
    lazy: {
      priority: 'lazy',
      timeout: 15000,
      retryCount: 1,
      memoryLimit: 20, // 20MB
    },
  };

  private constructor() {}

  public static getInstance(): AudioPreloader {
    if (!AudioPreloader.instance) {
      AudioPreloader.instance = new AudioPreloader();
    }
    return AudioPreloader.instance;
  }

  /**
   * プライオリティベースの音声プリロード
   */
  public async preloadWithStrategy(
    strategy: keyof typeof this.strategies = 'normal'
  ): Promise<PreloadProgress> {
    const config = this.strategies[strategy];

    // プライオリティ順にソート
    const sortedSounds = [...this.soundPriorities].sort((a, b) => b.priority - a.priority);

    // 進捗初期化
    sortedSounds.forEach(({ soundKey }) => {
      if (!this.preloadProgress.has(soundKey)) {
        this.preloadProgress.set(soundKey, 'pending');
      }
    });

    // const progress = this.getProgress(); // 未使用のため削除

    // 並列プリロード（高優先度から順次開始）
    const loadPromises = sortedSounds.map(
      (soundPriority, index) => this.preloadSingleSound(soundPriority, config, index * 100) // 100ms間隔で開始
    );

    await Promise.allSettled(loadPromises);

    return this.getProgress();
  }

  /**
   * 個別音声のプリロード
   */
  private async preloadSingleSound(
    soundPriority: SoundPriority,
    config: PreloadStrategy,
    delay: number = 0
  ): Promise<void> {
    const { soundKey } = soundPriority;

    // 遅延開始（ネットワーク負荷分散）
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // メモリ制限チェック
    if (this.memoryUsage > config.memoryLimit * 1024 * 1024) {
      this.preloadProgress.set(soundKey, 'failed');
      const error = new AudioError(
        `Memory limit exceeded for ${soundKey}`,
        {
          action: 'audio_preload',
          component: 'AudioPreloader',
          additionalData: { soundKey, memoryUsage: this.memoryUsage },
        },
        { recoverable: true, retryable: false }
      );
      handleError(error);
      return;
    }

    const maxRetries = config.retryCount;
    let currentRetry = this.retryCounters.get(soundKey) || 0;

    while (currentRetry <= maxRetries) {
      try {
        this.preloadProgress.set(soundKey, 'loading');
        this.loadTimestamps.set(soundKey, Date.now());

        // タイムアウト制御付きプリロード
        await Promise.race([
          this.loadWithAudioManager(soundKey),
          this.createTimeoutPromise(config.timeout, soundKey),
        ]);

        this.preloadProgress.set(soundKey, 'loaded');
        this.retryCounters.delete(soundKey);
        return;
      } catch (error) {
        currentRetry++;
        this.retryCounters.set(soundKey, currentRetry);

        if (currentRetry > maxRetries) {
          this.preloadProgress.set(soundKey, 'failed');
          const audioError = new AudioError(
            `Failed to preload ${soundKey} after ${maxRetries} retries`,
            {
              action: 'audio_preload',
              component: 'AudioPreloader',
              additionalData: { soundKey, retries: currentRetry, error },
            },
            { recoverable: true, retryable: false }
          );
          handleError(audioError);
          return;
        }

        // 指数バックオフでリトライ
        const backoffDelay = Math.pow(2, currentRetry - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  /**
   * AudioManagerを使用した実際のロード処理
   */
  private async loadWithAudioManager(soundKey: SoundKey): Promise<void> {
    // AudioManagerの内部プリロード機能を利用
    const audioState = audioManager.getAudioState();

    if (!audioState.loadedSounds.includes(soundKey)) {
      // AudioManagerのpreloadAllSounds()を個別音声用に拡張
      await audioManager.preloadAllSounds();

      // ロード完了を確認
      const updatedState = audioManager.getAudioState();
      if (!updatedState.loadedSounds.includes(soundKey)) {
        throw new Error(`Failed to load ${soundKey} via AudioManager`);
      }

      // メモリ使用量の推定更新（大雑把な見積もり）
      this.estimateMemoryUsage(soundKey);
    }
  }

  /**
   * タイムアウトPromiseの作成
   */
  private createTimeoutPromise(timeout: number, soundKey: SoundKey): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Preload timeout for ${soundKey} after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * メモリ使用量の推定
   */
  private estimateMemoryUsage(soundKey: SoundKey): void {
    // 音声ファイルのメモリ使用量を推定（実際の値は取得困難）
    const estimatedSizes: Record<SoundKey, number> = {
      pieceLand: 50 * 1024, // 50KB
      pieceRotate: 30 * 1024, // 30KB
      lineClear: 80 * 1024, // 80KB
      hardDrop: 40 * 1024, // 40KB
      tetris: 150 * 1024, // 150KB
      gameOver: 200 * 1024, // 200KB
    };

    this.memoryUsage += estimatedSizes[soundKey] || 50 * 1024;
  }

  /**
   * プリロード進捗の取得
   */
  public getProgress(): PreloadProgress {
    const statuses = Array.from(this.preloadProgress.values());

    return {
      total: statuses.length,
      loaded: statuses.filter((s) => s === 'loaded').length,
      failed: statuses.filter((s) => s === 'failed').length,
      inProgress: statuses.filter((s) => s === 'loading').length,
      progress:
        statuses.length > 0 ? statuses.filter((s) => s === 'loaded').length / statuses.length : 0,
    };
  }

  /**
   * 特定音声のプリロード状態取得
   */
  public getSoundStatus(soundKey: SoundKey): string {
    return this.preloadProgress.get(soundKey) || 'not-started';
  }

  /**
   * プリロード時間の統計取得
   */
  public getLoadingStats(): Record<SoundKey, { loadTime: number; status: string }> {
    const stats: Record<string, { loadTime: number; status: string }> = {};

    for (const [soundKey, timestamp] of this.loadTimestamps.entries()) {
      const status = this.preloadProgress.get(soundKey) || 'unknown';
      const loadTime = status === 'loaded' ? Date.now() - timestamp : -1;

      stats[soundKey] = { loadTime, status };
    }

    return stats as Record<SoundKey, { loadTime: number; status: string }>;
  }

  /**
   * メモリ使用量の取得
   */
  public getMemoryUsage(): { estimated: number; limit: number } {
    return {
      estimated: this.memoryUsage,
      limit: 50 * 1024 * 1024, // デフォルト50MB
    };
  }

  /**
   * プリロードのリセット
   */
  public reset(): void {
    this.preloadProgress.clear();
    this.loadTimestamps.clear();
    this.retryCounters.clear();
    this.memoryUsage = 0;
  }

  /**
   * 条件付きプリロード（ネットワーク状況考慮）
   */
  public async preloadBasedOnNetwork(): Promise<PreloadProgress> {
    // Network Information API対応チェック
    const connection =
      (
        navigator as unknown as {
          connection?: unknown;
          mozConnection?: unknown;
          webkitConnection?: unknown;
        }
      ).connection ||
      (navigator as unknown as { mozConnection?: unknown }).mozConnection ||
      (navigator as unknown as { webkitConnection?: unknown }).webkitConnection;

    let strategy: keyof typeof this.strategies = 'normal';

    if (connection) {
      const { effectiveType, downlink } = connection as { effectiveType: string; downlink: number };

      // ネットワーク状況に基づく戦略選択
      if (effectiveType === '4g' && downlink > 5) {
        strategy = 'immediate'; // 高速回線
      } else if (effectiveType === '3g' || downlink < 2) {
        strategy = 'lazy'; // 低速回線
      }
    }

    return this.preloadWithStrategy(strategy);
  }
}

// シングルトンインスタンスをエクスポート
export const audioPreloader = AudioPreloader.getInstance();

// 便利な関数をエクスポート
export const preloadAudioWithStrategy = (strategy?: 'immediate' | 'normal' | 'lazy') =>
  audioPreloader.preloadWithStrategy(strategy);

export const preloadAudioSmart = () => audioPreloader.preloadBasedOnNetwork();
export const getAudioPreloadProgress = () => audioPreloader.getProgress();
export const getAudioLoadingStats = () => audioPreloader.getLoadingStats();
export const resetAudioPreloader = () => audioPreloader.reset();
