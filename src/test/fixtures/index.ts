/**
 * テストフィクスチャ統合エクスポート
 * 
 * 全てのモックファクトリとテストユーティリティを
 * 統一インターフェースで提供
 */

// モックファクトリ
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
  measurePerformance
} from './mockFactory';

// 共通テストユーティリティ
export * from './testUtils';

// 型定義
export type * from './types';