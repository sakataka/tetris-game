/**
 * 簡素化されたセッション追跡フック (v2)
 *
 * SessionManagerサービスクラスを使用した
 * シンプルで効率的なフック実装
 */

import { useEffect } from 'react';
import {
  useCurrentSession,
  useIsSessionActive,
  useSessionStats,
  useStartSession,
  useEndSession,
  useOnGameStart,
} from '../store/sessionStoreV2';

export function useSessionTrackingV2() {
  const currentSession = useCurrentSession();
  const isSessionActive = useIsSessionActive();
  const sessionStats = useSessionStats();
  const startSession = useStartSession();
  const endSession = useEndSession();
  const onGameStart = useOnGameStart();

  // コンポーネントマウント時にセッション開始
  useEffect(() => {
    if (!currentSession) {
      startSession();
    }
  }, [currentSession, startSession]);

  return {
    // Session state
    currentSession,
    isSessionActive,
    sessionStats,

    // Session actions
    onGameStart,
    endSession,

    // Computed values
    currentSessionDuration: currentSession
      ? Math.floor((Date.now() - currentSession.startTime) / 1000)
      : 0,

    gameCountInCurrentSession: currentSession?.gameCount ?? 0,
  };
}
