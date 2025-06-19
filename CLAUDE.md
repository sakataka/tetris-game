# CLAUDE.md

This file provides guidance to Claude Code when working with this React Router 7 + React 19.1 Tetris game.

# MCP TypeScript Tools Usage Guidelines

## 🎯 Preferred Tools for TypeScript Operations

You prefer typescript mcp (`mcp__typescript_*`) to fix code over the default `Read` and `Edit` tools when possible.

### When to Use MCP TypeScript Tools:
1. **Symbol Operations**: Renaming, deleting, finding references
2. **Type Information**: Getting symbol types, module exports
3. **Diagnostics**: TypeScript error checking
4. **Safe Refactoring**: Moving files/directories with automatic import updates

### MCP TypeScript Best Practices:
- Use `get_diagnostics` before and after major changes
- Use `find_references` before renaming/deleting symbols
- Use `move_file` instead of manual file moves
- Handle MCP errors gracefully (fallback to traditional tools)
- Be aware of 25000 token limits for large scope queries

### Token Optimization Strategy:
1. Use MCP TypeScript tools for structural changes
2. Use Grep/Glob for discovery without reading file contents
3. Use Read/Edit only when complex logic changes are needed
4. Batch related operations to minimize tool calls

## 🔍 Search Command Guidelines

### Ripgrep (rg) Command Usage
**IMPORTANT**: Always use correct syntax to avoid file type errors

**✅ Correct Usage:**
```bash
# Search for patterns in all files
rg "pattern" src/

# Search in specific file extensions (use include patterns)
rg "pattern" src/ --include="*.tsx"
rg "pattern" src/ --include="*.ts"

# Multiple extensions
rg "pattern" src/ --include="*.{ts,tsx,js,jsx}"

# Search in specific directories
rg "gray-[0-9]+" src/components/
```

**❌ Incorrect Usage (causes errors):**
```bash
# DO NOT use --type with unsupported file types
rg "pattern" --type tsx src/  # Error: unrecognized file type: tsx
rg "pattern" --type ts src/   # May work but prefer --include
```

## 🎯 Development Guidelines

**Critical Reference**: [React Development Guidelines](./docs/REACT_DEVELOPMENT_GUIDELINES.md)

### Core Principles
- **React Compiler First**: Let React 19.1 compiler handle optimization automatically
- **Zustand Individual Selectors**: Use specific selectors, avoid prop drilling
- **TypeScript Strict Mode**: No `any` types, comprehensive interfaces
- **shadcn/ui + Cyberpunk**: Use CyberCard, Button, Tabs, Slider components
- **English Comments/Commits**: All source code documentation in English
- **No Hardcoding**: Never hardcode values to pass tests. Tests verify actual functionality, not hardcoded responses. Hardcoding defeats the purpose of testing and is strictly prohibited

## Project Architecture

### Tech Stack
- **Framework**: React 19.1 + React Router 7.6.2 (SPA mode)
- **Build**: Vite 6.3.5 + TypeScript ES2024 + babel-plugin-react-compiler 19.1.0-rc.2
- **State**: Zustand 5 (7 optimized stores)
- **UI**: shadcn/ui + Tailwind CSS v4.1 + Cyberpunk theme
- **Package Manager**: pnpm (required) 
- **Quality**: Biome (linting/formatting) + Lefthook pre-commit

### Bundle Performance
- **Production Build**: 322.02 kB (gzip: 95.68 kB)
- **Components**: 58 total (38 game + 20 shadcn/ui)
- **Tests**: 349 tests across 24 files (Vitest)

## Key Architecture Patterns

### 1. Modern Controller Pattern (Hook Composition)
The architecture replaces complex render props with elegant hook composition:

```typescript
// Before: 5 levels of render prop nesting (72 lines)
// After: Single hook call (15 lines)
export default function GameLogicController({ children }: GameLogicControllerProps) {
  const gameControllerAPI = useGameController();
  return children(gameControllerAPI);
}
```

**useGameController** consolidates all subsystem APIs:
- **Game State Controller** - Core game logic and state management
- **Audio Controller** - Sound system with useSimpleAudio strategy
- **Event Controller** - Analytics and game events
- **Device Controller** - Responsive behavior detection
- **Settings Management** - User preferences persistence

### 2. Optimized Zustand State Management
Individual selector pattern for minimal re-renders:

```typescript
// Granular selectors prevent unnecessary re-renders
const gameState = useGameState();
const togglePause = useTogglePause();
const updateParticles = useUpdateParticles();
```

### 3. React 19.1 Compiler Integration
Automatic optimization without manual memoization:
- Natural code flow - focus on business logic
- React Compiler handles memoization decisions
- No useCallback/useMemo boilerplate

### 4. Unified Animation System
Single AnimationManager for all animations:
- requestAnimationFrame optimization
- Automatic cleanup on component unmount
- Centralized animation queue management

## Zustand Store Architecture (7 Stores)

### Core Game Stores
1. **gameStateStore** - Main game state management
   - Board state, current/next pieces
   - Score, level, lines cleared
   - Line effects and particle animations
   - Game over and pause states

2. **settingsStore** - User preferences
   - Game difficulty and controls
   - Debug mode settings
   - Keyboard configurations
   - Persistent storage integration

3. **statisticsStore** - Game statistics
   - High scores management
   - Play history tracking
   - Performance metrics
   - Session data

### UI/UX Stores
4. **themeStore** - Visual customization
   - Theme presets (default, dark, light, cyberpunk)
   - Color scheme management
   - Accessibility filters
   - System preference sync

5. **audioStore** - Sound management
   - Volume and mute controls
   - Sound effect triggers
   - Audio strategy pattern integration

### System Stores
6. **i18nStore** - Internationalization
   - Language selection (en/ja)
   - Translation management
   - Locale persistence

7. **errorStore** - Error handling
   - Global error state
   - Toast notifications
   - Error boundary integration

## Constants Management System

### Comprehensive Configuration Architecture
The project uses a sophisticated constants management system with validation:

```typescript
// Centralized configuration with validation
import { gameConfig, audioConfig, uiConfig } from '@/constants';
import { validateAllConfigs } from '@/constants/validation';

// Runtime validation ensures configuration integrity
const validation = validateAllConfigs(customConfig);
```

### Configuration Categories
1. **Game Configuration** (`gameConfig.ts`)
   - Scoring rules and multipliers
   - Level progression mechanics
   - Physics and timing settings
   - Particle system configuration

2. **Audio Configuration** (`audioConfig.ts`)
   - Sound effect mappings
   - Volume defaults
   - Audio file paths

3. **UI Configuration** (`uiConfig.ts`)
   - Layout dimensions
   - Animation timings
   - Responsive breakpoints

4. **Validation System** (`validation.ts`)
   - Type-safe configuration validation
   - Runtime checks for all configs
   - Error and warning reporting

## Quick Commands

```bash
# Development
pnpm dev                # Vite dev server
pnpm build              # Production build
pnpm preview            # Preview build

# Quality
pnpm lint               # Biome linting
pnpm format             # Biome formatting
pnpm biome check --write # Auto-fix issues including unused imports
pnpm quality:check      # Full pipeline (lint + typecheck + test)

# Testing
pnpm test               # Vitest watch mode
pnpm test:e2e           # Playwright E2E tests
```

## Component Architecture Details

### Core Component Hierarchy
```
TetrisGame (Root)
├── GameOrchestrator (App initialization)
│   └── GameLogicController (Hook composition)
│       └── GameLayoutManager (UI orchestration)
│           ├── GameHeader
│           ├── MainLayout
│           │   ├── TetrisBoard
│           │   ├── GameInfo
│           │   │   ├── NextPiecePanel
│           │   │   ├── ScoringPanel
│           │   │   └── ControlsPanel
│           │   └── GameButtonsPanel
│           ├── VirtualControls (mobile)
│           └── Overlays (PausedMessage, GameOverMessage)
```

### Component Responsibilities

#### **TetrisGame** (`/src/components/TetrisGame.tsx`)
- Root component with error boundary
- Minimal logic, pure composition
- Entry point for the game

#### **GameOrchestrator** (`/src/components/GameOrchestrator.tsx`)
- I18n initialization
- SPA mode detection
- Global app lifecycle

#### **GameLogicController** (`/src/components/GameLogicController.tsx`)
- Consolidates all game logic via `useGameController` hook
- Provides unified API to children
- Replaces 5 levels of render props with single hook

#### **GameLayoutManager** (`/src/components/GameLayoutManager.tsx`)
- Responsive layout orchestration
- Mobile/desktop UI adaptation
- Dialog and overlay management

### Hook Architecture

#### **useGameController** (Master Hook)
Combines all subsystem controllers:
```typescript
{
  // Game state management
  gameState, isPaused, isGameOver, togglePause, resetGame,
  
  // Piece controls
  movePiece, rotatePiece, dropPiece, hardDropPiece,
  
  // Audio controls  
  volume, isMuted, toggleMute, setVolume,
  
  // Settings & device info
  settings, updateSettings, isMobile, 
  
  // UI state
  showSettings, setShowSettings
}
```

## Critical Systems

### Error Handling
- **Multiple Error Boundaries**: Page-level and component-level protection
- **Error Store Integration**: Global error state with toast notifications
- **Graceful Degradation**: Game continues with reduced functionality on errors
- **Sentry Integration**: Production error tracking and monitoring

### Internationalization
- **i18n Store**: Centralized language management
- **Supported Languages**: English (en) and Japanese (ja)
- **Browser Detection**: Automatic language selection
- **Persistent Selection**: Language preference saved to localStorage

### Audio System
- **Strategy Pattern**: Pluggable audio backends via useSimpleAudio
- **Optimized Loading**: Lazy loading with preload support
- **Volume Control**: Independent volume and mute settings
- **Sound Effects**: 6 game sounds (rotate, land, clear, tetris, game-over, hard-drop)

### Performance Optimizations
- **React Compiler**: Automatic memoization without manual optimization
- **Animation Manager**: Centralized RAF-based animation queue
- **Particle Pool**: Object pooling for particle effects
- **Canvas Rendering**: Optimized board rendering with minimal redraws
- **Individual Selectors**: Zustand selectors prevent unnecessary re-renders

## File Organization

### Route Structure (SPA)
```
src/routes/
├── home.tsx        # / (Main game)
├── settings.tsx    # /settings
├── statistics.tsx  # /statistics
├── themes.tsx      # /themes
└── about.tsx       # /about
```

### Key Directories
```
src/
├── components/     # React components (60 total)
├── store/         # Zustand stores (15 total)
├── utils/         # Audio, logging, error handling
├── hooks/         # Custom hooks (17 total)
├── types/         # TypeScript definitions
└── test/          # Vitest test files
```

## Recent Refactoring Achievements

### Phase-based Architecture Evolution
The project underwent comprehensive refactoring through multiple phases:

#### Phase 1: Foundation Improvements
- **Import Path Standardization**: All imports now use `@/` prefix
- **Constants Consolidation**: Unified constant definitions
- **Naming Consistency**: Standardized naming conventions across codebase

#### Phase 2: Major Architecture Improvements  
- **Component Structure**: Simplified component hierarchy
- **State Management**: Optimized Zustand store structure
- **Performance**: Enhanced rendering performance

#### Phase 3: Configuration Management System
- **Phase 3.2**: Import path organization completion
- **Phase 3.4**: Comprehensive constants management with validation
- **Configuration Comparison**: Runtime config validation system

#### Phase 4: Final Optimizations
- **Dead Code Elimination**: Removed unused files and exports
- **Bundle Optimization**: Reduced component count from 60 to 58
- **Animation System**: Optimized with unified AnimationManager
- **TypeScript Cleanup**: Complete type safety across codebase

### Import Path Standards
All imports use the `@/` prefix for absolute paths:

```typescript
// ✅ Correct - uses @/ prefix
import { useGameState } from '@/store/gameStateStore';
import { TetrisBoard } from '@/components/TetrisBoard';
import { GAME_CONFIG } from '@/constants';

// ❌ Incorrect - relative paths
import { useGameState } from '../store/gameStateStore';
```

## Development Workflow

### Quality Assurance Strategy
**Performance-Optimized Multi-Layer Validation:**

1. **Pre-commit (Fast: ~0.9s)** - Automatic on every commit
   - Biome format + lint (staged files only)
   - TypeScript type checking (full project)
   - Prevents commits with TypeScript errors

2. **Pre-push (Complete: ~3.5s)** - Manual before pushing
   ```bash
   pnpm pre-push  # Full quality check + all tests
   ```

3. **CI/CD (GitHub Actions)** - Final validation
   - Complete test suite
   - Build verification
   - Deployment checks

### Adding Features
1. Check existing patterns in similar components
2. Use appropriate Zustand stores with individual selectors
3. Follow TypeScript strict mode (no `any`)
4. Let React Compiler handle optimization
5. Add tests in `src/test/`
6. **Run `pnpm pre-push` before pushing** (recommended)

### Testing Guidelines

### Error Handling Philosophy

### Development Server Guidelines

### React Compiler Guidelines

### Build Configuration
- **Vite**: React plugin with babel-plugin-react-compiler
- **Tailwind CSS v4.1**: PostCSS integration, no config file needed
- **TypeScript**: ES2024 target with strict mode
- **Security**: CSP headers via Vercel configuration

## Production Deployment

### Vercel Configuration

### Environment Variables

## Important Notes

- **Package Manager**: pnpm (required) - enforced via engines field
- **React Version**: 19.1 with React Compiler optimization
- **Comments/Commits**: English only for source code documentation
- **Pre-commit**: Automatic Biome formatting/linting via Lefthook (~0.9s)
- **Pre-push**: Run `pnpm pre-push` for full quality check + tests (~3.5s)
- **Performance**: Bundle size optimized to 95.68 kB (gzip)
- **Testing**: 349 tests with Vitest, full E2E coverage with Playwright
- **Import Paths**: Always use `@/` prefix for absolute imports
- **State Management**: Use individual Zustand selectors to prevent re-renders
- **No Manual Memoization**: Let React Compiler handle optimization 

## Future Feature Roadmap

### 🟢 High Priority (1-3 months)
1. **Custom Control Schemes** - Remappable keys, multiple profiles
2. **Advanced Game Modes** - Puzzle, Marathon, Time Attack modes
3. **Achievement System** - 50+ achievements, progression tracking
4. **Tutorial System** - Interactive tutorials, T-spin training

### 🟡 Medium Priority (3-6 months)
5. **Real-time Multiplayer** - WebSocket battles, spectator mode
6. **AI Opponent** - ML-based difficulty, multiple personalities
7. **Replay System** - Record/playback, sharing, video export
8. **Power-ups & Special Blocks** - Bomb blocks, time freeze
9. **Social Features** - Friends, leaderboards, chat
10. **Advanced Statistics** - Heat maps, performance graphs

### 🔴 Low Priority (6+ months)
11. **Tournament Platform** - Brackets, events, live streaming
12. **Plugin System** - Third-party extensions, marketplace
13. **Performance Profiler** - In-game FPS, memory monitoring

### Architecture Support
The current architecture supports expansion through:
- **Controller Pattern**: Extensible for new game modes
- **Store Pattern**: Easy addition of new Zustand stores
- **Strategy Pattern**: Audio system can add new strategies
- **Component System**: shadcn/ui base for consistent UI expansion
