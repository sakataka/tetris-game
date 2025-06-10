# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. Features a sophisticated Zustand-based state management system, comprehensive test coverage, and a unified cyberpunk visual design system.

**Status**: Complete - Ready for production deployment

## Development Commands

### Core Commands

```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build with type checking
pnpm start        # Production server
pnpm lint         # ESLint validation
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Test coverage report
```

### Development Notes

- Always run `pnpm build` before committing
- ESLint warnings about useCallback dependencies are intentional
- Package manager: pnpm (optimized with .npmrc)
- Test framework: Vitest with React Testing Library
- Commit message should also be in English when committing.

## Architecture Overview

### State Management (Zustand)

**Modular Store System** - Separation of concerns through divided store architecture:

- **gameStateStore.ts**: Game state (board, pieces, score, effects)
- **settingsStore.ts**: Settings management (volume, key bindings) + LocalStorage persistence
- **statisticsStore.ts**: Statistics & high score management (Top 10 rankings, extended metrics)
- **themeStore.ts**: Theme management (5 presets, custom colors, accessibility)
- **sessionStore.ts**: Session tracking & error management
- **errorStore.ts**: Global error handling
- **accessibilityStore.ts**: WCAG-compliant accessibility features

[... rest of the file remains unchanged ...]
