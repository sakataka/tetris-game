# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. Features a sophisticated Zustand-based state management system, comprehensive test coverage, and a unified cyberpunk visual design system.

**Status**: Complete - Ready for production deployment

## Development Commands

### Core Commands

```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build with type checking
pnpm start        # Production server
pnpm lint         # ESLint validation
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Test coverage report
```

### Development Notes

- Always run `pnpm build` before committing
- ESLint warnings about useCallback dependencies are intentional
- Package manager: pnpm (optimized with .npmrc)
- Test framework: Vitest with React Testing Library
- All comments and commit messages should be in English

## Architecture Overview

### Technical Stack

- **Framework**: Next.js 15.3.3 + React 19 + TypeScript 5
- **State Management**: Zustand 5.0.5 (modular store architecture)
- **Styling**: Tailwind CSS v4 (utility-first design)
- **Testing**: Vitest + React Testing Library
- **Internationalization**: i18next + react-i18next
- **Build Tool**: Turbopack (Next.js 15)

### Project Scale

- **Components**: 34 files
- **Stores**: 11 files
- **Hooks**: 12 files
- **Utilities**: 26 files
- **Constants**: 8 files
- **Tests**: 20 active files + 7 disabled

## Component Architecture (Clean Architecture)

### Layer 1: Entry Point

**`TetrisGame.tsx`**: Main orchestrator using 3-layer structure

```typescript
<ErrorBoundary>
  <GameOrchestrator>
    <GameLogicController>
      {(api) => <GameLayoutManager api={api} />}
    </GameLogicController>
  </GameOrchestrator>
</ErrorBoundary>
```

### Layer 2: Separated Controllers

**`GameOrchestrator.tsx`**: Application initialization & lifecycle management

- SSR hydration processing, language system initialization, loading state management

**`GameLogicController.tsx`**: Business logic integration layer

- Zustand store integration, audio system management, game control aggregation
- **GameControllerAPI** - unified API for child components
- Render Props Pattern: `children(api)` for flexible composition

**`GameLayoutManager.tsx`**: UI layout & responsive control

- Desktop/mobile branching logic, ErrorBoundary integration
- Strategy Pattern: layout switching based on device type

### Layer 3: Specialized Components

**Information Display System** (Tab-based):

- **`GameInfo.tsx`**: Integrated info panel (lazy loading)
- **`TabNavigation.tsx`**: Independent tab system
- **`GameTabContent.tsx`**: Game information display
- **`StatisticsTabContent.tsx`**: Statistics management
- **`ThemeTabContent.tsx`**: Theme settings (lazy loading)
- **`SettingsTabContent.tsx`**: Settings management (lazy loading)

**Panel Components** (single responsibility):

- GameStatsPanel, NextPiecePanel, ControlsPanel, AudioPanel
- GameButtonsPanel, ScoringPanel, HighScoreDisplay

**Advanced Feature Components**:

- **`StatisticsDashboard.tsx`**: 15 extended metrics + period filtering
- **`ParticleEffect.tsx`**: Optimized animation system
- **`VirtualControls.tsx`**: Mobile touch controls (5 buttons)
- **`TetrisBoard.tsx`**: Game board display & effect integration

### Design Patterns

1. **Render Props Pattern**: GameLogicController → children(api)
2. **Facade Pattern**: GameControllerAPI unified interface
3. **Strategy Pattern**: Desktop/mobile layout branching
4. **Observer Pattern**: Zustand + React integration

## State Management System (Zustand Modular Stores)

### Store Architecture

**`gameStateStore.ts`** (Game State):

```typescript
interface GameStateStore {
  gameState: GameState;
  dropTime: number;
  // Actions: setGameState, updateParticles, resetGame, togglePause
  // High-level: calculatePiecePlacementState, movePieceToPosition, rotatePieceTo
}
```

**`settingsStore.ts`** (Settings + LocalStorage persistence):

```typescript
interface SettingsStore {
  settings: GameSettings; // volume, theme, keyBindings, difficulty
  // Actions: updateSettings, resetSettings, updateTheme
}
```

**`statisticsStore.ts`** (Statistics & High Scores):

```typescript
interface StatisticsStore {
  highScores: readonly HighScore[]; // Top 10 ranking
  statistics: GameStatistics; // 15 extended metrics
  // Calculated methods: getAverageScore, getEfficiency
}
```

**`themeStore.ts`** (Theme Management):

```typescript
interface ThemeStore {
  theme: ThemeState; // 5 presets + custom colors + accessibility
  // Actions: setTheme, setCustomColors, setAccessibilityOptions
}
```

**Additional Stores**:

- **`sessionStore.ts`**: Session tracking & play time management
- **`errorStore.ts`**: Global error handling
- **`accessibilityStore.ts`**: WCAG-compliant features
- **`languageStore.ts`**: Internationalization management

### Individual Selector Hooks (Prevents object regeneration):

```typescript
export const useSettings = () => useSettingsStore((state) => state.settings);
export const useUpdateSettings = () =>
  useSettingsStore((state) => state.updateSettings);
```

## Custom Hook System (Dependency-resolved)

### Core Hooks (Responsibility separation):

**`useGameControls.ts`**:

- Adapter pattern for loose coupling
- PieceControlActions interface abstraction
- Direct Zustand integration (onStateChange omitted)

**`useGameLoop.ts`**:

- Responsibility separation: keyboard + timer + calculation logic
- Combines useKeyboardInput, useGameTimer, useDropTimeCalculator

**`useSounds.ts`** (Advanced audio system):

- **5-level fallback**: Web Audio API → HTMLAudio → Visual → Console → Silent
- **Preload system**: Smart auto-detection
- **Parallel audio playback**: AudioContext object pooling

### Separated Side-effect Hooks:

- **useKeyboardInput**: Dedicated keyboard event processing
- **useGameTimer**: Timer control (useRef + setInterval)
- **useDropTimeCalculator**: Level-based drop time calculation

### System Management Hooks:

- **useHighScoreManager**: Automatic high score detection on game end
- **useSessionTrackingV2**: Session management & inactivity detection
- **useThemeManager**: Dynamic CSS variable updates
- **useMobileDetection**: Device detection

## Utility Structure (Function-based Directory Design)

**Total**: 26 files organized by function

### `utils/audio/` (High-performance audio system):

- **`audioManager.ts`**: Web Audio API singleton
  - AudioContext management, object pooling, parallel playback
- **`audioPreloader.ts`**: Smart preload system
- **`audioFallback.ts`**: HTMLAudioElement fallback system

### `utils/game/` (Game Logic):

- **`tetrisUtils.ts`**: Tetromino manipulation, board management, line clearing
- **`gameStateUtils.ts`**: Score calculation, level progression
- **`highScoreUtils.ts`**: Ranking management & auto-detection

### `utils/performance/` (Performance optimization):

- **`particlePool.ts`**: Object pooling (GC pressure reduction)
- **`performanceMonitor.ts`**: FPS monitoring & memory tracking
- **`animationManager.ts`**: Unified animation management

### `utils/ui/` (Theme & Accessibility):

- **`themeUtils.ts`**: CSS variable auto-generation (transparency variations)
- **`themeLoader.ts`**: 5 preset theme system
- **`accessibilityUtils.ts`**: WCAG-compliant, color vision deficiency support

### `utils/data/` (Data Management):

- **`sessionManager.ts`**: Play session tracking
- **`statisticsUtils.ts`**: 15 extended metrics calculation
- **`errorHandler.ts`**: Custom error hierarchy & gradual fallback

## Constants & Configuration System (8 files)

### Function-based constant separation:

**`gameRules.ts`**:

- Score calculation (SINGLE: 100, TETRIS: 800)
- Level progression (LEVEL_UP_LINES: 10)
- Validation settings

**`layout.ts`**:

- Board dimensions (10x20)
- Effect settings (FLASH_DURATION: 300ms)
- Mobile settings (TOUCH_DELAY: 100ms)

**`tetrominoes.ts`**:

- 7 tetromino types shape & color definitions

**`performance.ts`**:

- Particle settings (PARTICLES_PER_CELL: 3)
- FPS limits & optimization thresholds

**`storage.ts`**:

- LocalStorage key management

**`timing.ts`**:

- Animation duration settings

**`strings.ts`**:

- Multi-language string resources

### Unified Export (`index.ts`):

```typescript
export * from './gameRules';
export * from './layout';
// ... function-based bulk export
```

## Test System (Comprehensive Coverage)

**Active Tests**: 20 files
**Disabled Tests**: 7 files (.disabled)

### Test Infrastructure:

**`fixtures/mockFactory.ts`** (Unified mock generation):

```typescript
export const createMockAudioSystem = () => ({
  mockAudioContext, // Complete Web Audio API mock
  mockAudio, // HTMLAudioElement mock
  mockPlaySound, // Type-safe audio mock
});
```

**Test Categories**:

1. **Unit Tests**: Pure function testing (tetrisUtils, statisticsUtils)
2. **Component Tests**: React Testing Library (HighScoreDisplay, StatisticsDashboard)
3. **Integration Tests**: Zustand store integration (gameStore, sessionStore)
4. **Performance Tests**: Memory leak verification (themePerformance)

**Type-safe Mocks**:

- MockPlaySound, MockStoreActions
- DOM environment mocks: localStorage, matchMedia, Audio

## Key Architectural Patterns & Design Decisions

### Clean Architecture Implementation:

1. **Layer Separation**: UI → Controller → Business Logic → Data
2. **Dependency Inversion**: Interface abstraction (GameControllerAPI)
3. **Single Responsibility Principle**: Component 25-45 line limit
4. **Open-Closed Principle**: Pluggable theme & audio systems

### Performance Optimization Strategy:

1. **Memory Management**:

   - Object pooling (Particle, AudioBuffer)
   - Audio buffer management
   - useRef cleanup

2. **Rendering Optimization**:

   - React.memo applied to all components
   - useMemo heavy calculation memoization
   - Individual selectors (Zustand regeneration prevention)

3. **Code Splitting**:
   - Lazy loading (ThemeTabContent, SettingsTabContent)
   - Dynamic imports

### Type Safety Implementation:

1. **Strict TypeScript Settings**:

   ```json
   {
     "noImplicitAny": true,
     "strictNullChecks": true,
     "noImplicitReturns": true
   }
   ```

2. **Brand Types & Union Types**:
   ```typescript
   type SoundKey = 'lineClear' | 'pieceLand' | 'pieceRotate';
   type PlayerId = string & { readonly brand: unique symbol };
   ```

### Error Handling Hierarchy:

1. **Custom Error Inheritance**: BaseAppError → AudioError → GameError
2. **Gradual Fallback**: Web Audio → HTML Audio → Visual → Silent
3. **Global Error Boundary**: React Error Boundary + Zustand integration

### Internationalization & Accessibility:

1. **i18next Integration**: react-i18next + browser-languagedetector
2. **WCAG Compliance**: Color vision deficiency support, reduced-motion detection
3. **Mobile Optimization**: 5-button touch controls, responsive layout

### Quality Management System:

1. **Static Analysis**: ESLint + SonarJS + TypeScript strict mode
2. **Git Hooks**: Husky + lint-staged (pre-commit quality checks)
3. **Bundle Analysis**: Next.js Bundle Analyzer integration

## Audio System

- **Strategy Pattern Architecture**: Automatic fallback chain with dedicated strategies
- **3-level Fallback**: Web Audio API → HTML Audio Element → Silent
- **Strategy-based Implementation**: WebAudioStrategy, HTMLAudioStrategy, SilentStrategy
- **Auto-initialization**: Dynamic strategy selection based on browser capabilities
- **Concurrent Playback**: Object pooling for performance optimization
- **6 Sound Effects**: Line clear, piece land, rotate, tetris, game over, hard drop

## Statistics & Analytics

- **Auto High Score Detection**: Automatic registration on game end
- **15 Extended Metrics**: Efficiency (LPM), consistency, tetris rate, etc.
- **Period Filtering**: Today, this week, this month, all time
- **Session Management**: Auto play time tracking, inactivity detection

## Theme System

- **5 Preset Themes**: Cyberpunk, Classic, Retro, Minimal, Neon
- **Real-time Color Editor**: hex input support
- **Accessibility**: Color vision deficiency support, contrast adjustment, motion control
- **CSS Variable System**: Auto transparency variation generation

## Mobile & Responsive

- **5-button Touch Controls**: D-pad + hard drop
- **Responsive Layout**: Desktop/Mobile optimization
- **Dynamic Font Adjustment**: Screen size responsive

## Performance Metrics

- **Bundle Size**: 127KB (7KB reduction achieved)
- **Initial Load**: 19.1KB (26% reduction)
- **Test Success Rate**: 224/224 tests passing (100%)
- **Build Success Rate**: 100%

## Refactoring Priorities (Technical Debt Analysis)

### 🔥 HIGH PRIORITY

#### 1. GameLogicController Decomposition ✅ **COMPLETED**

**File**: `src/components/GameLogicController.tsx`
**Issue**: Single Responsibility Principle violation, multiple concerns in one component
**Details**:

- ~~Game state management, audio system, mobile detection, event handling mixed~~ → **Fixed**: Separated into 4 specialized controllers
- ~~15 Zustand hooks, 3 custom hooks, 7 event handlers~~ → **Fixed**: Distributed across focused controllers
- ~~Complex API object construction~~ → **Fixed**: Clean composition pattern with unified API

**Implementation Status**: ✅ Completed (2025/06/11)

#### 2. Color Processing Duplication ✅ **COMPLETED**

**File**: `src/utils/ui/themeUtils.ts`
**Issue**: Color conversion logic duplication, multiple similar functions
**Details**:

- ~~`hexToRgb` - duplicate implementation with cache~~ → **Fixed**: Unified in ColorConverter
- ~~`adjustColorBrightness` - simple implementation comment~~ → **Fixed**: Removed, replaced with ColorConverter.adjustBrightness
- ~~Transparency generation logic - insufficient abstraction~~ → **Fixed**: ColorConverter.generateTransparencies

**Implementation Status**: ✅ Completed (2025/06/11)

#### 3. Type Safety Improvements ✅ **COMPLETED**

**Files**: Multiple locations with `any` type usage
**Issue**: Missing strict type definitions, type assertion overuse
**Details**:

- ~~Audio system type assertions in audioManager.ts~~ → **Fixed**: Proper Window interface extension
- ~~Component prop interfaces incomplete~~ → **Fixed**: 30+ comprehensive prop interfaces
- ~~Event handler parameter types insufficiently strict~~ → **Fixed**: Strict event types with proper constraints

**Implementation Status**: ✅ Completed (2025/06/11)

### ⭐ MEDIUM PRIORITY

#### 4. AccessibilityStore Over-complexity ✅ **COMPLETED**

**File**: `src/store/accessibilityStore.ts`
**Issue**: Single file with excessive responsibilities, insufficient setting categorization
**Details**:

- ~~8 different accessibility categories~~ → **Fixed**: Separated into 3 focused stores + orchestrator
- ~~25 configuration items, 4 preset definitions~~ → **Fixed**: Distributed across specialized stores
- ~~Type definitions and logic mixed~~ → **Fixed**: Clean separation with dedicated types file

**Implementation Status**: ✅ Completed (2025/06/11)

**Refactoring Results**:

```typescript
// Successfully implemented modular architecture:
✅ types/accessibility.ts - All type definitions (313 lines)
✅ store/visualAccessibility.ts - Visual settings (221 lines)
✅ store/cognitiveAccessibility.ts - Cognitive assistance (260 lines)
✅ store/inputAccessibility.ts - Input & navigation (286 lines)
✅ store/accessibilityStore.ts - Orchestrator with unified API (284 lines)

// Architecture improvements:
- Code organization: 563 lines → 5 focused files
- Single Responsibility: Each store handles specific accessibility domain
- Orchestrator Pattern: Unified API with cross-store coordination
- Backward Compatibility: All existing hooks preserved
- System Integration: Individual system preference detection
```

#### 5. AudioManager High Cognitive Complexity ✅ **COMPLETED**

**File**: `src/utils/audio/audioManager.ts`
**Issue**: playSound function high cognitive complexity (ESLint disable required)
**Details**:

- ~~Web Audio API, HTMLAudio, fallback processing in one function~~ → **Fixed**: Strategy Pattern implementation
- ~~Complex conditional branching for 5-level fallback~~ → **Fixed**: Automatic strategy switching
- ~~Error handling, concurrent playback management mixed~~ → **Fixed**: Separated concerns per strategy

**Implementation Status**: ✅ Completed (2025/06/11)

**Refactoring Results**:

```typescript
// Successfully implemented Strategy Pattern:
✅ AudioStrategy - Abstract base class with common interface
✅ WebAudioStrategy - Web Audio API implementation (340 lines)
✅ HTMLAudioStrategy - HTML Audio fallback implementation (180 lines)
✅ SilentStrategy - Silent fallback implementation (70 lines)
✅ AudioManagerV2 - Strategy management with auto-fallback (340 lines)

// Performance improvements:
- Code reduction: 440 lines → 4 focused strategies
- ESLint cognitive-complexity disable: No longer needed
- Automatic fallback: Web Audio → HTML Audio → Silent
- Maintainability: Single Responsibility Principle compliance
- Test coverage: 254/254 tests passing (100%)
```

#### 6. TetrisBoard Rendering Logic Complexity

**File**: `src/components/TetrisBoard.tsx`
**Issue**: Rendering calculation, boundary checking, piece placement mixed
**Details**:

- Nested loops for rendering calculation
- Still complex despite 3 helper functions
- Ghost piece, current piece, board rendering responsibilities mixed

**Refactoring Strategy**:

```typescript
// Dedicated rendering class
class BoardRenderer {
  renderBoard(board: Board): JSX.Element[][];
  renderGhostPiece(piece: Tetromino, ghostY: number): void;
  renderCurrentPiece(piece: Tetromino): void;
  calculateBoardDisplay(): DisplayBoard;
}
```

### ⚡ LOW PRIORITY

#### 7. tetrisUtils.ts Performance Optimization ✅ **COMPLETED**

**File**: `src/utils/game/tetrisUtils.ts`
**Issue**: Heavy loop processing insufficient optimization
**Details**:

- ~~`isValidPosition` function double loop~~ → **Fixed**: Function decomposition with boundary checking separation
- ~~`placePiece` array copy processing~~ → **Fixed**: Optimized board copying (shallow copy for unchanged rows)
- ~~Line clearing linear search~~ → **Fixed**: Set-based O(1) lookup instead of O(n) includes

**Implementation Status**: ✅ Completed (2025/06/11)

**Refactoring Results**:

```typescript
// Successfully optimized core game functions:
✅ isValidPosition - Decomposed into helper functions (checkPieceBounds, checkBoardCollisions)
✅ placePiece - Optimized memory usage with partial board copying
✅ clearLines - Set-based lookup for O(1) performance improvement
✅ Cognitive Complexity - Reduced all functions below ESLint limit (15)

// Performance improvements:
- isValidPosition: Boundary checking separation, early termination
- placePiece: Selective row copying (75% memory reduction for typical pieces)
- clearLines: O(1) lookup vs O(n) includes operation
- Code Quality: All ESLint cognitive-complexity warnings resolved
- Test Success: 254/254 tests passing (100% compatibility)
```

#### 8. Distributed Statistics Processing Logic

**Files**: `src/utils/data/statisticsUtils.ts`, `src/components/StatisticsDashboard.tsx`
**Issue**: Insufficient separation between statistics calculation and UI display
**Details**:

- 15 types of extended metrics calculation distributed
- UI-dependent calculation logic mixed
- Period filtering processing duplication

#### 9. Particle System Optimization Gaps

**File**: `src/components/ParticleEffect.tsx`
**Issue**: Rendering processing optimization opportunities
**Details**:

- Object pool exists but drawing optimization insufficient
- Inefficient Canvas clear operations
- FPS control and performance monitoring separation insufficient

#### 10. Component UI Pattern Duplication

**Files**: Multiple panel components (`*Panel.tsx`)
**Issue**: Similar UI pattern duplicate implementation
**Details**:

- 8 panel components with similar layout processing
- Hologram effects, neon borders duplicate CSS
- Individual responsive processing implementation

### Priority Assessment

| Item                                | Impact | Effort | Priority    | Status      |
| ----------------------------------- | ------ | ------ | ----------- | ----------- |
| 1. GameLogicController Split        | High   | Large  | 🔥 Critical | ✅ Complete |
| 2. Color Processing Unification     | Medium | Small  | ⭐ High     | ✅ Complete |
| 3. Type Safety Improvements         | High   | Medium | ⭐ High     | ✅ Complete |
| 4. AccessibilityStore Split         | Medium | Medium | ⭐ High     | ✅ Complete |
| 5. AudioManager Strategy Pattern    | High   | Large  | 🔥 Critical | ✅ Complete |
| 6. TetrisBoard Rendering Separation | Medium | Medium | ⭐ High     | Pending     |
| 7. tetrisUtils Optimization         | High   | Medium | 🔥 Critical | ✅ Complete |
| 8. Statistics Processing Separation | Medium | Small  | ⚡ Medium   | Pending     |
| 9. Particle Optimization            | Medium | Medium | ⚡ Medium   | Pending     |
| 10. UI Pattern Unification          | Low    | Small  | ⚡ Medium   | Pending     |

**Recommended Implementation Order**: ~~1~~, ~~5~~, ~~7~~ → ~~2~~, ~~3~~, ~~4~~, 6 → 8, 9, 10

## Implementation Status

### Recently Completed (2025/06/10-11)

✅ **TetrisGame Component Decomposition** - Successfully refactored using Clean Architecture:

- **GameOrchestrator**: SSR hydration and lifecycle management
- **GameLogicController**: Zustand integration, audio system, business logic
- **GameLayoutManager**: Responsive layouts, UI composition
- **TetrisGame**: Simple component integration

**Architecture Improvements**:

- ✅ **Render Props Pattern**: Flexible component composition
- ✅ **API Integration**: Complete controller API for VirtualControls support
- ✅ **Responsibility Separation**: Each component has single responsibility
- ✅ **Type Safety**: Strict TypeScript interfaces

✅ **Color Processing Duplication (Item #2)** - Unified color manipulation system:

**New ColorConverter Utility**:

- **`src/utils/ui/colorConverter.ts`**: Comprehensive color manipulation class with 16 methods
- **Hex/RGB/HSL conversion**: Bidirectional conversion with caching
- **Advanced manipulation**: Brightness, contrast, saturation adjustment
- **WCAG compliance**: Contrast ratio calculation, accessibility checks
- **Performance optimization**: Method-level caching with cache management

**Implementation Details**:

- ✅ **Unified API**: All color operations through single ColorConverter class
- ✅ **Caching System**: Performance-optimized with cache statistics
- ✅ **Error Handling**: Graceful fallback for invalid color inputs
- ✅ **Type Safety**: Strict RGB, HSL, RGBA interfaces
- ✅ **Test Coverage**: 30 comprehensive test cases (100% passing)

**Refactored Files**:

- **`themeUtils.ts`**: Removed duplicate hexToRgb and adjustColorBrightness functions
- **`themePresets.ts`**: Updated adjustColorContrast to use ColorConverter
- **Comment Translation**: All Japanese comments converted to English

✅ **Type Safety Improvements (Item #3)** - Comprehensive type system enhancement:

**New Type System Architecture**:

- **`src/types/branded.ts`**: Branded types for ID safety (HighScoreId, ThemeId, etc.)
- **`src/types/guards.ts`**: 26 runtime type validation functions
- **`src/types/events.ts`**: Strict event handler types (GameKeyboardEvent, GameTouchEvent)
- **`src/types/components.ts`**: 30+ component prop interfaces with proper constraints
- **`src/types/generics.ts`**: Advanced TypeScript patterns (DeepPartial, DeepReadonly)

**Type Safety Enhancements**:

- ✅ **Branded Types**: Compile-time ID safety with factory functions
- ✅ **Runtime Guards**: Comprehensive validation for JSON parsing and API boundaries
- ✅ **Event Safety**: Strict typing for keyboard, touch, and custom game events
- ✅ **Component Props**: Type-safe props for all 30+ components
- ✅ **Generic Utilities**: Advanced TypeScript patterns for flexibility

**Fixed Type Issues**:

- **audioManager.ts**: Replaced unsafe type assertions with proper Window interface extension
- **Type Conflicts**: Resolved export ambiguities between tetris.ts and utility files
- **Any Types**: Eliminated all `any` usage in favor of `unknown` and proper constraints
- **Empty Objects**: Replaced `{}` with `Record<string, unknown>` for better type safety

**Build & Test Results**:

- ✅ **TypeScript**: 0 type errors (complete type safety)
- ✅ **Test Success**: 254/254 tests passing (100% compatibility)
- ✅ **Build Success**: All compilation errors resolved
- ✅ **ESLint**: Only 2 intentional optimization warnings remain
- ✅ **Runtime Safety**: Comprehensive validation at all boundaries

### Current Status

- **Completed Refactoring**:
  1. ✅ TetrisGame component decomposition (Item #1 architecture foundation)
  2. ✅ Color Processing Duplication unification (Item #2)
  3. ✅ Type Safety Improvements implementation (Item #3)
  4. ✅ AccessibilityStore Split implementation (Item #4)
  5. ✅ AudioManager Strategy Pattern implementation (Item #5)
  6. ✅ tetrisUtils Performance Optimization (Item #7)
- **Next Priority**: TetrisBoard Rendering Separation (Item #6) or Statistics Processing Separation (Item #8)
- **Architecture**: Clean Architecture + unified color system + comprehensive type safety + modular accessibility + Strategy Pattern audio + optimized game logic
- **Code Quality**: Type-safe codebase with runtime validation, zero type errors, optimized core functions, modular accessibility stores, no ESLint cognitive-complexity disables

## Future Enhancements

Ready for:

- **Internationalization**: Infrastructure completed (react-i18next integration only)
- **Multiplayer**: State synchronization patterns prepared
- **Plugin System**: Modular architecture compatible
- **Advanced Game Modes**: Extensible game logic
- **PWA**: Service Worker + manifest.json addition only

## Development Guidelines

**Quality Maintenance Process**:

- **Gradual Implementation**: Feature-unit completion
- **Test-Driven**: Run tests before and after each change
- **Type Safety**: Prohibit any types, strict type definitions
- **Performance**: Memory efficiency and rendering optimization
- **Accessibility**: WCAG compliance, universal design

**Recommended Development Flow**:

1. Read CLAUDE.md thoroughly before starting
2. Run `pnpm build` to ensure current state
3. Implement refactoring incrementally
4. Run tests frequently during development
5. Update documentation as architecture evolves
6. Commit with descriptive English messages

## Important Instructions

- **Language**: All code comments and commit messages must be in English
- **Testing**: Always run full test suite before committing changes
- **Documentation**: Update this file when making architectural changes
- **Performance**: Maintain current optimization levels during refactoring
- **Compatibility**: Preserve all existing functionality during improvements
