# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features a sophisticated Zustand-based state management system, comprehensive TDD test coverage (9 test files covering 29 source files), and a unified cyberpunk visual design system with neon effects, holographic backgrounds, and enhanced particle animations.

**Phase 2 Complete**: Full high score and statistics system with automatic persistence, real-time ranking, comprehensive error handling, statistics dashboard with enhanced metrics, session tracking, and **complete Customizable Theme System** with 5 preset themes, accessibility features, and interactive customization.

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
npm run lint   # ESLint validation - expect warnings about useCallback dependencies (intentional for performance)
npx tsc --noEmit  # TypeScript type checking without compilation
```

### Testing

```bash
npm test        # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage report

# Run specific test files (useful for TDD development)
npm test -- --run src/test/gameStore.test.ts
npm test -- --run src/test/highScoreUtils.test.ts
npm test -- --run src/test/useHighScoreManager.test.ts
npm test -- --run src/test/HighScoreDisplay.test.tsx
npm test -- --run src/test/StatisticsDashboard.test.tsx
npm test -- --run src/test/statisticsUtils.test.ts
```

### Development Notes

- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds
- **Always run `npm run build` before committing** to ensure no build errors
- ESLint warnings about missing dependencies in useCallback are intentional for infinite loop prevention

## Architecture Overview

This Tetris game uses a sophisticated four-layer architecture: **Zustand State Management** (centralized store with persistence), **Custom Hooks** (business logic), **Visual Design** (CSS variables + themed components), and **Performance** (object pooling + memoization). The architecture follows TDD principles with comprehensive test coverage and includes advanced statistics tracking, session management, and a complete customizable theme system with accessibility features.

### Zustand State Management (Primary)

The game uses pure Zustand (Immer removed due to SSR hydration issues) for type-safe state management:

**`useGameStore`** (Central Store):

- Global state container with LocalStorage persistence
- Handles high scores, statistics, settings, theme, errors, and play sessions
- Immutable state updates using spread operators and functional patterns
- Automatic data migration and validation
- Session tracking with automatic play time calculation
- Selective hooks: `useHighScores`, `useStatistics`, `useSettings`, `useTheme`
- Individual selector functions prevent infinite render loops by avoiding object recreation

**State Persistence Strategy**:

- Only user data persisted: settings, high scores, statistics, theme, play sessions
- Game state (board, pieces) is ephemeral and reset on each game
- Cross-tab synchronization with storage events
- Fallback to defaults with comprehensive error handling
- Session tracking with automatic inactivity detection (30-minute timeout)

### Hook-Based Business Logic

Legacy and specialized business logic hooks:

**`useGameState`** (Primary State Management):

- Manages all game state including board, pieces, score, effects
- Handles piece placement calculations with `calculatePiecePlacementState`
- Optimized `updateParticles` function with empty dependency array to prevent infinite loops
- Implements memory leak prevention with proper timeout cleanup

**`useGameControls`** (User Interactions):

- Handles piece movement, rotation, and hard drop
- Integrates with state management for piece placement
- Pure input processing without direct state coupling

**`useGameLoop`** (Game Timing & Events):

- Manages automatic piece dropping with dynamic speed
- Handles keyboard input mapping (Arrow keys + WASD + spacebar)
- Controls game loop timing based on level progression

**`useSounds`** (Audio System):

- Manages 6 distinct game audio effects with HTML5 Audio API
- Provides volume control and mute functionality
- Handles audio initialization and playback optimization
- Integrates with game state for contextual sound triggering
- Robust error handling for missing audio files with graceful degradation

**`useHighScoreManager`** (High Score System):

- Automatic high score detection and saving on game end
- Real-time ranking calculation and score validation
- Sound effect integration for achievements (1st place gets special sound)
- Comprehensive statistics tracking with game count and averages
- Memory management to prevent duplicate processing

**`useSessionTracking`** (Session Management):

- Automatic session start/end detection with play time tracking
- Inactivity timeout management (30 minutes)
- Game count tracking per session
- Integration with Zustand store for persistence

**`useThemeManager`** (Theme System Management):

- Complete theme management with real-time CSS variable updates
- Color blindness filter application and contrast adjustments
- Animation intensity control and reduced motion support
- LocalStorage persistence and system preference monitoring
- Integration with accessibility settings

**`useSettings`** (Legacy Configuration):

- Still used for some legacy settings functionality
- Gradually being migrated to Zustand store

**`useMobileDetection`** (Mobile Device Detection):

- Real-time device and screen size detection
- Touch device capability detection
- Responsive breakpoint monitoring (768px threshold)
- Orientation change and resize event handling

### Cyberpunk Visual Design System

**CSS Variable Architecture**:

- Unified cyberpunk color palette: `--cyber-cyan`, `--cyber-purple`, `--cyber-yellow`
- Transparency variations: `--cyber-cyan-10`, `--cyber-cyan-20`, `--cyber-cyan-30`, etc.
- Effect constants: `--neon-blur-sm` to `--neon-blur-xl`
- Standardized hologram backgrounds and neon borders

**Visual Components**:

- **Hologram Effects**: `.hologram`, `.hologram-cyan`, `.hologram-purple`, `.hologram-yellow`
- **Neon Borders**: `.neon-border`, `.neon-border-purple`, `.neon-border-yellow`
- **Grid Background**: Cyberpunk-style grid overlay with CSS variables
- **Floating Animations**: Subtle hover effects for enhanced user experience

### Performance Optimizations

**Memory Management**:

- Particle object pooling system (`particlePool.ts`) prevents GC pressure
- Optimized dependency arrays eliminate infinite render loops
- Expired particles automatically returned to pool for reuse
- `useRef` based timeout cleanup prevents memory leaks

**Render Optimizations**:

- All components wrapped with `React.memo` to prevent unnecessary re-renders
- `useMemo` for heavy board calculations with ghost piece rendering
- `useCallback` for stable function references across renders
- Optimized `displayBoard` calculation with minimal dependencies

**Type Safety & Constants**:

- Centralized particle physics constants: `PARTICLE_GRAVITY`, `PARTICLE_MAX_Y`
- Visual effect constants: `PARTICLE_SCALE_BASE`, `PARTICLE_OPACITY_MULTIPLIER`
- All magic numbers replaced with typed constants in `types/tetris.ts`
- Strict typing for audio system with `SoundKey` union type
- Error handling types for graceful failure management

### Component Architecture

**TetrisGame** (Main Orchestrator):

- Composes multiple custom hooks for complete game functionality (useGameState, useGameControls, useGameLoop, useSounds, useSettings)
- Enhanced visual layout with cyberpunk gradient effects
- Optimized callback functions with `useCallback` for child components
- Centralized settings integration with LocalStorage persistence

**TetrisBoard** (Visual Display Layer):

- Cyberpunk-themed game board with hologram background
- Neon-enhanced ghost piece with glow effects
- Enhanced cell styling with CSS variable integration
- Game over/pause overlays with themed styling

**GameInfo** (Themed UI Panels with Tabs):

- Tab-based interface switching between Game Info, Statistics Dashboard, and Theme Settings
- Game Info tab: Seven themed panels (Score Data, Next Piece, Controls, Audio, Buttons, Scoring, High Scores)
- Statistics tab: Comprehensive dashboard with enhanced metrics and analytics
- Theme tab: Complete customizable theme system with accessibility features
- High score panel displays Top 5 with rank, score, level, lines, date, and player name
- Audio panel includes volume slider and mute toggle with cyberpunk styling
- Each panel uses unique hologram backgrounds and neon borders
- Enhanced buttons with gradient effects and hover animations
- Consistent cyberpunk typography and spacing

**StatisticsDashboard** (Advanced Analytics UI):

- 15 enhanced statistical metrics (efficiency, consistency, favorite level, etc.)
- Period filtering: Today, This Week, This Month, All Time
- Real-time statistics calculation and display
- Session analysis with longest session and games per session
- Recent achievements display with top 3 high scores
- Detailed view toggle for comprehensive or simplified display
- Empty state handling for new players

**HighScoreDisplay** (Ranking System UI):

- Configurable display count (default Top 5 in GameInfo)
- Optional rank display with cyberpunk styling
- Player name support with validation
- Date formatting in Japanese locale
- Empty state handling with appropriate messaging

**ParticleEffect** (Enhanced Animation System)\*\*:

- Uses particle pool for memory efficiency
- Enhanced visual effects with multi-layer glow and sparkle animations
- Physics simulation with configurable constants
- Automatic particle lifecycle management with pool return

**Theme System Components**:

- **ThemeSettings**: Unified theme management with tabbed interface (Theme/Colors/Accessibility/Effects)
- **ThemeSelector**: Interactive theme selection with live preview
- **ColorPaletteEditor**: Real-time color customization with hex input and color picker
- **AccessibilitySettings**: Comprehensive accessibility options (color blindness, contrast, animation intensity)

**Mobile Controls Components**:

- **VirtualControls**: Touch-optimized mobile game controls
  - 5-button layout: 十字パッド（移動・回転・ソフトドロップ）+ ハードドロップ
  - Cyberpunk-themed with color-coded buttons and neon effects
  - Conditional rendering based on device detection and user settings
  - Touch events with `onTouchStart` for immediate response
  - Accessibility support with `aria-label` and proper semantics

### Game Features

**Core Gameplay**:

- **Ghost Piece**: Cyan neon outline showing drop destination
- **Hard Drop**: Space bar for instant piece placement with bonus points
- **Extended Controls**: Both arrow keys and WASD support
- **Dynamic Difficulty**: Speed increases every 10 lines cleared
- **Tetris Bonus**: 4-line clear bonus scoring

**Visual Enhancements**:

- **Cyberpunk Theme**: Complete visual redesign with neon aesthetics
- **Enhanced Particles**: Multi-layer glow effects with hue rotation
- **Holographic UI**: Translucent panels with backdrop blur
- **Themed Overlays**: Game over and pause screens with cyberpunk styling
- **Floating Animation**: Subtle game board hover effect

**Audio Features**:

- **Contextual Sound Effects**: 6 distinct audio cues for game events
- **Interactive Audio**: Piece rotation, landing, hard drop, line clear sounds
- **Game State Audio**: Tetris bonus and game over sound effects
- **Achievement Audio**: Special sound effects for high score achievements
- **Audio Controls**: Real-time volume adjustment and mute toggle
- **Performance Optimized**: Preloaded audio with efficient playback management

**High Score & Statistics System**:

- **Automatic Tracking**: Game end detection with automatic high score registration
- **Top 10 Rankings**: Persistent local high score table with automatic sorting
- **Enhanced Statistics Dashboard**: 15 detailed metrics including efficiency (LPM), consistency, Tetris rate
- **Session Tracking**: Automatic play session management with time tracking
- **Real-time Analytics**: Live calculation of performance metrics and trends
- **Achievement Recognition**: Rank-based celebration messages and sound effects
- **Data Persistence**: LocalStorage with cross-tab synchronization
- **Validation & Security**: Input sanitization and data integrity checks

**Customizable Theme System**:

- **5 Preset Themes**: Cyberpunk, Classic, Retro, Minimal, Neon with unique aesthetics
- **Interactive Color Editor**: Real-time color palette customization with hex input and color picker
- **Accessibility Features**: Color blindness support (3 types), contrast adjustment, animation intensity control
- **Reduced Motion**: Complete accessibility compliance with system preference detection
- **Real-time Application**: Dynamic CSS variable updates without page reload
- **Persistent Customization**: LocalStorage persistence with cross-tab synchronization

**Mobile & Responsive Features**:

- **Virtual Button Overlay**: 5 つのタッチボタンでフルゲーム操作
  - 十字方向パッド: 移動（←→）・回転（↻）・ソフトドロップ（↓）
  - ハードドロップボタン: 大型の ⚡DROP ボタン
  - Cyberpunk テーマ統一とネオンエフェクト
- **Responsive Layout System**: 画面サイズ別最適化レイアウト
  - デスクトップ（≥768px）: 横並び配置
  - モバイル（<768px）: 縦並び配置（ゲームボード → GameInfo → Virtual Controls）
  - フォントサイズとスペーシングの動的調整
- **Mobile Detection**: リアルタイムデバイス・画面サイズ検出
- **Touch Optimization**: タッチデバイス向け最適化（touch-manipulation, select-none）

### Technical Implementation Details

**CSS Variable System**:

- Centralized color management with transparency variations
- Reusable effect classes for consistent styling
- Configurable blur and glow intensities
- Maintainable theme architecture

**Particle Physics**:

- Gravity simulation with `PARTICLE_GRAVITY` constant
- Configurable particle lifespan and movement bounds
- Enhanced visual rendering with scale and rotation effects
- Memory-efficient object pooling pattern

**Audio System Architecture**:

- HTML5 Audio API with preloaded sound files in `/public/sounds/`
- Six audio files: `line-clear.mp3`, `piece-land.mp3`, `piece-rotate.mp3`, `tetris.mp3`, `game-over.mp3`, `hard-drop.mp3`
- Sound integration through hook dependency injection pattern
- Volume and mute state management with real-time audio object updates
- Comprehensive error handling for missing files with loading state tracking
- Graceful degradation when audio files are unavailable

**Zustand Store Architecture**:

- Pure Zustand store without Immer (removed due to SSR hydration issues)
- Immutable state updates using spread operators and functional patterns
- Individual selector functions to prevent object recreation and infinite loops
- Type-safe actions with comprehensive error boundaries
- Persistence functionality temporarily disabled (can be re-enabled when needed)

**Theme System Architecture**:

- `themePresets.ts`: 5 complete theme configurations with colors, effects, and accessibility settings
- `themeUtils.ts`: Dynamic CSS variable manipulation, color blindness filters, contrast adjustments
- `useThemeManager.ts`: Hook for theme state management, system preference monitoring, LocalStorage persistence
- CSS Custom Properties system with automatic transparency variant generation
- Reduced motion compliance with CSS media queries and JavaScript detection

**Statistics & Analytics Architecture**:

- `statisticsUtils.ts`: 14 pure utility functions for advanced statistics calculation
- `StatisticsDashboard.tsx`: Comprehensive analytics UI with period filtering
- `useSessionTracking.ts`: Automatic session management with play time tracking
- `highScoreUtils.ts`: Pure utility functions for ranking, validation, statistics
- `useHighScoreManager.ts`: React hook for automatic game end detection
- `HighScoreDisplay.tsx`: Reusable UI component with cyberpunk theming
- Comprehensive test coverage with 125+ unit and integration tests

**TDD Development Approach**:

- Test-first development for all new features
- Comprehensive mocking strategies for Zustand store testing
- Component testing with React Testing Library
- Utility function testing with edge case coverage

**Performance Characteristics**:

- Zero infinite render loops through optimized dependencies
- ~90% reduction in CSS duplication through variable system
- Memory leak prevention through proper timeout management
- Audio preloading and efficient playback management
- Production-ready performance optimizations with object pooling

## Current Codebase Quality

### Code Organization

- **Clean Architecture**: Separation of concerns with Zustand store, hooks, and components
- **Type Safety**: Comprehensive TypeScript coverage with readonly arrays and strict typing
- **Performance**: Optimized rendering and memory management with object pooling
- **Maintainability**: Unified styling system and consistent patterns
- **Test Coverage**: 9 test files with comprehensive TDD coverage for all features including statistics dashboard and theme system
- **Error Resilience**: Robust error handling for audio, storage, and game state failures
- **State Management**: Centralized Zustand store with persistence and validation

### Visual Design System

- **Consistent Theme**: Cyberpunk aesthetic across all components
- **Reusable Classes**: Standardized hologram and neon effect classes
- **Configurable Effects**: CSS variables for easy theme modifications
- **Enhanced UX**: Smooth animations and visual feedback

### Project-Specific Implementation Notes

**Styling System**:

- Use CSS variables from `globals.css` for all cyberpunk theming
- Prefer `.hologram-*` and `.neon-border-*` classes over inline styles
- All magic numbers are constants in `types/tetris.ts`

**State Flow**:

- All game state changes go through `calculatePiecePlacementState` for consistency
- Particle updates are decoupled from main state to avoid render thrashing

**Audio Integration**:

- Sound effects triggered through dependency injection pattern in hooks
- `playSound` function passed from `useSounds` to `useGameState` and `useGameControls`
- Audio files must be placed in `/public/sounds/` directory with specific naming
- All audio interactions respect mute state and volume settings
- Error handling prevents crashes when audio files are missing or fail to load

**Zustand Store Integration**:

- Use `useGameStore` for centralized state access and mutations
- Leverage selective hooks: `useHighScores`, `useStatistics`, `useSettings`, `useTheme`
- Individual selector functions prevent infinite render loops by avoiding object recreation
- Session management actions: `startPlaySession`, `endPlaySession`, `incrementGameCount`
- State changes are immutable through spread operators and functional patterns
- Data persistence temporarily disabled (use localStorage directly if needed)

**Theme System Integration**:

- Use `useThemeManager` hook for complete theme management
- Access theme state through Zustand: `useGameStore(state => state.theme)`
- Theme actions: `setTheme`, `setCustomColors`, `setAccessibilityOptions`, `resetThemeToDefault`
- Real-time CSS variable updates through `themeUtils.initializeTheme()`
- Accessibility integration with system preferences and user settings
- LocalStorage persistence for custom colors and accessibility options

**Statistics Dashboard Integration**:

- Use `StatisticsDashboard` component with `EnhancedStatistics` interface
- `calculateEnhancedStatistics` for advanced metric calculation
- Period filtering with `filterStatisticsByPeriod` utility function
- Session tracking automatically updates play time and game counts

**High Score System Integration**:

- `useHighScoreManager` automatically handles game end detection and score saving
- `HighScoreDisplay` component for displaying ranked scores with theming
- Use `highScoreUtils` functions for score validation and ranking calculations
- All high score data persists across browser sessions with LocalStorage

## Future Enhancement Roadmap

### Phase 2: Core Feature Expansion (COMPLETED ✅)

**Target**: Enhanced user experience and mobile support

**State Management Standardization** (✅ COMPLETED):

```typescript
interface GlobalGameState extends GameState {
  settings: GameSettings;
  highScores: readonly HighScore[];
  statistics: GameStatistics;
  theme: ThemeState;
  errors: readonly GameError[];
}
```

- ✅ Zustand store implemented (Immer removed due to SSR issues)
- ✅ Individual selector functions to prevent infinite loops
- ✅ Comprehensive error handling and validation
- ✅ Type-safe readonly arrays
- ⚠️ State persistence temporarily disabled (can be re-enabled)

**High Score & Statistics System** (✅ COMPLETED):

- ✅ Local high score management (Top 10) with automatic sorting
- ✅ Session statistics tracking (total lines, games, best streak, average score)
- ✅ Real-time achievement recognition with sound effects
- ✅ Comprehensive test coverage (125+ tests)
- ✅ Statistical data display in GameInfo panel

**Statistics Dashboard Implementation** (✅ COMPLETED):

- ✅ Advanced statistics dashboard with 15 detailed metrics
- ✅ Play time tracking and efficiency metrics (Lines Per Minute)
- ✅ Session management with automatic play time calculation
- ✅ Period filtering (Today/Week/Month/All Time)
- ✅ Enhanced UI with tab-based navigation in GameInfo
- ✅ Comprehensive TDD test coverage (31 additional tests)

**Customizable Theme System** (✅ COMPLETED):

- ✅ Additional preset themes (classic, retro, minimal, neon)
- ✅ Custom color palette editor with real-time preview
- ✅ Color-blind friendly configurations (3 types)
- ✅ Contrast adjustment controls (low, normal, high)
- ✅ Animation intensity settings (none, reduced, normal, enhanced)
- ✅ Reduced motion compliance and system preference detection
- ✅ Complete accessibility features integrated into GameInfo theme tab
- ✅ LocalStorage persistence and cross-tab synchronization

**Mobile & Responsive Enhancement** (🔄 PARTIALLY COMPLETED):

- ✅ **Virtual Button Overlay**: 5 つのタッチボタン（移動・回転・ハードドロップ）
  - Cyberpunk テーマ統一のモバイル操作 UI
  - 十字パッド + ハードドロップボタン配置
  - タッチ最適化とアクセシビリティ対応
  - GameInfo 設定パネルで ON/OFF 切り替え可能
- ✅ **Screen Size-Specific Layout Optimization**: レスポンシブレイアウト完全対応
  - デスクトップ: 横並び配置（従来通り）
  - モバイル: 縦並び配置（ゲームボード → GameInfo → Virtual Controls）
  - フォントサイズとスペーシングの画面サイズ別最適化
  - Virtual Controls 干渉回避とスペース確保
- 🔄 **Swipe Gesture Support**: 直感的なスワイプ操作（実装予定）
- 🔄 **Haptic Feedback Integration**: タッチ操作時の触覚フィードバック（実装予定）

**Phase 2 除外項目**:

- ~~Device Rotation Support~~ (縦画面前提で除外)
- ~~Tablet Optimization~~ (スマホ・デスクトップのみ対応)

## 現在進行中のリファクタリング計画

### 段階 1: GameInfo コンポーネント分割 (✅ 完了 - 2024/06/08)

**目的**: 338 行の巨大な GameInfo コンポーネントを機能別に分割

**完了済み**:

- ✅ GameStatsPanel.tsx - スコア、レベル、ライン表示 (30 行)
- ✅ NextPiecePanel.tsx - 次のピース表示 (35 行)
- ✅ ControlsPanel.tsx - キーバインド表示 (25 行)
- ✅ AudioPanel.tsx - 音声設定パネル (45 行)
- ✅ GameButtonsPanel.tsx - ポーズ・リセットボタン (30 行)
- ✅ ScoringPanel.tsx - スコア計算表示 (25 行)
- ✅ GameInfo.tsx - 新しいコンポーネント統合完了

**効果**:

- 各パネル 25-45 行に分割（元 338 行から大幅削減）
- 責務の明確化と再利用性向上
- テスト容易性の大幅改善
- ビルドエラーなし、既存機能完全保持

### 段階 2: useGameState 分割 (✅ 完了 - 2024/06/08)

**目的**: 184 行の useGameState を責務別に分割

**完了済み**:

- ✅ gameStateUtils.ts 新規作成 - 純粋関数群として分離
- ✅ calculateScoreIncrease() - スコア計算ロジック (15 行)
- ✅ processLineClear() - ライン消去処理 (8 行)
- ✅ createLineEffects() - エフェクト作成 (18 行)
- ✅ checkGameOver() - ゲームオーバー判定 (15 行)
- ✅ updateGameStateWithPiece() - 状態更新 (25 行)
- ✅ useGameState.ts - 75 行の巨大関数を 6 つのステップに分割

**効果**:

- calculatePiecePlacementState: 75 行 →58 行に削減（明確な 6 ステップ）
- 各責務が独立した純粋関数として分離
- 個別テスト可能な関数群への変換完了
- 型安全性向上（any 型排除）
- ビルドエラーなし、既存機能完全保持

### 段階 3: Zustand ストア分割 (🔄 進行中 - 2024/06/08)

**目的**: 441 行の gameStore.ts をドメイン別に分割

**完了済み**:

- ✅ **フェーズ 1: settingsStore.ts** - 設定管理 (40 行)
  - GameSettings 型対応、デフォルト値設定
  - 音量、テーマ、キーバインド、Virtual Controls 管理
  - settingsStore↔themeStore連携機能
- ✅ **フェーズ 2: gameStateStore.ts** - ゲーム状態管理 (90 行)
  - ボード、ピース、スコア、レベル、ライン管理
  - パーティクルエフェクト、ライン消去エフェクト
  - ゲームリセット、ポーズ機能
- ✅ **フェーズ 3: themeStore.ts** - テーマ管理 (90 行)
  - 5つのプリセットテーマ、カスタムカラー
  - アクセシビリティ設定（色覚、コントラスト、アニメーション）
  - エフェクト強度、アニメーション制御
- ✅ **フェーズ 4: statisticsStore.ts** - 統計・ハイスコア管理 (80 行)
  - ハイスコア管理（Top 10）、統計データ
  - ゲーム統計更新、効率計算
  - GameStatistics型準拠の完全実装
- ✅ **フェーズ 5: sessionStore.ts** - セッション・エラー管理 (120 行)
  - プレイセッション管理（開始・終了・ゲーム数追跡）
  - エラーハンドリング（追加・削除・制限）
  - セッション時間計算、統計連携

**完了**:
- ✅ **統合エクスポート**: src/store/index.ts作成
- ✅ **5つのドメイン別ストア**: 441行→430行（5ファイル分割）
- ✅ **レガシーストア**: 段階的廃止準備完了

### Phase 3: Advanced Features (1-2 months)

**Target**: Platform-level capabilities and accessibility

**Multiplayer Foundation**:

```typescript
interface MultiplayerArchitecture {
  gameMode: "single" | "versus" | "cooperative" | "battle";
  players: Player[];
  syncEngine: StateSyncEngine;
  networking: NetworkLayer;
}
```

- Local multiplayer (same-screen 2-player)
- WebSocket/WebRTC communication layer
- State synchronization with conflict resolution
- Real-time 1vs1 competitive mode
- Cooperative line-clearing mode

**Internationalization (i18n)**:

```typescript
interface I18nSystem {
  languages: ["ja", "en", "es", "fr", "de", "ko", "zh"];
  translations: TranslationMap;
  formatters: LocaleFormatters;
  rtlSupport: RTLConfig;
}
```

- Multi-language UI support
- Regional number and date formatting
- Right-to-left language support
- Localized audio files
- Regional keyboard layout adaptation

**Accessibility Enhancement (WCAG Compliance)**:

```typescript
interface AccessibilityFeatures {
  screenReader: ScreenReaderConfig;
  keyboardNav: KeyboardNavConfig;
  visualAids: VisualAidConfig;
  motorSupport: MotorSupportConfig;
}
```

- Complete screen reader support
- Keyboard-only navigation
- High contrast mode
- Reduced motion options
- Alternative text and ARIA labels
- Non-color-based information delivery

**Advanced Game Modes**:

```typescript
type ExtendedGameMode =
  | "classic"
  | "sprint"
  | "ultra"
  | "zen"
  | "puzzle"
  | "survival";
```

- Sprint Mode: Time-limited line clearing competition
- Ultra Mode: Maximum score within time limit
- Zen Mode: Relaxing unlimited play
- Puzzle Mode: Complete specific arrangements
- Survival Mode: Progressively increasing speed
- Power-ups with temporary special effects
- Daily challenges and missions

**Plugin System**:

```typescript
interface GamePlugin {
  manifest: PluginManifest;
  hooks: PluginHooks;
  components: PluginComponents;
  assets: PluginAssets;
}
```

- Third-party plugin support
- Custom theme plugins
- New game mode extensions
- Enhanced effect plugins
- Statistics and analysis tools
- Streaming/content creator features

### Technical Infrastructure Extensions

**Performance Optimization**:

- Web Workers for heavy computation isolation
- Virtual scrolling for large data handling
- Service Worker for offline support
- Bundle splitting and lazy loading

**Data Management**:

- IndexedDB for large-capacity data storage
- Optional cloud synchronization
- Data backup and restoration
- Migration system for version updates

### Extensibility Patterns

- **Theme Variations**: Easy creation of new color schemes using CSS variables
- **Effect Customization**: Configurable particle and animation parameters
- **Component Reuse**: Hologram and neon effect classes for new features
- **Performance Scaling**: Architecture ready for complex visual effects
- **Plugin Architecture**: Extensible system for community contributions

### Architecture Benefits

- **Comprehensive Theming**: Complete customizable theme system with 5 presets, accessibility features, and real-time customization
- **Performance Ready**: Optimized for production deployment with Zustand state management and object pooling
- **Type Safe**: Comprehensive TypeScript with readonly arrays, strict typing, and theme type safety
- **Memory Efficient**: Object pooling for particles and proper cleanup patterns throughout
- **Accessibility Compliant**: Full WCAG compliance with color blindness support, contrast adjustment, and reduced motion
- **Test-Driven Development**: 9 test files with comprehensive coverage ensure reliability and prevent regressions
- **Error Resilient**: Graceful handling of failures maintains user experience across all features
- **Data Persistence**: Comprehensive LocalStorage with cross-tab synchronization for all user preferences
- **Scalable Architecture**: Zustand foundation ready for advanced features, multiplayer, and theme extensions

## Project-Specific Testing

**Test Structure**:

- 9 test files covering 29 source files with comprehensive TDD coverage
- Mock Zustand store with custom test stores for isolated testing
- Focus on game logic, statistics, and theme system testing

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
