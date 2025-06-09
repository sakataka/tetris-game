/**
 * 統合定数エクスポート
 * 
 * 機能別に分割された定数ファイルからの再エクスポート
 * 単一の信頼できる情報源として使用
 */

// ゲームルール関連
export * from './gameRules';

// レイアウト・UI関連
export * from './layout';

// テトリミノ定義
export * from './tetrominoes';

// パフォーマンス最適化
export * from './performance';

// ストレージ管理
export * from './storage';

// タイミング・多言語化
export * from './timing';

// 文字列リソース
export * from './strings';

// 後方互換性のためのエイリアス
export const EFFECT_RESET_DELAY = 300; // EFFECTS.RESET_DELAY へのエイリアス