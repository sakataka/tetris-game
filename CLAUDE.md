# CLAUDE.md

必ず日本語で回答して下さい。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a fully refactored Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features modern React patterns with optimized custom hooks, performance optimizations, and advanced visual effects for line clearing animations. The codebase has been extensively refactored for maintainability, performance, and extensibility.

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
npm run lint   # ESLint validation - expect minor warnings about hook dependencies
```

## Refactored Architecture

### Hook-Based State Management
The game uses a sophisticated custom hook architecture for separation of concerns:

**`useGameState`** (Primary State Management):
- Manages all game state including board, pieces, score, effects
- Handles piece placement calculations with `calculatePiecePlacementState`
- Manages particle system and animation effects
- Implements memory leak prevention with proper timeout cleanup

**`useGameControls`** (User Interactions):
- Handles piece movement, rotation, and hard drop
- Integrates with state management for piece placement
- Pure input processing without direct state coupling

**`useGameLoop`** (Game Timing & Events):
- Manages automatic piece dropping with dynamic speed
- Handles keyboard input mapping (Arrow keys + WASD + spacebar)
- Controls game loop timing based on level progression

### Performance Optimizations
**Memory Management**:
- Particle object pooling system (`particlePool.ts`) prevents GC pressure
- Proper timeout cleanup with `useRef` prevents memory leaks
- Expired particles automatically returned to pool for reuse

**Render Optimizations**:
- All components wrapped with `React.memo` to prevent unnecessary re-renders
- `useMemo` for heavy board calculations with ghost piece rendering
- `useCallback` for stable function references across renders

**Type Safety**:
- Unified `Particle` interface eliminates type duplication
- Centralized constants in `types/tetris.ts` (EFFECT_RESET_DELAY, PARTICLE_LIFE_DURATION, etc.)
- Strict typing throughout custom hooks

### Component Architecture
**TetrisGame** (Main Orchestrator):
- Composes the three custom hooks for complete game functionality
- Minimal logic - primarily hook coordination and prop passing
- Optimized callback functions with `useCallback` for child components

**TetrisBoard** (Optimized Display Layer):
- `useMemo` optimized board rendering with ghost piece calculations
- `React.memo` prevents unnecessary re-renders
- Integrates particle system with board coordinates

**ParticleEffect** (Performance-Optimized Animation):
- Uses particle pool for memory efficiency
- `requestAnimationFrame` based physics simulation
- Automatic particle lifecycle management with pool return

**GameInfo** (Memoized UI Components):
- `React.memo` wrapped for render optimization
- Static UI that only re-renders on prop changes

### Game Features
- **Ghost Piece**: Dashed outline showing drop destination
- **Hard Drop**: Space bar for instant piece placement with bonus points
- **Extended Controls**: Both arrow keys and WASD support
- **Dynamic Difficulty**: Speed increases every 10 lines cleared
- **Tetris Bonus**: 4-line clear bonus scoring
- **Visual Effects**: Line clearing with flash, shake, and particle explosions

### Key Implementation Details
**Particle System**:
- Object pooling pattern prevents excessive garbage collection
- Pool automatically grows/shrinks based on usage patterns
- Particles have realistic physics with gravity and velocity

**Game State Flow**:
- Unidirectional data flow through custom hooks
- All mutations go through `calculatePiecePlacementState` for consistency
- Effect timing managed with `useRef` and proper cleanup

**Performance Characteristics**:
- ~80% code reduction in main component (270 lines → 60 lines)
- Memory leak prevention through proper timeout management
- Optimized rendering with React.memo and useMemo patterns

## Completed Refactoring History

### Phase 1: Code Duplication Elimination ✅
- Unified `calculatePiecePlacementState` function eliminated duplicate logic
- Centralized effect processing and score calculation
- Reduced codebase by ~50 lines

### Phase 2: State Management Separation ✅  
- Created `useGameState`, `useGameControls`, `useGameLoop` custom hooks
- Separated concerns for maintainability and testability
- Reduced main component complexity by 80%

### Phase 3: Performance Optimization ✅
- Implemented particle object pooling system
- Added React.memo to all components
- Optimized heavy calculations with useMemo/useCallback
- Proper memory management with useRef-based timeout handling

## Future Enhancement Opportunities

### Extensibility Patterns
- **Game Configuration**: Create configurable options for speed, board size, colors
- **Effect System**: Plugin architecture for different animation types  
- **Input Abstraction**: Support for different control schemes and devices
- **Game Modes**: Framework for variants like time attack or multiplayer

### Architecture Notes
- The custom hook pattern makes the game logic highly reusable
- Performance optimizations are production-ready for complex games
- Memory management patterns prevent common React performance pitfalls
