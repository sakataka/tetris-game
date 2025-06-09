/**
 * セッション管理専用サービスクラス
 * 
 * PlaySessionの追跡、localStorage同期、タイムアウト管理を
 * 一元化したシンプルなアーキテクチャ
 */

import { PlaySession } from '../types/tetris';

const SESSION_STORAGE_KEY = 'tetris-play-sessions';
const CURRENT_SESSION_KEY = 'tetris-current-session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export interface SessionStats {
  totalSessions: number;
  totalPlayTime: number; // seconds
  totalGames: number;
  averageSessionTime: number; // seconds
  averageGamesPerSession: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: PlaySession | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private changeListeners: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
    this.setupWindowListeners();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * 現在のアクティブセッションを取得
   */
  public getCurrentSession(): PlaySession | null {
    return this.currentSession;
  }

  /**
   * 全てのセッション履歴を取得
   */
  public getAllSessions(): PlaySession[] {
    if (typeof window === 'undefined') return []; // SSR対応
    
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * 新しいセッションを開始
   */
  public startSession(): PlaySession {
    // 既存のアクティブセッションを終了
    if (this.currentSession?.isActive) {
      this.endCurrentSession();
    }

    // 新しいセッション作成
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      gameCount: 0,
      isActive: true
    };

    this.saveCurrentSession();
    this.resetTimeout();
    this.notifyListeners();

    return this.currentSession;
  }

  /**
   * 現在のセッションを終了
   */
  public endCurrentSession(): void {
    if (!this.currentSession?.isActive) return;

    const completedSession: PlaySession = {
      ...this.currentSession,
      endTime: Date.now(),
      isActive: false
    };

    // セッション履歴に保存
    this.saveSessionToHistory(completedSession);
    
    // 現在のセッションをクリア
    this.currentSession = null;
    this.clearCurrentSession();
    this.clearTimeout();
    this.notifyListeners();
  }

  /**
   * ゲーム開始時の処理
   */
  public onGameStart(): void {
    // アクティブセッションがない場合は新規作成
    if (!this.currentSession?.isActive) {
      this.startSession();
    }

    // ゲーム数を増加
    if (this.currentSession) {
      this.currentSession = {
        ...this.currentSession,
        gameCount: this.currentSession.gameCount + 1
      };
      this.saveCurrentSession();
      this.resetTimeout();
      this.notifyListeners();
    }
  }

  /**
   * セッション統計を計算
   */
  public getSessionStats(): SessionStats {
    const sessions = this.getAllSessions();
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        totalPlayTime: 0,
        totalGames: 0,
        averageSessionTime: 0,
        averageGamesPerSession: 0
      };
    }

    const totalPlayTime = sessions.reduce((total, session) => {
      if (session.endTime) {
        return total + (session.endTime - session.startTime);
      }
      return total;
    }, 0) / 1000; // Convert to seconds

    const totalGames = sessions.reduce((total, session) => {
      return total + session.gameCount;
    }, 0);

    return {
      totalSessions,
      totalPlayTime,
      totalGames,
      averageSessionTime: totalPlayTime / totalSessions,
      averageGamesPerSession: totalGames / totalSessions
    };
  }

  /**
   * 変更リスナーを追加
   */
  public addChangeListener(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * セッション履歴をクリア（開発・テスト用）
   */
  public clearAllSessions(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.endCurrentSession();
  }

  // === Private Methods ===

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    const stored = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!stored) return;

    try {
      const session = JSON.parse(stored);
      
      // セッションが期限切れかチェック
      const now = Date.now();
      const timeSinceStart = now - session.startTime;
      
      if (timeSinceStart > SESSION_TIMEOUT) {
        // 期限切れセッションを履歴に移動
        this.saveSessionToHistory({
          ...session,
          endTime: session.startTime + SESSION_TIMEOUT,
          isActive: false
        });
        this.clearCurrentSession();
      } else {
        this.currentSession = session;
        this.resetTimeout();
      }
    } catch {
      // 破損データは削除
      this.clearCurrentSession();
    }
  }

  private saveCurrentSession(): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    if (this.currentSession) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  private clearCurrentSession(): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }

  private saveSessionToHistory(session: PlaySession): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    const sessions = this.getAllSessions();
    sessions.push(session);
    
    // 最新100セッションのみ保持
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.endCurrentSession();
    }, SESSION_TIMEOUT);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private setupWindowListeners(): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    // ページアンロード時の処理
    const handleBeforeUnload = () => {
      this.endCurrentSession();
    };

    // ページフォーカス復帰時の処理
    const handleFocus = () => {
      this.loadFromStorage();
      this.notifyListeners();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => listener());
  }
}

// シングルトンインスタンスをエクスポート
export const sessionManager = SessionManager.getInstance();