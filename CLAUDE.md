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
npm test -- --run src/test/gameStore.test.ts
npm test -- --run src/test/highScoreUtils.test.ts
npm test -- --run src/test/statisticsUtils.test.ts
```

### Development Notes
- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds
- **Always run `npm run build` before committing** to ensure no build errors
- ESLint warnings about missing dependencies in useCallback are intentional for infinite loop prevention

## リファクタリングToDoリスト

### 🔥 最優先（Critical Priority）
1. **状態管理の統合と整理** - レガシーuseGameStateとZustandストア混在の解消
   - gameStore.tsから分割済みストアへの完全移行
   - useGameStoreの削除と分割ストア使用への統一
   - 状態の重複と不整合の解消

2. ✅ **多言語化準備完了** - コンポーネント責務分離とリソース基盤構築
   - ✅ GameOverMessage/PausedMessage/LoadingMessageコンポーネント分離
   - ✅ strings.ts/gameConstants.ts - 100+文字列のリソース化
   - ✅ localeStore.ts - 4言語対応の完全な言語管理システム
   - ✅ 全UIテキストの外部リソース化とi18n準備完了

3. ✅ **エラーハンドリングの統一完了** - 包括的エラー処理システム実装
   - ✅ カスタムエラークラス階層（BaseAppError継承）作成
   - ✅ グローバルエラーバウンダリ（ページ/セクション/コンポーネントレベル）実装
   - ✅ try-catchブロック統一化とuseSoundsでの適用
   - ✅ エラー状態管理ストア（Zustand）追加とトースト通知システム

### ⚡ 高優先（High Priority）
4. **カスタムフックの整理** - 相互依存の解消
   - useGameControls、useGameLoop、useGameStateの再設計
   - 単一責任の原則に基づいた分割
   - 副作用の分離（エフェクトタイマー管理など）

5. **パフォーマンス最適化** - レンダリング効率の改善
   - ParticleEffectコンポーネントの最適化
   - Canvas APIまたはWeb Workerの検討
   - React.memoの適用拡大

6. **型安全性の向上** - any型排除と厳密な型定義
   - mockPlaySoundなどのany型使用箇所の修正
   - SoundKeyなどのユニオン型拡張
   - Readonly型の徹底活用

### 🔧 中優先（Medium Priority）
7. **音声システムの改善** - 非効率な音声ファイル管理の改善
   - Web Audio APIの導入検討
   - 音声プリロードの最適化
   - エラーハンドリングの強化

8. **コンポーネント構造の見直し** - GameInfoコンポーネントの分割
   - タブシステムの独立したコンポーネント化
   - 統計情報、テーマ設定、ゲーム情報の分離
   - 機能別コンポーネントの最適化

9. **セッション管理の簡素化** - PlaySession追跡ロジックの改善
   - セッション管理専用サービスクラスの作成
   - ローカルストレージ同期処理の改善
   - セッションデータ構造の最適化

### 📈 低優先（Low Priority）
10. **テーマシステムの簡素化** - CSS変数生成ロジックの改善
    - テーマプリセットのJSON化
    - CSS-in-JSライブラリの検討
    - アクセシビリティ設定の独立コンテキスト化

11. **定数とユーティリティの整理** - ファイル構造の最適化
    - constants.ts専用ファイルの作成
    - ユーティリティ関数の機能別分類
    - tetris.tsの責務分離

12. **テスト構造の改善** - テストコードの品質向上
    - モック重複定義の解消
    - テスト用ファクトリ関数とフィクスチャの作成
    - 統合テストの追加

13. **レスポンシブデザインの改善** - メディアクエリの統一
    - Tailwindブレークポイントの統一的使用
    - インラインスタイルの削減
    - モバイル専用コンポーネントの作成

14. **アニメーションシステムの最適化** - アニメーション管理の統一
    - CSS/JavaScriptアニメーションの整理
    - Framer Motionなどライブラリの導入検討
    - requestAnimationFrameの統一管理

15. **ビルドとバンドルの最適化** - パフォーマンス向上
    - 未使用インポートとデッドコードの削除
    - 動的インポートによるコード分割
    - アセット最適化（画像・音声）

### 実装ガイドライン
- **段階的実装**: 最優先から順次実装、1つずつ完了してから次へ
- **テスト駆動**: 各リファクタリング前後でテスト実行
- **ビルド検証**: 修正後は必ず`npm run build`で検証
- **Git管理**: 各機能単位でコミット、詳細なコミットメッセージ

## 🌐 多言語化実装準備状況

### 基盤完成済み
- **文字列リソース**: strings.ts（15カテゴリ、100+文字列）
- **言語管理**: localeStore.ts（ja/en/zh/ko対応）
- **コンポーネント分離**: メッセージ表示の完全分離
- **型安全性**: 全文字列キーの型定義完備

### 次のステップ（多言語化実装）
1. **react-i18next** または **next-intl** ライブラリ導入
2. 翻訳ファイル作成（ja.json, en.json, zh.json, ko.json）
3. useTranslation フックの各コンポーネント適用
4. 言語切替UIコンポーネントの実装

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
- **型安全性**: TypeScript完全対応、エラーレベル・カテゴリ分類
- **コンテキスト情報**: アクション、コンポーネント、追加データの自動収集

#### グローバルエラーバウンダリ（src/components/ErrorBoundary.tsx）
```typescript
<ErrorBoundary level="page|section|component">
  {children}
</ErrorBoundary>
```
- **多層構造**: ページ→セクション→コンポーネントの段階的エラー処理
- **フォールバックUI**: レベル別カスタマイズ可能な代替表示
- **リトライ機能**: 自動復旧とユーザー手動リトライ対応

#### 統一エラーハンドラー（src/utils/errorHandler.ts）
```typescript
class ErrorHandlerService {
  public handleError(error: Error | BaseAppError): ErrorHandlingResult
  public withErrorHandling<T>(fn: Function): Function
  public handleAsyncError(asyncFn: Function): Promise<any>
}
```
- **シングルトンパターン**: 全アプリケーション共通のエラー処理
- **カテゴリ別ハンドラー**: ゲーム、音声、ストレージ、ネットワーク別処理
- **グローバルキャッチ**: 未処理例外とPromise rejectionの自動捕捉

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
- **Zustand統合**: 既存ストアアーキテクチャとの完全統合
- **永続化制御**: エラー設定のみ永続化、エラーデータはセッション毎リセット
- **統計機能**: エラー頻度、カテゴリ別分析、最近のエラー履歴

#### エラー通知システム（src/components/ErrorNotification.tsx）
```typescript
<ErrorNotification position="top-right" maxNotifications={3} />
```
- **トースト形式**: レベル別色分け、自動消去、手動クローズ対応
- **位置カスタマイズ**: 画面の8箇所配置指定可能
- **通知制御**: 表示数制限、重複防止、優先度管理

#### 実装適用箇所
- **useSounds.ts**: 音声ロード・再生エラーをAudioErrorで統一処理
- **TetrisGame.tsx**: セクション・コンポーネントレベルのエラーバウンダリ配置
- **layout.tsx**: ページレベルエラーバウンダリとエラー通知システム統合

### 技術仕様
- **エラー分類**: 4レベル（info/warning/error/critical）× 8カテゴリ
- **型安全性**: 完全TypeScript対応、エラー情報の型安全な収集
- **パフォーマンス**: エラー履歴サイズ制限、メモリ効率的な管理
- **開発者体験**: 詳細スタックトレース、コンテキスト情報の自動収集

## Architecture Overview

This Tetris game uses a sophisticated modular architecture with **Zustand State Management**, **Modular Component System**, **Separated Utility Functions**, **Performance Optimizations**, and **Unified Error Handling System**. The architecture follows TDD principles with comprehensive test coverage.

### Zustand State Management

**`useGameStore`** (Central Store - 442 lines):
- Global state container with LocalStorage persistence
- Handles game state, settings, high scores, statistics, theme, errors, and play sessions
- Immutable state updates using spread operators and functional patterns
- Individual selector functions prevent infinite render loops
- Specialized hooks: `useGameState`, `useGameActions`, `useSettings`, `useHighScores`, `useStatistics`, `useTheme`

**State Management Architecture**:
- Game state (board, pieces) is ephemeral and reset on each game
- User data persisted: settings, high scores, statistics, theme, play sessions
- Cross-tab synchronization with storage events
- Comprehensive error handling and validation
- Session tracking with automatic inactivity detection

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

### Hook-Based Business Logic

**Core Game Hooks**:
- **useGameState.ts** (184 lines) - Primary state management with `calculatePiecePlacementState`
- **useGameControls.ts** (102 lines) - User input handling
- **useGameLoop.ts** (101 lines) - Game timing and automatic piece dropping
- **useSounds.ts** (126 lines) - 6-sound audio system with volume control

**System Management Hooks**:
- **useHighScoreManager.ts** - Automatic high score detection and saving
- **useSessionTracking.ts** - Session management with play time tracking
- **useThemeManager.ts** - Theme management with CSS variable updates
- **useMobileDetection.ts** - Real-time device and screen size detection
- **useSettings.ts** - Legacy settings (gradually being migrated)

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

### Audio System
- **6 Sound Effects**: Line clear, piece land, piece rotate, Tetris bonus, game over, hard drop
- **Volume Control**: Real-time volume adjustment and mute toggle
- **Achievement Audio**: Special sounds for high score achievements
- **Error Handling**: Graceful degradation when audio files are missing

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
- **Optimized Dependencies**: Eliminate infinite render loops
- **useRef Timeout Cleanup**: Prevents memory leaks
- **Expired Particle Recycling**: Automatic pool return

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

### Current Test Status
- ✅ **gameStore.test.ts** (10 tests) - State management
- ✅ **statisticsUtils.test.ts** (14 tests) - Statistics calculations
- ✅ **highScoreUtils.test.ts** (29 tests) - High score logic
- ✅ **tetrisUtils.test.ts** (10 tests) - Core game logic
- ✅ **useSettings.test.ts** (9 tests) - Settings management
- ✅ **HighScoreDisplay.test.tsx** (15 tests) - UI components
- ✅ **StatisticsDashboard.test.tsx** (17 tests) - Dashboard UI
- ❌ **useHighScoreManager.test.ts** (12 failing) - Zustand mock issues
- ❌ **useSounds.test.ts** (3 failing) - Audio API mock issues

## Project Structure

### File Organization (53 TypeScript files, 7,857 total lines)
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
│   ├── TetrisGame.tsx          # Main orchestrator
│   ├── TetrisBoard.tsx         # Game board
│   ├── GameInfo.tsx            # Tabbed info panel
│   └── [theme/mobile components]
├── hooks/                 # Custom React hooks (9 files)
│   ├── useGameState.ts         # Primary state management
│   ├── useGameControls.ts      # Input handling
│   ├── useGameLoop.ts          # Game timing
│   ├── useSounds.ts            # Audio system
│   └── [system management hooks]
├── store/                 # Zustand state management
│   └── gameStore.ts            # Central store (442 lines)
├── utils/                 # Utility functions (7 files)
│   ├── gameStateUtils.ts       # Pure game logic functions
│   ├── tetrisUtils.ts          # Core Tetris logic
│   ├── statisticsUtils.ts      # Statistics calculations
│   └── [theme/visual utilities]
├── types/                 # TypeScript definitions
│   └── tetris.ts              # Complete type system
└── test/                  # Test files (10 files, 125 tests)
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

# Development Memories
- 大きな修正をしてコミットするタイミングには GitHubにも同期してください。

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.