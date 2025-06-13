# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS. Features comprehensive state management, audio system with fallback strategies, and particle effects.

**Tech Stack**: Next.js 15.3.3 + React 19.1.0 + TypeScript 5 (ES2024) + Zustand 5 + Tailwind CSS 4.1.10 (with React Compiler & modern CSS features)

## Environment Setup

**Prerequisites**: Node.js 18+, pnpm package manager

**Configuration**: The game uses environment-based configuration with `.env.local` overrides:

**Development Tools**: Uses Turbopack for fast development, Husky for pre-commit hooks, React Compiler for automatic optimization

## Quick Start

```bash
# Setup
pnpm install            # Install dependencies (required: pnpm)
cp .env.example .env.local  # Copy environment configuration

# Development
pnpm dev                # Development server with Turbopack
pnpm build              # Production build
pnpm start              # Start production server

# Testing
pnpm test               # Run tests in watch mode
pnpm test:run           # Run tests once
pnpm test:coverage      # Run tests with coverage report

# Code Quality
pnpm lint               # Oxlint validation (7-8ms execution)
pnpm lint:full          # Oxlint + ESLint comprehensive check
pnpm lint:fix           # Auto-fix issues with both linters
pnpm format             # Format code with Prettier
pnpm quality:check      # Full quality pipeline (lint + typecheck + test)

# Analysis
pnpm analyze            # Bundle size analysis
```

## Architecture Overview

### Component Architecture (3-Layer Structure)

```
TetrisGame (Entry Point)
├── GameOrchestrator (Lifecycle & SSR)
├── GameLogicController (Business Logic)
│   ├── Game state management (Zustand)
│   ├── Audio system integration
│   └── Game controls aggregation
└── GameLayoutManager (UI Layout)
    ├── Desktop/Mobile layouts
    └── Component composition
```

### Key Design Patterns

1. **Render Props Pattern**: `GameLogicController` provides API via `children(api)`
2. **Strategy Pattern**: Audio system with WebAudio → HTMLAudio → Silent fallback
3. **Service Pattern**: `StatisticsService` for centralized calculations
4. **MVC Pattern**: `BoardRenderer` separates rendering logic from UI
5. **Controller Pattern**: Specialized controllers compose through render props
6. **React Compiler Pattern**: Automatic optimization without manual memoization

### Controller Architecture

The game uses a layered controller pattern for clean separation of concerns:

1. **GameStateController**: Core game logic and state management

   - Handles piece movement, rotation, and collision detection
   - Manages game lifecycle (start, pause, game over)
   - Integrates with gameStateStore

2. **AudioController**: Audio system management

   - Provides unified audio API across strategies
   - Handles audio initialization and fallback
   - Manages volume and mute states

3. **EventController**: Event handling and propagation

   - Centralizes game event management
   - Provides hooks for game lifecycle events
   - Manages event subscriptions

4. **DeviceController**: Device detection and adaptation
   - Detects mobile vs desktop environments
   - Provides device-specific configurations
   - Manages responsive behavior

Controllers compose through render props, allowing clean API aggregation:

## React 19.1 Modern Features

### React Compiler Integration

The project leverages React 19.1's React Compiler for automatic performance optimization:

**Key Benefits:**

- **Zero Manual Optimization**: 40+ useMemo/useCallback instances removed
- **Intelligent Memoization**: Compiler decides when optimization is beneficial
- **Automatic Re-rendering Control**: Optimal component update patterns
- **Better Performance**: More efficient than manual optimization

**Components Optimized:**

- `TetrisBoard`: 6 useMemo optimizations replaced with compiler intelligence
- `GameStateController`: 3 useCallback optimizations removed
- `ParticleCanvas`: Complex animation optimizations simplified
- `ParticleEffect`: 4 manual optimizations replaced
- All settings components: Event handlers automatically optimized

### Modern React Features

**1. use() Hook for Async Resources**

```typescript
// GameOrchestrator.tsx - Enhanced hydration management
const isHydrated = use(getHydrationPromise());
```

**2. Ref as Prop (Native Support)**

- No forwardRef dependencies required
- Direct ref passing to functional components
- Cleaner component APIs

**3. Enhanced Error Handling**

- Better hydration error messages
- Improved client-server mismatch detection
- Automatic error recovery patterns

**4. Performance Improvements**

- Faster compilation with React Compiler
- Reduced bundle size through intelligent optimization
- Better memory usage patterns

**Performance Impact:**

- Bundle size: Main page 43.3 kB (First Load JS: 176 kB) - optimized by compiler
- Compilation: 3.0s build time with React Compiler optimizations
- Runtime: Better performance through intelligent memoization
- Memory: More efficient with compiler-managed optimization
- Tests: 343 tests passing with improved performance

## State Management (Zustand)

### Core Stores

- **gameStateStore**: Game state, piece movement, line clearing
- **settingsStore**: User preferences with localStorage persistence
- **statisticsStore**: High scores and gameplay metrics
- **themeStore**: Theme management with 5 presets + custom colors
- **accessibilityStore**: WCAG-compliant features (3 sub-stores)
- **errorStore**: Error tracking with categorization, statistics, and UI integration
- **sessionStore**: Unified session management with automatic timeout (30min)
- **languageStore**: i18n language state management with persistence
- **localeStore**: Locale-specific settings (date format, RTL support)

### Store Usage Pattern

```typescript
// Individual selectors prevent object regeneration
export const useGameState = () => useGameStateStore((state) => state.gameState);
export const useSetGameState = () =>
  useGameStateStore((state) => state.setGameState);
```

## Key Systems

### Audio System (Strategy Pattern)

- **AudioManagerV2**: Manages strategy switching
- **WebAudioStrategy**: Primary audio with object pooling
- **HTMLAudioStrategy**: Fallback for older browsers
- **SilentStrategy**: Silent mode fallback
- Auto-detection and graceful degradation

#### Decomposed Audio Hooks

- **useAudioStrategy**: Strategy selection and switching logic with retry mechanisms
- **useAudioPlayer**: Clean playback interface with throttling
- **useAudioState**: Volume and mute state management
- **useAudioPreloader**: Audio file preloading with progress tracking
- **useSounds**: Legacy compatibility wrapper combining all audio hooks

### Particle System

- **ParticlePool**: Object pooling with 80%+ reuse rate
- **CanvasRenderer**: Gradient caching, selective clearing
- **FpsController**: Adaptive 30-120fps control
- 200+ particles at 60fps with automatic optimization

### Animation System

- **AnimationManager**: Centralized RAF management
- **useAnimationFrame**: Hook-based animation control
- **useTimerAnimation**: Interval replacement with RAF
- Performance monitoring and auto-optimization

### Logging System

- **Logger**: Environment-aware unified logging with structured context
- **Log Levels**: ERROR, WARN, INFO, DEBUG (development only)
- **Game Helpers**: `log.audio()`, `log.animation()`, `log.game()`, `log.performance()`, `log.config()`
- **Production Mode**: Automatic debug log suppression for clean console output
- **Structured Context**: Component identification and metadata attachment
- **Format**: ISO timestamp + level + [component](action) + message

### Timeout Management System

- **TimeoutManager**: Unified timeout management using AnimationManager
- **Features**:
  - Animation-based timeouts for consistency with game loop
  - Support for long-duration timeouts (session management)
  - Automatic cleanup and memory management
  - Debug logging for timeout tracking
- **API**: `unifiedSetTimeout()` and `unifiedClearTimeout()`

### Error Handling System

- **ErrorStore**: Centralized error tracking and management
- **Error Categories**: game, audio, storage, network, ui, validation, system
- **Error Levels**: info, warning, error, critical
- **Features**:
  - Automatic error statistics and aggregation
  - UI integration with ErrorNotification component
  - Error history with configurable retention
  - Error filtering by category and level
- **ErrorBoundary Hierarchy**: Page-level and component-level error isolation

### Session Management

- **SessionStore**: Unified session tracking replacing legacy SessionManager
- **Features**:
  - Automatic session timeout (30 minutes)
  - Play time tracking and statistics
  - Game count per session
  - localStorage persistence
  - Window focus/blur handling
- **Statistics**: Total play time, average session duration, games per session

## UI Components

### Panel System (Unified Design)

- **PanelBase**: Universal panel component
- 6 themes: cyan, purple, green, yellow, red, default
- Consistent hologram effects and neon borders
- Responsive sizing (sm, md, lg)

### Key Components

- **TetrisBoard**: Game board with BoardRenderer MVC
- **ParticleEffect/Canvas**: Line clear animations
- **VirtualControls**: Mobile touch controls (5 buttons)
- **StatisticsDashboard**: 15 extended metrics

## Tailwind CSS v4.1 Modern Features

### Advanced @theme Directive Implementation

The project leverages Tailwind CSS v4.1's enhanced `@theme inline` directive for sophisticated theme management:

### Modern CSS Features Integration

**1. Color Management with OKLCH**

- Enhanced color mixing using `color-mix(in oklch, ...)` for perceptually uniform transparency
- Superior gradient rendering and better color interpolation
- Improved accessibility with consistent luminance scaling

**2. CSS Layers for Organization**

```css
@layer base, components, utilities, animations;
```

- Explicit cascade control for better maintainability
- Clear separation of base styles, components, utilities, and animations
- Prevents specificity conflicts and improves debugging

**3. Container Queries Support**

- Component-based responsive design independent of viewport
- Better encapsulation for modular components
- Future-proof layout patterns

**4. Modern Viewport Units**

- `dvh` (dynamic viewport height) for mobile-first design
- `svh` (small viewport height) for consistent minimum heights
- Better mobile browser compatibility

## Hooks Architecture

### Core Game Hooks

- **useGameControls**: Piece movement and rotation logic
- **useGameLoop**: Combines keyboard, timer, and drop logic
- **useGameTimer**: Animation-based timer system
- **useSounds**: Audio management with fallback chain

### System Hooks

- **useHighScoreManager**: Auto-detection on game end
- **useSessionTrackingV2**: Play time and session management
- **useThemeManager**: Dynamic CSS variable updates
- **useErrorActions**: Error management and UI integration
- **useSessionStore**: Unified session management with localStorage persistence

## Testing Strategy

- **Test Framework**: Vitest with React Testing Library
- **Environment**: JSDOM for browser API simulation
- **Unit Tests**: Pure functions (tetrisUtils, statisticsUtils)
- **Component Tests**: React Testing Library with JSDOM
- **Integration Tests**: Zustand store testing with mock scenarios
- **Performance Tests**: Memory and rendering optimization validation
- **Coverage**: 343 tests, 100% passing with Vitest

### Vitest Configuration

```bash
# Run specific test patterns
pnpm test tetris           # Run tests matching "tetris"
pnpm test src/test/hooks   # Run hook tests
pnpm test --ui             # Run with Vitest UI
```

**Test Files Structure**: Located in `src/test/` with corresponding `*.test.ts` files

## Performance Optimizations

1. **React 19.1 + Compiler Optimizations**

   - **React Compiler**: Automatic memoization and optimization
   - **Zero Manual Memoization**: 40+ useMemo/useCallback instances removed
   - **Intelligent Caching**: Compiler-driven performance optimization
   - **Modern React Features**: use() API for better async handling

2. **Memory Management**

   - Object pooling for particles and audio
   - Selective board rendering (partial updates)
   - useRef for animation state

3. **Rendering Optimization**

   - React.memo on all components
   - Individual Zustand selectors
   - Lazy loading for settings tabs
   - React Compiler automatic optimizations

4. **Animation Performance**
   - Unified RAF management
   - FPS limiting and frame skipping
   - Performance monitoring

## Type Safety

- **Strict TypeScript**: No `any` types, comprehensive interfaces
- **Branded Types**: Type-safe IDs (HighScoreId, ThemeId)
- **Runtime Guards**: 26 validation functions for JSON/API boundaries
- **Event Types**: Strict typing for keyboard and touch events

## Internationalization

- **i18next**: Full EN/JA support with React integration
- **Dynamic Loading**: Browser language detection
- **Component Integration**: All UI text internationalized
- **Accessibility**: ARIA labels and announcements

### Dual Store Architecture

The i18n system uses two complementary stores:

1. **languageStore**: Primary i18n state management

   - Manages current language selection
   - Integrates with i18next for translations
   - Persists language preference to localStorage
   - Handles initialization and language switching

2. **localeStore**: Locale-specific configurations
   - Date format settings per locale
   - RTL language support (prepared for future expansion)
   - HTML lang attribute management
   - Browser language detection with fallback

## Code Quality & Linting

### Oxlint Integration (Rust-based, 50-100x faster)

- **Linter**: Oxlint 1.0 with 500+ rules (ESLint removed for performance)
- **Performance**: 7-8ms execution time (50-100x faster than ESLint)
- **Memory Usage**: 78MB (5.3x less than ESLint)
- **Configuration**: `.oxlintrc.json` with Next.js/React/TypeScript plugins

```bash
pnpm lint         # Run Oxlint
pnpm lint:fix     # Auto-fix with Oxlint
```

### Linting Strategy

- **Development**: Oxlint for instant feedback
- **Pre-commit**: Oxlint via lint-staged (fast commits)
- **CI/CD**: Oxlint in pipeline (faster builds)
- **Code Quality**: Comprehensive rule set covering TypeScript, React, and Next.js best practices

## Build Configuration

### Next.js Optimization

- **React Compiler**: Enabled in experimental config for automatic optimization
- **Bundle Analyzer**: Integrated for size analysis (`pnpm analyze`)
- **Compiler Options**: Console.log removal in production (keeps warn/error)
- **Package Optimization**: Optimized imports for zustand, immer, react
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Image Optimization**: AVIF/WebP formats with responsive sizes

### React Compiler Configuration

```typescript
// next.config.ts
experimental: {
  reactCompiler: true, // Enables automatic optimization
  optimizePackageImports: ['zustand', 'immer', 'react', 'react-dom'],
}
```

**React Compiler Benefits:**

- Automatic memoization without manual optimization
- Intelligent re-rendering control
- Reduced bundle size through optimized compilation
- Better performance with zero developer overhead

### Tailwind CSS v4.1 Configuration

- **PostCSS Integration**: Uses `@tailwindcss/postcss` v4.1.10 for optimal performance
- **No Config File Required**: Leverages v4's configuration-free approach
- **CSS Import Method**: Direct `@import 'tailwindcss';` in globals.css
- **Enhanced @theme Directive**: Utilizes inline theme definitions with CSS variables
- **Modern CSS Features**:
  - OKLCH color space for better color mixing
  - CSS clamp() for fluid typography
  - Container queries for component-based responsive design
  - CSS layers for organized cascade management
  - Modern viewport units (dvh, svh, lvh)

### TypeScript Configuration

- **ES2024 Target**: Modern JavaScript features and APIs
- **Strict Mode**: Enhanced with additional strict checks
- **Compiler Options**:
  - `target`: "ES2024" - Latest JavaScript features
  - `lib`: ES2024 comprehensive library support (ArrayBuffer, Collection, Object, Promise, String, RegExp, SharedMemory)
  - `noUnusedLocals`: true
  - `noUnusedParameters`: true
  - `exactOptionalPropertyTypes`: true
  - `noUncheckedIndexedAccess`: true
  - `noPropertyAccessFromIndexSignature`: true
  - `noImplicitOverride`: true
  - `useDefineForClassFields`: true - ES2022+ class field behavior
  - `assumeChangesOnlyAffectDirectDependencies`: true - Faster incremental builds

**ES2024 Features Available:**

- Modern Array and Object methods
- Advanced Promise handling
- Enhanced String manipulation APIs
- Improved Regular Expression features
- SharedArrayBuffer and advanced ArrayBuffer operations
- Latest Collection (Set/Map) enhancements

## Important Notes

- Package manager: pnpm (required)
- React version: 19.1.0 with React Compiler enabled
- Comments and commits: English only
- Linting: Oxlint only (ESLint removed for performance)
- Build before commit: Always run `pnpm build`
- Git hooks: Pre-commit checks via Husky
- Performance: Let React Compiler handle optimization automatically

## Development Workflow

### Adding a New Feature

1. Check existing patterns in similar components (follow MVC/hooks architecture)
2. Use appropriate Zustand stores (`gameStateStore`, `settingsStore`, etc.)
3. Follow TypeScript strict mode (no `any` types)
4. **React Compiler Best Practices**: Avoid manual useMemo/useCallback unless necessary
5. Let React Compiler handle optimization automatically
6. Add comprehensive tests in `src/test/`
7. Run `pnpm quality:check` before committing

### React Compiler Guidelines

**DO:**

- Write clean, readable code without premature optimization
- Use standard React patterns and let the compiler optimize
- Focus on component logic rather than performance concerns
- Trust the compiler for automatic memoization

**DON'T:**

- Add manual useMemo/useCallback unless absolutely necessary
- Over-optimize code that the compiler handles better
- Use complex dependency arrays for simple computations
- Assume manual optimization is always faster

## Future Feature Roadmap

The current architecture is designed to support future expansion with minimal refactoring. Key architectural foundations include:

### 🟢 High Priority Features (1-3 months)

1. **Custom Control Schemes**

   - Fully remappable keys
   - Multiple control profiles
   - Gamepad support (Xbox, PlayStation)
   - Touch gesture customization
   - Architecture: Extend settingsStore with control mapping

2. **Advanced Game Modes**

   - **Puzzle Mode**: Pre-set challenges to solve
   - **Marathon Mode**: Endless gameplay with increasing difficulty
   - **Time Attack**: Score maximization in fixed time
   - **Gravity Mode**: Pieces affected by physics
   - Architecture: Extend gameStateStore with mode-specific logic

3. **Achievement & Progression System**

   - 50+ achievements with different tiers
   - Player level and experience points
   - Unlockable themes, sounds, and effects
   - Daily/weekly challenges
   - Architecture: New ProgressionStore + persistent storage

4. **Tutorial & Training System**

   - Interactive tutorial for beginners
   - Advanced technique training (T-spins, etc.)
   - Practice specific scenarios
   - Video tutorials integration
   - Architecture: New TutorialStore + guided tour library

### 🟡 Medium Priority Features (3-6 months)

5. **Real-time Multiplayer System**

   - WebSocket/WebRTC integration for low-latency gameplay
   - Battle mode (1v1, 2v2, team battles)
   - Spectator mode with live commentary
   - Matchmaking and ELO rating system
   - Architecture: Extend GameStateStore with multiplayer sync layer

6. **AI Opponent System**

   - Machine learning-based difficulty adaptation
   - Multiple AI personalities (aggressive, defensive, balanced)
   - Training mode against AI
   - Architecture: New AIStrategyStore + TensorFlow.js integration

7. **Replay System**

   - Record and playback gameplay sessions
   - Share replays with unique URLs
   - Frame-by-frame analysis
   - Export as video (WebRTC)
   - Architecture: New ReplayStore + compression algorithms

8. **Power-ups & Special Blocks**

   - Bomb blocks (clear area)
   - Rainbow blocks (match any color)
   - Time freeze power-up
   - Ghost mode (temporary invincibility)
   - Architecture: Extend tetrisUtils with power-up logic

9. **Social Features**

   - Friend system with invites
   - Global and friend leaderboards
   - Profile customization
   - Chat system (with moderation)
   - Architecture: New SocialStore + OAuth integration

10. **Advanced Statistics Dashboard**

    - Heat maps of piece placements
    - Performance graphs over time
    - Detailed session analytics
    - Export statistics as CSV/PDF
    - Architecture: Extend StatisticsService with visualization

11. **Music & Sound Customization**

    - Custom music playlists
    - Sound effect packs
    - Dynamic music (adapts to gameplay)
    - Community sound sharing
    - Architecture: Extend AudioManagerV2 with playlist support

12. **Enhanced Visual Customization**

    - Piece skin editor
    - Custom background animations
    - Particle effect designer
    - Import/export theme packages
    - Architecture: Extend themeStore with advanced options

### 🔴 Low Priority Features (6+ months)

13. **Tournament & Competition Platform**

    - Tournament bracket system
    - Scheduled events and seasons
    - Prize pool management
    - Live streaming integration
    - Architecture: New CompetitionStore + backend API integration

14. **Plugin System Architecture**

    - Modular component loading system
    - Third-party extension APIs
    - Plugin marketplace integration
    - Hot-swappable game modules
    - Architecture: Plugin manager with lifecycle hooks and dependency injection

15. **Performance Profiler**

    - In-game FPS counter
    - Network latency display
    - Memory usage monitoring
    - Performance recommendations
    - Architecture: Extend performanceMonitor with UI overlay

16. **Accessibility Enhancements**

    - Voice commands
    - Screen reader improvements
    - One-handed play mode
    - Customizable visual indicators
    - Architecture: Extend accessibilityStore with new features

### Implementation Priority Matrix

| Feature                           | User Value | Technical Complexity | Architecture Fit | Priority  |
| --------------------------------- | ---------- | -------------------- | ---------------- | --------- |
| Custom Control Schemes            | High       | Low                  | Excellent        | 🟢 High   |
| Advanced Game Modes               | High       | Medium               | Excellent        | 🟢 High   |
| Achievement & Progression System  | High       | Medium               | Good             | 🟢 High   |
| Tutorial & Training System        | High       | Low                  | Good             | 🟢 High   |
| Real-time Multiplayer System      | Very High  | High                 | Good             | 🟡 Medium |
| AI Opponent System                | Medium     | High                 | Good             | 🟡 Medium |
| Replay System                     | Medium     | Medium               | Good             | 🟡 Medium |
| Power-ups & Special Blocks        | Medium     | Medium               | Good             | 🟡 Medium |
| Social Features                   | Medium     | High                 | Fair             | 🟡 Medium |
| Advanced Statistics Dashboard     | Medium     | Low                  | Good             | 🟡 Medium |
| Music & Sound Customization       | Medium     | Low                  | Good             | 🟡 Medium |
| Enhanced Visual Customization     | Medium     | Medium               | Good             | 🟡 Medium |
| Tournament & Competition Platform | Low        | Very High            | Fair             | 🔴 Low    |
| Plugin System Architecture        | Medium     | Very High            | Excellent        | 🔴 Low    |
| Performance Profiler              | Low        | Medium               | Good             | 🔴 Low    |
| Accessibility Enhancements        | Medium     | Medium               | Good             | 🔴 Low    |

### Technical Preparation Checklist

Before implementing major features:

1. **Backend Infrastructure** (for multiplayer/social)

   - WebSocket server setup
   - Database design (PostgreSQL/Redis)
   - Authentication system (JWT/OAuth)
   - CDN for replay storage

2. **Performance Optimizations**

   - Code splitting for feature modules
   - Web Workers for AI calculations
   - IndexedDB for large data storage
   - WebAssembly for critical paths

3. **Testing Infrastructure**

   - E2E tests for multiplayer
   - Load testing for concurrent users
   - AI behavior testing framework
   - Replay validation tests

4. **Security Measures**
   - Input validation for multiplayer
   - Anti-cheat systems
   - Rate limiting
   - Content moderation tools
