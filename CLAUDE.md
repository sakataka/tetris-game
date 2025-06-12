# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS. Features comprehensive state management, audio system with fallback strategies, and particle effects.

**Tech Stack**: Next.js 15.3.3 + React 19 + TypeScript 5 + Zustand 5 + Tailwind CSS v4

## Environment Setup

**Prerequisites**: Node.js 18+, pnpm package manager

**Configuration**: The game uses environment-based configuration with `.env.local` overrides:

```bash
# Key environment variables (see .env.example)
NEXT_PUBLIC_AUDIO_ENABLED=true          # Audio system toggle
NEXT_PUBLIC_PARTICLES_ENABLED=true      # Particle effects toggle
NEXT_PUBLIC_MAX_PARTICLES=200           # Performance tuning
NEXT_PUBLIC_TARGET_FPS=60               # Frame rate target
NEXT_PUBLIC_DEFAULT_LEVEL=1             # Starting difficulty
NEXT_PUBLIC_DEBUG_PERFORMANCE=false     # Performance debugging
```

**Development Tools**: Uses Turbopack for fast development, Husky for pre-commit hooks

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

## State Management (Zustand)

### Core Stores

- **gameStateStore**: Game state, piece movement, line clearing
- **settingsStore**: User preferences with localStorage persistence
- **statisticsStore**: High scores and gameplay metrics
- **themeStore**: Theme management with 5 presets + custom colors
- **accessibilityStore**: WCAG-compliant features (3 sub-stores)

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
- **Game Helpers**: `log.audio()`, `log.animation()`, `log.game()`, `log.performance()`
- **Production Mode**: Automatic debug log suppression for clean console output
- **Structured Context**: Component identification and metadata attachment

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

## Testing Strategy

- **Unit Tests**: Pure functions (tetrisUtils, statisticsUtils)
- **Component Tests**: React Testing Library with JSDOM
- **Integration Tests**: Zustand store testing with mock scenarios
- **Performance Tests**: Memory and rendering optimization validation
- **Coverage**: 272 tests, 100% passing with Vitest

```bash
# Run specific test patterns
pnpm test tetris           # Run tests matching "tetris"
pnpm test src/test/hooks   # Run hook tests
pnpm test --ui             # Run with Vitest UI
```

**Test Files Structure**: Located in `src/test/` with corresponding `*.test.ts` files

## Performance Optimizations

1. **Memory Management**

   - Object pooling for particles and audio
   - Selective board rendering (partial updates)
   - useRef for animation state

2. **Rendering Optimization**

   - React.memo on all components
   - Individual Zustand selectors
   - Lazy loading for settings tabs

3. **Animation Performance**
   - Unified RAF management
   - FPS limiting and frame skipping
   - Performance monitoring

## Type Safety

- **Strict TypeScript**: No `any` types, comprehensive interfaces
- **Branded Types**: Type-safe IDs (HighScoreId, ThemeId)
- **Runtime Guards**: 26 validation functions for JSON/API boundaries
- **Event Types**: Strict typing for keyboard and touch events

## Internationalization

- **i18next**: Full EN/JA support
- **Dynamic Loading**: Browser language detection
- **Component Integration**: All UI text internationalized
- **Accessibility**: ARIA labels and announcements

## Code Quality & Linting

### Oxlint Integration (Rust-based, 50-100x faster)

- **Primary Linter**: Oxlint 1.0 with 500+ rules
- **Performance**: 7-8ms execution time vs ESLint's 1.4s
- **Memory Usage**: 78MB vs ESLint's 416MB (5.3x less)
- **Configuration**: `.oxlintrc.json` with Next.js/React/TypeScript plugins

```bash
pnpm lint         # Oxlint only (daily development)
pnpm lint:oxlint  # Oxlint explicit execution
pnpm lint:eslint  # ESLint only (when needed)
pnpm lint:full    # Both linters (comprehensive check)
pnpm lint:fix     # Auto-fix with both linters
```

### Linting Strategy

- **Development**: Oxlint for instant feedback
- **Pre-commit**: Oxlint via lint-staged (fast commits)
- **CI/CD**: Oxlint in pipeline (faster builds)
- **Comprehensive**: ESLint available when needed

## Important Notes

- Package manager: pnpm (required)
- Comments and commits: English only
- Linting: Oxlint primary, ESLint secondary
- Build before commit: Always run `pnpm build`
- Git hooks: Pre-commit checks via Husky

## Development Workflow

### Adding a New Feature

1. Check existing patterns in similar components (follow MVC/hooks architecture)
2. Use appropriate Zustand stores (`gameStateStore`, `settingsStore`, etc.)
3. Follow TypeScript strict mode (no `any` types)
4. Add comprehensive tests in `src/test/`
5. Run `pnpm quality:check` before committing

### Debugging Common Issues

**Audio Problems:**

```bash
# Check audio strategy in browser console
log.audio("Current strategy:", audioStrategy.currentStrategy)
# Verify fallback chain: WebAudio → HTMLAudio → Silent
```

**Performance Issues:**

```bash
# Enable performance debugging
NEXT_PUBLIC_DEBUG_PERFORMANCE=true pnpm dev
# Check AnimationManager stats in console
log.performance("FPS:", animationManager.getFPS())
```

**State Management Issues:**

- Use Zustand DevTools browser extension
- Check individual selectors to prevent object regeneration
- Verify store subscription patterns

**Build Issues:**

```bash
pnpm build              # Check for build errors
pnpm lint:full          # Comprehensive linting
pnpm tsc --noEmit       # TypeScript validation
```

## Future Feature Roadmap

The current architecture is designed to support future expansion with minimal refactoring. Key architectural foundations include:

- **Multiplayer-Ready**: State sync patterns via Zustand stores and centralized game logic
- **Plugin Architecture**: Modular component design with clear interfaces and dependency injection
- **Extensible Game Logic**: Configurable game modes through gameStateStore extensions
- **PWA Conversion Ready**: Service worker structure and offline-first design patterns

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
