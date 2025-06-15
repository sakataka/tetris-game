# 🧹 Codebase Cleanup Report

## 概要
未使用コードの調査結果とクリーンアップ計画をまとめました。以下のカテゴリで詳細に分析しています。

## ✅ 削除済み (SSR関連)
**すでに削除済みのファイル：**
- `/src/entry.server.tsx` (150行) - SSRエントリーポイント
- `/src/entry.client.tsx` (33行) - クライアントハイドレーション
- `/src/utils/ssr/isomorphicStore.ts` (114行) - SSR対応Zustandユーティリティ
- `/src/utils/security.ts` (315行) - サーバーサイドセキュリティミドルウェア

**削除結果：** 合計612行のコードを削除済み

---

## 🎵 Audio/Sound関連

### ✅ 使用中のファイル
**すべてのサウンドファイルは使用中：**
- `public/sounds/game-over.mp3` - ゲーム終了時
- `public/sounds/hard-drop.mp3` - ハードドロップ時
- `public/sounds/line-clear.mp3` - 1-3ライン消去時
- `public/sounds/piece-land.mp3` - ピース着地時
- `public/sounds/piece-rotate.mp3` - ピース回転時
- `public/sounds/tetris.mp3` - 4ライン消去時

### ❌ 削除候補（未使用のレガシーコード）
**オーディオフォールバックシステム：**
- `src/utils/audio/audioFallback.ts` (レガシーラッパー - 未使用)
- `src/utils/audio/AudioFallbackManagerV2.ts` (代替実装 - 未使用)
- `src/utils/audio/AudioFallbackStrategy.ts` (代替戦略 - 未使用)
- `src/utils/audio/AudioCapabilityDetector.ts` (機能検出 - 未使用)

**理由：** 現在のシステムは`audioManager`を直接使用し、戦略パターン（WebAudio/HTMLAudio/Silent）で動作している

---

## 🧩 React Components

### ❌ 完全に未使用
1. **`LoadingMessage.tsx`** - 型定義のみ参照、実際の使用なし
2. **`GameStatsPanel.tsx`** - `CombinedStatsNextPanel`に置き換え済み
3. **shadcn/ui components:**
   - `ui/dialog.tsx` - インポートなし
   - `ui/popover.tsx` - インポートなし
   - `ui/separator.tsx` - インポートなし

### ⚠️ 限定的使用（要確認）
1. **`AccessibilitySettings.tsx`** - accessibilityストアに置き換えられた可能性
2. **`layout/Navigation.tsx`** - タブナビゲーションに置き換えられた可能性

---

## 🔧 Utility Functions

### ❌ 削除候補
1. **`src/main-complex.tsx`** - 未使用の代替メインファイル
2. **Audio fallback utilities（上記参照）**
3. **Legacy error handlers（使用確認必要）**

### ✅ 使用中のユーティリティ
- Performance utilities（particlePool, performanceMonitor）
- Theme utilities（themePresets, colorConverter）
- Statistics utilities（StatisticsService, statisticsUtils）
- Game utilities（tetrisUtils, boardRenderer）

---

## 📦 Zustand Stores

### ✅ すべて使用中
**12個のストア全て使用されています：**
- `gameStateStore` - ゲームロジック
- `settingsStore` - ユーザー設定
- `audioStore` - オーディオシステム
- `themeStore` - テーマ管理
- `errorStore` - エラー追跡
- `statisticsStore` - 統計データ
- `sessionStore` - セッション管理
- `navigationStore` - ナビゲーション
- `i18nStore` - 国際化
- `accessibilityStore` - アクセシビリティ
- `specializedAccessibility` - 特化アクセシビリティ
- その他の関連ストア

---

## 📝 Type Definitions

### ❌ 削除が必要な型定義
**`src/types/components.ts`内の未使用コンポーネント型：**
- `LoadingMessageProps` - LoadingMessage.tsxが未使用
- `GameStatsPanelProps` - GameStatsPanel.tsxが未使用
- `AccessibilitySettingsProps` - 要確認

### ✅ 使用中の型定義
その他の型定義は適切に使用されています。

---

## 🎯 削除計画

### 🔴 高優先度（即座に削除可能）
1. **未使用shadcn/uiコンポーネント**
   - `src/components/ui/dialog.tsx`
   - `src/components/ui/popover.tsx`
   - `src/components/ui/separator.tsx`

2. **完全に未使用のコンポーネント**
   - `src/components/LoadingMessage.tsx`
   - `src/components/GameStatsPanel.tsx`

3. **レガシーオーディオシステム**
   - `src/utils/audio/audioFallback.ts`
   - `src/utils/audio/AudioFallbackManagerV2.ts`
   - `src/utils/audio/AudioFallbackStrategy.ts`
   - `src/utils/audio/AudioCapabilityDetector.ts`

4. **未使用メインファイル**
   - `src/main-complex.tsx`

### 🟡 中優先度（確認後削除）
1. **限定的使用コンポーネント**
   - `src/components/AccessibilitySettings.tsx`
   - `src/components/layout/Navigation.tsx`

2. **対応する型定義**
   - `src/types/components.ts`内の未使用型

### 🟢 低優先度（長期的整理）
1. 型定義の整理とリファクタリング
2. コンポーネント構造の最適化

---

## 📊 予想される効果

### バンドルサイズ削減
- **削除対象行数：** 約200-300行
- **ファイル数：** 8-10ファイル
- **予想サイズ削減：** 5-10KB（gzip後）

### メンテナンス性向上
- 未使用コードの除去により、コードベースがより理解しやすくなる
- TypeScriptの型チェックが高速化
- 開発者の認知負荷軽減

### パフォーマンス向上
- 不要なインポートの削除
- ビルド時間の短縮
- デバッグ効率の向上

---

## ⚠️ 注意点

1. **削除前の確認事項**
   - テストが正常に通ることを確認
   - ビルドエラーが発生しないことを確認
   - 型エラーが発生しないことを確認

2. **削除順序**
   - コンポーネント → 型定義 → ユーティリティの順で削除
   - 依存関係を考慮した段階的削除

3. **バックアップ**
   - 削除前にGitコミットを作成
   - 重要なコードは別ブランチで保管

---

## 🚀 実行手順

### Phase 1: 即座に削除可能
```bash
# shadcn/ui未使用コンポーネント
rm src/components/ui/dialog.tsx
rm src/components/ui/popover.tsx  
rm src/components/ui/separator.tsx

# 完全未使用コンポーネント
rm src/components/LoadingMessage.tsx
rm src/components/GameStatsPanel.tsx

# レガシーオーディオシステム
rm src/utils/audio/audioFallback.ts
rm src/utils/audio/AudioFallbackManagerV2.ts
rm src/utils/audio/AudioFallbackStrategy.ts
rm src/utils/audio/AudioCapabilityDetector.ts

# 未使用メインファイル
rm src/main-complex.tsx
```

### Phase 2: 確認後削除
```bash
# テストとビルド確認
pnpm test
pnpm build

# 問題がなければ型定義の整理
# src/types/components.tsから未使用型を削除
```

### Phase 3: 最終確認
```bash
# 品質チェック
pnpm lint
pnpm typecheck
pnpm test

# 本番ビルド確認
pnpm build
pnpm preview
```

このクリーンアップにより、プロジェクトがより保守しやすく、パフォーマンスが向上したコードベースになります。