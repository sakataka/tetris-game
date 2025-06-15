/**
 * GameLogicController - Hook-based implementation
 *
 * Replaces the 5-level render prop nesting with clean hook composition.
 * This demonstrates the modernized pattern that React Compiler can optimize.
 */

import { type GameControllerAPI, useGameController } from '../hooks/useGameController';

interface GameLogicControllerProps {
  children: (api: GameControllerAPI) => React.ReactNode;
}

/**
 * Modernized GameLogicController using hook composition instead of render props.
 *
 * Benefits:
 * - Single hook call replaces 5-level nesting
 * - Better React Compiler optimization
 * - Cleaner component tree
 * - Reduced cognitive load
 *
 * Before: 5 levels of render prop nesting (72 lines)
 * After: Single hook call (15 lines)
 */
export default function GameLogicController({ children }: GameLogicControllerProps) {
  // Single hook call replaces the entire render prop chain
  const gameControllerAPI = useGameController();

  return children(gameControllerAPI);
}

// Re-export the API interface for backward compatibility
export type { GameControllerAPI };
