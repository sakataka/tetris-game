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

## Future-Ready Architecture

The codebase is prepared for:

- Multiplayer (state sync patterns)
- Plugin system (modular design)
- Advanced game modes (extensible logic)
- PWA conversion (minimal changes needed)
