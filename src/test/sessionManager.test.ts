/**
 * SessionManager統合テスト
 *
 * SessionManagerの主要機能と
 * localStorage同期の動作確認
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../utils/data/sessionManager';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// グローバルlocalStorageを置き換え
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// SessionManagerのインスタンスをリセットする関数
const resetSessionManager = () => {
  // シングルトンをリセット（テスト用）
  // @ts-expect-error - privateメンバーアクセス
  SessionManager.instance = undefined;
};

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();

    // SessionManagerインスタンスをリセット
    resetSessionManager();

    // タイマーをモック
    vi.useFakeTimers();

    // 新しいインスタンスを取得
    sessionManager = SessionManager.getInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionManager.clearAllSessions();
    resetSessionManager();
  });

  describe('セッション基本機能', () => {
    it('should create a new session', () => {
      const session = sessionManager.startSession();

      expect(session).toBeDefined();
      expect(session.isActive).toBe(true);
      expect(session.gameCount).toBe(0);
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should return current session', () => {
      const session = sessionManager.startSession();
      const currentSession = sessionManager.getCurrentSession();

      expect(currentSession).toEqual(session);
    });

    it('should end current session', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeNull();
    });

    it('should track game count', () => {
      sessionManager.startSession();

      sessionManager.onGameStart();
      expect(sessionManager.getCurrentSession()?.gameCount).toBe(1);

      sessionManager.onGameStart();
      expect(sessionManager.getCurrentSession()?.gameCount).toBe(2);
    });
  });

  describe('セッション履歴管理', () => {
    it('should save completed sessions to history', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].isActive).toBe(false);
      expect(sessions[0].endTime).toBeDefined();
    });

    it('should handle multiple sessions', () => {
      // 3つのセッション作成・終了
      for (let i = 0; i < 3; i++) {
        sessionManager.startSession();
        sessionManager.onGameStart(); // ゲーム数を追加
        sessionManager.endCurrentSession();
      }

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(3);

      // 全て非アクティブ
      sessions.forEach((session) => {
        expect(session.isActive).toBe(false);
        expect(session.gameCount).toBe(1);
      });
    });
  });

  describe('localStorage同期', () => {
    it('should persist current session to localStorage', () => {
      const session = sessionManager.startSession();

      // localStorageに保存されているか確認
      const stored = localStorage.getItem('tetris-current-session');
      expect(stored).toBeTruthy();

      const parsedSession = JSON.parse(stored!);
      expect(parsedSession.id).toBe(session.id);
      expect(parsedSession.isActive).toBe(true);
    });

    it('should persist session history to localStorage', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      // セッション履歴がlocalStorageに保存されているか確認
      const stored = localStorage.getItem('tetris-play-sessions');
      expect(stored).toBeTruthy();

      const sessions = JSON.parse(stored!);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].isActive).toBe(false);
    });

    it('should load existing session from localStorage', () => {
      // 手動でlocalStorageにセッション保存
      const testSession = {
        id: 'test-session',
        startTime: Date.now() - 5000, // 5秒前
        gameCount: 2,
        isActive: true,
      };

      localStorage.setItem('tetris-current-session', JSON.stringify(testSession));

      // 新しいSessionManagerインスタンス作成（localStorage読み込み）
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      const currentSession = newManager.getCurrentSession();
      expect(currentSession?.id).toBe('test-session');
      expect(currentSession?.gameCount).toBe(2);
      expect(currentSession?.isActive).toBe(true);
    });
  });

  describe('統計計算', () => {
    it('should calculate session stats correctly', () => {
      // セッション統計の初期状態
      let stats = sessionManager.getSessionStats();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.totalGames).toBe(0);

      // セッション作成・終了
      sessionManager.startSession();

      // 時間経過をシミュレート
      vi.advanceTimersByTime(60000); // 1分

      sessionManager.onGameStart(); // ゲーム1回
      sessionManager.endCurrentSession();

      stats = sessionManager.getSessionStats();
      expect(stats.totalSessions).toBe(1);
      expect(stats.totalPlayTime).toBe(60); // 60秒
      expect(stats.totalGames).toBe(1);
      expect(stats.averageSessionTime).toBe(60);
      expect(stats.averageGamesPerSession).toBe(1);
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle corrupted localStorage data', () => {
      // 破損したデータをlocalStorageに設定
      localStorage.setItem('tetris-current-session', 'invalid-json');

      // SessionManagerが正常に動作するか確認
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      expect(newManager.getCurrentSession()).toBeNull();
    });

    it('should handle expired session', () => {
      // 30分以上前のセッション
      const expiredSession = {
        id: 'expired-session',
        startTime: Date.now() - 31 * 60 * 1000, // 31分前
        gameCount: 1,
        isActive: true,
      };

      localStorage.setItem('tetris-current-session', JSON.stringify(expiredSession));

      // 期限切れセッションが正しく処理されるか確認
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      expect(newManager.getCurrentSession()).toBeNull();

      // 履歴に移動されているか確認
      const sessions = newManager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('expired-session');
      expect(sessions[0].isActive).toBe(false);
    });
  });

  describe('メモリ管理', () => {
    it('should limit session history to 100 entries', () => {
      // 101個のセッションを作成
      for (let i = 0; i < 101; i++) {
        sessionManager.startSession();
        sessionManager.endCurrentSession();
      }

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(100); // 最新100個のみ保持
    });
  });
});
