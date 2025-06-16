/**
 * Centralized controller exports for clean architecture pattern
 */

export { AudioController } from './AudioController';
export { EventController } from './EventController';
export { DeviceController } from './DeviceController';

export type { AudioSystemAPI } from './AudioController';
export type { EventSystemAPI } from './EventController';
export type { DeviceSystemAPI } from './DeviceController';
