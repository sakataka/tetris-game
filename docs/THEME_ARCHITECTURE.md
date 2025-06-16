# Universal Theme Architecture Documentation

## 🎨 概要

UI全体にテーマが反映される汎用的なアーキテクチャを実装しました。セマンティックカラートークンシステムにより、全ての画面で一貫したテーマ適用が可能です。

## 🏗️ アーキテクチャ設計

### 1. セマンティックカラートークンシステム

直接色指定（cyan, purple）から汎用的な役割ベース指定に変更：

```typescript
// 従来（特定色）
'bg-cyber-cyan' 
'text-cyber-purple'

// 新システム（セマンティック）
'bg-theme-primary'
'text-theme-secondary'
```

### 2. 動的CSS変数更新

テーマ変更時にCSS変数を自動更新：

```typescript
// テーママネージャーが自動実行
document.documentElement.style.setProperty('--theme-primary', newColor);
```

### 3. セマンティックカラートークン定義

```typescript
export interface SemanticColorTokens {
  // Primary brand colors
  primary: string;      // メインブランドカラー
  secondary: string;    // セカンダリカラー
  tertiary: string;     // サードカラー
  
  // UI surface colors
  background: string;   // 背景色
  foreground: string;   // テキスト色
  surface: string;      // パネル背景
  
  // Interactive states
  accent: string;       // アクセント色
  muted: string;        // 無彩色
  border: string;       // ボーダー色
  
  // Semantic feedback colors
  success: string;      // 成功
  warning: string;      // 警告
  error: string;        // エラー
  info: string;         // 情報
}
```

## 🎯 使用方法

### コンポーネントでの使用

```tsx
// CyberCard - セマンティックテーマ指定
<CyberCard theme="primary" size="lg">
  <p className="text-theme-foreground">Content</p>
</CyberCard>

// Button - サイバーパンクスタイル
<Button variant="cyber-primary">
  Click me
</Button>

// カスタムクラス
<div className="bg-theme-surface border-theme-border">
  Custom panel
</div>
```

### テーマ変更

```typescript
import { useSetTheme } from '../store/themeStore';

function ThemeSelector() {
  const setTheme = useSetTheme();
  
  const handleThemeChange = (theme: ThemeVariant) => {
    setTheme(theme); // CSS変数が自動更新される
  };
  
  return (
    <select onChange={(e) => handleThemeChange(e.target.value)}>
      <option value="cyberpunk">Cyberpunk</option>
      <option value="minimal">Minimal</option>
      <option value="retro">Retro</option>
    </select>
  );
}
```

## 📦 実装ファイル一覧

### 新規作成ファイル
- `src/utils/ui/themeManager.ts` - テーマ管理システム
- `src/components/providers/ThemeProvider.tsx` - テーマプロバイダー
- `docs/THEME_ARCHITECTURE.md` - アーキテクチャドキュメント

### 更新ファイル
- `src/store/themeStore.ts` - テーママネージャー連携
- `src/components/ui/CyberCard.tsx` - セマンティックテーマ対応
- `src/components/ui/button.tsx` - サイバーパンクバリアント追加
- `src/app/globals.css` - セマンティックCSS変数追加
- `src/App.tsx` - ThemeProvider統合
- `src/components/ThemeTabContent.tsx` - テーマ指定更新

## 🎨 テーマプリセット対応

### 既存テーマの自動変換

各テーマプリセットが自動でセマンティックカラーにマッピング：

```typescript
// Cyberpunk テーマ
primary: '#00ffff'     // シアン
secondary: '#ff00ff'   // マゼンタ  
accent: '#00ff00'      // グリーン

// Classic テーマ
primary: '#0066cc'     // ブルー
secondary: '#cc6600'   // オレンジ
accent: '#cc0000'      // レッド

// Minimal テーマ
primary: '#2c3e50'     // ダークグレー
secondary: '#34495e'   // グレー
accent: '#3498db'      // ライトブルー
```

## ⚡ パフォーマンス最適化

### CSS変数 + Tailwind v4.1

```css
/* 動的透明度バリアント */
--color-theme-primary-10: color-mix(in oklch, var(--theme-primary) 10%, transparent);
--color-theme-primary-20: color-mix(in oklch, var(--theme-primary) 20%, transparent);

/* Tailwindクラスで使用 */
.bg-theme-primary-10 { background: var(--color-theme-primary-10); }
```

### Zustand永続化

```typescript
// テーマ設定の自動保存・復元
{
  name: 'tetris-theme-storage',
  version: 1,
  partialize: (state) => ({ theme: state.theme }),
  onRehydrateStorage: () => (state) => {
    // 復元時にテーマを再適用
    applyThemeToDocument(state.theme.current);
  }
}
```

## 🚀 メリット

### 1. 汎用性
- 直接色指定から脱却
- 全テーマで統一されたUI

### 2. 保守性
- セマンティックな色の役割定義
- CSS変数による動的更新

### 3. 拡張性
- 新テーマの追加が容易
- カスタムカラーの柔軟な適用

### 4. 一貫性
- 全画面で統一されたテーマ反映
- 開発者体験の向上

## 🧪 テスト状況

- ✅ TypeScript型チェック: エラーなし
- ✅ Biome Lint: 警告なし  
- ✅ Vitest テスト: 321テスト全て成功
- ✅ プロダクションビルド: 成功

## 📝 使用例

### ゲーム画面
```tsx
// ゲームボード
<CyberCard theme="primary" title="GAME BOARD">
  <GameBoard />
</CyberCard>

// 統計情報
<CyberCard theme="secondary" title="STATISTICS">
  <Statistics />
</CyberCard>

// 操作ボタン
<Button variant="cyber-accent">PAUSE</Button>
<Button variant="cyber-outline">RESET</Button>
```

### 設定画面
```tsx
// テーマ設定
<CyberCard theme="primary" title="THEME SETTINGS">
  <ThemeSelector />
</CyberCard>

// 音声設定
<CyberCard theme="accent" title="AUDIO SETTINGS">
  <AudioControls />
</CyberCard>
```

### 統計画面
```tsx
// 成績表示
<CyberCard theme="success" title="HIGH SCORES">
  <HighScoreList />
</CyberCard>

// エラー表示
<CyberCard theme="error" title="ERROR LOG">
  <ErrorHistory />
</CyberCard>
```

このアーキテクチャにより、すべての画面でテーマが一貫して反映され、開発者は色を意識することなく汎用的なコンポーネント開発が可能になりました。