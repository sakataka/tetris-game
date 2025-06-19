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
- **Build**: Vite 6.3.5 + TypeScript ES2024
- **State**: Zustand 5 (15 stores)
- **UI**: shadcn/ui + Tailwind CSS v4.1 + Cyberpunk theme
- **Package Manager**: pnpm (required)
- **Quality**: Biome (linting/formatting) + Husky pre-commit

### Bundle Performance
- **Production Build**: 322.02 kB (gzip: 95.68 kB)
- **Components**: 60 total (40 game + 20 shadcn/ui)
- **Tests**: 349 tests across 24 files (Vitest)

## Key Architecture Patterns

### 1. Component Structure

### 2. State Management

### 3. Audio System (Strategy Pattern)

### 4. UI Components (shadcn/ui + Cyberpunk)


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

## Critical Systems

### Error Handling


### Internationalization


### Audio System


### Performance

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

- **Package Manager**
- **React Version**:
- **Comments/Commits**: English only for source code
- **Pre-commit**:
- **Pre-push**: 
- **Performance**:
- **Testing**: 

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
