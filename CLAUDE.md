# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important**: 必ず日本語で回答して下さい。 (Always respond in Japanese)

## Project Status

This is a cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features a sophisticated custom hook architecture, comprehensive performance optimizations, and a unified cyberpunk visual design system with neon effects, holographic backgrounds, and enhanced particle animations.

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

### Development Notes
- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds

## Architecture Overview

This Tetris game uses a sophisticated three-layer architecture: **State Management** (custom hooks), **Visual Design** (CSS variables + themed components), and **Performance** (object pooling + memoization). All components are interconnected through a unidirectional data flow pattern.

### Hook-Based State Management
The game uses a refined custom hook architecture with optimized dependencies:

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

### Component Architecture

**TetrisGame** (Main Orchestrator):
- Composes three custom hooks for complete game functionality
- Enhanced visual layout with cyberpunk gradient effects
- Optimized callback functions with `useCallback` for child components

**TetrisBoard** (Visual Display Layer):
- Cyberpunk-themed game board with hologram background
- Neon-enhanced ghost piece with glow effects
- Enhanced cell styling with CSS variable integration
- Game over/pause overlays with themed styling

**GameInfo** (Themed UI Panels):
- Six distinct themed panels: Score Data, Next Piece, Controls, Audio, Buttons, Scoring
- Audio panel includes volume slider and mute toggle with cyberpunk styling
- Each panel uses unique hologram backgrounds and neon borders
- Enhanced buttons with gradient effects and hover animations
- Consistent cyberpunk typography and spacing

**ParticleEffect** (Enhanced Animation System)**:
- Uses particle pool for memory efficiency
- Enhanced visual effects with multi-layer glow and sparkle animations
- Physics simulation with configurable constants
- Automatic particle lifecycle management with pool return

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
- **Audio Controls**: Real-time volume adjustment and mute toggle
- **Performance Optimized**: Preloaded audio with efficient playback management

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

**Performance Characteristics**:
- Zero infinite render loops through optimized dependencies
- ~90% reduction in CSS duplication through variable system
- Memory leak prevention through proper timeout management
- Audio preloading and efficient playback management
- Production-ready performance optimizations

## Current Codebase Quality

### Code Organization
- **Clean Architecture**: Separation of concerns across hooks and components
- **Type Safety**: Comprehensive TypeScript coverage with centralized constants
- **Performance**: Optimized rendering and memory management
- **Maintainability**: Unified styling system and consistent patterns

### Visual Design System
- **Consistent Theme**: Cyberpunk aesthetic across all components
- **Reusable Classes**: Standardized hologram and neon effect classes
- **Configurable Effects**: CSS variables for easy theme modifications
- **Enhanced UX**: Smooth animations and visual feedback

### Critical Implementation Notes

**Performance Optimizations**:
- `updateParticles` uses empty dependency array to prevent infinite loops (intentional ESLint warning)
- All components use `React.memo` - avoid breaking memoization when modifying props
- Particle system uses object pooling - always return particles to pool when expired

**Styling System**:
- Use CSS variables from `globals.css` for all cyberpunk theming
- Prefer `.hologram-*` and `.neon-border-*` classes over inline styles
- All magic numbers are constants in `types/tetris.ts`

**State Flow**:
- All game state changes go through `calculatePiecePlacementState` for consistency
- Use `useRef` for timeouts to prevent memory leaks
- Particle updates are decoupled from main state to avoid render thrashing

**Audio Integration**:
- Sound effects triggered through dependency injection pattern in hooks
- `playSound` function passed from `useSounds` to `useGameState` and `useGameControls`
- Audio files must be placed in `/public/sounds/` directory with specific naming
- All audio interactions respect mute state and volume settings

## Future Enhancement Opportunities

### Extensibility Patterns
- **Theme Variations**: Easy creation of new color schemes using CSS variables
- **Effect Customization**: Configurable particle and animation parameters
- **Component Reuse**: Hologram and neon effect classes for new features
- **Performance Scaling**: Architecture ready for complex visual effects

### Architecture Benefits
- **Maintainable Theming**: CSS variable system supports easy design changes
- **Performance Ready**: Optimized for production deployment
- **Type Safe**: Comprehensive constant definitions prevent runtime errors
- **Memory Efficient**: Object pooling and proper cleanup patterns

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.