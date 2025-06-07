import { create } from 'zustand';
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
  GameMode,
  PlaySession
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


export const useGameStore = create<GameStore>()((set) => ({
  // Initial state
  ...DEFAULT_GAME_STATE,
  settings: DEFAULT_SETTINGS,
  highScores: [],
  statistics: DEFAULT_STATISTICS,
  theme: DEFAULT_THEME_STATE,
  errors: [],
  currentSession: null,
  playSessions: [],

  // Game state actions
  setGameState: (gameState: Partial<GameState>) => {
    set((state) => ({
      ...state,
      ...gameState
    }));
  },

  resetGame: () => {
    set((state) => {
      const newGameState = {
        ...DEFAULT_GAME_STATE,
        board: createEmptyBoard(),
        currentPiece: getRandomTetromino(),
        nextPiece: getRandomTetromino()
      };
      
      const newStatistics = {
        ...state.statistics,
        totalGames: state.statistics.totalGames + 1
      };
      newStatistics.averageScore = newStatistics.totalGames > 0 
        ? Math.floor(newStatistics.totalScore / newStatistics.totalGames)
        : 0;
      
      return {
        ...state,
        ...newGameState,
        statistics: newStatistics
      };
    });
  },

  togglePause: () => {
    set((state) => ({
      ...state,
      isPaused: !state.isPaused
    }));
  },

  // Settings actions
  updateSettings: (settings: Partial<GameSettings>) => {
    set((state) => ({
      ...state,
      settings: { ...state.settings, ...settings }
    }));
  },

  // High scores actions
  addHighScore: (score: HighScore) => {
    set((state) => {
      const newHighScores = [...state.highScores, score]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const newStatistics = {
        ...state.statistics,
        bestScore: Math.max(state.statistics.bestScore, score.score)
      };
      
      return {
        ...state,
        highScores: newHighScores,
        statistics: newStatistics
      };
    });
  },

  clearHighScores: () => {
    set((state) => ({
      ...state,
      highScores: []
    }));
  },

  // Statistics actions
  updateStatistics: (stats: Partial<GameStatistics>) => {
    set((state) => {
      const newStatistics = { ...state.statistics, ...stats };
      if (newStatistics.totalGames > 0) {
        newStatistics.averageScore = Math.floor(
          newStatistics.totalScore / newStatistics.totalGames
        );
      }
      return {
        ...state,
        statistics: newStatistics
      };
    });
  },

  resetStatistics: () => {
    set((state) => ({
      ...state,
      statistics: DEFAULT_STATISTICS
    }));
  },

  // Theme actions
  setTheme: (theme: ThemeVariant) => {
    set((state) => ({
      ...state,
      theme: { ...state.theme, current: theme },
      settings: { ...state.settings, theme }
    }));
  },

  updateThemeState: (themeState: Partial<ThemeState>) => {
    set((state) => ({
      ...state,
      theme: { ...state.theme, ...themeState }
    }));
  },

  // Error handling actions
  addError: (error: GameError) => {
    set((state) => {
      const newErrors = [...state.errors, error];
      if (newErrors.length > 50) {
        newErrors.splice(0, newErrors.length - 50);
      }
      return {
        ...state,
        errors: newErrors
      };
    });
  },

  clearErrors: () => {
    set((state) => ({
      ...state,
      errors: []
    }));
  },

  clearError: (errorId: string) => {
    set((state) => ({
      ...state,
      errors: state.errors.filter(error => 
        error.timestamp.toString() !== errorId
      )
    }));
  },

  // Session tracking actions
  startPlaySession: () => {
    set((state) => {
      const newPlaySessions = [...state.playSessions];
      
      // End current session if exists
      if (state.currentSession?.isActive) {
        const completedSession: PlaySession = {
          ...state.currentSession,
          endTime: Date.now(),
          isActive: false
        };
        newPlaySessions.push(completedSession);
      }

      // Start new session
      const newSession: PlaySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        startTime: Date.now(),
        gameCount: 0,
        isActive: true
      };
      
      return {
        ...state,
        currentSession: newSession,
        playSessions: newPlaySessions
      };
    });
  },

  endPlaySession: () => {
    set((state) => {
      if (!state.currentSession?.isActive) {
        return state;
      }
      
      const completedSession: PlaySession = {
        ...state.currentSession,
        endTime: Date.now(),
        isActive: false
      };
      
      // Only add if not already in the list (prevent duplicates)
      const existingSession = state.playSessions.find(s => s.id === completedSession.id);
      const newPlaySessions = [...state.playSessions];
      const newStatistics = { ...state.statistics };
      
      if (!existingSession) {
        newPlaySessions.push(completedSession);
        
        // Update play time statistics
        const sessionDuration = (completedSession.endTime! - completedSession.startTime) / 1000; // seconds
        newStatistics.playTime += sessionDuration;
      }
      
      return {
        ...state,
        currentSession: null,
        playSessions: newPlaySessions,
        statistics: newStatistics
      };
    });
  },

  incrementGameCount: () => {
    set((state) => {
      let newCurrentSession = state.currentSession;
      if (state.currentSession?.isActive) {
        newCurrentSession = {
          ...state.currentSession,
          gameCount: state.currentSession.gameCount + 1
        };
      }
      
      return {
        ...state,
        currentSession: newCurrentSession,
        statistics: {
          ...state.statistics,
          totalGames: state.statistics.totalGames + 1
        }
      };
    });
  }
}));

// Simple selectors that return individual values to avoid object recreation
export const useGameActions = () => {
  const setGameState = useGameStore(state => state.setGameState);
  const resetGame = useGameStore(state => state.resetGame);
  const togglePause = useGameStore(state => state.togglePause);
  
  return { setGameState, resetGame, togglePause };
};

export const useSettings = () => {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  
  return { settings, updateSettings };
};

export const useHighScores = () => {
  const highScores = useGameStore(state => state.highScores);
  const addHighScore = useGameStore(state => state.addHighScore);
  const clearHighScores = useGameStore(state => state.clearHighScores);
  
  return { highScores, addHighScore, clearHighScores };
};

export const useStatistics = () => {
  const statistics = useGameStore(state => state.statistics);
  const updateStatistics = useGameStore(state => state.updateStatistics);
  const resetStatistics = useGameStore(state => state.resetStatistics);
  
  return { statistics, updateStatistics, resetStatistics };
};

export const useTheme = () => {
  const theme = useGameStore(state => state.theme);
  const setTheme = useGameStore(state => state.setTheme);
  const updateThemeState = useGameStore(state => state.updateThemeState);
  
  return { theme, setTheme, updateThemeState };
};

export const useErrors = () => {
  const errors = useGameStore(state => state.errors);
  const addError = useGameStore(state => state.addError);
  const clearErrors = useGameStore(state => state.clearErrors);
  const clearError = useGameStore(state => state.clearError);
  
  return { errors, addError, clearErrors, clearError };
};