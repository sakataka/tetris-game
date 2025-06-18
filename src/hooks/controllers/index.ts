/**
 * Controller Hooks - Hook-based replacements for render prop controllers
 *
 * These hooks replace the 5-level render prop nesting pattern with
 * clean composition hooks that are optimized by React Compiler.
 */

export type { AudioSystemAPI } from './useAudioController';
export { useAudioController } from './useAudioController';
export type { DeviceSystemAPI } from './useDeviceController';
export { useDeviceController } from './useDeviceController';
export type { EventSystemAPI } from './useEventController';
export { useEventController } from './useEventController';
export type { GameStateAPI } from './useGameStateController';
export { useGameStateController } from './useGameStateController';
