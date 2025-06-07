# CLAUDE.md

必ず日本語で回答して下さい。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game is fully functional with modern React patterns using hooks and client-side state management, featuring advanced visual effects for line clearing animations.

## Development Commands

### Development Server
```bash
npm run dev    # Uses Turbopack for faster development builds
```

### Build and Deploy
```bash
npm run build  # Build for production
npm run start  # Start production server
```

### Code Quality
```bash
npm run lint   # ESLint validation
```

## Architecture

### Core Game Logic Flow
The game follows a unidirectional data flow pattern:
1. **Game State** - Centralized in `TetrisGame.tsx` using `useState`
2. **Game Loop** - `useEffect` with `setInterval` for automatic piece dropping
3. **Input Handling** - Global keyboard event listeners (Arrow keys + WASD)
4. **Collision Detection** - Pure functions in `tetrisUtils.ts` for position validation
5. **Rendering** - Board state computed on each render with current piece overlay

### Visual Effects System
The game features a sophisticated animation system for line clearing:

**Effect State Management (`LineEffectState`)**:
- `flashingLines`: Array of row indices for flash effects
- `shaking`: Boolean for board shake animation
- `particles`: Array of particle objects with physics properties

**Effect Components**:
- **TetrisGame**: Manages effect lifecycle with 300ms auto-reset
- **TetrisBoard**: Applies CSS animations based on effect state
- **ParticleEffect**: Handles particle physics with `requestAnimationFrame`

**Animation Types**:
- Flash effect: Cleared lines turn white with `animate-pulse`
- Shake effect: Board bounces with `animate-bounce`
- Particle explosion: 3 particles per cleared cell with gravity simulation

### Component Architecture

**TetrisGame (Main Controller)**:
- Centralized state management for all game data
- Effect coordination and timing control
- Callback management for particle updates

**TetrisBoard (Display Layer)**:
- Ghost piece rendering (dashed preview of drop position)
- Dynamic styling based on game and effect states
- Integration with particle system

**ParticleEffect (Animation System)**:
- Physics simulation for particle movement
- Automatic cleanup of expired particles
- Performance-optimized rendering loop

### Game Features
- **Ghost Piece**: Dashed outline showing drop destination
- **Hard Drop**: Space bar for instant piece placement with bonus points
- **Extended Controls**: Both arrow keys and WASD support
- **Dynamic Difficulty**: Speed increases every 10 lines cleared
- **Tetris Bonus**: 4-line clear bonus scoring

### TypeScript Architecture
- `GameState` interface includes `lineEffect` for animation state
- `LineEffectState` defines particle and effect properties
- `Tetromino` interface encapsulates piece data with position and shape
- Utility functions are pure and type-safe for reliable game logic
- Enhanced `clearLines` function returns cleared line indices for effects

### Styling and Performance
- Tailwind CSS with dynamic animations and transitions
- CSS Grid-based board layout with individual cell styling
- `requestAnimationFrame` for smooth particle animations
- Automatic particle cleanup to prevent memory leaks

## Future Refactoring Guidelines

### 1. State Management Separation
**Current Issue**: `TetrisGame.tsx` is nearly 400 lines with too many responsibilities
**Solution**: 
- Extract game logic into custom hooks (`useGameState`, `useGameControls`)
- Implement Context API to avoid props drilling
- Separate effect management from core game logic

### 2. Code Duplication Elimination
**Current Issue**: Line clearing logic is duplicated in `movePiece` (lines 89-124) and `hardDrop` (lines 209-232)
**Solution**:
- Create unified `handlePiecePlacement` function
- Extract common effect processing and score calculation
- Consolidate animation timing logic

### 3. Type Safety Improvements
**Current Issue**: Particle type definition duplicated between `types/tetris.ts:18-26` and `utils/tetrisUtils.ts:110-127`
**Solution**:
- Define `Particle` interface in types file
- Convert magic numbers to named constants (300ms timeout, 60 frame life, etc.)
- Add stricter typing for game configuration

### 4. Performance Optimization
**Current Issue**: `setTimeout` for effect reset and potential re-renders
**Solution**:
- Replace setTimeout with useEffect cleanup or state-based timing
- Implement React.memo for expensive components
- Optimize particle system with object pooling

### 5. Extensibility Enhancement
**Current Issue**: Hard-coded game parameters and limited customization
**Solution**:
- Create configurable game options (speed, board size, colors)
- Design pluggable effect system for different animation types
- Abstract input handling for different control schemes
- Implement game mode variants (time attack, multiplayer setup)

### 6. Architecture Improvements
**Priority Order**:
1. Extract state management logic (highest impact)
2. Eliminate code duplication (maintainability)
3. Improve type safety (reliability)
4. Optimize performance (user experience)
5. Enhance extensibility (future features)
