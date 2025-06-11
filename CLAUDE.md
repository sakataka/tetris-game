# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS. Features comprehensive state management, audio system with fallback strategies, and particle effects.

**Tech Stack**: Next.js 15.3.3 + React 19 + TypeScript 5 + Zustand 5 + Tailwind CSS v4

## Quick Start

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # ESLint validation
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
- **Component Tests**: React Testing Library
- **Integration Tests**: Zustand store testing
- **Performance Tests**: Memory and rendering optimization
- **Coverage**: 272 tests, 100% passing

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

## Important Notes

- Package manager: pnpm (required)
- Comments and commits: English only
- ESLint warnings: Intentional useCallback optimizations
- Build before commit: Always run `pnpm build`
- Git hooks: Pre-commit checks via Husky

## Common Tasks

### Adding a New Feature

1. Check existing patterns in similar components
2. Use appropriate hooks and stores
3. Follow TypeScript strict mode
4. Add tests for new functionality

### Debugging Audio Issues

1. Check AudioManagerV2 strategy status
2. Verify browser permissions
3. Check fallback chain in console

### Performance Issues

1. Check AnimationManager stats
2. Monitor particle count
3. Verify RAF timing

## Future Feature Roadmap

The current architecture is designed to support future expansion with minimal refactoring. Key architectural foundations include:

- **Multiplayer-Ready**: State sync patterns via Zustand stores and centralized game logic
- **Plugin Architecture**: Modular component design with clear interfaces and dependency injection
- **Extensible Game Logic**: Configurable game modes through gameStateStore extensions
- **PWA Conversion Ready**: Service worker structure and offline-first design patterns

### 🚀 Large Features (3-6 months)

1. **Real-time Multiplayer System**

   - WebSocket/WebRTC integration for low-latency gameplay
   - Battle mode (1v1, 2v2, team battles)
   - Spectator mode with live commentary
   - Matchmaking and ELO rating system
   - Architecture: Extend GameStateStore with multiplayer sync layer

2. **AI Opponent System**

   - Machine learning-based difficulty adaptation
   - Multiple AI personalities (aggressive, defensive, balanced)
   - Training mode against AI
   - Architecture: New AIStrategyStore + TensorFlow.js integration

3. **Tournament & Competition Platform**
   - Tournament bracket system
   - Scheduled events and seasons
   - Prize pool management
   - Live streaming integration
   - Architecture: New CompetitionStore + backend API integration

### ⭐ Medium Features (1-3 months)

4. **Advanced Game Modes**

   - **Puzzle Mode**: Pre-set challenges to solve
   - **Marathon Mode**: Endless gameplay with increasing difficulty
   - **Time Attack**: Score maximization in fixed time
   - **Gravity Mode**: Pieces affected by physics
   - Architecture: Extend gameStateStore with mode-specific logic

5. **Achievement & Progression System**

   - 50+ achievements with different tiers
   - Player level and experience points
   - Unlockable themes, sounds, and effects
   - Daily/weekly challenges
   - Architecture: New ProgressionStore + persistent storage

6. **Replay System**

   - Record and playback gameplay sessions
   - Share replays with unique URLs
   - Frame-by-frame analysis
   - Export as video (WebRTC)
   - Architecture: New ReplayStore + compression algorithms

7. **Power-ups & Special Blocks**

   - Bomb blocks (clear area)
   - Rainbow blocks (match any color)
   - Time freeze power-up
   - Ghost mode (temporary invincibility)
   - Architecture: Extend tetrisUtils with power-up logic

8. **Social Features**
   - Friend system with invites
   - Global and friend leaderboards
   - Profile customization
   - Chat system (with moderation)
   - Architecture: New SocialStore + OAuth integration

### 💡 Small Features (1-2 weeks)

9. **Custom Control Schemes**

   - Fully remappable keys
   - Multiple control profiles
   - Gamepad support (Xbox, PlayStation)
   - Touch gesture customization
   - Architecture: Extend settingsStore with control mapping

10. **Advanced Statistics Dashboard**

    - Heat maps of piece placements
    - Performance graphs over time
    - Detailed session analytics
    - Export statistics as CSV/PDF
    - Architecture: Extend StatisticsService with visualization

11. **Tutorial & Training System**

    - Interactive tutorial for beginners
    - Advanced technique training (T-spins, etc.)
    - Practice specific scenarios
    - Video tutorials integration
    - Architecture: New TutorialStore + guided tour library

12. **Music & Sound Customization**

    - Custom music playlists
    - Sound effect packs
    - Dynamic music (adapts to gameplay)
    - Community sound sharing
    - Architecture: Extend AudioManagerV2 with playlist support

13. **Enhanced Visual Customization**

    - Piece skin editor
    - Custom background animations
    - Particle effect designer
    - Import/export theme packages
    - Architecture: Extend themeStore with advanced options

14. **Accessibility Enhancements**

    - Voice commands
    - Screen reader improvements
    - One-handed play mode
    - Customizable visual indicators
    - Architecture: Extend accessibilityStore with new features

15. **Performance Profiler**

    - In-game FPS counter
    - Network latency display
    - Memory usage monitoring
    - Performance recommendations
    - Architecture: Extend performanceMonitor with UI overlay

16. **Plugin System Architecture**
    - Modular component loading system
    - Third-party extension APIs
    - Plugin marketplace integration
    - Hot-swappable game modules
    - Architecture: Plugin manager with lifecycle hooks and dependency injection

### Implementation Priority Matrix

| Feature             | User Value | Technical Complexity | Architecture Fit | Priority  |
| ------------------- | ---------- | -------------------- | ---------------- | --------- |
| Custom Controls     | High       | Low                  | Excellent        | 🟢 High   |
| Advanced Game Modes | High       | Medium               | Excellent        | 🟢 High   |
| Achievement System  | High       | Medium               | Good             | 🟢 High   |
| Tutorial System     | High       | Low                  | Good             | 🟢 High   |
| Multiplayer         | Very High  | High                 | Good             | 🟡 Medium |
| AI Opponent         | Medium     | High                 | Good             | 🟡 Medium |
| Replay System       | Medium     | Medium               | Good             | 🟡 Medium |
| Power-ups           | Medium     | Medium               | Good             | 🟡 Medium |
| Social Features     | Medium     | High                 | Fair             | 🟡 Medium |
| Tournament Platform | Low        | Very High            | Fair             | 🔴 Low    |
| Plugin System       | Medium     | Very High            | Excellent        | 🔴 Low    |

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

## Code Quality & Refactoring Roadmap

Based on recent bug fixes and structural analysis, these refactoring items will improve code maintainability, reduce bug occurrence, and support future feature development.

### 🔴 High Priority (Quick Wins)

1. **Debug Log Cleanup** ✅ **COMPLETED**

   - **Complexity**: ⭐ Easy (1-2 days)
   - **Impact**: Performance + Production readiness
   - **Issue**: Scattered console.log statements affecting performance
   - **Solution**: ✅ Implemented unified logging system with environment-based levels
   - **Implementation**:
     - Created `src/utils/logging/logger.ts` with LogLevel enum (ERROR, WARN, INFO, DEBUG)
     - Environment-aware: Development shows DEBUG+, Production shows WARN+
     - Replaced 35+ console statements across the codebase
     - Added structured logging with component context and metadata
     - Performance logging helper for timing measurements
     - Game-specific helpers: `log.audio()`, `log.animation()`, `log.game()`

2. **Constants Centralization**

   - **Complexity**: ⭐ Easy (2-3 days)
   - **Impact**: Maintainability + Consistency
   - **Issue**: Magic numbers and strings scattered across components
   - **Solution**: Create centralized constants with semantic naming

3. **Type Safety Enhancement**

   - **Complexity**: ⭐⭐ Medium (1 week)
   - **Impact**: Bug prevention + Developer experience
   - **Issue**: Remaining `any` types and loose type assertions
   - **Solution**: Strict typing with branded types and validation guards

4. **Error Boundary Expansion**
   - **Complexity**: ⭐ Easy (2-3 days)
   - **Impact**: User experience + Debugging
   - **Issue**: Limited error handling for component failures
   - **Solution**: Granular error boundaries with fallback UI

### 🟡 Medium Priority (Structural Improvements)

5. **State Management Unification**

   - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks)
   - **Impact**: Bug reduction + Predictability
   - **Issue**: Zustand + React state conflicts causing timing bugs
   - **Solution**: Single source of truth with clear state ownership

6. **Custom Hook Decomposition**

   - **Complexity**: ⭐⭐ Medium (1-2 weeks)
   - **Impact**: Testability + Reusability
   - **Issue**: Monolithic hooks with multiple responsibilities
   - **Solution**: Single-responsibility hooks with clear interfaces

7. **Component Size Reduction**

   - **Complexity**: ⭐⭐ Medium (1-2 weeks)
   - **Impact**: Maintainability + Testing
   - **Issue**: Large components mixing UI, logic, and effects
   - **Solution**: Extract logic to custom hooks, split UI concerns

8. **Timer Management Unification**

   - **Complexity**: ⭐⭐⭐ Hard (1-2 weeks)
   - **Impact**: Bug prevention + Performance
   - **Issue**: Multiple timer systems causing synchronization issues
   - **Solution**: Unified timer manager with priority-based scheduling

9. **Configuration Management**
   - **Complexity**: ⭐⭐ Medium (1 week)
   - **Impact**: Flexibility + Environment handling
   - **Issue**: Hardcoded settings and environment-specific values
   - **Solution**: Centralized config with environment overrides

### 🟢 Low Priority (Advanced Improvements)

10. **Animation System Redesign**

    - **Complexity**: ⭐⭐⭐⭐ Very Hard (3-4 weeks)
    - **Impact**: Performance + Extensibility
    - **Issue**: Complex animation manager with performance bottlenecks
    - **Solution**: Lightweight, composable animation primitives

11. **Game Logic Functional Refactor**

    - **Complexity**: ⭐⭐⭐⭐ Very Hard (4-6 weeks)
    - **Impact**: Testability + Predictability
    - **Issue**: Mixed imperative/functional styles in game logic
    - **Solution**: Pure functional game engine with immutable state

12. **Event System Implementation**

    - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks)
    - **Impact**: Decoupling + Extensibility
    - **Issue**: Direct component communication creating tight coupling
    - **Solution**: Event-driven architecture with typed events

13. **Performance Monitoring Integration**

    - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks)
    - **Impact**: Performance insights + User experience
    - **Issue**: Limited visibility into runtime performance issues
    - **Solution**: Built-in performance metrics with user feedback

### Implementation Strategy

**Phase 1: Foundation (1-2 months)**

- Items 1-4: Quick wins that improve stability immediately
- Focus on reducing technical debt and improving developer experience

**Phase 2: Structure (2-3 months)**

- Items 5-9: Architectural improvements supporting future features
- Address core design issues revealed by recent bugs

**Phase 3: Advanced (6+ months)**

- Items 10-13: Long-term architectural evolution
- Major rewrites supporting multiplayer and complex features

### Bug Prevention Measures

**Preventive Measures:**

- Comprehensive state management testing
- Timer synchronization validation
- Configuration hierarchy testing
- Integration test coverage for cross-system interactions

### Success Metrics

- **Bug Reduction**: 50% fewer state-related bugs
- **Development Speed**: 30% faster feature implementation
- **Test Coverage**: 90%+ for critical game logic
- **Performance**: Consistent 60fps under load
- **Maintainability**: New developer onboarding < 1 day
