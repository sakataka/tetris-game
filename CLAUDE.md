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
pnpm lint         # Oxlint validation (9.5x faster)
pnpm lint:full    # Oxlint + ESLint complete check
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

## Code Quality & Refactoring Roadmap

Based on recent bug fixes and structural analysis, these refactoring items will improve code maintainability, reduce bug occurrence, and support future feature development.

### 🔴 High Priority (Quick Wins)

1. **Debug Log Cleanup** ✅ **COMPLETED**

   - **Complexity**: ⭐ Easy (1-2 days)
   - **Impact**: Performance + Production readiness
   - **Issue**: Scattered console.log statements affecting performance
   - **Solution**: ✅ Implemented unified logging system with environment-based levels

2. **Constants Centralization** ✅ **COMPLETED**

   - **Complexity**: ⭐ Easy (2-3 days)
   - **Impact**: Maintainability + Consistency
   - **Issue**: Magic numbers and strings scattered across components
   - **Solution**: ✅ Created centralized constants with semantic naming

3. **Type Safety Enhancement** ✅ **COMPLETED**

   - **Complexity**: ⭐⭐ Medium (1 week)
   - **Impact**: Bug prevention + Developer experience
   - **Issue**: Remaining `any` types and loose type assertions
   - **Solution**: ✅ Enhanced TypeScript strict mode with comprehensive type safety
   - **Implementation**:
     - Enhanced TypeScript strict mode: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`
     - Fixed 50+ type assertions replacing `as any` with proper type definitions
     - Implemented 30+ safe array access patterns with optional chaining
     - Added proper DOM API type extensions for performance, navigator APIs
     - Created type guard functions for runtime validation
     - Added `override` keywords for React lifecycle methods
     - Achieved 100% build/test/lint success with zero type errors

4. **Error Boundary Expansion** ✅ **COMPLETED**
   - **Complexity**: ⭐ Easy (2-3 days)
   - **Impact**: User experience + Debugging
   - **Issue**: Limited error handling for component failures
   - **Solution**: ✅ Implemented granular error boundaries with specialized fallback UI

### 🟡 Medium Priority (Structural Improvements)

5. **State Management Unification** ✅ **COMPLETED**

   - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks)
   - **Impact**: Bug reduction + Predictability
   - **Issue**: Zustand + React state conflicts causing timing bugs
   - **Solution**: ✅ Unified state management with AnimationManager-based timing system
   - **Implementation**:
     - Created `useAnimationTimer` hook replacing setInterval with requestAnimationFrame
     - Migrated `useGameLoop` from `useGameTimer` to `useAnimationTimer`
     - Unified GameStateController line effect cleanup with single AnimationManager timer
     - Replaced SessionManager + sessionStoreV2 dual architecture with unified sessionStore
     - Eliminated `onStateChange` callback pattern in favor of direct Zustand updates
     - Resolved timer conflicts, race conditions, and session synchronization issues
     - Achieved 272/272 tests passing with zero timing-related failures

6. **Custom Hook Decomposition** ✅ **COMPLETED**

   - **Complexity**: ⭐⭐ Medium (1-2 weeks)
   - **Impact**: Testability + Reusability
   - **Issue**: Monolithic hooks with multiple responsibilities
   - **Solution**: ✅ Implemented single-responsibility hooks with clear interfaces

7. **Component Size Reduction** ❌ **ANALYSIS COMPLETED - NOT RECOMMENDED**

   - **Complexity**: ⭐⭐ Medium (1-2 weeks)
   - **Impact**: Low - Current component sizes are appropriate
   - **Analysis Results**:
     - **Current Status**: Components average 100 lines, max 265 lines (within React standards)
     - **Already Optimized**: 27 custom hooks, React.memo, lazy loading, proper patterns applied
     - **Risk Assessment**: Splitting would increase complexity, reduce type safety, and add cognitive load
     - **Decision**: Skip implementation - focus on higher-value features instead
   - **Alternative**: Consider natural splitting during future feature development only

8. **Timer Management Unification** ✅ **COMPLETED**

   - **Complexity**: ⭐⭐⭐ Hard (1-2 weeks)
   - **Impact**: Bug prevention + Performance
   - **Issue**: Multiple timer systems causing synchronization issues
   - **Solution**: ✅ Unified timeout management using AnimationManager with priority-based scheduling
   - **Implementation**:
     - Created `TimeoutManager` singleton class with AnimationManager integration
     - Implemented RAF-based timeout system with 1fps efficiency for long durations (30-minute sessions)
     - Migrated SessionManager from native setTimeout to TimeoutManager.setTimeout
     - Added comprehensive timeout tracking, statistics, and debug logging
     - Enhanced error handling with graceful callback error recovery
     - Provided convenience functions (unifiedSetTimeout, unifiedClearTimeout) matching native API
     - Added timeout lifecycle management with automatic cleanup and resource management
     - Fixed ESLint errors and TypeScript strict mode compliance
     - Achieved 302/302 tests passing with comprehensive TimeoutManager test suite
   - **Benefits**: Consistent timer debugging, unified animation scheduling, memory-efficient timeout management

9. **Configuration Management** ✅ **ANALYSIS COMPLETED - ALREADY IMPLEMENTED**

   - **Complexity**: ⭐⭐ Medium (1 week)
   - **Impact**: Already achieved - Excellent implementation in place
   - **Analysis Results**:
     - **Current Status**: Production-ready configuration system already implemented
     - **Existing Features**: 30 environment variables with type-safe management, Zustand-based ConfigStore, environment-specific settings (Dev/Prod/Test), runtime validation, localStorage persistence, configuration change monitoring
     - **Architecture Quality**: Implements all Configuration Management best practices including Single Source of Truth, Type Safety, Environment Isolation, Validation, and Monitoring
     - **Implementation Files**: `src/config/environment.ts`, `src/config/gameConfig.ts`, `src/config/configStore.ts`, `src/config/utils.ts`
     - **Assessment**: Current system is exemplary implementation, not technical debt
   - **Decision**: No refactoring needed - focus on higher-priority items instead
   - **Optional Enhancements**: Minor developer experience improvements (config helpers, debug tools) available if needed

### 🟢 Low Priority (Advanced Improvements)

10. **Animation System Redesign** ❌ **ANALYSIS COMPLETED - NOT RECOMMENDED**

    - **Complexity**: ⭐⭐⭐⭐ Very Hard (3-4 weeks)
    - **Impact**: Minimal - Current system already excellent
    - **Analysis Results**:
      - **Current Status**: 326-line highly optimized AnimationManager already implements lightweight, composable design
      - **Existing Features**: RAF integration, FPS control, performance monitoring, priority management, auto-optimization (low-performance device detection)
      - **Performance**: No bottlenecks detected - comprehensive statistics and error handling already implemented
      - **Assessment**: Current system already achieves the proposed "lightweight, composable animation primitives" goal
    - **Decision**: Not recommended - high risk of introducing instability for minimal gain
    - **ROI**: Extremely low - 3-4 weeks investment with no measurable improvement

11. **Game Logic Functional Refactor** ❌ **ANALYSIS COMPLETED - NOT RECOMMENDED**

    - **Complexity**: ⭐⭐⭐⭐ Very Hard (4-6 weeks)
    - **Impact**: Negative - High risk of breaking stable system
    - **Analysis Results**:
      - **Current Status**: Game logic already follows functional programming principles with pure functions in tetrisUtils.ts
      - **Architecture Quality**: GameLogicController uses dependency injection, game state is predictable and testable
      - **Test Coverage**: 100% test success rate (318/318) demonstrates current system reliability
      - **Assessment**: No evidence of "mixed imperative/functional styles" - code is already well-structured
    - **Decision**: Not recommended - massive refactoring risk for unclear benefits
    - **ROI**: Extremely low - 4-6 weeks could delay feature development significantly

12. **Event System Implementation** 🟡 **ANALYSIS COMPLETED - CONDITIONAL**

    - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks)
    - **Impact**: Limited - Current system already well-decoupled
    - **Analysis Results**:
      - **Current Status**: Controller-based design (EventController, AudioController, DeviceController) provides appropriate separation
      - **Coupling Assessment**: No evidence of problematic tight coupling - components communicate through well-defined interfaces
      - **Architecture Quality**: Dependency injection and controller patterns already achieve good decoupling
      - **Future Needs**: Event system would become valuable for real-time multiplayer synchronization
    - **Decision**: Conditional implementation - only recommend if/when implementing multiplayer features
    - **ROI**: Low as standalone feature, medium-high when combined with multiplayer development

13. **Performance Monitoring Integration** ❌ **ANALYSIS COMPLETED - NOT RECOMMENDED**

    - **Complexity**: ⭐⭐⭐ Hard (2-3 weeks) - **Overestimated**
    - **Impact**: Minimal - Comprehensive monitoring already implemented
    - **Analysis Results**:
      - **Current Status**: performanceMonitor.ts provides extensive monitoring (FPS, frame time, memory usage, rendering time)
      - **Existing Features**: Performance recommendations, level detection, console.table metrics display, AnimationManager integration
      - **Missing Component**: Only UI integration for user-facing display (estimated 1-3 days, not 2-3 weeks)
      - **Assessment**: "Limited visibility" claim is inaccurate - comprehensive metrics already available
    - **Decision**: Not recommended - monitoring system already complete, only minor UI work needed
    - **ROI**: Very low - existing system already provides all necessary performance insights

### Implementation Strategy

**Phase 1: Foundation (1-2 months)**

- Items 1-4: Quick wins that improve stability immediately
- Focus on reducing technical debt and improving developer experience

**Phase 2: Structure (2-3 months)**

- Items 5-9: Architectural improvements supporting future features
- Address core design issues revealed by recent bugs

**Phase 3: Future Feature Development (Ongoing)**

- Items 10-13: Analysis completed - Focus shifted to Feature Roadmap implementation
- **Recommended**: Achievement System, Custom Controls, Advanced Game Modes (High Priority)
- **Conditional**: Event System implementation only when adding multiplayer features
- **Alternative to Refactoring**: Small-scale improvements (1-3 days each) and new feature development

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

## Refactoring Analysis Summary

### ✅ **Completed Refactoring Items (8/13)**

1. ✅ Debug Log Cleanup
2. ✅ Constants Centralization
3. ✅ Type Safety Enhancement
4. ✅ Error Boundary Expansion
5. ✅ State Management Unification
6. ✅ Custom Hook Decomposition
7. ❌ Component Size Reduction (Analysis: Not needed)
8. ✅ Timer Management Unification
9. ✅ Configuration Management (Analysis: Already implemented)

### 📊 **Advanced Items Analysis (4/4 Analyzed)**

**Items 10-13 Decision Matrix:**

- **10. Animation System Redesign**: ❌ Not recommended (already excellent)
- **11. Game Logic Functional Refactor**: ❌ Not recommended (already functional)
- **12. Event System Implementation**: 🟡 Conditional (multiplayer only)
- **13. Performance Monitoring Integration**: ❌ Not recommended (already complete)

### 🎯 **Final Recommendation**

**Refactoring Phase Complete** - Focus on Feature Development

Current codebase quality assessment:

- **Architecture**: Excellent design patterns implemented
- **Performance**: Comprehensive monitoring and optimization in place
- **Maintainability**: High test coverage (100% success rate)
- **Technical Debt**: Minimal (only minor TODOs remaining)

**Next Steps**: Prioritize Feature Roadmap implementation over additional refactoring
