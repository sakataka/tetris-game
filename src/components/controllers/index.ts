/**
 * Centralized controller exports for clean architecture pattern
 */

export { GameStateController } from './GameStateController';
export { AudioController } from './AudioController';
export { EventController } from './EventController';
export { DeviceController } from './DeviceController';

export type { GameStateAPI } from './GameStateController';
export type { AudioSystemAPI } from './AudioController';
export type { EventSystemAPI } from './EventController';
export type { DeviceSystemAPI } from './DeviceController';
