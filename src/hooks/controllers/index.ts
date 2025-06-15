/**
 * Controller Hooks - Hook-based replacements for render prop controllers
 *
 * These hooks replace the 5-level render prop nesting pattern with
 * clean composition hooks that are optimized by React Compiler.
 */

export { useAudioController } from './useAudioController';
export { useDeviceController } from './useDeviceController';
export { useEventController } from './useEventController';
export { useGameStateController } from './useGameStateController';

export type { AudioSystemAPI } from './useAudioController';
export type { DeviceSystemAPI } from './useDeviceController';
export type { EventSystemAPI } from './useEventController';
export type { GameStateAPI } from './useGameStateController';
