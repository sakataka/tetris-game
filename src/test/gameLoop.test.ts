/**
 * Game loop integration tests
 *
 * Verifies integrated operation of core game functionality
 * and ensures basic flow of piece manipulation, automatic drop, and line clearing
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from '../hooks/useGameLoop';

// Mock dependent modules
vi.mock('../hooks/useKeyboardInput', () => ({
  useKeyboardInput: vi.fn(),
}));

vi.mock('../hooks/useAnimationTimer', () => ({
  useAnimationTimer: vi.fn(),
}));

vi.mock('../hooks/useDropTimeCalculator', () => ({
  useDropTimeCalculator: vi.fn(),
}));

describe('useGameLoop - Game integration tests', () => {
  let mockActions: {
    movePiece: ReturnType<typeof vi.fn>;
    rotatePieceClockwise: ReturnType<typeof vi.fn>;
    hardDrop: ReturnType<typeof vi.fn>;
    dropPiece: ReturnType<typeof vi.fn>;
    togglePause: ReturnType<typeof vi.fn>;
    resetGame: ReturnType<typeof vi.fn>;
  };

  let mockOnDropTimeChange: ReturnType<typeof vi.fn>;
  let mockUseAnimationTimer: ReturnType<typeof vi.fn>;
  let mockUseKeyboardInput: ReturnType<typeof vi.fn>;
  let mockUseDropTimeCalculator: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock action functions
    mockActions = {
      movePiece: vi.fn(),
      rotatePieceClockwise: vi.fn(),
      hardDrop: vi.fn(),
      dropPiece: vi.fn(),
      togglePause: vi.fn(),
      resetGame: vi.fn(),
    };

    mockOnDropTimeChange = vi.fn();

    // Mock dependent hooks
    mockUseAnimationTimer = vi.mocked(
      (await import('../hooks/useAnimationTimer')).useAnimationTimer
    );
    mockUseKeyboardInput = vi.mocked((await import('../hooks/useKeyboardInput')).useKeyboardInput);
    mockUseDropTimeCalculator = vi.mocked(
      (await import('../hooks/useDropTimeCalculator')).useDropTimeCalculator
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic integration operations', () => {
    it('Integration of all hooks in normal game state', () => {
      const gameState = {
        isGameOver: false,
        isPaused: false,
        level: 1,
        dropTime: 1000,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange,
      };

      renderHook(() => useGameLoop(gameState));

      // Verify that each hook is called appropriately
      expect(mockUseAnimationTimer).toHaveBeenCalledWith({
        isActive: true, // !isGameOver && !isPaused
        interval: 1000,
        onTick: mockActions.dropPiece,
      });

      expect(mockUseKeyboardInput).toHaveBeenCalledWith({
        isGameOver: false,
        onMoveLeft: expect.any(Function),
        onMoveRight: expect.any(Function),
        onMoveDown: expect.any(Function),
        onRotate: mockActions.rotatePieceClockwise,
        onHardDrop: mockActions.hardDrop,
        onPause: mockActions.togglePause,
        onReset: mockActions.resetGame,
        onConfirm: expect.any(Function),
      });

      expect(mockUseDropTimeCalculator).toHaveBeenCalledWith({
        level: 1,
        initialDropTime: 1000,
        onDropTimeChange: mockOnDropTimeChange,
      });
    });

    it('Proper control in game over state', () => {
      const gameState = {
        isGameOver: true,
        isPaused: false,
        level: 5,
        dropTime: 500,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange,
      };

      renderHook(() => useGameLoop(gameState));

      // Timer is inactive during game over
      expect(mockUseAnimationTimer).toHaveBeenCalledWith({
        isActive: false, // isGameOver = true
        interval: 500,
        onTick: mockActions.dropPiece,
      });

      // Game over state is passed to keyboard input
      expect(mockUseKeyboardInput).toHaveBeenCalledWith(
        expect.objectContaining({
          isGameOver: true,
        })
      );
    });

    it('Proper control in paused state', () => {
      const gameState = {
        isGameOver: false,
        isPaused: true,
        level: 3,
        dropTime: 700,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange,
      };

      renderHook(() => useGameLoop(gameState));

      // Timer is inactive when paused
      expect(mockUseAnimationTimer).toHaveBeenCalledWith({
        isActive: false, // isPaused = true
        interval: 700,
        onTick: mockActions.dropPiece,
      });
    });
  });

  describe('Keyboard input integration', () => {
    it('Movement callbacks are correctly configured', () => {
      renderHook(() =>
        useGameLoop({
          isGameOver: false,
          isPaused: false,
          level: 1,
          dropTime: 1000,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange,
        })
      );

      // Get keyboard input configuration
      const keyboardInputCall = mockUseKeyboardInput.mock.calls[0]?.[0];

      // Test left movement
      act(() => {
        keyboardInputCall?.onMoveLeft();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: -1, y: 0 });

      // Test right movement
      act(() => {
        keyboardInputCall.onMoveRight();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: 1, y: 0 });

      // Test down movement
      act(() => {
        keyboardInputCall.onMoveDown();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: 0, y: 1 });

      // Test reset confirmation
      act(() => {
        keyboardInputCall.onConfirm();
      });
      expect(mockActions.resetGame).toHaveBeenCalled();
    });

    it('Game actions are directly linked', () => {
      renderHook(() =>
        useGameLoop({
          isGameOver: false,
          isPaused: false,
          level: 1,
          dropTime: 1000,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange,
        })
      );

      const keyboardInputCall = mockUseKeyboardInput.mock.calls[0]?.[0];

      // Test rotation
      act(() => {
        keyboardInputCall?.onRotate();
      });
      expect(mockActions.rotatePieceClockwise).toHaveBeenCalled();

      // Test hard drop
      act(() => {
        keyboardInputCall.onHardDrop();
      });
      expect(mockActions.hardDrop).toHaveBeenCalled();

      // Test pause
      act(() => {
        keyboardInputCall.onPause();
      });
      expect(mockActions.togglePause).toHaveBeenCalled();

      // Test reset
      act(() => {
        keyboardInputCall.onReset();
      });
      expect(mockActions.resetGame).toHaveBeenCalled();
    });
  });

  describe('Level and speed integration', () => {
    it('Proper updates when level changes', () => {
      const { rerender } = renderHook(
        ({ level, dropTime }) =>
          useGameLoop({
            isGameOver: false,
            isPaused: false,
            level,
            dropTime,
            initialDropTime: 1000,
            actions: mockActions,
            onDropTimeChange: mockOnDropTimeChange,
          }),
        {
          initialProps: { level: 1, dropTime: 1000 },
        }
      );

      // Increase to level 5
      rerender({ level: 5, dropTime: 400 });

      // Timer is set with new speed
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith({
        isActive: true,
        interval: 400, // Accelerated interval
        onTick: mockActions.dropPiece,
      });

      // New level is also passed to drop time calculator
      expect(mockUseDropTimeCalculator).toHaveBeenLastCalledWith({
        level: 5,
        initialDropTime: 1000,
        onDropTimeChange: mockOnDropTimeChange,
      });
    });

    it('Stable operation with extreme level values', () => {
      const extremeCases = [
        { level: 0, dropTime: 2000 },
        { level: 99, dropTime: 50 },
        { level: -1, dropTime: 1000 },
      ];

      extremeCases.forEach(({ level, dropTime }) => {
        const { unmount } = renderHook(() =>
          useGameLoop({
            isGameOver: false,
            isPaused: false,
            level,
            dropTime,
            initialDropTime: 1000,
            actions: mockActions,
            onDropTimeChange: mockOnDropTimeChange,
          })
        );

        // Verify no crashes occur
        expect(mockUseAnimationTimer).toHaveBeenCalledWith(
          expect.objectContaining({
            interval: dropTime,
          })
        );

        unmount();
      });
    });
  });

  describe('State transition scenarios', () => {
    it('Game progress → pause → resume flow', () => {
      const { rerender } = renderHook(
        ({ isPaused }) =>
          useGameLoop({
            isGameOver: false,
            isPaused,
            level: 2,
            dropTime: 800,
            initialDropTime: 1000,
            actions: mockActions,
            onDropTimeChange: mockOnDropTimeChange,
          }),
        { initialProps: { isPaused: false } }
      );

      // Initial state: active
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );

      // Pause
      rerender({ isPaused: true });
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: false })
      );

      // Resume
      rerender({ isPaused: false });
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });

    it('Game progress → game over → reset flow', () => {
      const { rerender } = renderHook(
        ({ isGameOver, level }) =>
          useGameLoop({
            isGameOver,
            isPaused: false,
            level,
            dropTime: 1000,
            initialDropTime: 1000,
            actions: mockActions,
            onDropTimeChange: mockOnDropTimeChange,
          }),
        { initialProps: { isGameOver: false, level: 1 } }
      );

      // Game over
      rerender({ isGameOver: true, level: 1 });
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: false })
      );

      // After reset (return to level 1)
      rerender({ isGameOver: false, level: 1 });
      expect(mockUseAnimationTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });
  });
});
