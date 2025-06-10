'use client';

import GameOrchestrator from './GameOrchestrator';
import GameLogicController from './GameLogicController';
import GameLayoutManager from './GameLayoutManager';
import ErrorBoundary from './ErrorBoundary';

/**
 * TetrisGame is the main entry point component, now refactored into a clean architecture:
 * - GameOrchestrator: Handles initialization and lifecycle
 * - GameLogicController: Manages state, audio, and game logic
 * - GameLayoutManager: Handles UI layout and responsive design
 *
 * This decomposition follows the Single Responsibility Principle and improves:
 * - Maintainability: Each component has a clear, focused responsibility
 * - Testability: Components can be tested independently
 * - Reusability: Logic components can be reused with different UI layouts
 */
export default function TetrisGame() {
  return (
    <ErrorBoundary level='page'>
      <GameOrchestrator>
        <GameLogicController>{(api) => <GameLayoutManager api={api} />}</GameLogicController>
      </GameOrchestrator>
    </ErrorBoundary>
  );
}
