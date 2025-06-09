/**
 * 簡素化されたセッションストア (v2)
 * 
 * SessionManagerサービスクラスをベースにした
 * 軽量なZustandストア実装
 */

import { create } from 'zustand';
import { PlaySession } from '../types/tetris';
import { sessionManager, SessionStats } from '../utils/data/sessionManager';

interface SessionStoreV2 {
  // State (SessionManagerから取得)
  currentSession: PlaySession | null;
  sessions: PlaySession[];
  stats: SessionStats;
  
  // Actions (SessionManagerのラッパー)
  startSession: () => void;
  endSession: () => void;
  onGameStart: () => void;
  refreshData: () => void;
  clearAllSessions: () => void;
  
  // Utilities
  isSessionActive: boolean;
}

export const useSessionStoreV2 = create<SessionStoreV2>()((set) => {
  // SessionManagerからの変更通知をリッスン
  const updateFromManager = () => {
    set({
      currentSession: sessionManager.getCurrentSession(),
      sessions: sessionManager.getAllSessions(),
      stats: sessionManager.getSessionStats(),
      isSessionActive: sessionManager.getCurrentSession()?.isActive ?? false
    });
  };

  // 初回データロード
  updateFromManager();

  // SessionManagerの変更をリッスン
  sessionManager.addChangeListener(updateFromManager);

  return {
    // Initial state
    currentSession: sessionManager.getCurrentSession(),
    sessions: sessionManager.getAllSessions(),
    stats: sessionManager.getSessionStats(),
    isSessionActive: sessionManager.getCurrentSession()?.isActive ?? false,

    // Actions
    startSession: () => {
      sessionManager.startSession();
      // SessionManagerが自動的にリスナーを呼び出すため、
      // ここでは明示的なstateUpdateは不要
    },

    endSession: () => {
      sessionManager.endCurrentSession();
    },

    onGameStart: () => {
      sessionManager.onGameStart();
    },

    refreshData: () => {
      updateFromManager();
    },

    clearAllSessions: () => {
      sessionManager.clearAllSessions();
    }
  };
});

// 個別セレクターフック（パフォーマンス最適化）
export const useCurrentSession = () => useSessionStoreV2((state) => state.currentSession);
export const useSessionStats = () => useSessionStoreV2((state) => state.stats);
export const useIsSessionActive = () => useSessionStoreV2((state) => state.isSessionActive);
export const useAllSessions = () => useSessionStoreV2((state) => state.sessions);

// アクションフック（関数参照安定化）
export const useStartSession = () => useSessionStoreV2((state) => state.startSession);
export const useEndSession = () => useSessionStoreV2((state) => state.endSession);
export const useOnGameStart = () => useSessionStoreV2((state) => state.onGameStart);
export const useRefreshSessionData = () => useSessionStoreV2((state) => state.refreshData);
export const useClearAllSessions = () => useSessionStoreV2((state) => state.clearAllSessions);