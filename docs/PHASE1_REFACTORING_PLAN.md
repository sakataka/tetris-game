# Phase 1 リファクタリング実行計画

## 📋 計画概要

**目標**: 現在のNext.jsアプリケーションを、React Router 7らしいアーキテクチャに最適化し、安全な移行の基盤を構築する

**期間**: 1-2週間  
**リスク**: 低（既存機能に影響なし）  
**成果物**: リファクタリング済みコードベース + 移行準備完了

## 🎯 Phase 1の具体的目標

### 1. アーキテクチャの準備
- **プロップドリリング解消**: ストア直接参照パターンに統一
- **コンポーネント独立性向上**: ページ分割に備えたコンポーネント設計
- **共通レイアウト抽出**: 将来の共通レイアウトコンポーネント準備

### 2. ルーティング基盤整備
- **ナビゲーション要件整理**: 現在のタブ → 将来のページ遷移設計
- **URL状態管理準備**: クエリパラメータ活用の検討
- **SEO準備**: メタデータ構造の整理

### 3. 開発環境最適化
- **依存関係整理**: 不要な依存関係の特定・削除
- **TypeScript設定強化**: React Router 7対応の型安全性
- **テスト戦略調整**: 将来のルーティングテストに対応

## 🔧 実行タスク詳細

### Task 1: プロップドリリング解消 (2-3日)

#### 対象コンポーネント
1. **GameInfo.tsx**
   - タブ状態管理をストア化
   - 子コンポーネントへのプロップ渡しを削除

2. **SettingsTabContent.tsx**
   - オーディオプロップスをaudioStore直接参照に変更
   - 設定プロップスをsettingsStore直接参照に変更

3. **GameTabContent.tsx**
   - ゲーム状態プロップスをgameStateStore直接参照に変更
   - 統計プロップスをstatisticsStore直接参照に変更

#### 実装例
```typescript
// Before: プロップドリリング
interface SettingsTabContentProps {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  // ... 多数のプロップス
}

// After: ストア直接参照
import { useAudioVolume, useAudioMuted } from '../store/audioStore';

export default function SettingsTabContent() {
  const volume = useAudioVolume();
  const isMuted = useAudioMuted();
  // プロップス不要
}
```

### Task 2: ナビゲーション抽象化 (1-2日)

#### 新規作成コンポーネント
```typescript
// src/components/layout/Navigation.tsx
interface NavigationItem {
  key: string;
  path: string;
  label: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  { key: 'game', path: '/', label: 'game', icon: 'gamepad' },
  { key: 'statistics', path: '/statistics', label: 'statistics', icon: 'bar-chart' },
  { key: 'themes', path: '/themes', label: 'themes', icon: 'palette' },
  { key: 'settings', path: '/settings', label: 'settings', icon: 'settings' },
];

export default function Navigation() {
  const [activeTab, setActiveTab] = useTabNavigation();
  
  return (
    <nav className="cyber-nav">
      {navigationItems.map((item) => (
        <TabButton
          key={item.key}
          active={activeTab === item.key}
          onClick={() => setActiveTab(item.key)}
          icon={item.icon}
          label={t(item.label)}
        />
      ))}
    </nav>
  );
}
```

#### ナビゲーション状態管理
```typescript
// src/store/navigationStore.ts
interface NavigationState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'game',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export const useActiveTab = () => useNavigationStore(state => state.activeTab);
export const useSetActiveTab = () => useNavigationStore(state => state.setActiveTab);
```

### Task 3: メタデータ管理準備 (1日)

#### メタデータ抽象化
```typescript
// src/utils/metadata.ts
interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export const pageMetadata: Record<string, PageMetadata> = {
  game: {
    title: 'Cyberpunk Tetris Game',
    description: 'Production-ready cyberpunk-themed Tetris game with advanced features',
    keywords: ['tetris', 'game', 'cyberpunk', 'puzzle'],
  },
  statistics: {
    title: 'Statistics | Cyberpunk Tetris',
    description: 'View your Tetris game statistics, high scores, and performance metrics',
    keywords: ['statistics', 'high score', 'tetris', 'metrics'],
  },
  themes: {
    title: 'Themes | Cyberpunk Tetris',
    description: 'Customize your Tetris game appearance with cyberpunk themes',
    keywords: ['themes', 'customization', 'cyberpunk', 'colors'],
  },
  settings: {
    title: 'Settings | Cyberpunk Tetris',
    description: 'Configure your Tetris game settings and preferences',
    keywords: ['settings', 'configuration', 'audio', 'controls'],
  },
};
```

### Task 4: 共通レイアウト準備 (1-2日)

#### レイアウトコンポーネント設計
```typescript
// src/components/layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export default function MainLayout({ 
  children, 
  showNavigation = true,
  className 
}: MainLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen grid-background flex items-center justify-center relative overflow-hidden",
      className
    )}>
      {/* Background effects */}
      <BackgroundEffects />
      
      <div className="text-center relative z-10 px-4">
        {/* Header */}
        <GameHeader />
        
        {/* Navigation */}
        {showNavigation && <Navigation />}
        
        {/* Main content */}
        <main className="float-animation">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### 背景エフェクト抽出
```typescript
// src/components/layout/BackgroundEffects.tsx
export default function BackgroundEffects() {
  return (
    <>
      <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full opacity-10 blur-3xl animate-pulse" />
      <div
        className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-10 blur-2xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />
    </>
  );
}
```

### Task 5: TypeScript設定強化 (1日)

#### tsconfig.json最適化
```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // React Router 7 準備
    "types": ["vite/client"],
    "paths": {
      "~/*": ["./src/*"],
      "@/*": ["./src/*"]
    },
    
    // 将来のReact Router types対応
    "rootDirs": [".", "./.react-router/types"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
  ],
  "exclude": ["node_modules"]
}
```

### Task 6: 依存関係最適化 (1日)

#### 不要依存関係の整理
```json
// package.json 見直し候補
{
  "dependencies": {
    // 保持: React Router移行後も必要
    "zustand": "^5.0.5",
    "tailwind-merge": "^3.3.1",
    "clsx": "^2.1.1",
    "i18next": "^25.2.1",
    "react-i18next": "^15.5.3",
    
    // 検討: React Router移行時に代替検討
    "next-themes": "^0.4.6", // → カスタム実装？
    
    // 削除候補: Next.js固有
    // "next": "15.3.3" (React Router移行時)
  }
}
```

### Task 7: テスト戦略調整 (1日)

#### ルーティングテスト準備
```typescript
// src/test/utils/testRouter.tsx
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';

export function renderWithRouter(
  component: React.ReactElement,
  initialEntry = '/'
) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: component,
    },
  ], {
    initialEntries: [initialEntry],
  });

  return render(<RouterProvider router={router} />);
}
```

## 📊 進捗管理とマイルストーン

### Week 1: 基盤リファクタリング
- **Day 1-2**: Task 1 (プロップドリリング解消)
- **Day 3-4**: Task 2 (ナビゲーション抽象化)
- **Day 5**: Task 3 (メタデータ準備) + Task 5 (TypeScript強化)

### Week 2: レイアウト整理と最適化
- **Day 1-2**: Task 4 (共通レイアウト準備)
- **Day 3**: Task 6 (依存関係最適化)
- **Day 4**: Task 7 (テスト戦略調整)
- **Day 5**: 統合テスト・ドキュメント更新

## ✅ 成功指標

### 機能的指標
- [ ] 既存の全機能が正常動作
- [ ] プロップドリリングが50%以上削減
- [ ] ナビゲーション状態がストア管理
- [ ] 共通レイアウトコンポーネント完成

### 技術的指標
- [ ] TypeScriptエラー0件維持
- [ ] テストカバレッジ維持（289テスト）
- [ ] Biome lint/format 100%合格
- [ ] バンドルサイズ増加なし

### 品質指標
- [ ] アクセシビリティ機能完全保持
- [ ] パフォーマンス維持（60fps）
- [ ] i18n機能正常動作
- [ ] エラーハンドリング継続動作

## 🚀 Phase 2への準備状況

### Phase 1完了後の状態
1. **アーキテクチャ準備完了**
   - ストア中心の状態管理
   - コンポーネント独立性向上
   - 共通レイアウト基盤

2. **React Router 7移行準備**
   - ナビゲーション抽象化済み
   - メタデータ管理準備済み
   - TypeScript設定最適化済み

3. **開発環境整備**
   - 依存関係最適化済み
   - テスト戦略調整済み
   - ドキュメント整備済み

### 移行リスク評価
- **技術リスク**: 低（段階的移行）
- **機能リスク**: 極低（既存機能保持）
- **スケジュールリスク**: 低（2週間バッファ確保）
- **品質リスク**: 極低（既存テスト維持）

## 🎯 次期Phase 2への移行準備

Phase 1完了により、以下が可能になります：

1. **React Router 7環境構築**: スムーズな技術移行
2. **ページ分割実装**: 最小限のコンポーネント変更
3. **ルーティング機能**: 既存ナビゲーションの活用
4. **パフォーマンス最適化**: Viteベースの高速開発

この詳細計画により、リスクを最小化しながら確実にReact Router 7移行の基盤を構築できます。