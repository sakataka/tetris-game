# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 IMPORTANT: Follow React Development Guidelines

**All React development, implementation, and design must follow this document:**

👉 **[React 19.1 + React Compiler Development Guidelines](./docs/REACT_DEVELOPMENT_GUIDELINES.md)**

### 📋 Required Checklist

When implementing new components or features, always verify the following:

- **🤖 React Compiler First**: Prioritize readability over manual optimization
- **🎨 Component Responsibility Separation**: Strict Single Responsibility Principle
- **🗄️ Zustand Individual Selectors**: Use Zustand, avoid Context overuse
- **🛡️ TypeScript Strict Mode**: Ensure type safety
- **🧪 Testing Strategy**: Implement tests with React Testing Library + Vitest
- **📁 File Organization**: Use Co-location pattern and Named Exports

## Project Overview

Production-ready cyberpunk-themed Tetris game built with React Router 7, TypeScript, and Tailwind CSS. Features comprehensive state management, audio system with fallback strategies, and particle effects.

**Tech Stack**: Vite 6.3.5 + React 19.1.0 + React Router 7.6.2 (SPA mode) + TypeScript 5 (ES2024) + Zustand 5 + Tailwind CSS 4.1.10 + shadcn/ui (15/20 components active, React Compiler optimized)

## Environment Setup

**Prerequisites**: Node.js 20+, pnpm 9+ package manager

**Configuration**: The game uses environment-based configuration with `.env.local` overrides:

**Development Tools**: Uses Vite for fast development and HMR, Husky for pre-commit hooks, React Compiler for automatic optimization

## Quick Start

```bash
# Setup
pnpm install            # Install dependencies (required: pnpm)
cp .env.example .env.local  # Copy environment configuration

# Development
pnpm dev                # Vite development server with HMR
pnpm build              # Vite production build (SPA)
pnpm preview            # Preview production build

# Testing
pnpm test               # Run tests in watch mode
pnpm test:run           # Run tests once
pnpm test:coverage      # Run tests with coverage report
pnpm test:e2e           # Run E2E tests with Playwright
pnpm test:e2e:ui        # Run E2E tests with Playwright UI
pnpm test:e2e:debug     # Run E2E tests in debug mode

# Code Quality
pnpm lint               # Biome linting (fast execution)
pnpm lint:fix           # Auto-fix lint issues with Biome
pnpm format             # Format code with Biome
pnpm format:check       # Biome format validation
pnpm biome:check        # Comprehensive check (format + lint + imports)
pnpm quality:check      # Full quality pipeline (lint + typecheck + test)

# Analysis
pnpm analyze            # Bundle size analysis with Vite
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
5. **Controller Pattern**: Specialized controllers compose through render props
6. **React Compiler Pattern**: Automatic optimization without manual memoization

### Controller Architecture

The game uses a layered controller pattern for clean separation of concerns:

1. **GameStateController**: Core game logic and state management

   - Handles piece movement, rotation, and collision detection
   - Manages game lifecycle (start, pause, game over)
   - Integrates with gameStateStore

2. **AudioController**: Audio system management

   - Provides unified audio API across strategies
   - Handles audio initialization and fallback
   - Manages volume and mute states

3. **EventController**: Event handling and propagation

   - Centralizes game event management
   - Provides hooks for game lifecycle events
   - Manages event subscriptions

4. **DeviceController**: Device detection and adaptation
   - Detects mobile vs desktop environments
   - Provides device-specific configurations
   - Manages responsive behavior

Controllers compose through render props, allowing clean API aggregation:

### Current Architecture Statistics

**Component Breakdown:**
- **Total React Components**: 60 (40 game-specific + 20 shadcn/ui)
- **Custom Hooks**: 17 specialized hooks
- **Zustand Stores**: 15 state management stores (🆕 +2 Phase 1: navigationStore, audioStore)
- **Controllers**: 4 specialized controllers (Audio, Device, Event, GameState)
- **shadcn/ui Integration**: 15/20 components actively used (75% utilization)
- **🆕 Layout Components**: 4 React Router ready components (MainLayout, Navigation, GameHeader, BackgroundEffects)

**Code Quality Metrics:**
- **Test Coverage**: 349 tests across 24 files + E2E test suite (Playwright)
- **Bundle Size**: 322.02 kB main bundle (optimized with Vite, gzip: 95.68 kB)
- **Build Performance**: ~3770ms with Vite (SPA mode with compression)
- **TypeScript Strict**: ES2024 target with React Router 7 SPA integration
- **🎯 Migration Status**: 🎉 SPA mode deployment - React 19.1 + React Router 7 SSR temporarily disabled

## React 19.1 Modern Features

### React Compiler Integration

The project leverages React 19.1's React Compiler for automatic performance optimization:

**Key Benefits:**

- **Reduced Manual Optimization**: 40+ useMemo/useCallback instances reduced to 12 critical cases
- **Intelligent Memoization**: Compiler decides when optimization is beneficial
- **Automatic Re-rendering Control**: Optimal component update patterns
- **Better Performance**: More efficient than manual optimization

**Components Optimized:**

- `TetrisBoard`: 6 useMemo optimizations replaced with compiler intelligence
- `GameStateController`: 3 useCallback optimizations removed
- `ParticleCanvas`: Complex animation optimizations simplified
- `ParticleEffect`: 4 manual optimizations replaced
- All settings components: Event handlers automatically optimized

## State Management (Zustand)

### Zustand Stores (15 total)

- **gameStateStore**: Game state, piece movement, line clearing
- **settingsStore**: User preferences with localStorage persistence  
- **statisticsStore**: High scores and gameplay metrics
- **themeStore**: Theme management with 5 presets + custom colors
- **accessibilityStore**: WCAG-compliant features (3 sub-stores)
- **errorStore**: Error tracking with categorization, statistics, and UI integration
- **sessionStore**: Unified session management with automatic timeout (30min)
- **languageStore**: i18n language state management with persistence
- **localeStore**: Locale-specific settings (date format, RTL support)
- **configStore**: Configuration and settings management
- **cognitiveAccessibility**: Cognitive accessibility features
- **inputAccessibility**: Input accessibility options
- **visualAccessibility**: Visual accessibility enhancements
- **🆕 navigationStore**: Tab navigation state management (Phase 1 React Router preparation)
- **🆕 audioStore**: Audio system state centralization (Phase 1 prop drilling elimination)

## Build Architecture (SPA Mode)

### Routing System

**Route Structure**: Clean, organized page hierarchy
```
src/routes/
├── home.tsx        # / (Main Tetris game)
├── settings.tsx    # /settings (Game configuration)
├── statistics.tsx  # /statistics (High scores & metrics)
├── themes.tsx      # /themes (Visual customization)  
└── about.tsx       # /about (Project information)
```

**Entry Points**: Standard Vite + React SPA pattern
- **main.tsx**: Application entry with createBrowserRouter
- **root.tsx**: Global layout with providers (I18n, Error boundaries, Toaster)
- **index.html**: Static HTML template

**Configuration**: Optimized for SPA deployment
- **vite.config.ts**: Tailwind CSS v4.1, React Compiler, standard Vite build
- **vercel.json**: SPA rewrites, security headers, caching strategy
- **Type Safety**: Full TypeScript integration with React Router

### Build System (Vite 6.3.5)

**Development**: Lightning-fast HMR and dev server
- **HMR Speed**: ~200ms (target achieved)
- **Dev Server Startup**: ~1000ms
- **Hot Module Replacement**: Instant component updates

**Production Build**: Optimized SPA bundle
- **Main Bundle**: 322.02 kB (gzip: 95.68 kB)
- **Code Splitting**: Automatic chunking for optimal loading
- **Compression**: Brotli and gzip pre-compression
- **Font Loading**: @fontsource integration (Geist Sans/Mono)
- **Asset Optimization**: Aggressive tree-shaking and minification

## Key Systems

### Layout System (React Router Native)

**MainLayout**: Flexible page structure foundation
- Configurable header, navigation, and background variants
- Support for different page types (game, settings, about, etc.)
- Responsive design with cyberpunk theming
- Ready for React Router outlet integration

**Navigation**: Centralized tab/page navigation
- shadcn/ui Tabs integration with cyberpunk styling
- Internationalization support
- Keyboard accessibility (WCAG compliant)
- Smooth transition to React Router Links

**Metadata Management**: SEO and social media optimization
- React Router Meta API compatible structure
- Dynamic title and meta tag generation
- Open Graph and Twitter Card support
- Localization ready

**Background Effects**: Reusable cyberpunk atmosphere
- Three variants: default, minimal, intense
- Animated floating orbs with different color schemes
- Non-interactive overlay system

### Audio System (Strategy Pattern)

- **AudioManagerV2**: Manages strategy switching
- **WebAudioStrategy**: Primary audio with object pooling
- **HTMLAudioStrategy**: Fallback for older browsers
- **SilentStrategy**: Silent mode fallback
- Auto-detection and graceful degradation

#### Decomposed Audio Hooks

- **useAudioStrategy**: Strategy selection and switching logic with retry mechanisms
- **useAudioPlayer**: Clean playback interface with throttling
- **useAudioState**: Volume and mute state management
- **useAudioPreloader**: Audio file preloading with progress tracking
- **useSounds**: Legacy compatibility wrapper combining all audio hooks

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
- **Game Helpers**: `log.audio()`, `log.animation()`, `log.game()`, `log.performance()`, `log.config()`
- **Production Mode**: Automatic debug log suppression for clean console output
- **Structured Context**: Component identification and metadata attachment
- **Format**: ISO timestamp + level + [component](action) + message

### Timeout Management System

- **TimeoutManager**: Unified timeout management using AnimationManager
- **Features**:
  - Animation-based timeouts for consistency with game loop
  - Support for long-duration timeouts (session management)
  - Automatic cleanup and memory management
  - Debug logging for timeout tracking
- **API**: `unifiedSetTimeout()` and `unifiedClearTimeout()`

### Error Handling System

- **ErrorStore**: Centralized error tracking and management
- **Error Categories**: game, audio, storage, network, ui, validation, system
- **Error Levels**: info, warning, error, critical
- **Features**:
  - Automatic error statistics and aggregation
  - UI integration with ErrorNotification component
  - Error history with configurable retention
  - Error filtering by category and level
- **ErrorBoundary Hierarchy**: Page-level and component-level error isolation

### Session Management

- **SessionStore**: Unified session tracking replacing legacy SessionManager
- **Features**:
  - Automatic session timeout (30 minutes)
  - Play time tracking and statistics
  - Game count per session
  - localStorage persistence
  - Window focus/blur handling
- **Statistics**: Total play time, average session duration, games per session

## UI Components & Design System

### shadcn/ui Integration

The project uses **shadcn/ui** as the foundation for a unified, accessible component system:

- **Component Library**: Built on Radix UI primitives for accessibility
- **Design System**: shadcn/ui components enhanced with cyberpunk aesthetics
- **Type Safety**: Full TypeScript support with strict mode compliance
- **Customization**: CSS variables and Tailwind CSS for theme integration

### shadcn/ui Components Status

**Installed Components (20 total):**
```
alert, badge, button, card, checkbox, dialog, input, label, 
popover, progress, scroll-area, select, separator, skeleton, 
slider, sonner, switch, tabs, tooltip, CyberCard (custom)
```
### Core shadcn/ui Components

- **Button**: Enhanced with cyberpunk variants (default, destructive, outline, secondary, ghost, link)
- **CyberCard**: shadcn/ui Card wrapper with hologram effects and neon borders
- **Tabs**: Accessible tab navigation with keyboard support
- **Slider**: Form controls with cyberpunk styling (volume, settings)
- **Alert**: Cyberpunk notification variants (default, warning, error, success)
- **Toast**: Sonner integration for real-time notifications

### Panel System (CyberCard Architecture)

- **CyberCard**: shadcn/ui Card foundation with cyberpunk enhancements
- **6 Themes**: cyan, purple, green, yellow, red, default
- **Hologram Effects**: Consistent gradient backgrounds with blur effects
- **Neon Borders**: Theme-specific glowing borders with shadow effects
- **Responsive Sizing**: 4 sizes (xs, sm, md, lg) with adaptive spacing

### Key Game Components (60 total)

- **TetrisBoard**: Game board with BoardRenderer MVC
- **ParticleEffect/Canvas**: Line clear animations
- **VirtualControls**: Mobile touch controls (5 buttons)
- **StatisticsDashboard**: 15 extended metrics
- **GameInfo**: Main UI with shadcn/ui Tabs integration
- **ThemeSettings**: Complete shadcn/ui form components
- **AudioPanel**: Volume controls with Slider components
- **ErrorBoundary**: Multi-level error handling with Button components

### Form Components (shadcn/ui Enhanced)

- **Button**: Cyberpunk-themed variants for all interactive elements
- **Slider**: Volume controls and effect intensity adjustments
- **Tabs**: Settings navigation with enhanced accessibility
- **Card**: Information panels and content containers

## shadcn/ui + Cyberpunk Theme Integration

### Component Architecture

The project successfully integrates **shadcn/ui** with custom cyberpunk aesthetics:

```typescript
// CyberCard: shadcn/ui Card + cyberpunk enhancements
<CyberCard title="GAME STATS" theme="cyan" size="md">
  <GameContent />
</CyberCard>

// shadcn/ui Button with cyberpunk styling
<Button variant="outline" className="border-cyber-cyan text-cyber-cyan">
  Reset Settings
</Button>

// shadcn/ui Slider with neon effects
<Slider 
  value={[volume]} 
  onValueChange={(value) => setVolume(value[0])}
  className="[&>span[data-slot=slider-range]]:bg-cyber-cyan"
/>
```

### Available Components

| Component | shadcn/ui Base | Cyberpunk Enhancement | Usage Count |
|-----------|---------------|---------------------|-------------|
| **CyberCard** | Card | Hologram effects, neon borders, 6 themes | 8 panels |
| **Button** | Button | Cyber variants, neon hover effects | 60+ elements |
| **Tabs** | Tabs | Custom colors, cyberpunk styling | 2 navigations |
| **Slider** | Slider | Neon track/thumb, glow effects | 3 controls |
| **Alert** | Alert | 4 cyberpunk variants with glow effects | 4 messages |
| **Toast** | Sonner | Achievement notifications | Global system |
| **ScrollArea** | ScrollArea | Cyber-themed scrollbars | 3 areas |
| **Switch** | Switch | Neon toggle effects | 5 settings |
| **Label** | Label | Consistent cyber styling | 12 forms |
| **Skeleton** | Skeleton | Cyber-themed loading states | 4 loaders |

### Theme System

```typescript
// 6 Cyberpunk Themes Available
type CyberTheme = 'cyan' | 'purple' | 'green' | 'yellow' | 'red' | 'default';

// CSS Variables Integration
--cyber-cyan: theme(colors.cyan.400);
--cyber-purple: theme(colors.purple.400);
--cyber-green: theme(colors.green.400);
--cyber-yellow: theme(colors.yellow.400);
--cyber-red: theme(colors.red.400);
```

### Adding New shadcn/ui Components

1. Install component: `npx shadcn@latest add [component-name]`
2. Enhance with cyberpunk styling in `/src/components/ui/`
3. Add cyber theme support if needed
4. Update TypeScript types for theme variants
5. Test with existing cyberpunk color system

## Tailwind CSS v4.1 Modern Features

### Advanced @theme Directive Implementation

The project leverages Tailwind CSS v4.1's enhanced `@theme inline` directive for sophisticated theme management:

### Modern CSS Features Integration

**1. Color Management with OKLCH**

- Enhanced color mixing using `color-mix(in oklch, ...)` for perceptually uniform transparency
- Superior gradient rendering and better color interpolation
- Improved accessibility with consistent luminance scaling

**2. CSS Layers for Organization**

```css
@layer base, components, utilities, animations;
```

- Explicit cascade control for better maintainability
- Clear separation of base styles, components, utilities, and animations
- Prevents specificity conflicts and improves debugging

**3. Container Queries Support**

- Component-based responsive design independent of viewport
- Better encapsulation for modular components
- Future-proof layout patterns

**4. Modern Viewport Units**

- `dvh` (dynamic viewport height) for mobile-first design
- `svh` (small viewport height) for consistent minimum heights
- Better mobile browser compatibility

## Hooks Architecture

### Custom Hooks (17 total)

**Core Game Hooks:**
- **useGameControls**: Piece movement and rotation logic
- **useGameLoop**: Combines keyboard, timer, and drop logic
- **useGameTimer**: Animation-based timer system
- **useSounds**: Audio management with fallback chain
- **useKeyBindings**: Keyboard input handling
- **useGameEndDetection**: Game over detection with toast notifications

**System Hooks:**
- **useHighScoreManager**: Auto-detection on game end
- **useSession**: Unified session management
- **useTheme**: Dynamic CSS variable updates
- **useSettings**: Settings management and persistence
- **useAudio**: Audio system integration
- **useAccessibilityFilters**: Accessibility feature management
- **useAnimationTimer**: Animation loop management
- **useDropTimeCalculator**: Dynamic difficulty calculation
- **useMobileDetection**: Device type detection
- **useSystemPreferences**: OS-level preference detection
- **useHighScoreUtils**: High score calculation utilities

## Testing Strategy

- **Test Framework**: Vitest with React Testing Library
- **Environment**: JSDOM for browser API simulation
- **Unit Tests**: Pure functions (tetrisUtils, statisticsUtils)
- **Component Tests**: React Testing Library with JSDOM
- **Integration Tests**: Zustand store testing with mock scenarios
- **Performance Tests**: Memory and rendering optimization validation
- **Coverage**: 289 tests across 21 files, 100% passing with Vitest

### Vitest Configuration

```bash
# Run specific test patterns
pnpm test tetris           # Run tests matching "tetris"
pnpm test src/test/hooks   # Run hook tests
pnpm test --ui             # Run with Vitest UI
```

**Test Files Structure**: Located in `src/test/` with corresponding `*.test.ts` files

## Performance Optimizations

1. **React 19.1 + Compiler Optimizations**

   - **React Compiler**: Automatic memoization and optimization
   - **Optimized Manual Memoization**: 40+ useMemo/useCallback instances reduced to 12 critical cases
   - **Intelligent Caching**: Compiler-driven performance optimization
   - **Modern React Features**: use() API for better async handling

2. **Memory Management**

   - Object pooling for particles and audio
   - Selective board rendering (partial updates)
   - useRef for animation state

3. **Rendering Optimization**

   - React.memo on all components
   - Individual Zustand selectors
   - Lazy loading for settings tabs
   - React Compiler automatic optimizations

4. **Animation Performance**
   - Unified RAF management
   - FPS limiting and frame skipping
   - Performance monitoring

## Type Safety

- **Strict TypeScript**: No `any` types, comprehensive interfaces
- **Branded Types**: Type-safe IDs (HighScoreId, ThemeId)
- **Runtime Guards**: 26 validation functions for JSON/API boundaries
- **Event Types**: Strict typing for keyboard and touch events

## Internationalization

- **i18next**: Full EN/JA support with React integration
- **Dynamic Loading**: Browser language detection
- **Component Integration**: All UI text internationalized
- **Accessibility**: ARIA labels and announcements

### Dual Store Architecture

The i18n system uses two complementary stores:

1. **languageStore**: Primary i18n state management

   - Manages current language selection
   - Integrates with i18next for translations
   - Persists language preference to localStorage
   - Handles initialization and language switching

2. **localeStore**: Locale-specific configurations
   - Date format settings per locale
   - RTL language support (prepared for future expansion)
   - HTML lang attribute management
   - Browser language detection with fallback

## Code Quality & Linting

### Current Linting & Formatting Strategy

- **Development**: Biome-only for all code quality checks
- **Pre-commit**: Biome format check + lint via lint-staged
- **CI/CD**: Biome in build pipeline for fast validation
- **Editor Integration**: Biome extension for real-time feedback
- **Tetris-Specific**: Customized rules for game grid patterns and UI components

## Build Configuration

### React Router 7 + Vite Optimization

- **React Compiler**: Enabled for automatic optimization in Vite
- **Bundle Analyzer**: Integrated for size analysis (`pnpm analyze`)
- **Compiler Options**: Console.log removal in production (keeps warn/error)
- **Package Optimization**: Optimized imports for zustand, immer, react
- **Security Headers**: CSP + 10 security headers via Vercel configuration

### Build Configuration

**Vite Optimization**:
- Standard React plugin with babel-plugin-react-compiler
- Automatic code splitting and lazy loading
- Pre-compression with gzip and brotli
- Asset fingerprinting for cache optimization

**React Compiler Benefits:**
- Automatic memoization without manual optimization
- Intelligent re-rendering control
- Reduced bundle size through optimized compilation
- Better performance with zero developer overhead

### Tailwind CSS v4.1 Configuration

- **PostCSS Integration**: Uses `@tailwindcss/postcss` v4.1.10 for optimal performance
- **No Config File Required**: Leverages v4's configuration-free approach
- **CSS Import Method**: Direct `@import 'tailwindcss';` in globals.css
- **Enhanced @theme Directive**: Utilizes inline theme definitions with CSS variables
- **Modern CSS Features**:
  - OKLCH color space for better color mixing
  - CSS clamp() for fluid typography
  - Container queries for component-based responsive design
  - CSS layers for organized cascade management
  - Modern viewport units (dvh, svh, lvh)

**ES2024 Features Available:**

- Modern Array and Object methods
- Advanced Promise handling
- Enhanced String manipulation APIs
- Improved Regular Expression features
- SharedArrayBuffer and advanced ArrayBuffer operations
- Latest Collection (Set/Map) enhancements

## Important Notes

- Package manager: pnpm (required)
- React version: 19.1.0 with React Compiler enabled
- UI Components: shadcn/ui + cyberpunk theme (use CyberCard, Button, Tabs, Slider)
- Comments and commits: English only
- Linting: Biome only (Oxlint removed, ESLint removed for performance)
- Build before commit: Always run `pnpm build`
- Git hooks: Pre-commit checks via Husky
- Performance: Let React Compiler handle optimization automatically

## Development Workflow

**🚨 MANDATORY: Before any development, read the [React Development Guidelines](./docs/REACT_DEVELOPMENT_GUIDELINES.md)**

### Adding a New Feature

1. **Review Guidelines**: Check [React Development Guidelines](./docs/REACT_DEVELOPMENT_GUIDELINES.md) for patterns and best practices
2. Check existing patterns in similar components (follow MVC/hooks architecture)
3. Use appropriate Zustand stores (`gameStateStore`, `settingsStore`, etc.)
4. Follow TypeScript strict mode (no `any` types)
5. **React Compiler Best Practices**: Avoid manual useMemo/useCallback unless necessary
6. Let React Compiler handle optimization automatically
7. Add comprehensive tests in `src/test/`
8. Run `pnpm quality:check` before committing

### React Compiler Guidelines

**DO:**

- Write clean, readable code without premature optimization
- Use standard React patterns and let the compiler optimize
- Focus on component logic rather than performance concerns
- Trust the compiler for automatic memoization
- You should check the latest Next.js, Node.js, and other libraries with `use context7` MCP.
- You can use web search including `use brave-search` MCP to search the latest solution.

**DON'T:**

- Add manual useMemo/useCallback unless absolutely necessary
- Over-optimize code that the compiler handles better
- Use complex dependency arrays for simple computations
- Assume manual optimization is always faster

### 🚨 Guideline Conflicts & Escalation

**If development guidelines cause implementation issues:**

1. **STOP** - Do not proceed with workarounds
2. **DOCUMENT** - Capture the specific issue and context
3. **ASK** - Present the conflict to the user with:
   - Which guideline was being followed
   - Exact error/issue encountered
   - Proposed alternative solution
   - Request for guidance on how to proceed

**Examples of when to escalate:**

- TypeScript strict mode preventing valid patterns
- React Compiler optimization causing performance regressions
- Zustand patterns conflicting with Next.js requirements
- Testing strategies failing with specific components

Remember: Guidelines are meant to help, not hinder development. When they conflict with practical needs, user input is essential for resolution.

## Production Monitoring & Security

### 🔍 Sentry Error Tracking

The project includes comprehensive error monitoring for production environments:

**Features:**
- Real-time error tracking with React Router 7 integration
- Game-specific error categorization (audio, performance, UI)
- User feedback collection and context capture
- Performance monitoring with automatic optimization detection
- Session replay for error reproduction

**Usage:**
```typescript
// Game-specific error tracking
GameSentry.captureGameError(error, { type: 'game_logic', level: currentLevel });
GameSentry.captureAudioError(error, audioStrategy);
GameSentry.capturePerformanceIssue('High memory usage detected');
```

**Configuration:**
- Automatic initialization in production (`src/utils/sentry.ts`)
- Environment-based filtering (localhost requests ignored)
- Sample rates: 10% for traces, 10% for profiling
- Audio gesture errors automatically filtered

### 🛡️ Security Implementation

**Content Security Policy (CSP):**
- Strict CSP for production environments
- Development-friendly policies for HMR
- Frame-ancestors protection against clickjacking
- Upgrade-insecure-requests for HTTPS enforcement

**Security Headers:**
- X-XSS-Protection: Browser XSS filtering
- X-Content-Type-Options: MIME type sniffing prevention
- X-Frame-Options: Clickjacking protection
- Referrer-Policy: Information leakage control
- Permissions-Policy: Feature access restrictions

**Attack Prevention:**
- Rate limiting (100 requests/minute per IP)
- Suspicious request pattern detection
- Automatic IP blocking for malicious behavior
- SQL injection and XSS pattern recognition

**Implementation:**
```typescript
// Automatic security middleware in entry.server.tsx
const securityResponse = securityMiddleware(request);
applySecurityHeaders(responseHeaders, environment);
```

### 🚀 Vercel Production Optimization

**Optimized Configuration:**
- React Router 7 serverless function setup
- Static asset caching (1 year TTL)
- Multi-region deployment support
- Automatic security header injection

**Performance Features:**
- CDN caching for all static assets
- gzip/brotli compression (70% size reduction)
- Image optimization with modern formats
- Bundle splitting for optimal loading

**Environment Management:**
- 75 environment variables documented
- Separate dev/staging/production configs
- Sentry integration variables
- Security and monitoring toggles

## Future Feature Roadmap

The current architecture is designed to support future expansion with minimal refactoring. Key architectural foundations include:

### 🟢 High Priority Features (1-3 months)

1. **Custom Control Schemes**

   - Fully remappable keys
   - Multiple control profiles
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

