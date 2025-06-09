import { create } from 'zustand';
import { GameStatistics, HighScore } from '../types/tetris';

// デフォルト統計値
const DEFAULT_STATISTICS: GameStatistics = {
  totalGames: 0,
  totalLines: 0,
  totalScore: 0,
  bestScore: 0,
  averageScore: 0,
  playTime: 0,
  bestStreak: 0,
  tetrisCount: 0
};

interface StatisticsStore {
  // State
  highScores: readonly HighScore[];
  statistics: GameStatistics;
  
  // High Score Actions
  addHighScore: (score: HighScore) => void;
  clearHighScores: () => void;
  
  // Statistics Actions
  updateStatistics: (stats: Partial<GameStatistics>) => void;
  resetStatistics: () => void;
  incrementTotalGames: () => void;
  updateBestScore: (score: number) => void;
  addScore: (score: number) => void;
  addLines: (lines: number) => void;
  addTetris: () => void;
  addPlayTime: (time: number) => void;
  updateBestStreak: (streak: number) => void;
  
  // Computed getters
  getAverageScore: () => number;
  getEfficiency: () => number;
}

export const useStatisticsStore = create<StatisticsStore>()((set, get) => ({
  // Initial state
  highScores: [],
  statistics: DEFAULT_STATISTICS,
  
  // High Score Actions
  addHighScore: (score) =>
    set((state) => {
      const newHighScores = [...state.highScores, score]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10
      
      return {
        highScores: newHighScores,
        statistics: {
          ...state.statistics,
          bestScore: Math.max(state.statistics.bestScore, score.score)
        }
      };
    }),
  
  clearHighScores: () =>
    set((state) => ({
      highScores: [],
      statistics: {
        ...state.statistics,
        bestScore: 0
      }
    })),
  
  // Statistics Actions
  updateStatistics: (stats) =>
    set((state) => ({
      statistics: { ...state.statistics, ...stats }
    })),
  
  resetStatistics: () =>
    set(() => ({
      statistics: DEFAULT_STATISTICS
    })),
  
  incrementTotalGames: () =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        totalGames: state.statistics.totalGames + 1
      }
    })),
  
  updateBestScore: (score) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        bestScore: Math.max(state.statistics.bestScore, score)
      }
    })),
  
  addScore: (score) =>
    set((state) => {
      const newTotalScore = state.statistics.totalScore + score;
      const totalGames = Math.max(state.statistics.totalGames, 1);
      
      return {
        statistics: {
          ...state.statistics,
          totalScore: newTotalScore,
          averageScore: Math.round(newTotalScore / totalGames)
        }
      };
    }),
  
  addLines: (lines) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        totalLines: state.statistics.totalLines + lines
      }
    })),
  
  addTetris: () =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        tetrisCount: state.statistics.tetrisCount + 1
      }
    })),
  
  addPlayTime: (time) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        playTime: state.statistics.playTime + time
      }
    })),
  
  updateBestStreak: (streak) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        bestStreak: Math.max(state.statistics.bestStreak, streak)
      }
    })),
  
  // Computed getters
  getAverageScore: () => {
    const { statistics } = get();
    return statistics.totalGames > 0 
      ? Math.round(statistics.totalScore / statistics.totalGames)
      : 0;
  },
  
  getEfficiency: () => {
    const { statistics } = get();
    return statistics.playTime > 0 
      ? Math.round((statistics.totalLines / (statistics.playTime / 60)) * 100) / 100
      : 0;
  }
}));

// Selector hooks for optimized access
export const useHighScores = () => useStatisticsStore((state) => state.highScores);
export const useStatistics = () => useStatisticsStore((state) => state.statistics);

// 個別アクションフック（関数参照安定化）
export const useAddHighScore = () => useStatisticsStore((state) => state.addHighScore);
export const useClearHighScores = () => useStatisticsStore((state) => state.clearHighScores);
export const useUpdateStatistics = () => useStatisticsStore((state) => state.updateStatistics);
export const useResetStatistics = () => useStatisticsStore((state) => state.resetStatistics);
export const useIncrementTotalGames = () => useStatisticsStore((state) => state.incrementTotalGames);
export const useUpdateBestScore = () => useStatisticsStore((state) => state.updateBestScore);
export const useAddScore = () => useStatisticsStore((state) => state.addScore);
export const useAddLines = () => useStatisticsStore((state) => state.addLines);
export const useAddTetris = () => useStatisticsStore((state) => state.addTetris);
export const useAddPlayTime = () => useStatisticsStore((state) => state.addPlayTime);
export const useUpdateBestStreak = () => useStatisticsStore((state) => state.updateBestStreak);
export const useGetAverageScore = () => useStatisticsStore((state) => state.getAverageScore);
export const useGetEfficiency = () => useStatisticsStore((state) => state.getEfficiency);