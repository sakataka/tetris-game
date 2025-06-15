# React Router 7 ルーティング設計書

## 📋 概要

現在のNext.jsベースの単一ページアプリケーションをReact Router 7のマルチページアプリケーションに移行するための包括的なルーティング設計。

## 🎯 設計原則

1. **段階的移行**: 既存機能を損なわずに段階的に拡張
2. **直感的なURL**: ユーザーにとって分かりやすいURL構造
3. **将来の拡張性**: 計画されている機能に対応可能な設計
4. **SEO対応**: 検索エンジンに友好的なURL構造

## 🗺️ Phase 1: 基本ルーティング設計

### Core Pages (即座に実装)

```
/ (root)
├── /                    # ホーム (メインゲーム画面)
├── /settings           # 設定 (SettingsTabContent基盤)
├── /statistics         # 統計 (StatisticsTabContent基盤)  
├── /themes             # テーマ (ThemeTabContent基盤)
└── /about              # アプリ情報
```

### ルートの詳細仕様

#### 1. `/` - ホーム/メインゲーム
- **コンポーネント**: `TetrisGame.tsx`ベース
- **レイアウト**: `GameLayoutManager`でゲーム盤面+サイドパネル
- **含む機能**:
  - ゲーム盤面 (`TetrisBoard`)
  - リアルタイム情報 (`GameTabContent`)
  - ゲームコントロール (`VirtualControls`)
- **ストア**: `gameStateStore`, `audioStore`, `sessionStore`

#### 2. `/settings` - 設定画面
- **コンポーネント**: `SettingsTabContent.tsx`ベース
- **含む機能**:
  - 言語設定 (`LanguageSelector`)
  - 音声設定 (`AudioPanel`)
  - アクセシビリティ設定 (`AccessibilitySettings`)
  - ゲームモード設定
- **ストア**: `settingsStore`, `accessibilityStore`, `languageStore`

#### 3. `/statistics` - 統計画面
- **コンポーネント**: `StatisticsTabContent.tsx`ベース
- **含む機能**:
  - ハイスコア表示 (`HighScoreDisplay`)
  - 詳細統計 (`StatisticsDashboard`)
  - セッション統計
- **ストア**: `statisticsStore`, `sessionStore`

#### 4. `/themes` - テーマカスタマイズ
- **コンポーネント**: `ThemeTabContent.tsx`ベース
- **含む機能**:
  - テーマ選択 (`ThemeSelector`)
  - カスタムテーマ作成 (`ColorPaletteEditor`)
  - テーマ設定 (`ThemeSettings`)
- **ストア**: `themeStore`

#### 5. `/about` - アプリ情報
- **新規作成**
- **含む機能**:
  - アプリケーション情報
  - 操作説明
  - クレジット
  - ライセンス情報

## 🚀 Phase 2: 拡張ルーティング設計

### Advanced Pages (将来実装)

```
/
├── /tutorial           # チュートリアルシステム
│   ├── /               # チュートリアル一覧
│   ├── /basic          # 基本操作
│   ├── /advanced       # 上級テクニック
│   └── /practice       # 練習モード
├── /game-modes         # ゲームモード
│   ├── /               # モード一覧
│   ├── /puzzle         # パズルモード
│   ├── /marathon       # マラソンモード
│   ├── /time-attack    # タイムアタック
│   └── /gravity        # 重力モード
├── /multiplayer        # マルチプレイヤー
│   ├── /               # ロビー
│   ├── /create-room    # ルーム作成
│   ├── /join-room/:id  # ルーム参加
│   └── /battle/:id     # バトル画面
├── /replay             # リプレイシステム
│   ├── /               # リプレイ一覧
│   ├── /record         # 録画設定
│   └── /watch/:id      # リプレイ再生
├── /profile            # プロフィール
│   ├── /               # プロフィール表示
│   ├── /achievements   # アチーブメント
│   └── /edit           # プロフィール編集
└── /admin              # 管理画面 (開発用)
    ├── /debug          # デバッグ情報
    ├── /performance    # パフォーマンス監視
    └── /errors         # エラーログ
```

## 📱 レスポンシブ対応

### モバイル専用ルート
```
/mobile/
├── /controls          # モバイル操作設定
└── /orientation       # 画面向き設定
```

## 🔧 技術仕様

### React Router 7 設定

#### routes.ts
```typescript
import { type RouteConfig } from "@react-router/dev/routes";

export default [
  // Phase 1: Core Routes
  {
    index: true,
    file: "./pages/home.tsx",
  },
  {
    path: "/settings",
    file: "./pages/settings.tsx",
  },
  {
    path: "/statistics", 
    file: "./pages/statistics.tsx",
  },
  {
    path: "/themes",
    file: "./pages/themes.tsx",
  },
  {
    path: "/about",
    file: "./pages/about.tsx",
  },
  
  // Phase 2: Advanced Routes
  {
    path: "/tutorial",
    file: "./pages/tutorial/layout.tsx",
    children: [
      { index: true, file: "./pages/tutorial/index.tsx" },
      { path: "basic", file: "./pages/tutorial/basic.tsx" },
      { path: "advanced", file: "./pages/tutorial/advanced.tsx" },
      { path: "practice", file: "./pages/tutorial/practice.tsx" },
    ],
  },
  // ... 他のルート定義
] satisfies RouteConfig;
```

### 共通レイアウト設計

#### root.tsx
```typescript
export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="cyberpunk-theme">
        <I18nProvider>
          <ErrorBoundaryWithTranslation>
            <ThemeProvider>
              <MainLayout>
                <Outlet />
              </MainLayout>
              <ErrorToastAdapter />
              <Toaster />
            </ThemeProvider>
          </ErrorBoundaryWithTranslation>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

#### MainLayout.tsx
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen grid-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### ナビゲーション設計

#### Navigation.tsx
```typescript
const navigationItems = [
  { path: "/", label: "game", icon: "gamepad" },
  { path: "/statistics", label: "statistics", icon: "bar-chart" },
  { path: "/themes", label: "themes", icon: "palette" },
  { path: "/settings", label: "settings", icon: "settings" },
];

export default function Navigation() {
  return (
    <nav className="cyber-nav">
      {navigationItems.map((item) => (
        <NavLink key={item.path} to={item.path} className="nav-link">
          <Icon name={item.icon} />
          <span>{t(item.label)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

## 🎮 ゲーム状態の永続化

### URL状態管理
- ゲーム設定をクエリパラメータで管理
- 統計フィルタをURLで保持
- テーマ選択状態をURLで共有可能

例: `/statistics?period=week&type=score`

### セッション管理
- ページ遷移時のゲーム状態保持
- 戻るボタンでのゲーム復帰
- ブラウザリフレッシュでの状態復旧

## 🔄 移行戦略

### Phase 1対応 (4週間)
1. 基本ルート実装 (/, /settings, /statistics, /themes, /about)
2. 共通レイアウト作成
3. ナビゲーション実装
4. 既存コンポーネント統合

### Phase 2対応 (8週間)
1. チュートリアルシステム
2. 追加ゲームモード
3. マルチプレイヤー機能
4. リプレイシステム

## ✅ 成功指標

1. **機能完全性**: 既存機能の100%移行
2. **パフォーマンス**: ページ読み込み時間 < 1秒
3. **SEO**: 各ページの適切なメタデータ
4. **アクセシビリティ**: WCAG 2.1 AA準拠維持
5. **ユーザビリティ**: 直感的なナビゲーション

## 📈 将来の拡張性

この設計により以下の機能追加が容易になります：

- **ソーシャル機能**: フレンドシステム、ランキング共有
- **コンテンツ管理**: 動的なチュートリアル、ニュース配信
- **API統合**: 外部サービスとの連携
- **PWA対応**: オフライン機能、プッシュ通知
- **多言語対応**: 新言語の動的追加

この包括的な設計により、段階的かつ安全にReact Router 7への移行を実現し、将来の機能拡張に対する強固な基盤を提供します。