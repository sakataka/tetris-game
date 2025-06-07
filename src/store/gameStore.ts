import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  GlobalGameState,
  GameStoreActions,
  GameState,
  GameSettings,
  HighScore,
  GameStatistics,
  ThemeState,
  GameError,
  ThemeVariant,
  DifficultyLevel,
  GameMode
} from '../types/tetris';
import { createEmptyBoard, getRandomTetromino } from '../utils/tetrisUtils';

// Default values
const DEFAULT_SETTINGS: GameSettings = {
  volume: 0.5,
  isMuted: false,
  theme: 'cyberpunk' as ThemeVariant,
  keyBindings: {
    'left': 'ArrowLeft',
    'right': 'ArrowRight',
    'down': 'ArrowDown',
    'rotate': 'ArrowUp',
    'hardDrop': 'Space',
    'pause': 'Escape'
  },
  difficulty: 'normal' as DifficultyLevel,
  gameMode: 'single' as GameMode
};

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

const DEFAULT_THEME_STATE: ThemeState = {
  current: 'cyberpunk' as ThemeVariant,
  effectIntensity: 1.0,
  animations: true
};

const DEFAULT_GAME_STATE: GameState = {
  board: createEmptyBoard(),
  currentPiece: getRandomTetromino(),
  nextPiece: getRandomTetromino(),
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  isPaused: false,
  lineEffect: {
    flashingLines: [],
    shaking: false,
    particles: []
  }
};

type GameStore = GlobalGameState & GameStoreActions;

export const useGameStore = create<GameStore>()(
  persist(
    immer((set) => ({
      // Initial state
      ...DEFAULT_GAME_STATE,
      settings: DEFAULT_SETTINGS,
      highScores: [],
      statistics: DEFAULT_STATISTICS,
      theme: DEFAULT_THEME_STATE,
      errors: [],

      // Game state actions
      setGameState: (gameState: Partial<GameState>) => {
        set((state) => {
          Object.assign(state, gameState);
        });
      },

      resetGame: () => {
        set((state) => {
          const newGameState = {
            ...DEFAULT_GAME_STATE,
            board: createEmptyBoard(),
            currentPiece: getRandomTetromino(),
            nextPiece: getRandomTetromino()
          };
          Object.assign(state, newGameState);
          
          // Update statistics
          state.statistics.totalGames += 1;
          if (state.statistics.totalGames > 0) {
            state.statistics.averageScore = Math.floor(
              state.statistics.totalScore / state.statistics.totalGames
            );
          }
        });
      },

      togglePause: () => {
        set((state) => {
          state.isPaused = !state.isPaused;
        });
      },

      // Settings actions
      updateSettings: (settings: Partial<GameSettings>) => {
        set((state) => {
          Object.assign(state.settings, settings);
        });
      },

      // High scores actions
      addHighScore: (score: HighScore) => {
        set((state) => {
          state.highScores.push(score);
          // Keep only top 10 scores
          state.highScores.sort((a, b) => b.score - a.score);
          if (state.highScores.length > 10) {
            state.highScores.splice(10);
          }
          
          // Update best score in statistics
          if (score.score > state.statistics.bestScore) {
            state.statistics.bestScore = score.score;
          }
        });
      },

      clearHighScores: () => {
        set((state) => {
          state.highScores.splice(0);
        });
      },

      // Statistics actions
      updateStatistics: (stats: Partial<GameStatistics>) => {
        set((state) => {
          Object.assign(state.statistics, stats);
          
          // Recalculate derived values
          if (state.statistics.totalGames > 0) {
            state.statistics.averageScore = Math.floor(
              state.statistics.totalScore / state.statistics.totalGames
            );
          }
        });
      },

      resetStatistics: () => {
        set((state) => {
          Object.assign(state.statistics, DEFAULT_STATISTICS);
        });
      },

      // Theme actions
      setTheme: (theme: ThemeVariant) => {
        set((state) => {
          state.theme.current = theme;
          state.settings.theme = theme;
        });
      },

      updateThemeState: (themeState: Partial<ThemeState>) => {
        set((state) => {
          Object.assign(state.theme, themeState);
        });
      },

      // Error handling actions
      addError: (error: GameError) => {
        set((state) => {
          state.errors.push(error);
          // Keep only last 50 errors
          if (state.errors.length > 50) {
            state.errors.splice(0, state.errors.length - 50);
          }
        });
      },

      clearErrors: () => {
        set((state) => {
          state.errors.splice(0);
        });
      },

      clearError: (errorId: string) => {
        set((state) => {
          const index = state.errors.findIndex(error => 
            error.timestamp.toString() === errorId
          );
          if (index !== -1) {
            state.errors.splice(index, 1);
          }
        });
      }
    })),
    {
      name: 'tetris-game-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist settings, high scores, statistics, and theme
      partialize: (state) => ({
        settings: state.settings,
        highScores: state.highScores,
        statistics: state.statistics,
        theme: state.theme
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 1) {
          // Migration logic for future versions
          const state = persistedState as {
            settings?: Partial<GameSettings>;
            statistics?: Partial<GameStatistics>;
            theme?: Partial<ThemeState>;
            highScores?: HighScore[];
          };
          return {
            settings: { ...DEFAULT_SETTINGS, ...(state?.settings || {}) },
            statistics: { ...DEFAULT_STATISTICS, ...(state?.statistics || {}) },
            theme: { ...DEFAULT_THEME_STATE, ...(state?.theme || {}) },
            highScores: state?.highScores || []
          };
        }
        return persistedState;
      }
    }
  )
);

// Utility hooks for specific parts of the store
export const useGameState = () => useGameStore((state) => ({
  board: state.board,
  currentPiece: state.currentPiece,
  nextPiece: state.nextPiece,
  score: state.score,
  level: state.level,
  lines: state.lines,
  gameOver: state.gameOver,
  isPaused: state.isPaused,
  lineEffect: state.lineEffect
}));

export const useGameActions = () => useGameStore((state) => ({
  setGameState: state.setGameState,
  resetGame: state.resetGame,
  togglePause: state.togglePause
}));

export const useSettings = () => useGameStore((state) => ({
  settings: state.settings,
  updateSettings: state.updateSettings
}));

export const useHighScores = () => useGameStore((state) => ({
  highScores: state.highScores,
  addHighScore: state.addHighScore,
  clearHighScores: state.clearHighScores
}));

export const useStatistics = () => useGameStore((state) => ({
  statistics: state.statistics,
  updateStatistics: state.updateStatistics,
  resetStatistics: state.resetStatistics
}));

export const useTheme = () => useGameStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
  updateThemeState: state.updateThemeState
}));

export const useErrors = () => useGameStore((state) => ({
  errors: state.errors,
  addError: state.addError,
  clearErrors: state.clearErrors,
  clearError: state.clearError
}));