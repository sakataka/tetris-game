# CLAUDE.md

This file provides guidance to Claude Code when working with this React Router 7 + React 19.1 Tetris game.

## 🎯 Development Guidelines

**Critical Reference**: [React Development Guidelines](./docs/REACT_DEVELOPMENT_GUIDELINES.md)

### Core Principles
- **React Compiler First**: Let React 19.1 compiler handle optimization automatically
- **Zustand Individual Selectors**: Use specific selectors, avoid prop drilling
- **TypeScript Strict Mode**: No `any` types, comprehensive interfaces
- **shadcn/ui + Cyberpunk**: Use CyberCard, Button, Tabs, Slider components
- **English Comments/Commits**: All source code documentation in English

## Project Architecture

### Tech Stack
- **Framework**: React 19.1 + React Router 7.6.2 (SPA mode)
- **Build**: Vite 6.3.5 + TypeScript ES2024
- **State**: Zustand 5 (15 stores)
- **UI**: shadcn/ui + Tailwind CSS v4.1 + Cyberpunk theme
- **Package Manager**: pnpm (required)
- **Quality**: Biome (linting/formatting) + Husky pre-commit

### Bundle Performance
- **Production Build**: 322.02 kB (gzip: 95.68 kB)
- **Components**: 60 total (40 game + 20 shadcn/ui)
- **Tests**: 349 tests across 24 files (Vitest + Playwright)

## Key Architecture Patterns

### 1. Component Structure (3-Layer)
```
TetrisGame (Entry)
├── GameOrchestrator (Lifecycle)
├── GameLogicController (Business Logic)
│   ├── Zustand stores integration
│   ├── Audio system coordination
│   └── Game controls aggregation
└── GameLayoutManager (UI Layout)
    ├── Responsive layouts
    └── Component composition
```

### 2. State Management (Zustand)
**Core Stores:**
- `gameStateStore`: Game logic, piece movement, line clearing
- `settingsStore`: User preferences with localStorage persistence
- `audioStore`: Audio system state centralization
- `themeStore`: Theme management with cyberpunk variants
- `errorStore`: Error tracking with categorization and UI integration

**Accessibility Stores:**
- `accessibilityStore`, `cognitiveAccessibility`, `inputAccessibility`, `visualAccessibility`

**System Stores:**
- `statisticsStore`, `sessionStore`, `languageStore`, `localeStore`, `configStore`, `navigationStore`

### 3. Audio System (Strategy Pattern)
```
AudioManagerV2 (Coordinator)
├── WebAudioStrategy (Primary)
├── HTMLAudioStrategy (Fallback)
└── SilentStrategy (Silent mode)
```

**Error Suppression**: Three-layer system prevents audio loading/initialization errors from showing to users:
- ErrorHandler: Suppresses notifications for loading errors
- Console Logs: Filtered for development environment
- Toast Notifications: Filtered in ErrorToastAdapter

### 4. UI Components (shadcn/ui + Cyberpunk)
**Core Components:**
- `CyberCard`: Enhanced Card with 6 themes (cyan, purple, green, yellow, red, default)
- `Button`: Cyberpunk variants with neon effects
- `Tabs`: Navigation with accessibility support
- `Slider`: Volume/settings controls with neon styling

**Integration Pattern:**
```typescript
<CyberCard title="GAME STATS" theme="cyan" size="md">
  <Button variant="outline" className="border-cyber-cyan">
    Reset Settings
  </Button>
</CyberCard>
```

## Quick Commands

```bash
# Development
pnpm dev                # Vite dev server
pnpm build              # Production build
pnpm preview            # Preview build

# Quality
pnpm lint               # Biome linting
pnpm format             # Biome formatting
pnpm quality:check      # Full pipeline (lint + typecheck + test)

# Testing
pnpm test               # Vitest watch mode
pnpm test:e2e           # Playwright E2E tests
```

## Critical Systems

### Error Handling
- **ErrorStore**: Centralized error tracking with categories (audio, game, ui, etc.)
- **ErrorToastAdapter**: Filters audio errors from user notifications
- **Three-Layer Suppression**: ErrorHandler + Console + Toast filtering

### Internationalization
- **i18next**: EN/JA support with React integration
- **Dual Store**: `languageStore` + `localeStore` for comprehensive i18n
- **Component Integration**: All UI text uses `{t('key')}` pattern

### Audio System
- **Strategy Pattern**: WebAudio → HTMLAudio → Silent fallback
- **Error Suppression**: Loading/initialization errors hidden from users
- **Preloading**: Automatic sound preloading with progress tracking

### Performance
- **React Compiler**: Automatic optimization (40+ manual optimizations removed)
- **Object Pooling**: Particles and audio buffer reuse
- **Selective Rendering**: Board updates only changed cells
- **Bundle Splitting**: Automatic code splitting for optimal loading

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

## Development Workflow

### Adding Features
1. Check existing patterns in similar components
2. Use appropriate Zustand stores with individual selectors
3. Follow TypeScript strict mode (no `any`)
4. Let React Compiler handle optimization
5. Add tests in `src/test/`
6. Run `pnpm quality:check` before commit

### React Compiler Guidelines
**DO:**
- Write clean, readable code
- Use standard React patterns
- Trust compiler for memoization

**DON'T:**
- Add manual useMemo/useCallback unless critical
- Over-optimize code
- Assume manual optimization is faster

### Build Configuration
- **Vite**: React plugin with babel-plugin-react-compiler
- **Tailwind CSS v4.1**: PostCSS integration, no config file needed
- **TypeScript**: ES2024 target with strict mode
- **Security**: CSP headers via Vercel configuration

## Production Deployment

### Vercel Configuration
- **SPA Mode**: Static site generation with client-side routing
- **Security Headers**: CSP, XSS protection, frame options
- **Compression**: Brotli/gzip for 70% size reduction
- **Caching**: 1-year TTL for static assets

### Environment Variables
- **Sentry**: Error tracking (production only)
- **Audio**: File paths and configuration
- **Build**: React Compiler and optimization settings

## Important Notes

- **Package Manager**: pnpm required (not npm/yarn)
- **React Version**: 19.1.0 with React Compiler enabled
- **Comments/Commits**: English only for source code
- **Pre-commit**: Husky runs Biome format + lint + TypeScript check
- **Performance**: React Compiler handles optimization automatically
- **Testing**: Use React Testing Library + Vitest for component tests

## Future Architecture Considerations

The current architecture supports expansion with:
- **Controller Pattern**: Extensible for new game modes
- **Store Pattern**: Easy addition of new Zustand stores
- **Strategy Pattern**: Audio system can add new strategies
- **Component System**: shadcn/ui base for consistent UI expansion
- **Plugin Architecture**: Ready for modular feature additions

This architecture ensures maintainability, performance, and developer experience while providing a solid foundation for future enhancements.