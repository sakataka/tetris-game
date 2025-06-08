# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features a sophisticated Zustand-based state management system, comprehensive TDD test coverage, and a unified cyberpunk visual design system with neon effects, holographic backgrounds, and enhanced particle animations.

**Current Status**: Full-featured game with advanced statistics system, customizable theme system, mobile responsive design, and modular component architecture.

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
npm run lint   # ESLint validation - expect 2 intentional warnings for performance optimization
npx tsc --noEmit  # TypeScript type checking without compilation
```

### Testing
```bash
npm test        # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage report

# Run specific test files
npm test -- --run src/test/gameStore.test.ts
npm test -- --run src/test/highScoreUtils.test.ts
npm test -- --run src/test/statisticsUtils.test.ts
```

### Development Notes
- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds
- **Always run `npm run build` before committing** to ensure no build errors
- ESLint warnings about missing dependencies in useCallback are intentional for infinite loop prevention

## Architecture Overview

This Tetris game uses a sophisticated modular architecture with **Zustand State Management**, **Modular Component System**, **Separated Utility Functions**, and **Performance Optimizations**. The architecture follows TDD principles with comprehensive test coverage.

### Zustand State Management

**`useGameStore`** (Central Store - 442 lines):
- Global state container with LocalStorage persistence
- Handles game state, settings, high scores, statistics, theme, errors, and play sessions
- Immutable state updates using spread operators and functional patterns
- Individual selector functions prevent infinite render loops
- Specialized hooks: `useGameState`, `useGameActions`, `useSettings`, `useHighScores`, `useStatistics`, `useTheme`

**State Management Architecture**:
- Game state (board, pieces) is ephemeral and reset on each game
- User data persisted: settings, high scores, statistics, theme, play sessions
- Cross-tab synchronization with storage events
- Comprehensive error handling and validation
- Session tracking with automatic inactivity detection

### Modular Component Architecture

**Main Components**:
- **TetrisGame.tsx** (195 lines) - Main orchestrator composing multiple hooks
- **TetrisBoard.tsx** - Game board display with cyberpunk theming
- **GameInfo.tsx** - Tabbed interface (Game Info / Statistics / Theme Settings)

**Optimized Panel Components** (25-45 lines each):
- **GameStatsPanel.tsx** (30 lines) - Score, level, lines display
- **NextPiecePanel.tsx** (35 lines) - Next piece preview
- **ControlsPanel.tsx** (25 lines) - Key bindings display
- **AudioPanel.tsx** (45 lines) - Audio settings panel
- **GameButtonsPanel.tsx** (30 lines) - Pause/reset buttons
- **ScoringPanel.tsx** (25 lines) - Scoring calculation display

**Advanced Feature Components**:
- **StatisticsDashboard.tsx** - 15 enhanced metrics with period filtering
- **HighScoreDisplay.tsx** - Top 10 rankings with cyberpunk styling
- **ThemeSettings.tsx** - Complete theme customization system
- **VirtualControls.tsx** - Mobile touch controls
- **ParticleEffect.tsx** - Enhanced animation system with object pooling

### Hook-Based Business Logic

**Core Game Hooks**:
- **useGameState.ts** (184 lines) - Primary state management with `calculatePiecePlacementState`
- **useGameControls.ts** (102 lines) - User input handling
- **useGameLoop.ts** (101 lines) - Game timing and automatic piece dropping
- **useSounds.ts** (126 lines) - 6-sound audio system with volume control

**System Management Hooks**:
- **useHighScoreManager.ts** - Automatic high score detection and saving
- **useSessionTracking.ts** - Session management with play time tracking
- **useThemeManager.ts** - Theme management with CSS variable updates
- **useMobileDetection.ts** - Real-time device and screen size detection
- **useSettings.ts** - Legacy settings (gradually being migrated)

### Utility Function Architecture

**Game Logic Utilities**:
- **gameStateUtils.ts** (NEW) - Pure functions extracted from useGameState:
  - `calculateScoreIncrease()` - Score calculation logic
  - `processLineClear()` - Line clearing process
  - `createLineEffects()` - Effect creation
  - `checkGameOver()` - Game over detection
  - `updateGameStateWithPiece()` - State updates
- **tetrisUtils.ts** - Core Tetris logic (board, pieces, collision)
- **highScoreUtils.ts** - High score ranking and validation
- **statisticsUtils.ts** - 14 pure functions for enhanced statistics

**Theme and Visual Utilities**:
- **themePresets.ts** - 5 complete theme configurations
- **themeUtils.ts** - CSS variable manipulation and accessibility filters
- **particlePool.ts** - Object pooling for memory efficiency

### Visual Design System

**CSS Variable Architecture**:
- Unified cyberpunk color palette: `--cyber-cyan`, `--cyber-purple`, `--cyber-yellow`
- Transparency variations: `--cyber-cyan-10` through `--cyber-cyan-90`
- Effect constants: `--neon-blur-sm` to `--neon-blur-xl`
- Standardized hologram backgrounds and neon borders

**Component Styling**:
- **Hologram Effects**: `.hologram`, `.hologram-cyan`, `.hologram-purple`, `.hologram-yellow`
- **Neon Borders**: `.neon-border`, `.neon-border-purple`, `.neon-border-yellow`
- **Grid Background**: Cyberpunk-style grid overlay
- **Floating Animations**: Hover effects for enhanced UX

## Game Features

### Core Gameplay
- **Basic Tetris**: Piece movement, rotation, line clearing with dynamic speed
- **Ghost Piece**: Cyan neon outline showing drop destination
- **Hard Drop**: Space bar for instant placement with bonus points
- **Extended Controls**: Arrow keys + WASD + spacebar support
- **Tetris Bonus**: 4-line clear bonus scoring (700 × level)

### Audio System
- **6 Sound Effects**: Line clear, piece land, piece rotate, Tetris bonus, game over, hard drop
- **Volume Control**: Real-time volume adjustment and mute toggle
- **Achievement Audio**: Special sounds for high score achievements
- **Error Handling**: Graceful degradation when audio files are missing

### High Score & Statistics System
- **Automatic Tracking**: Game end detection with automatic high score registration
- **Top 10 Rankings**: Persistent local high score table with automatic sorting
- **15 Enhanced Metrics**: Efficiency (LPM), consistency, Tetris rate, favorite level, etc.
- **Period Filtering**: Today, This Week, This Month, All Time
- **Session Management**: Automatic play time tracking with inactivity detection
- **Real-time Analytics**: Live calculation of performance metrics and trends

### Customizable Theme System
- **5 Preset Themes**: Cyberpunk, Classic, Retro, Minimal, Neon with unique aesthetics
- **Interactive Color Editor**: Real-time color palette customization with hex input
- **Accessibility Features**: 
  - Color blindness support (protanopia, deuteranopia, tritanopia)
  - Contrast adjustment (low, normal, high)
  - Animation intensity control (none, reduced, normal, enhanced)
- **Reduced Motion**: Complete WCAG compliance with system preference detection
- **Real-time Application**: Dynamic CSS variable updates without page reload

### Mobile & Responsive Features
- **Virtual Button Overlay**: 5-button touch control system
  - Directional pad: Move (←→), Rotate (↻), Soft Drop (↓)
  - Hard Drop button: Large ⚡DROP button
  - Cyberpunk-themed with color-coded buttons and neon effects
- **Responsive Layout**: Screen size-specific optimization
  - Desktop (≥768px): Horizontal layout
  - Mobile (<768px): Vertical layout (Game → Info → Controls)
  - Dynamic font sizing and spacing adjustments
- **Touch Optimization**: touch-manipulation and select-none for optimal touch experience

## Performance Optimizations

### Memory Management
- **Particle Object Pooling**: `particlePool.ts` prevents GC pressure
- **Optimized Dependencies**: Eliminate infinite render loops
- **useRef Timeout Cleanup**: Prevents memory leaks
- **Expired Particle Recycling**: Automatic pool return

### Render Optimizations
- **React.memo**: All components wrapped to prevent unnecessary re-renders
- **useMemo**: Heavy board calculations with ghost piece rendering
- **useCallback**: Stable function references across renders
- **Individual Selectors**: Prevent object recreation in Zustand selectors

### Type Safety & Constants
- **Centralized Constants**: All magic numbers in `types/tetris.ts`
- **Particle Physics**: `PARTICLE_GRAVITY`, `PARTICLE_MAX_Y`, etc.
- **Visual Effects**: `PARTICLE_SCALE_BASE`, `PARTICLE_OPACITY_MULTIPLIER`
- **Audio System**: Strict `SoundKey` union type
- **Error Handling**: Comprehensive error types for graceful failure management

## Technical Implementation

### State Flow
- All game state changes go through `calculatePiecePlacementState` for consistency
- Particle updates are decoupled from main state to avoid render thrashing
- Session tracking automatically updates statistics and play time

### Audio Integration
- Sound effects triggered through dependency injection pattern
- `playSound` function passed from `useSounds` to game logic hooks
- Audio files in `/public/sounds/` with specific naming convention
- Volume and mute state management with real-time updates

### Theme System Integration
- CSS Custom Properties system with automatic transparency variants
- Real-time theme switching through `themeUtils.initializeTheme()`
- Accessibility integration with system preferences
- LocalStorage persistence for custom colors and settings

### Statistics Integration
- Automatic statistics updates on game events
- Enhanced metrics calculation with `statisticsUtils`
- Period-based filtering and session analysis
- Cross-tab synchronization for persistent data

## Code Quality

### Architecture Benefits
- **Clean Separation**: Zustand store, hooks, components, and utilities
- **Type Safety**: Comprehensive TypeScript with readonly arrays
- **Performance Ready**: Optimized for production with object pooling
- **Memory Efficient**: Proper cleanup patterns throughout
- **Test Coverage**: 10 test files with 125 tests (110 passing, 15 failing)
- **Error Resilient**: Graceful handling maintains user experience

### Test Structure
- **TDD Approach**: Test-first development for new features
- **Component Testing**: React Testing Library for UI components
- **Utility Testing**: Pure function testing with edge cases
- **Integration Testing**: Zustand store and hook interactions
- **Mock Strategies**: Comprehensive mocking for isolated testing

### Current Test Status
- ✅ **gameStore.test.ts** (10 tests) - State management
- ✅ **statisticsUtils.test.ts** (14 tests) - Statistics calculations
- ✅ **highScoreUtils.test.ts** (29 tests) - High score logic
- ✅ **tetrisUtils.test.ts** (10 tests) - Core game logic
- ✅ **useSettings.test.ts** (9 tests) - Settings management
- ✅ **HighScoreDisplay.test.tsx** (15 tests) - UI components
- ✅ **StatisticsDashboard.test.tsx** (17 tests) - Dashboard UI
- ❌ **useHighScoreManager.test.ts** (12 failing) - Zustand mock issues
- ❌ **useSounds.test.ts** (3 failing) - Audio API mock issues

## Project Structure

### File Organization (53 TypeScript files, 7,857 total lines)
```
src/
├── app/                    # Next.js app router
├── components/            # React components (17 files)
│   ├── GameStatsPanel.tsx      # Modular panels (25-45 lines each)
│   ├── NextPiecePanel.tsx
│   ├── ControlsPanel.tsx
│   ├── AudioPanel.tsx
│   ├── GameButtonsPanel.tsx
│   ├── ScoringPanel.tsx
│   ├── TetrisGame.tsx          # Main orchestrator
│   ├── TetrisBoard.tsx         # Game board
│   ├── GameInfo.tsx            # Tabbed info panel
│   └── [theme/mobile components]
├── hooks/                 # Custom React hooks (9 files)
│   ├── useGameState.ts         # Primary state management
│   ├── useGameControls.ts      # Input handling
│   ├── useGameLoop.ts          # Game timing
│   ├── useSounds.ts            # Audio system
│   └── [system management hooks]
├── store/                 # Zustand state management
│   └── gameStore.ts            # Central store (442 lines)
├── utils/                 # Utility functions (7 files)
│   ├── gameStateUtils.ts       # Pure game logic functions
│   ├── tetrisUtils.ts          # Core Tetris logic
│   ├── statisticsUtils.ts      # Statistics calculations
│   └── [theme/visual utilities]
├── types/                 # TypeScript definitions
│   └── tetris.ts              # Complete type system
└── test/                  # Test files (10 files, 125 tests)
```

### Styling System
- Use CSS variables from `globals.css` for cyberpunk theming
- Prefer `.hologram-*` and `.neon-border-*` classes over inline styles
- All constants defined in `types/tetris.ts`

## Future Enhancement Ready

The current architecture is designed to support advanced features:
- **Multiplayer Foundation**: State synchronization patterns in place
- **Plugin System**: Modular component architecture supports extensions
- **Internationalization**: Component structure ready for i18n
- **Advanced Game Modes**: Extensible game logic with pure functions
- **Performance Scaling**: Object pooling and optimization patterns established

# Development Memories
- 大きな修正をしてコミットするタイミングには GitHubにも同期してください。

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.