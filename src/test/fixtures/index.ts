/**
 * Test fixtures integration export
 *
 * Provides all mock factories and test utilities
 * through a unified interface
 */

// Mock factories
export {
  createMockAudioSystem,
  createMockAudioManager,
  createMockDOMEnvironment,
  createMockStore,
  createMockStatisticsStore,
  createMockGameStateStore,
  createTestFixtures,
  setupAsyncTest,
  expectToThrow,
  measurePerformance,
} from './mockFactory';

// Common test utilities
export * from './testUtils';
