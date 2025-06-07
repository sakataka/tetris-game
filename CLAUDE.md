# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important**: 必ず日本語で回答して下さい。 (Always respond in Japanese)

## Project Status

This is a cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game features a sophisticated Zustand-based state management system, comprehensive TDD test coverage (66+ tests), and a unified cyberpunk visual design system with neon effects, holographic backgrounds, and enhanced particle animations.

**Phase 2 Complete**: Full high score and statistics system with automatic persistence, real-time ranking, and comprehensive error handling.

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

### Testing
```bash
npm test        # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage report

# Run specific test files (useful for TDD development)
npm test -- --run src/test/gameStore.test.ts
npm test -- --run src/test/highScoreUtils.test.ts
npm test -- --run src/test/useHighScoreManager.test.ts
npm test -- --run src/test/HighScoreDisplay.test.tsx
```

### Development Notes
- Build warnings about `useCallback` dependencies are expected and intentional for performance optimization
- The game runs on `http://localhost:3000` in development mode
- Uses Turbopack for faster development builds

## Architecture Overview

This Tetris game uses a sophisticated four-layer architecture: **Zustand State Management** (centralized store with persistence), **Custom Hooks** (business logic), **Visual Design** (CSS variables + themed components), and **Performance** (object pooling + memoization). The architecture follows TDD principles with comprehensive test coverage.

### Zustand State Management (Primary)
The game uses Zustand with Immer for type-safe, persistent state management:

**`useGameStore`** (Central Store):
- Global state container with LocalStorage persistence
- Handles high scores, statistics, settings, theme, and errors
- Immutable state updates with Immer middleware
- Automatic data migration and validation
- Selective hooks: `useHighScores`, `useStatistics`, `useSettings`, `useTheme`

**State Persistence Strategy**:
- Only user data persisted: settings, high scores, statistics, theme
- Game state (board, pieces) is ephemeral and reset on each game
- Cross-tab synchronization with storage events
- Fallback to defaults with comprehensive error handling

### Hook-Based Business Logic
Legacy and specialized business logic hooks:

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
- Robust error handling for missing audio files with graceful degradation

**`useHighScoreManager`** (High Score System):
- Automatic high score detection and saving on game end
- Real-time ranking calculation and score validation
- Sound effect integration for achievements (1st place gets special sound)
- Comprehensive statistics tracking with game count and averages
- Memory management to prevent duplicate processing

**`useSettings`** (Legacy Configuration):
- Still used for some legacy settings functionality
- Gradually being migrated to Zustand store

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
- Strict typing for audio system with `SoundKey` union type
- Error handling types for graceful failure management

### Component Architecture

**TetrisGame** (Main Orchestrator):
- Composes multiple custom hooks for complete game functionality (useGameState, useGameControls, useGameLoop, useSounds, useSettings)
- Enhanced visual layout with cyberpunk gradient effects
- Optimized callback functions with `useCallback` for child components
- Centralized settings integration with LocalStorage persistence

**TetrisBoard** (Visual Display Layer):
- Cyberpunk-themed game board with hologram background
- Neon-enhanced ghost piece with glow effects
- Enhanced cell styling with CSS variable integration
- Game over/pause overlays with themed styling

**GameInfo** (Themed UI Panels):
- Seven distinct themed panels: Score Data, Next Piece, Controls, Audio, Buttons, Scoring, High Scores
- High score panel displays Top 5 with rank, score, level, lines, date, and player name
- Audio panel includes volume slider and mute toggle with cyberpunk styling
- Each panel uses unique hologram backgrounds and neon borders
- Enhanced buttons with gradient effects and hover animations
- Consistent cyberpunk typography and spacing

**HighScoreDisplay** (Ranking System UI):
- Configurable display count (default Top 5 in GameInfo)
- Optional rank display with cyberpunk styling
- Player name support with validation
- Date formatting in Japanese locale
- Empty state handling with appropriate messaging

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
- **Achievement Audio**: Special sound effects for high score achievements
- **Audio Controls**: Real-time volume adjustment and mute toggle
- **Performance Optimized**: Preloaded audio with efficient playback management

**High Score & Statistics System**:
- **Automatic Tracking**: Game end detection with automatic high score registration
- **Top 10 Rankings**: Persistent local high score table with automatic sorting
- **Comprehensive Statistics**: Total games, lines, score, averages, best scores
- **Achievement Recognition**: Rank-based celebration messages and sound effects
- **Data Persistence**: LocalStorage with cross-tab synchronization
- **Validation & Security**: Input sanitization and data integrity checks

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
- Comprehensive error handling for missing files with loading state tracking
- Graceful degradation when audio files are unavailable

**Zustand Store Architecture**:
- Immer integration for immutable state updates
- Persistent middleware with selective data storage
- Migration system for version updates and data structure changes
- Type-safe actions with comprehensive error boundaries

**High Score System Architecture**:
- `highScoreUtils.ts`: Pure utility functions for ranking, validation, statistics
- `useHighScoreManager.ts`: React hook for automatic game end detection
- `HighScoreDisplay.tsx`: Reusable UI component with cyberpunk theming
- Comprehensive test coverage with 66+ unit and integration tests

**TDD Development Approach**:
- Test-first development for all new features
- Comprehensive mocking strategies for Zustand store testing
- Component testing with React Testing Library
- Utility function testing with edge case coverage

**Performance Characteristics**:
- Zero infinite render loops through optimized dependencies
- ~90% reduction in CSS duplication through variable system
- Memory leak prevention through proper timeout management
- Audio preloading and efficient playback management
- Production-ready performance optimizations

## Current Codebase Quality

### Code Organization
- **Clean Architecture**: Separation of concerns with Zustand store, hooks, and components
- **Type Safety**: Comprehensive TypeScript coverage with readonly arrays and strict typing
- **Performance**: Optimized rendering and memory management with object pooling
- **Maintainability**: Unified styling system and consistent patterns
- **Test Coverage**: 66+ tests with comprehensive TDD coverage for all high score features
- **Error Resilience**: Robust error handling for audio, storage, and game state failures
- **State Management**: Centralized Zustand store with persistence and validation

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
- Error handling prevents crashes when audio files are missing or fail to load

**Zustand Store Integration**:
- Use `useGameStore` for centralized state access and mutations
- Leverage selective hooks: `useHighScores`, `useStatistics`, `useSettings`, `useTheme`
- All user data automatically persisted with validation and error handling
- State changes are immutable through Immer middleware integration

**High Score System Integration**:
- `useHighScoreManager` automatically handles game end detection and score saving
- `HighScoreDisplay` component for displaying ranked scores with theming
- Use `highScoreUtils` functions for score validation and ranking calculations
- All high score data persists across browser sessions with LocalStorage

## Future Enhancement Roadmap

### Phase 2: Core Feature Expansion (COMPLETED ✅)
**Target**: Enhanced user experience and mobile support

**State Management Standardization** (✅ COMPLETED):
```typescript
interface GlobalGameState extends GameState {
  settings: GameSettings;
  highScores: readonly HighScore[];
  statistics: GameStatistics;
  theme: ThemeState;
  errors: readonly GameError[];
}
```
- ✅ Zustand with Immer integration implemented
- ✅ State persistence with LocalStorage
- ✅ Comprehensive error handling and validation
- ✅ Type-safe readonly arrays

**High Score & Statistics System** (✅ COMPLETED):
- ✅ Local high score management (Top 10) with automatic sorting
- ✅ Session statistics tracking (total lines, games, best streak, average score)
- ✅ Real-time achievement recognition with sound effects
- ✅ Comprehensive test coverage (66+ tests)
- ✅ Statistical data display in GameInfo panel

**Remaining Phase 2 Items**:

**Statistics Dashboard Implementation** (NEXT):
- Detailed statistics visualization with charts
- Play time tracking and efficiency metrics
- Achievement system with unlockable rewards
- Historical performance analysis
- Statistical data export functionality

**Customizable Theme System** (PENDING):
- Additional preset themes (classic, retro, minimal, neon)
- Custom color palette editor stored in Zustand
- Color-blind friendly configurations
- Contrast adjustment controls
- Animation intensity settings

**Mobile & Responsive Enhancement** (PENDING):
- Swipe gesture support (move, rotate, drop)
- Optional virtual button overlay
- Haptic feedback integration
- Screen size-specific layout optimization
- Device rotation support

### Phase 3: Advanced Features (1-2 months)
**Target**: Platform-level capabilities and accessibility

**Multiplayer Foundation**:
```typescript
interface MultiplayerArchitecture {
  gameMode: 'single' | 'versus' | 'cooperative' | 'battle';
  players: Player[];
  syncEngine: StateSyncEngine;
  networking: NetworkLayer;
}
```
- Local multiplayer (same-screen 2-player)
- WebSocket/WebRTC communication layer
- State synchronization with conflict resolution
- Real-time 1vs1 competitive mode
- Cooperative line-clearing mode

**Internationalization (i18n)**:
```typescript
interface I18nSystem {
  languages: ['ja', 'en', 'es', 'fr', 'de', 'ko', 'zh'];
  translations: TranslationMap;
  formatters: LocaleFormatters;
  rtlSupport: RTLConfig;
}
```
- Multi-language UI support
- Regional number and date formatting
- Right-to-left language support
- Localized audio files
- Regional keyboard layout adaptation

**Accessibility Enhancement (WCAG Compliance)**:
```typescript
interface AccessibilityFeatures {
  screenReader: ScreenReaderConfig;
  keyboardNav: KeyboardNavConfig;
  visualAids: VisualAidConfig;
  motorSupport: MotorSupportConfig;
}
```
- Complete screen reader support
- Keyboard-only navigation
- High contrast mode
- Reduced motion options
- Alternative text and ARIA labels
- Non-color-based information delivery

**Advanced Game Modes**:
```typescript
type ExtendedGameMode = 'classic' | 'sprint' | 'ultra' | 'zen' | 'puzzle' | 'survival';
```
- Sprint Mode: Time-limited line clearing competition
- Ultra Mode: Maximum score within time limit
- Zen Mode: Relaxing unlimited play
- Puzzle Mode: Complete specific arrangements
- Survival Mode: Progressively increasing speed
- Power-ups with temporary special effects
- Daily challenges and missions

**Plugin System**:
```typescript
interface GamePlugin {
  manifest: PluginManifest;
  hooks: PluginHooks;
  components: PluginComponents;
  assets: PluginAssets;
}
```
- Third-party plugin support
- Custom theme plugins
- New game mode extensions
- Enhanced effect plugins
- Statistics and analysis tools
- Streaming/content creator features

### Technical Infrastructure Extensions

**Performance Optimization**:
- Web Workers for heavy computation isolation
- Virtual scrolling for large data handling
- Service Worker for offline support
- Bundle splitting and lazy loading

**Data Management**:
- IndexedDB for large-capacity data storage
- Optional cloud synchronization
- Data backup and restoration
- Migration system for version updates

### Extensibility Patterns
- **Theme Variations**: Easy creation of new color schemes using CSS variables
- **Effect Customization**: Configurable particle and animation parameters
- **Component Reuse**: Hologram and neon effect classes for new features
- **Performance Scaling**: Architecture ready for complex visual effects
- **Plugin Architecture**: Extensible system for community contributions

### Architecture Benefits
- **Maintainable Theming**: CSS variable system supports easy design changes
- **Performance Ready**: Optimized for production deployment with Zustand persistence
- **Type Safe**: Comprehensive TypeScript with readonly arrays and strict typing
- **Memory Efficient**: Object pooling and proper cleanup patterns
- **Test-Driven Development**: 66+ tests ensure reliability and prevent regressions
- **Error Resilient**: Graceful handling of failures maintains user experience
- **Data Persistence**: Comprehensive LocalStorage with cross-tab synchronization
- **Scalable Architecture**: Zustand foundation ready for advanced features and multiplayer

## TDD Development Guidelines

**Test Structure**:
- Use Vitest with React Testing Library for component testing
- Mock Zustand store with custom test stores for isolated testing
- Test utilities as pure functions with comprehensive edge case coverage
- Component tests focus on user interactions and visual output

**Testing Patterns**:
- Create test-specific mock stores to avoid cross-test contamination
- Use `beforeEach` to reset all mocks and test state
- Test both happy paths and error conditions extensively
- Validate both business logic and UI behavior

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.