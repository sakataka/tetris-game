// useCallback removed - React Compiler handles optimization automatically
import type { GameSettings } from './useSettings';

export interface KeyBindingsAPI {
  updateKeyBinding: (action: keyof GameSettings['keyBindings'], keys: string[]) => void;
  validateKeyBinding: (keys: string[]) => boolean;
  getKeyBinding: (action: keyof GameSettings['keyBindings']) => string[];
  resetKeyBindings: () => void;
}

/**
 * Key bindings management
 *
 * Single responsibility: Handle key binding operations including
 * update, validation, and reset functionality.
 */
export function useKeyBindings(
  currentKeyBindings: GameSettings['keyBindings'],
  defaultKeyBindings: GameSettings['keyBindings'],
  onKeyBindingChange: (keyBindings: GameSettings['keyBindings']) => void
): KeyBindingsAPI {
  // React Compiler will optimize these functions automatically
  const updateKeyBinding = (action: keyof GameSettings['keyBindings'], keys: string[]) => {
    const newKeyBindings = {
      ...currentKeyBindings,
      [action]: keys,
    };
    onKeyBindingChange(newKeyBindings);
  };

  const validateKeyBinding = (keys: string[]): boolean => {
    // Basic validation: at least one key and all keys are valid
    return keys.length > 0 && keys.every((key) => typeof key === 'string' && key.length > 0);
  };

  const getKeyBinding = (action: keyof GameSettings['keyBindings']): string[] => {
    return currentKeyBindings[action] || [];
  };

  const resetKeyBindings = () => {
    onKeyBindingChange(defaultKeyBindings);
  };

  return {
    updateKeyBinding,
    validateKeyBinding,
    getKeyBinding,
    resetKeyBindings,
  };
}
