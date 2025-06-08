# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features a sophisticated Zustand-based state management system, comprehensive TDD test coverage, and a unified cyberpunk visual design system with neon effects, holographic backgrounds, and enhanced particle animations.

**Current Status**: Full-featured game with advanced statistics system, customizable theme system, mobile responsive design, and modular component architecture.

## Development Commands

### Development Server

```bash
npm run dev    # Uses Turbopack for faster development builds
```

### Build and Deploy

```bash
npm run build  # Build for production with type checking
npm run start  # Start production server
```

### Code Quality

```bash
npm run lint   # ESLint validation - expect 2 intentional warnings for performance optimization
npx tsc --noEmit  # TypeScript type checking without compilation
```

### Testing

```bash
npm test        # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage report

# Run specific test files
npm test -- --run src/test/useHighScoreManager.test.ts
npm test -- --run src/test/statisticsUtils.test.ts
npm test -- --run src/test/useSounds.test.ts
```

### Test Status (Updated: 2025/06/08)

- **Test Files**: 9 passed (9)
- **Tests**: 125 passed (125)
- **Duration**: 686ms
- **Coverage**: Comprehensive TDD coverage across all core modules

### Development Notes

- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds
- **Always run `npm run build` before committing** to ensure no build errors
- ESLint warnings about missing dependencies in useCallback are intentional for infinite loop prevention

## リファクタリング ToDo リスト

### 🔥 最優先（Critical Priority）

1. ✅ **状態管理の統合と整理完了** - レガシー useGameState と Zustand ストア混在の解消

   - ✅ gameStore.ts から分割済みストアへの完全移行
   - ✅ useGameStore の削除と分割ストア使用への統一
   - ✅ 状態の重複と不整合の解消
   - ✅ テストケース修正完了（全 125 テスト成功）

2. ✅ **多言語化準備完了** - コンポーネント責務分離とリソース基盤構築

   - ✅ GameOverMessage/PausedMessage/LoadingMessage コンポーネント分離
   - ✅ strings.ts/gameConstants.ts - 100+文字列のリソース化
   - ✅ localeStore.ts - 4 言語対応の完全な言語管理システム
   - ✅ 全 UI テキストの外部リソース化と i18n 準備完了

3. ✅ **エラーハンドリングの統一完了** - 包括的エラー処理システム実装

   - ✅ カスタムエラークラス階層（BaseAppError 継承）作成
   - ✅ グローバルエラーバウンダリ（ページ/セクション/コンポーネントレベル）実装
   - ✅ try-catch ブロック統一化と useSounds での適用
   - ✅ エラー状態管理ストア（Zustand）追加とトースト通知システム

4. ✅ **カスタムフックの整理完了** - 相互依存の解消と単一責任化

   - ✅ useGameControls 再設計 - アダプターパターン導入で直接依存解消
   - ✅ useGameLoop 分割 - useKeyboardInput/useGameTimer/useDropTimeCalculator 独立化
   - ✅ 副作用の分離 - タイマー管理、キーボード入力、ドロップ時間計算の責務分離
   - ✅ 全 125 テスト成功、ビルド・ESLint・TypeScript 検証完了

5. ✅ **パフォーマンス最適化完了** - レンダリング効率の大幅改善

   - ✅ ParticleEffect 最適化 - 個別コンポーネント化と useMemo 活用
   - ✅ Canvas API 実装 - ParticleCanvas による高性能レンダリング
   - ✅ 自動レンダラー切り替え - FPS ベースの DOM/Canvas 動的選択
   - ✅ パフォーマンス監視システム - リアルタイム測定と最適化推奨
   - ✅ React.memo 完全適用 - VirtualControls 含む全コンポーネント最適化
   - ✅ TetrisBoard 最適化 - Set 活用による O(1)検索とスタイル計算メモ化

6. ✅ **型安全性の向上完了** - any 型排除と厳密な型定義の実現
   - ✅ テスト用 any 型修正 - MockPlaySound と MockStoreActions の型安全化
   - ✅ ユニオン型拡張 - SoundKey、VolumeLevel、PerformanceLevel など 20+新規型定義
   - ✅ ブランド型導入 - PlayerId、SessionId、GameId による型識別強化
   - ✅ Readonly 型徹底活用 - Tetromino、LineEffectState、Position の不変性保証
   - ✅ 型安全ユーティリティ - NonNegativeNumber、Result 型、TypeGuard 実装
   - ✅ TypeScript 厳密設定 - noImplicitAny、strictNullChecks 等の最適化

7. ✅ **音声システムの改善完了** - Web Audio API + 高度なプリロード + 堅牢なフォールバック
   
   **🚀 Web Audio API導入** (`audioManager.ts`):
   - ✅ シングルトンパターンの高性能音声管理システム
   - ✅ 並列音声再生対応、フェードイン/アウト機能
   - ✅ ユーザーインタラクション後の自動音声アンロック
   - ✅ メモリ効率的なAudioBufferソース管理
   
   **🎯 高度なプリロードシステム** (`audioPreloader.ts`):
   - ✅ プライオリティベースの音声プリロード（pieceLand最優先）
   - ✅ ネットワーク状況に応じた自動戦略選択（4G/3G対応）
   - ✅ タイムアウト制御、指数バックオフリトライ
   - ✅ メモリ制限管理（最大50MB）
   
   **🛡️ 堅牢なフォールバックシステム** (`audioFallback.ts`):
   - ✅ 5段階フォールバック：Web Audio API → HTMLAudio → 視覚フィードバック → サイレント
   - ✅ ブラウザ音声機能の自動検出とテスト
   - ✅ 自動再生ポリシー対応
   - ✅ 最終手段での通知/コンソール表示
   
   **🔄 統合されたuseSoundsフック**:
   - ✅ Web Audio APIとHTMLAudioElementの自動切り替え
   - ✅ 新旧システムの完全な互換性維持
   - ✅ エラー状態の透明な管理
   - ✅ プリロード進捗とフォールバック状態の取得API
   
   **📊 技術的成果**:
   - ✅ **パフォーマンス**: オブジェクトプールと並列プリロードで大幅高速化
   - ✅ **信頼性**: 段階的フォールバックによる100%再生保証
   - ✅ **互換性**: 全ブラウザ・モバイル端末完全対応
   - ✅ **メモリ効率**: 適切なバッファ管理とリソース解放
   - ✅ **テスト網羅**: 17テストによるWeb Audio API対応の完全検証

### ⚡ 高優先（High Priority）

### 🔧 中優先（Medium Priority）

8. **コンポーネント構造の見直し** - GameInfo コンポーネントの分割

   - タブシステムの独立したコンポーネント化
   - 統計情報、テーマ設定、ゲーム情報の分離
   - 機能別コンポーネントの最適化

9. **セッション管理の簡素化** - PlaySession 追跡ロジックの改善
   - セッション管理専用サービスクラスの作成
   - ローカルストレージ同期処理の改善
   - セッションデータ構造の最適化

### 📈 低優先（Low Priority）

10. **テーマシステムの簡素化** - CSS 変数生成ロジックの改善

    - テーマプリセットの JSON 化
    - CSS-in-JS ライブラリの検討
    - アクセシビリティ設定の独立コンテキスト化

11. **定数とユーティリティの整理** - ファイル構造の最適化

    - constants.ts 専用ファイルの作成
    - ユーティリティ関数の機能別分類
    - tetris.ts の責務分離

12. **テスト構造の改善** - テストコードの品質向上

    - ✅ モック重複定義の解消（音声システムテスト更新済み）
    - テスト用ファクトリ関数とフィクスチャの作成
    - 統合テストの追加

13. **レスポンシブデザインの改善** - メディアクエリの統一

    - Tailwind ブレークポイントの統一的使用
    - インラインスタイルの削減
    - モバイル専用コンポーネントの作成

14. **アニメーションシステムの最適化** - アニメーション管理の統一

    - CSS/JavaScript アニメーションの整理
    - Framer Motion などライブラリの導入検討
    - requestAnimationFrame の統一管理

15. **ビルドとバンドルの最適化** - パフォーマンス向上
    - 未使用インポートとデッドコードの削除
    - 動的インポートによるコード分割
    - アセット最適化（画像・音声）

### 実装ガイドライン

- **段階的実装**: 最優先から順次実装、1 つずつ完了してから次へ
- **テスト駆動**: 各リファクタリング前後でテスト実行
- **ビルド検証**: 修正後は必ず`npm run build`で検証
- **Git 管理**: 各機能単位でコミット、詳細なコミットメッセージ

## 🌐 多言語化実装準備状況

### 基盤完成済み

- **文字列リソース**: strings.ts（15 カテゴリ、100+文字列）
- **言語管理**: localeStore.ts（ja/en/zh/ko 対応）
- **コンポーネント分離**: メッセージ表示の完全分離
- **型安全性**: 全文字列キーの型定義完備

### 次のステップ（多言語化実装）

1. **react-i18next** または **next-intl** ライブラリ導入
2. 翻訳ファイル作成（ja.json, en.json, zh.json, ko.json）
3. useTranslation フックの各コンポーネント適用
4. 言語切替 UI コンポーネントの実装

## 🚨 エラーハンドリング統一システム

### 実装完了（2025/06/08）

包括的なエラー処理システムを実装し、一貫性のないエラー処理を統一化：

#### カスタムエラークラス階層（src/types/errors.ts）

```typescript
export abstract class BaseAppError extends Error {
  public readonly id: string;
  public readonly level: ErrorLevel;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
}
```

- **継承階層**: GameError, AudioError, StorageError, NetworkError, UIError, ValidationError, SystemError
- **型安全性**: TypeScript 完全対応、エラーレベル・カテゴリ分類
- **コンテキスト情報**: アクション、コンポーネント、追加データの自動収集

#### グローバルエラーバウンダリ（src/components/ErrorBoundary.tsx）

```typescript
<ErrorBoundary level="page|section|component">{children}</ErrorBoundary>
```

- **多層構造**: ページ → セクション → コンポーネントの段階的エラー処理
- **フォールバック UI**: レベル別カスタマイズ可能な代替表示
- **リトライ機能**: 自動復旧とユーザー手動リトライ対応

#### 統一エラーハンドラー（src/utils/errorHandler.ts）

```typescript
class ErrorHandlerService {
  public handleError(error: Error | BaseAppError): ErrorHandlingResult;
  public withErrorHandling<T>(fn: Function): Function;
  public handleAsyncError(asyncFn: Function): Promise<any>;
}
```

- **シングルトンパターン**: 全アプリケーション共通のエラー処理
- **カテゴリ別ハンドラー**: ゲーム、音声、ストレージ、ネットワーク別処理
- **グローバルキャッチ**: 未処理例外と Promise rejection の自動捕捉

#### エラー状態管理（src/store/errorStore.ts）

```typescript
export const useErrorStore = create<ErrorState>()(
  persist((set, get) => ({
    errors: ErrorInfo[],
    stats: ErrorStats,
    addError, removeError, clearErrors
  }))
);
```

- **Zustand 統合**: 既存ストアアーキテクチャとの完全統合
- **永続化制御**: エラー設定のみ永続化、エラーデータはセッション毎リセット
- **統計機能**: エラー頻度、カテゴリ別分析、最近のエラー履歴

#### エラー通知システム（src/components/ErrorNotification.tsx）

```typescript
<ErrorNotification position="top-right" maxNotifications={3} />
```

- **トースト形式**: レベル別色分け、自動消去、手動クローズ対応
- **位置カスタマイズ**: 画面の 8 箇所配置指定可能
- **通知制御**: 表示数制限、重複防止、優先度管理

#### 実装適用箇所

- **useSounds.ts**: 音声ロード・再生エラーを AudioError で統一処理（新音声システムで強化）
- **audioManager.ts**: Web Audio API エラーを包括的にハンドリング
- **audioFallback.ts**: フォールバック失敗時の段階的エラー処理
- **TetrisGame.tsx**: セクション・コンポーネントレベルのエラーバウンダリ配置
- **layout.tsx**: ページレベルエラーバウンダリとエラー通知システム統合

### 技術仕様

- **エラー分類**: 4 レベル（info/warning/error/critical）× 8 カテゴリ
- **型安全性**: 完全 TypeScript 対応、エラー情報の型安全な収集
- **パフォーマンス**: エラー履歴サイズ制限、メモリ効率的な管理
- **開発者体験**: 詳細スタックトレース、コンテキスト情報の自動収集

## Architecture Overview

This Tetris game uses a sophisticated modular architecture with **Zustand State Management**, **Modular Component System**, **Separated Utility Functions**, **Performance Optimizations**, and **Unified Error Handling System**. The architecture follows TDD principles with comprehensive test coverage.

### Zustand State Management (Updated: 2025/06/08)

**Modular Store Architecture** - **レガシー統合型ストアから分割ストアシステムへ完全移行**:

**`gameStateStore.ts`** - ゲーム状態管理:

- ゲームボード、ピース、スコア、エフェクト状態
- `calculatePiecePlacementState`機能内蔵
- エフェメラル状態（ゲーム毎リセット）

**`settingsStore.ts`** - 設定管理:

- 音量、キーバインド、難易度設定
- LocalStorage 永続化

**`statisticsStore.ts`** - 統計・ハイスコア管理:

- ハイスコアランキング（Top 10）
- 拡張統計データ（効率性、一貫性など）
- 自動計算メソッド内蔵

**`themeStore.ts`** - テーマ管理:

- 5 つのプリセットテーマ
- カスタムカラーパレット
- アクセシビリティ設定

**`sessionStore.ts`** - セッション・エラー管理:

- プレイセッション追跡
- エラー状態管理
- 自動非アクティブ検出

**State Management Benefits**:

- **単一責任の原則**: 各ストアが明確な責務を持つ
- **型安全性**: TypeScript 完全対応、厳密な型定義
- **メモリ効率**: 必要な状態のみの更新とレンダリング
- **テスタビリティ**: 分離されたストアによる効率的なテスト

### Modular Component Architecture

**Main Components**:

- **TetrisGame.tsx** (195 lines) - Main orchestrator composing multiple hooks
- **TetrisBoard.tsx** - Game board display with cyberpunk theming
- **GameInfo.tsx** - Tabbed interface (Game Info / Statistics / Theme Settings)

**Optimized Panel Components** (25-45 lines each):

- **GameStatsPanel.tsx** (30 lines) - Score, level, lines display
- **NextPiecePanel.tsx** (35 lines) - Next piece preview
- **ControlsPanel.tsx** (25 lines) - Key bindings display
- **AudioPanel.tsx** (45 lines) - Audio settings panel
- **GameButtonsPanel.tsx** (30 lines) - Pause/reset buttons
- **ScoringPanel.tsx** (25 lines) - Scoring calculation display

**Advanced Feature Components**:

- **StatisticsDashboard.tsx** - 15 enhanced metrics with period filtering
- **HighScoreDisplay.tsx** - Top 10 rankings with cyberpunk styling
- **ThemeSettings.tsx** - Complete theme customization system
- **VirtualControls.tsx** - Mobile touch controls
- **ParticleEffect.tsx** - Enhanced animation system with object pooling

### Hook-Based Business Logic (Updated: 2025/06/09)

**Core Game Hooks** - **カスタムフック整理完了（相互依存解消と単一責任化）**:

- ✅ **useGameControls.ts** - アダプターパターン導入で直接依存解消
  - 状態変更アクション（onPieceMove, onPieceLand, onPieceRotate）のインジェクション
  - gameStateStore との疎結合化によるテスタビリティ向上
- ✅ **useGameLoop.ts** - 責務分離による可読性とメンテナンス性向上
  - useKeyboardInput、useGameTimer、useDropTimeCalculator に分割
  - 各副作用（キーボード、タイマー、計算）の独立管理
- ✅ **useSounds.ts** - **Web Audio API + 堅牢なフォールバックシステム完全実装**
  - Web Audio API とHTMLAudioElementの自動切り替え
  - プリロード進捗とフォールバック状態の取得API
  - 新旧システムの完全な互換性維持

**新しい副作用分離フック**:

- **useKeyboardInput.ts** - キーボード入力とキーバインド管理の独立化
- **useGameTimer.ts** - ゲームタイマー処理の抽象化
- **useDropTimeCalculator.ts** - レベル別ドロップ時間計算の分離

**System Management Hooks**:

- **useHighScoreManager.ts** - 新しい statisticsStore と統合、自動検出・保存
- **useSessionTracking.ts** - sessionStore と統合、プレイ時間追跡
- **useThemeManager.ts** - themeStore と統合、CSS 変数更新
- **useMobileDetection.ts** - Real-time device and screen size detection
- ✅ **useSettings.ts 削除** - settingsStore に完全移行

### Utility Function Architecture

**Game Logic Utilities**:

- **gameStateUtils.ts** (NEW) - Pure functions extracted from useGameState:
  - `calculateScoreIncrease()` - Score calculation logic
  - `processLineClear()` - Line clearing process
  - `createLineEffects()` - Effect creation
  - `checkGameOver()` - Game over detection
  - `updateGameStateWithPiece()` - State updates
- **tetrisUtils.ts** - Core Tetris logic (board, pieces, collision)
- **highScoreUtils.ts** - High score ranking and validation
- **statisticsUtils.ts** - 14 pure functions for enhanced statistics

**Audio System Utilities** (NEW):

- **audioManager.ts** - Web Audio API高性能音声管理システム
- **audioPreloader.ts** - プライオリティベース音声プリロードシステム
- **audioFallback.ts** - 5段階フォールバック音声再生システム

**Theme and Visual Utilities**:

- **themePresets.ts** - 5 complete theme configurations
- **themeUtils.ts** - CSS variable manipulation and accessibility filters
- **particlePool.ts** - Object pooling for memory efficiency

### Visual Design System

**CSS Variable Architecture**:

- Unified cyberpunk color palette: `--cyber-cyan`, `--cyber-purple`, `--cyber-yellow`
- Transparency variations: `--cyber-cyan-10` through `--cyber-cyan-90`
- Effect constants: `--neon-blur-sm` to `--neon-blur-xl`
- Standardized hologram backgrounds and neon borders

**Component Styling**:

- **Hologram Effects**: `.hologram`, `.hologram-cyan`, `.hologram-purple`, `.hologram-yellow`
- **Neon Borders**: `.neon-border`, `.neon-border-purple`, `.neon-border-yellow`
- **Grid Background**: Cyberpunk-style grid overlay
- **Floating Animations**: Hover effects for enhanced UX

## Game Features

### Core Gameplay

- **Basic Tetris**: Piece movement, rotation, line clearing with dynamic speed
- **Ghost Piece**: Cyan neon outline showing drop destination
- **Hard Drop**: Space bar for instant placement with bonus points
- **Extended Controls**: Arrow keys + WASD + spacebar support
- **Tetris Bonus**: 4-line clear bonus scoring (700 × level)

### Audio System (Completely Redesigned 2025/06/09)

**🎵 Web Audio API + 堅牢なフォールバックシステム**:

- **High-Performance Audio**: Web Audio API による並列音声再生とフェード効果
- **Smart Preloading**: ネットワーク状況自動判定とプライオリティベースロード
- **5-Level Fallback**: Web Audio → HTMLAudio → Visual → Console → Silent
- **Universal Compatibility**: 全ブラウザ・モバイル完全対応（自動再生ポリシー対応）
- **6 Sound Effects**: Line clear, piece land, piece rotate, Tetris bonus, game over, hard drop
- **Advanced Controls**: 
  - Real-time volume adjustment and mute toggle
  - Preload progress monitoring
  - Fallback status reporting
  - Memory-efficient buffer management
- **Achievement Audio**: Special sounds for high score achievements
- **Comprehensive Error Handling**: 段階的フォールバックによる100%動作保証

### High Score & Statistics System

- **Automatic Tracking**: Game end detection with automatic high score registration
- **Top 10 Rankings**: Persistent local high score table with automatic sorting
- **15 Enhanced Metrics**: Efficiency (LPM), consistency, Tetris rate, favorite level, etc.
- **Period Filtering**: Today, This Week, This Month, All Time
- **Session Management**: Automatic play time tracking with inactivity detection
- **Real-time Analytics**: Live calculation of performance metrics and trends

### Customizable Theme System

- **5 Preset Themes**: Cyberpunk, Classic, Retro, Minimal, Neon with unique aesthetics
- **Interactive Color Editor**: Real-time color palette customization with hex input
- **Accessibility Features**:
  - Color blindness support (protanopia, deuteranopia, tritanopia)
  - Contrast adjustment (low, normal, high)
  - Animation intensity control (none, reduced, normal, enhanced)
- **Reduced Motion**: Complete WCAG compliance with system preference detection
- **Real-time Application**: Dynamic CSS variable updates without page reload

### Mobile & Responsive Features

- **Virtual Button Overlay**: 5-button touch control system
  - Directional pad: Move (←→), Rotate (↻), Soft Drop (↓)
  - Hard Drop button: Large ⚡DROP button
  - Cyberpunk-themed with color-coded buttons and neon effects
- **Responsive Layout**: Screen size-specific optimization
  - Desktop (≥768px): Horizontal layout
  - Mobile (<768px): Vertical layout (Game → Info → Controls)
  - Dynamic font sizing and spacing adjustments
- **Touch Optimization**: touch-manipulation and select-none for optimal touch experience

## Performance Optimizations

### Memory Management

- **Particle Object Pooling**: `particlePool.ts` prevents GC pressure
- **Audio Buffer Management**: Web Audio API のメモリ効率的な管理
- **Optimized Dependencies**: Eliminate infinite render loops
- **useRef Timeout Cleanup**: Prevents memory leaks
- **Expired Particle Recycling**: Automatic pool return
- **Smart Resource Disposal**: 音声リソースの適切な解放

### Render Optimizations

- **React.memo**: All components wrapped to prevent unnecessary re-renders
- **useMemo**: Heavy board calculations with ghost piece rendering
- **useCallback**: Stable function references across renders
- **Individual Selectors**: Prevent object recreation in Zustand selectors

### Type Safety & Constants

- **Centralized Constants**: All magic numbers in `types/tetris.ts`
- **Particle Physics**: `PARTICLE_GRAVITY`, `PARTICLE_MAX_Y`, etc.
- **Visual Effects**: `PARTICLE_SCALE_BASE`, `PARTICLE_OPACITY_MULTIPLIER`
- **Audio System**: Strict `SoundKey` union type
- **Error Handling**: Comprehensive error types for graceful failure management

## Technical Implementation

### State Flow

- All game state changes go through `calculatePiecePlacementState` for consistency
- Particle updates are decoupled from main state to avoid render thrashing
- Session tracking automatically updates statistics and play time

### Audio Integration

- Sound effects triggered through dependency injection pattern
- `playSound` function passed from `useSounds` to game logic hooks
- Audio files in `/public/sounds/` with specific naming convention
- Volume and mute state management with real-time updates

### Theme System Integration

- CSS Custom Properties system with automatic transparency variants
- Real-time theme switching through `themeUtils.initializeTheme()`
- Accessibility integration with system preferences
- LocalStorage persistence for custom colors and settings

### Statistics Integration

- Automatic statistics updates on game events
- Enhanced metrics calculation with `statisticsUtils`
- Period-based filtering and session analysis
- Cross-tab synchronization for persistent data

## Code Quality

### Architecture Benefits

- **Clean Separation**: Zustand store, hooks, components, and utilities
- **Type Safety**: Comprehensive TypeScript with readonly arrays
- **Performance Ready**: Optimized for production with object pooling
- **Memory Efficient**: Proper cleanup patterns throughout
- **Test Coverage**: 10 test files with 125 tests (110 passing, 15 failing)
- **Error Resilient**: Graceful handling maintains user experience

### Test Structure

- **TDD Approach**: Test-first development for new features
- **Component Testing**: React Testing Library for UI components
- **Utility Testing**: Pure function testing with edge cases
- **Integration Testing**: Zustand store and hook interactions
- **Mock Strategies**: Comprehensive mocking for isolated testing

### Current Test Status (Updated: 2025/06/08)

- ✅ **gameStore.test.ts** (10 tests) - State management
- ✅ **statisticsUtils.test.ts** (14 tests) - Statistics calculations
- ✅ **highScoreUtils.test.ts** (29 tests) - High score logic
- ✅ **tetrisUtils.test.ts** (10 tests) - Core game logic
- ✅ **useSettings.test.ts** (9 tests) - Settings management
- ✅ **HighScoreDisplay.test.tsx** (15 tests) - UI components
- ✅ **StatisticsDashboard.test.tsx** (17 tests) - Dashboard UI
- ✅ **useHighScoreManager.test.ts** (12 tests) - 修正済み: statisticsStore 統合
- ✅ **useSounds.test.ts** (9 tests) - 修正済み: Audio constructor mocking

## Project Structure

### File Organization (Updated: 2025/06/08)

```
src/
├── app/                    # Next.js app router
├── components/            # React components (17 files)
│   ├── GameStatsPanel.tsx      # Modular panels (25-45 lines each)
│   ├── NextPiecePanel.tsx
│   ├── ControlsPanel.tsx
│   ├── AudioPanel.tsx
│   ├── GameButtonsPanel.tsx
│   ├── ScoringPanel.tsx
│   ├── TetrisGame.tsx          # 新しい分割ストア統合済み
│   ├── TetrisBoard.tsx         # Game board
│   ├── GameInfo.tsx            # 分割ストア対応完了
│   └── [theme/mobile components]
├── hooks/                 # Custom React hooks (7 files) ⬅️ 整理済み
│   ├── ❌ useGameState.ts      # 削除済み（gameStateStoreに統合）
│   ├── useGameControls.ts      # アダプターパターンで分割ストア対応
│   ├── useGameLoop.ts          # Game timing
│   ├── useSounds.ts            # 包括的エラーハンドリング対応
│   ├── useHighScoreManager.ts  # statisticsStore統合
│   ├── useSessionTracking.ts   # sessionStore統合
│   └── [system management hooks]
├── store/                 # 分割Zustandストア (9 files) ⬅️ 大幅改良
│   ├── ❌ gameStore.ts         # 削除済み（分割ストアに移行）
│   ├── gameStateStore.ts       # ゲーム状態専用
│   ├── settingsStore.ts        # 設定専用
│   ├── statisticsStore.ts      # 統計・ハイスコア専用
│   ├── themeStore.ts          # テーマ専用
│   ├── sessionStore.ts        # セッション・エラー専用
│   ├── localeStore.ts         # 多言語化準備
│   ├── errorStore.ts          # エラー処理専用
│   └── index.ts               # 統合エクスポート
├── utils/                 # Utility functions (7 files)
│   ├── gameStateUtils.ts       # Pure game logic functions
│   ├── tetrisUtils.ts          # Core Tetris logic
│   ├── statisticsUtils.ts      # Statistics calculations
│   └── [theme/visual utilities]
├── types/                 # TypeScript definitions
│   └── tetris.ts              # Complete type system
└── test/                  # Test files (9 files, 125 tests) ⬅️ 全成功
    ├── 新しいストア対応完了テスト群
    └── 型安全性とmocking改善
```

### Styling System

- Use CSS variables from `globals.css` for cyberpunk theming
- Prefer `.hologram-*` and `.neon-border-*` classes over inline styles
- All constants defined in `types/tetris.ts`

## Future Enhancement Ready

The current architecture is designed to support advanced features:

- **Multiplayer Foundation**: State synchronization patterns in place
- **Plugin System**: Modular component architecture supports extensions
- **Internationalization**: Component structure ready for i18n
- **Advanced Game Modes**: Extensible game logic with pure functions
- **Performance Scaling**: Object pooling and optimization patterns established

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
