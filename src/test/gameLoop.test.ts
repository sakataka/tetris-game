/**
 * ゲームループ統合テスト
 * 
 * ゲーム核心機能の統合動作を検証し、
 * ピース操作・自動落下・ライン消去の基本フローを保証する
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from '../hooks/useGameLoop';

// 依存モジュールのモック
vi.mock('../hooks/useKeyboardInput', () => ({
  useKeyboardInput: vi.fn()
}));

vi.mock('../hooks/useGameTimer', () => ({
  useGameTimer: vi.fn()
}));

vi.mock('../hooks/useDropTimeCalculator', () => ({
  useDropTimeCalculator: vi.fn()
}));

describe('useGameLoop - ゲーム統合テスト', () => {
  let mockActions: {
    movePiece: ReturnType<typeof vi.fn>;
    rotatePieceClockwise: ReturnType<typeof vi.fn>;
    hardDrop: ReturnType<typeof vi.fn>;
    dropPiece: ReturnType<typeof vi.fn>;
    togglePause: ReturnType<typeof vi.fn>;
    resetGame: ReturnType<typeof vi.fn>;
  };

  let mockOnDropTimeChange: ReturnType<typeof vi.fn>;
  let mockUseGameTimer: ReturnType<typeof vi.fn>;
  let mockUseKeyboardInput: ReturnType<typeof vi.fn>;
  let mockUseDropTimeCalculator: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // アクション関数のモック
    mockActions = {
      movePiece: vi.fn(),
      rotatePieceClockwise: vi.fn(),
      hardDrop: vi.fn(),
      dropPiece: vi.fn(),
      togglePause: vi.fn(),
      resetGame: vi.fn()
    };

    mockOnDropTimeChange = vi.fn();

    // 依存フックのモック
    mockUseGameTimer = vi.mocked((await import('../hooks/useGameTimer')).useGameTimer);
    mockUseKeyboardInput = vi.mocked((await import('../hooks/useKeyboardInput')).useKeyboardInput);
    mockUseDropTimeCalculator = vi.mocked((await import('../hooks/useDropTimeCalculator')).useDropTimeCalculator);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本統合動作', () => {
    it('通常ゲーム状態での全フック統合', () => {
      const gameState = {
        isGameOver: false,
        isPaused: false,
        level: 1,
        dropTime: 1000,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange
      };

      renderHook(() => useGameLoop(gameState));

      // 各フックが適切に呼ばれることを確認
      expect(mockUseGameTimer).toHaveBeenCalledWith({
        isActive: true, // !isGameOver && !isPaused
        interval: 1000,
        onTick: mockActions.dropPiece
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
        onConfirm: expect.any(Function)
      });

      expect(mockUseDropTimeCalculator).toHaveBeenCalledWith({
        level: 1,
        initialDropTime: 1000,
        onDropTimeChange: mockOnDropTimeChange
      });
    });

    it('ゲームオーバー状態での適切な制御', () => {
      const gameState = {
        isGameOver: true,
        isPaused: false,
        level: 5,
        dropTime: 500,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange
      };

      renderHook(() => useGameLoop(gameState));

      // ゲームオーバー時はタイマー非アクティブ
      expect(mockUseGameTimer).toHaveBeenCalledWith({
        isActive: false, // isGameOver = true
        interval: 500,
        onTick: mockActions.dropPiece
      });

      // キーボード入力にはゲームオーバー状態が渡される
      expect(mockUseKeyboardInput).toHaveBeenCalledWith(
        expect.objectContaining({
          isGameOver: true
        })
      );
    });

    it('一時停止状態での適切な制御', () => {
      const gameState = {
        isGameOver: false,
        isPaused: true,
        level: 3,
        dropTime: 700,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange
      };

      renderHook(() => useGameLoop(gameState));

      // 一時停止時はタイマー非アクティブ
      expect(mockUseGameTimer).toHaveBeenCalledWith({
        isActive: false, // isPaused = true
        interval: 700,
        onTick: mockActions.dropPiece
      });
    });
  });

  describe('キーボード入力統合', () => {
    it('移動コールバックが正しく設定される', () => {
      renderHook(() => useGameLoop({
        isGameOver: false,
        isPaused: false,
        level: 1,
        dropTime: 1000,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange
      }));

      // キーボード入力の設定を取得
      const keyboardInputCall = mockUseKeyboardInput.mock.calls[0][0];

      // 左移動テスト
      act(() => {
        keyboardInputCall.onMoveLeft();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: -1, y: 0 });

      // 右移動テスト
      act(() => {
        keyboardInputCall.onMoveRight();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: 1, y: 0 });

      // 下移動テスト
      act(() => {
        keyboardInputCall.onMoveDown();
      });
      expect(mockActions.movePiece).toHaveBeenCalledWith({ x: 0, y: 1 });

      // リセット確認テスト
      act(() => {
        keyboardInputCall.onConfirm();
      });
      expect(mockActions.resetGame).toHaveBeenCalled();
    });

    it('ゲームアクションが直接連携される', () => {
      renderHook(() => useGameLoop({
        isGameOver: false,
        isPaused: false,
        level: 1,
        dropTime: 1000,
        initialDropTime: 1000,
        actions: mockActions,
        onDropTimeChange: mockOnDropTimeChange
      }));

      const keyboardInputCall = mockUseKeyboardInput.mock.calls[0][0];

      // 回転テスト
      act(() => {
        keyboardInputCall.onRotate();
      });
      expect(mockActions.rotatePieceClockwise).toHaveBeenCalled();

      // ハードドロップテスト
      act(() => {
        keyboardInputCall.onHardDrop();
      });
      expect(mockActions.hardDrop).toHaveBeenCalled();

      // 一時停止テスト
      act(() => {
        keyboardInputCall.onPause();
      });
      expect(mockActions.togglePause).toHaveBeenCalled();

      // リセットテスト
      act(() => {
        keyboardInputCall.onReset();
      });
      expect(mockActions.resetGame).toHaveBeenCalled();
    });
  });

  describe('レベル・速度統合', () => {
    it('レベル変化時の適切な更新', () => {
      const { rerender } = renderHook(
        ({ level, dropTime }) => useGameLoop({
          isGameOver: false,
          isPaused: false,
          level,
          dropTime,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange
        }),
        { 
          initialProps: { level: 1, dropTime: 1000 }
        }
      );

      // レベル5に上昇
      rerender({ level: 5, dropTime: 400 });

      // 新しい速度でタイマーが設定される
      expect(mockUseGameTimer).toHaveBeenLastCalledWith({
        isActive: true,
        interval: 400, // 高速化された間隔
        onTick: mockActions.dropPiece
      });

      // ドロップタイム計算器にも新しいレベルが渡される
      expect(mockUseDropTimeCalculator).toHaveBeenLastCalledWith({
        level: 5,
        initialDropTime: 1000,
        onDropTimeChange: mockOnDropTimeChange
      });
    });

    it('極端なレベル値での安定動作', () => {
      const extremeCases = [
        { level: 0, dropTime: 2000 },
        { level: 99, dropTime: 50 },
        { level: -1, dropTime: 1000 }
      ];

      extremeCases.forEach(({ level, dropTime }) => {
        const { unmount } = renderHook(() => useGameLoop({
          isGameOver: false,
          isPaused: false,
          level,
          dropTime,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange
        }));

        // クラッシュしないことを確認
        expect(mockUseGameTimer).toHaveBeenCalledWith(
          expect.objectContaining({
            interval: dropTime
          })
        );

        unmount();
      });
    });
  });

  describe('状態変化シナリオ', () => {
    it('ゲーム進行中→一時停止→再開の流れ', () => {
      const { rerender } = renderHook(
        ({ isPaused }) => useGameLoop({
          isGameOver: false,
          isPaused,
          level: 2,
          dropTime: 800,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange
        }),
        { initialProps: { isPaused: false } }
      );

      // 初期状態: アクティブ
      expect(mockUseGameTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );

      // 一時停止
      rerender({ isPaused: true });
      expect(mockUseGameTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: false })
      );

      // 再開
      rerender({ isPaused: false });
      expect(mockUseGameTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });

    it('ゲーム進行中→ゲームオーバー→リセットの流れ', () => {
      const { rerender } = renderHook(
        ({ isGameOver, level }) => useGameLoop({
          isGameOver,
          isPaused: false,
          level,
          dropTime: 1000,
          initialDropTime: 1000,
          actions: mockActions,
          onDropTimeChange: mockOnDropTimeChange
        }),
        { initialProps: { isGameOver: false, level: 1 } }
      );

      // ゲームオーバー
      rerender({ isGameOver: true, level: 1 });
      expect(mockUseGameTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: false })
      );

      // リセット後（レベル1に戻る）
      rerender({ isGameOver: false, level: 1 });
      expect(mockUseGameTimer).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });
  });
});