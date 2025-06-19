/**
 * Centralized controller exports for clean architecture pattern
 */

export type { AudioSystemAPI } from '../../hooks/controllers/useAudioController';
export type { DeviceSystemAPI } from './DeviceController';
export { DeviceController } from './DeviceController';
export type { EventSystemAPI } from './EventController';
export { EventController } from './EventController';
