import { useCallback, useEffect, useRef } from 'react';
import { 
  useStatisticsStore,
  useAddHighScore,
  useUpdateStatistics 
} from '../store/statisticsStore';
import { GameState, SoundKey } from '../types/tetris';
import {
  isHighScore,
  getHighScoreRank,
  getHighScoreMessage,
  createHighScoreEntry
} from '../utils/highScoreUtils';

interface UseHighScoreManagerProps {
  gameState: GameState;
  playSound?: (soundType: SoundKey) => void;
}

interface HighScoreResult {
  isNewHighScore: boolean;
  rank?: number;
  message?: string;
}

export function useHighScoreManager({ gameState, playSound }: UseHighScoreManagerProps) {
  const addHighScore = useAddHighScore();
  const updateStatistics = useUpdateStatistics();
  const previousGameOverRef = useRef(false);
  const gameEndProcessedRef = useRef(false);

  // ゲーム終了を検知してハイスコア処理を実行
  const processGameEnd = useCallback((finalScore: number, level: number, lines: number): HighScoreResult => {
    // すでに処理済みの場合はスキップ
    if (gameEndProcessedRef.current) {
      return { isNewHighScore: false };
    }

    gameEndProcessedRef.current = true;

    // ストアから現在の状態を取得
    const currentState = useStatisticsStore.getState();
    const { highScores, statistics } = currentState;

    // 統計を更新
    const newStats = {
      totalGames: statistics.totalGames + 1,
      totalScore: statistics.totalScore + finalScore,
      totalLines: statistics.totalLines + lines,
      playTime: statistics.playTime + Date.now() // 簡易的な時間計算（実際の実装では開始時間を記録）
    };

    // Tetrisボーナスのカウント（4ライン同時消去の検出は別途実装が必要）
    updateStatistics(newStats);

    // ハイスコア判定
    if (isHighScore(finalScore, highScores)) {
      const rank = getHighScoreRank(finalScore, highScores);
      const message = rank ? getHighScoreMessage(rank) : '';
      
      // ハイスコアエントリを作成して保存
      const highScoreEntry = createHighScoreEntry(finalScore, level, lines);
      addHighScore(highScoreEntry);
      
      // 音効果の再生
      if (playSound) {
        if (rank === 1) {
          playSound('tetris'); // 1位の場合は特別な音
        } else {
          playSound('lineClear'); // その他のハイスコアの場合
        }
      }

      return {
        isNewHighScore: true,
        rank: rank || undefined,
        message
      };
    }

    return { isNewHighScore: false };
  }, [addHighScore, updateStatistics, playSound]);

  // ゲームリセット時の処理
  const handleGameReset = useCallback(() => {
    gameEndProcessedRef.current = false;
  }, []);

  // ゲーム状態の変化を監視
  useEffect(() => {
    const isGameOver = gameState.gameOver;
    const wasGameOver = previousGameOverRef.current;

    // ゲームが終了した瞬間を検知
    if (isGameOver && !wasGameOver && !gameEndProcessedRef.current) {
      processGameEnd(gameState.score, gameState.level, gameState.lines);
    }

    // ゲームがリセットされた場合
    if (!isGameOver && wasGameOver) {
      handleGameReset();
    }

    previousGameOverRef.current = isGameOver;
  }, [gameState.gameOver, gameState.score, gameState.level, gameState.lines, processGameEnd, handleGameReset]);

  // ハイスコア関連の便利関数
  const checkIsHighScore = useCallback((score: number) => {
    const { highScores } = useStatisticsStore.getState();
    return isHighScore(score, highScores);
  }, []);

  const getScoreRank = useCallback((score: number) => {
    const { highScores } = useStatisticsStore.getState();
    return getHighScoreRank(score, highScores);
  }, []);

  const getCurrentHighScore = useCallback(() => {
    const { highScores } = useStatisticsStore.getState();
    return highScores.length > 0 ? highScores[0].score : 0;
  }, []);

  const getLowestHighScore = useCallback(() => {
    const { highScores } = useStatisticsStore.getState();
    return highScores.length > 0 ? highScores[highScores.length - 1].score : 0;
  }, []);

  // 手動でハイスコアを保存する関数（テスト用）
  const manualSaveHighScore = useCallback((score: number, level: number, lines: number, playerName?: string) => {
    const highScoreEntry = createHighScoreEntry(score, level, lines, playerName);
    addHighScore(highScoreEntry);
    return highScoreEntry;
  }, [addHighScore]);

  return {
    // ハイスコア判定関数
    checkIsHighScore,
    getScoreRank,
    getCurrentHighScore,
    getLowestHighScore,
    
    // 手動保存関数
    manualSaveHighScore,
    
    // 現在のハイスコアと統計のゲッター
    getHighScores: () => useStatisticsStore.getState().highScores,
    getStatistics: () => useStatisticsStore.getState().statistics,
    
    // 処理状態
    isGameEndProcessed: gameEndProcessedRef.current
  };
}