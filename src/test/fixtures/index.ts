/**
 * Test fixtures integration export
 *
 * Provides all mock factories and test utilities
 * through a unified interface
 */

// Mock factories
export {
  createMockAudioManager,
  createMockAudioSystem,
  createMockDOMEnvironment,
  createMockGameStateStore,
  createMockStatisticsStore,
  createMockStore,
  createTestFixtures,
  expectToThrow,
  measurePerformance,
  setupAsyncTest,
} from './mockFactory';

// Common test utilities
export * from './testUtils';
