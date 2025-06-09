/**
 * テスト用モックファクトリ
 * 
 * 重複するモック定義を統一し、型安全で再利用可能な
 * モック生成ユーティリティを提供
 */

import { vi, expect } from 'vitest';
import type { GameState, HighScore, GameStatistics, ThemeConfig } from '../../types/tetris';

// ===== 音声システムモック =====

/**
 * Web Audio APIの包括的モック
 */
export const createMockAudioSystem = () => {
  // AudioContextモック
  const mockAudioContext = {
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 }
    })),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null
    })),
    decodeAudioData: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
    close: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
    state: 'running' as AudioContextState
  };

  // HTMLAudioElementモック
  const mockAudio = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    duration: 2.5,
    volume: 1,
    muted: false,
    paused: true,
    ended: false,
    src: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    canPlayType: vi.fn().mockReturnValue('probably')
  };

  // グローバルモック設定
  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: vi.fn(() => mockAudioContext)
  });

  Object.defineProperty(window, 'Audio', {
    writable: true,
    value: vi.fn(() => mockAudio)
  });

  return {
    mockAudioContext,
    mockAudio,
    mockPlaySound: vi.fn().mockResolvedValue(undefined),
    mockAudioManager: {
      isInitialized: vi.fn().mockReturnValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
      loadSound: vi.fn().mockResolvedValue(true),
      playSound: vi.fn().mockResolvedValue(undefined),
      setVolume: vi.fn(),
      setMasterVolume: vi.fn(),
      setMuted: vi.fn(),
      getMasterVolume: vi.fn().mockReturnValue(0.5),
      isMutedState: vi.fn().mockReturnValue(false),
      getAudioState: vi.fn().mockReturnValue({
        initialized: true,
        suspended: false,
        loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
        activeSounds: 0,
        masterVolume: 0.5,
        isMuted: false
      }),
      preloadAllSounds: vi.fn().mockResolvedValue(undefined),
      stopSound: vi.fn(),
      stopAllSounds: vi.fn(),
      unlockAudio: vi.fn().mockResolvedValue(true),
      dispose: vi.fn()
    }
  };
};

/**
 * 音声マネージャーモック
 */
export const createMockAudioManager = () => ({
  isInitialized: vi.fn().mockReturnValue(true),
  initialize: vi.fn().mockResolvedValue(undefined),
  loadSound: vi.fn().mockResolvedValue(true),
  playSound: vi.fn().mockResolvedValue(undefined),
  setVolume: vi.fn(),
  setMasterVolume: vi.fn(),
  unlockAudio: vi.fn().mockResolvedValue(true),
  getStats: vi.fn().mockReturnValue({ loadedSounds: 6, failedSounds: 0 })
});

// ===== DOM環境モック =====

/**
 * DOM要素とlocalStorageの標準モック
 */
export const createMockDOMEnvironment = () => {
  // LocalStorageモック
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((index: number) => Object.keys(store)[index] || null)
    };
  })();

  // matchMedia モック
  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // DocumentElementモック
  const mockDocumentElement = {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn().mockReturnValue('')
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn().mockReturnValue(false),
      toggle: vi.fn()
    }
  };

  // グローバル設定
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  Object.defineProperty(document, 'documentElement', {
    value: mockDocumentElement,
    writable: true
  });

  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true
  });

  return {
    localStorageMock,
    mockDocumentElement,
    matchMediaMock
  };
};

// ===== Zustandストアモック =====

/**
 * 型安全なZustandストアモック生成
 */
export const createMockStore = <T extends Record<string, unknown>>(
  initialState: Partial<T>,
  actions: Record<string, ReturnType<typeof vi.fn>> = {}
) => {
  const state = { ...initialState, ...actions };
  
  return vi.fn((selector?: (state: T) => unknown) => {
    if (selector) {
      return selector(state as T);
    }
    return state;
  });
};

/**
 * 統計ストア専用モック
 */
export const createMockStatisticsStore = () => {
  const mockHighScores: HighScore[] = [
    { id: '1', score: 50000, level: 10, lines: 80, date: Date.now() },
    { id: '2', score: 40000, level: 8, lines: 60, date: Date.now() },
    { id: '3', score: 30000, level: 6, lines: 40, date: Date.now() }
  ];

  const mockStatistics: GameStatistics = {
    totalGames: 15,
    totalScore: 125000,
    totalLines: 185,
    playTime: 4500,
    bestScore: 45000,
    averageScore: 8333,
    bestStreak: 3,
    tetrisCount: 15
  };

  return {
    useHighScores: vi.fn(() => mockHighScores),
    useStatistics: vi.fn(() => mockStatistics),
    useAddHighScore: vi.fn(),
    useUpdateStatistics: vi.fn(),
    useClearStatistics: vi.fn()
  };
};

/**
 * ゲーム状態ストア専用モック
 */
export const createMockGameStateStore = () => {
  const mockGameState: Partial<GameState> = {
    board: Array(20).fill(null).map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false
  };

  return {
    useGameState: vi.fn(() => mockGameState),
    useSetGameState: vi.fn(),
    useResetGame: vi.fn(),
    useTogglePause: vi.fn(),
    useUpdateParticles: vi.fn()
  };
};

// ===== テストデータフィクスチャ =====

/**
 * 標準的なテストデータセット
 */
export const createTestFixtures = () => ({
  // ハイスコアデータ
  highScores: [
    { id: '1', score: 50000, level: 10, lines: 80, date: Date.now() },
    { id: '2', score: 40000, level: 8, lines: 60, date: Date.now() },
    { id: '3', score: 30000, level: 6, lines: 40, date: Date.now() },
    { id: '4', score: 20000, level: 4, lines: 20, date: Date.now() },
    { id: '5', score: 10000, level: 2, lines: 10, date: Date.now() }
  ] as HighScore[],

  // 統計データ
  statistics: {
    totalGames: 15,
    totalScore: 125000,
    totalLines: 185,
    playTime: 4500,
    bestScore: 45000,
    averageScore: 8333,
    bestStreak: 3,
    tetrisCount: 15
  } as GameStatistics,

  // テーマ設定
  themeConfig: {
    name: 'cyberpunk',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#000011'
    },
    effects: {
      blur: 0.5,
      glow: 1.0,
      saturation: 1.2,
      brightness: 1.0
    },
    accessibility: {
      colorBlindnessType: 'none' as const,
      contrast: 'normal' as const,
      animationIntensity: 'normal' as const
    }
  } as ThemeConfig,

  // ゲーム状態
  gameState: {
    board: Array(20).fill(null).map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    particles: []
  } as Partial<GameState>
});

// ===== ユーティリティ関数 =====

/**
 * 非同期テストのセットアップヘルパー
 */
export const setupAsyncTest = (timeout: number = 100) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });
};

/**
 * エラーテスト用ヘルパー
 */
export const expectToThrow = async (
  asyncFn: () => Promise<unknown>,
  expectedError?: string | RegExp
) => {
  let thrownError: Error | null = null;
  
  try {
    await asyncFn();
  } catch (error) {
    thrownError = error as Error;
  }
  
  expect(thrownError).not.toBeNull();
  
  if (expectedError) {
    if (typeof expectedError === 'string') {
      expect(thrownError?.message).toContain(expectedError);
    } else {
      expect(thrownError?.message).toMatch(expectedError);
    }
  }
  
  return thrownError;
};

/**
 * パフォーマンステスト用ヘルパー
 */
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T,
  label: string = 'operation'
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`📊 ${label}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
};