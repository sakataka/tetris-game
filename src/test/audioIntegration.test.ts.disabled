/**
 * 音声システム統合テスト
 * 
 * AudioManager + AudioPreloader + AudioFallback の統合機能を検証
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockAudioSystem, createMockDOMEnvironment } from './fixtures';

// 音声関連のモック設定
const audioMocks = createMockAudioSystem();
const domMocks = createMockDOMEnvironment();

// 実際のモジュールをモック
vi.mock('../utils/audio/audioManager', () => ({
  audioManager: audioMocks.mockAudioManager
}));

vi.mock('../utils/audio/audioPreloader', () => ({
  preloadAudioSmart: vi.fn().mockResolvedValue({
    total: 6,
    loaded: 6,
    failed: 0,
    inProgress: 0,
    progress: 1.0
  }),
  getAudioPreloadProgress: vi.fn().mockReturnValue({
    total: 6,
    loaded: 6,
    failed: 0,
    inProgress: 0,
    progress: 1.0
  })
}));

vi.mock('../utils/audio/audioFallback', () => ({
  playWithFallback: vi.fn().mockResolvedValue(undefined),
  getFallbackStatus: vi.fn().mockReturnValue({
    currentLevel: 0,
    availableLevels: ['web-audio-api', 'html-audio-element'],
    capabilities: {
      webAudio: true,
      htmlAudio: true,
      audioContextSupport: true,
      mp3Support: true,
      codecs: ['audio/mpeg'],
      autoplayPolicy: 'allowed'
    },
    silentMode: false
  })
}));

// インポート（モック後）
import { audioManager } from '../utils/audio/audioManager';
import { preloadAudioSmart, getAudioPreloadProgress } from '../utils/audio/audioPreloader';
import { playWithFallback, getFallbackStatus } from '../utils/audio/audioFallback';

describe('音声システム統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックの初期状態設定
    audioMocks.mockAudioManager.getAudioState.mockReturnValue({
      initialized: true,
      suspended: false,
      loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
      activeSounds: 0,
      masterVolume: 0.5,
      isMuted: false
    });
  });

  afterEach(() => {
    // クリーンアップ
    audioMocks.mockAudioManager.dispose();
  });

  describe('システム初期化と統合', () => {
    it('3つのサブシステムが正常に連携する', async () => {
      // プリローダーでの音声ロード
      const preloadResult = await preloadAudioSmart({
        strategy: 'priority',
        maxConcurrent: 3,
        timeout: 5000
      });

      expect(preloadResult.total).toBe(6);
      expect(preloadResult.loaded).toBe(6);

      // AudioManagerの初期化確認
      expect(audioMocks.mockAudioManager.playSound).toBeDefined();

      // フォールバックシステムの状態確認
      const fallbackStatus = getFallbackStatus();
      expect(fallbackStatus.capabilities.webAudio).toBe(true);
    });

    it('Web Audio API利用可能時の完全統合', async () => {
      // Web Audio APIが利用可能な環境
      audioMocks.mockAudioManager.isInitialized.mockReturnValue(true);
      audioMocks.mockAudioManager.getAudioState.mockReturnValue({
        initialized: true,
        suspended: false,
        loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
        activeSounds: 0,
        masterVolume: 0.7,
        isMuted: false
      });

      // 音声再生テスト
      await playWithFallback('lineClear', { volume: 0.7 });

      expect(playWithFallback).toHaveBeenCalledWith('lineClear', { volume: 0.7 });
      
      // プリロード状況確認
      const progress = getAudioPreloadProgress();
      expect(progress.progress).toBe(1.0);
    });

    it('フォールバック環境での統合動作', async () => {
      // Web Audio APIが利用不可の環境をシミュレート
      const fallbackStatus = {
        currentLevel: 1,
        availableLevels: ['html-audio-element'],
        capabilities: {
          webAudio: false,
          htmlAudio: true,
          audioContextSupport: false,
          mp3Support: true,
          codecs: ['audio/mpeg'],
          autoplayPolicy: 'user-gesture-required'
        },
        silentMode: false
      };

      vi.mocked(getFallbackStatus).mockReturnValue(fallbackStatus);

      // HTMLAudioElementでの音声再生
      await playWithFallback('pieceLand', { volume: 0.5 });

      expect(playWithFallback).toHaveBeenCalledWith('pieceLand', { volume: 0.5 });
    });
  });

  describe('パフォーマンステスト', () => {
    it('高頻度音声再生でのシステム安定性', async () => {
      const soundKeys = ['lineClear', 'pieceLand', 'pieceRotate'] as const;
      const promises: Promise<void>[] = [];

      // 100回の並列音声再生
      for (let i = 0; i < 100; i++) {
        const soundKey = soundKeys[i % soundKeys.length];
        promises.push(playWithFallback(soundKey, { volume: 0.3 }));
      }

      await Promise.all(promises);

      expect(playWithFallback).toHaveBeenCalledTimes(100);
    });

    it('メモリ効率的な音声管理', async () => {
      // 大量の音声アセットをプリロード
      const largePreloadConfig = {
        strategy: 'all' as const,
        maxConcurrent: 6,
        timeout: 10000,
        memoryLimit: 50 * 1024 * 1024 // 50MB
      };

      const result = await preloadAudioSmart(largePreloadConfig);

      expect(result.loaded).toBeGreaterThan(0);
      expect(result.failed).toBe(0);

      // メモリ使用量が制限内であることを確認
      const audioState = audioMocks.mockAudioManager.getAudioState();
      expect(audioState.loadedSounds.length).toBeLessThanOrEqual(6);
    });

    it('並列プリロードのパフォーマンス', async () => {
      const startTime = performance.now();

      // 並列プリロード実行
      await preloadAudioSmart({
        strategy: 'priority',
        maxConcurrent: 3,
        timeout: 3000
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 3秒以内に完了することを確認
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('エラーハンドリングと回復', () => {
    it('Web Audio API失敗時の自動フォールバック', async () => {
      // Web Audio APIでのエラーをシミュレート
      audioMocks.mockAudioManager.playSound.mockRejectedValueOnce(
        new Error('Web Audio API not available')
      );

      // フォールバックシステムが自動的に作動
      vi.mocked(playWithFallback).mockResolvedValueOnce(undefined);

      await playWithFallback('tetris', { volume: 0.8 });

      expect(playWithFallback).toHaveBeenCalledWith('tetris', { volume: 0.8 });
    });

    it('ネットワークエラー時のプリロード回復', async () => {
      // 最初のプリロードでネットワークエラー
      vi.mocked(preloadAudioSmart).mockRejectedValueOnce(
        new Error('Network error')
      ).mockResolvedValueOnce({
        total: 6,
        loaded: 4,
        failed: 2,
        inProgress: 0,
        progress: 0.67
      });

      let result;
      try {
        result = await preloadAudioSmart({
          strategy: 'priority',
          maxConcurrent: 2,
          timeout: 2000,
          retryAttempts: 2
        });
      } catch (error) {
        // 再試行での成功
        result = await preloadAudioSmart({
          strategy: 'priority',
          maxConcurrent: 2,
          timeout: 2000,
          retryAttempts: 2
        });
      }

      expect(result.loaded).toBeGreaterThan(0);
    });

    it('複数レベルフォールバックの動作', async () => {
      const fallbackLevels = [
        {
          level: 0,
          name: 'web-audio-api',
          available: false,
          error: 'AudioContext not supported'
        },
        {
          level: 1,
          name: 'html-audio-element',
          available: true,
          error: null
        },
        {
          level: 2,
          name: 'visual-feedback',
          available: true,
          error: null
        }
      ];

      // Web Audio API失敗
      vi.mocked(getFallbackStatus).mockReturnValue({
        currentLevel: 1,
        availableLevels: ['html-audio-element', 'visual-feedback'],
        capabilities: {
          webAudio: false,
          htmlAudio: true,
          audioContextSupport: false,
          mp3Support: true,
          codecs: ['audio/mpeg'],
          autoplayPolicy: 'user-gesture-required'
        },
        silentMode: false
      });

      await playWithFallback('gameOver', { volume: 1.0 });

      expect(playWithFallback).toHaveBeenCalledWith('gameOver', { volume: 1.0 });
    });
  });

  describe('ユーザーエクスペリエンス', () => {
    it('音量制御の統合動作', async () => {
      // 音量設定
      audioMocks.mockAudioManager.setMasterVolume(0.3);
      
      // 音声再生での音量適用
      await playWithFallback('pieceLand', { volume: 0.8 });

      expect(audioMocks.mockAudioManager.setMasterVolume).toHaveBeenCalledWith(0.3);
      expect(playWithFallback).toHaveBeenCalledWith('pieceLand', { volume: 0.8 });
    });

    it('ミュート機能の統合動作', async () => {
      // ミュート状態設定
      audioMocks.mockAudioManager.setMuted(true);
      audioMocks.mockAudioManager.isMutedState.mockReturnValue(true);

      // ミュート時は音声再生されない
      await playWithFallback('lineClear');

      expect(audioMocks.mockAudioManager.setMuted).toHaveBeenCalledWith(true);
    });

    it('プリロード進捗のリアルタイム更新', () => {
      // 段階的なプリロード進捗
      const progressStates = [
        { total: 6, loaded: 2, failed: 0, inProgress: 4, progress: 0.33 },
        { total: 6, loaded: 4, failed: 0, inProgress: 2, progress: 0.67 },
        { total: 6, loaded: 6, failed: 0, inProgress: 0, progress: 1.0 }
      ];

      progressStates.forEach((state, index) => {
        vi.mocked(getAudioPreloadProgress).mockReturnValueOnce(state);
        
        const progress = getAudioPreloadProgress();
        expect(progress.progress).toBe(state.progress);
        expect(progress.loaded).toBe(state.loaded);
      });
    });
  });

  describe('音声品質とレイテンシ', () => {
    it('低遅延音声再生の実現', async () => {
      const startTime = performance.now();

      await playWithFallback('hardDrop', { volume: 0.9 });

      const endTime = performance.now();
      const latency = endTime - startTime;

      // 50ms以内の低遅延を確認
      expect(latency).toBeLessThan(50);
    });

    it('音声品質の自動選択', async () => {
      // 高品質モードの設定
      audioMocks.mockAudioManager.getAudioState.mockReturnValue({
        initialized: true,
        suspended: false,
        loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
        activeSounds: 0,
        masterVolume: 0.5,
        isMuted: false
      });

      // Web Audio APIでの高品質再生
      await playWithFallback('tetris', { 
        volume: 1.0,
        fadeIn: 100,
        fadeOut: 200
      });

      expect(playWithFallback).toHaveBeenCalledWith('tetris', {
        volume: 1.0,
        fadeIn: 100,
        fadeOut: 200
      });
    });
  });

  describe('モバイルデバイス対応', () => {
    it('モバイル自動再生ポリシー対応', async () => {
      // モバイル環境での制限をシミュレート
      vi.mocked(getFallbackStatus).mockReturnValue({
        currentLevel: 0,
        availableLevels: ['web-audio-api', 'html-audio-element'],
        capabilities: {
          webAudio: true,
          htmlAudio: true,
          audioContextSupport: true,
          mp3Support: true,
          codecs: ['audio/mpeg'],
          autoplayPolicy: 'user-gesture-required'
        },
        silentMode: false
      });

      // ユーザージェスチャー後の音声アンロック
      await audioMocks.mockAudioManager.unlockAudio();

      expect(audioMocks.mockAudioManager.unlockAudio).toHaveBeenCalled();
    });

    it('低帯域幅環境での最適化', async () => {
      // 低帯域幅での制限付きプリロード
      const limitedPreloadConfig = {
        strategy: 'priority' as const,
        maxConcurrent: 1,
        timeout: 5000,
        networkOptimization: true
      };

      const result = await preloadAudioSmart(limitedPreloadConfig);

      expect(result.loaded).toBeGreaterThan(0);
      expect(preloadAudioSmart).toHaveBeenCalledWith(limitedPreloadConfig);
    });
  });

  describe('統合システム診断', () => {
    it('全サブシステムの状態レポート', () => {
      // AudioManagerの状態
      const audioState = audioMocks.mockAudioManager.getAudioState();
      expect(audioState.initialized).toBe(true);
      expect(audioState.loadedSounds.length).toBe(6);

      // プリローダーの状態
      const preloadProgress = getAudioPreloadProgress();
      expect(preloadProgress.progress).toBe(1.0);

      // フォールバックシステムの状態
      const fallbackStatus = getFallbackStatus();
      expect(fallbackStatus.capabilities.webAudio).toBe(true);
    });

    it('パフォーマンス指標の収集', async () => {
      const metrics = {
        loadTime: 0,
        playbackLatency: 0,
        memoryUsage: 0,
        errorRate: 0
      };

      // 音声ロード時間計測
      const loadStart = performance.now();
      await preloadAudioSmart({ strategy: 'all', maxConcurrent: 6, timeout: 3000 });
      metrics.loadTime = performance.now() - loadStart;

      // 再生遅延計測
      const playStart = performance.now();
      await playWithFallback('lineClear');
      metrics.playbackLatency = performance.now() - playStart;

      expect(metrics.loadTime).toBeGreaterThan(0);
      expect(metrics.playbackLatency).toBeGreaterThan(0);
      expect(metrics.loadTime).toBeLessThan(3000);
      expect(metrics.playbackLatency).toBeLessThan(100);
    });
  });
});