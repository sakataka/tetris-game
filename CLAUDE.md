# CLAUDE.md

必ず日本語で回答して下さい。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. The game is fully functional with modern React patterns using hooks and client-side state management.

## Development Setup

### Running the Development Server
```bash
cd tetris-game
npm run dev    # Uses Turbopack for faster development builds
```

### Building for Production
```bash
cd tetris-game
npm run build
```

### Production Server
```bash
cd tetris-game
npm run start
```

### Linting
```bash
cd tetris-game
npm run lint
```

## Architecture

### Core Game Logic Flow
The game follows a unidirectional data flow pattern:
1. **Game State** - Centralized in `TetrisGame.tsx` using `useState`
2. **Game Loop** - `useEffect` with `setInterval` for automatic piece dropping
3. **Input Handling** - Global keyboard event listeners for real-time controls
4. **Collision Detection** - Pure functions in `tetrisUtils.ts` for position validation
5. **Rendering** - Board state computed on each render with current piece overlay

### Key Game Systems
- **Piece Generation**: Random tetromino creation with standard shapes and colors
- **Movement Validation**: Boundary and collision checking before state updates
- **Line Clearing**: Row detection and removal with cascading gravity
- **Scoring System**: Points based on lines cleared, level multipliers, and hard drops
- **Level Progression**: Speed increases every 10 lines cleared

### State Management Pattern
All game state is managed in `TetrisGame.tsx` with immutable updates. Components receive props for display and callbacks for actions. No external state management library is used.

### TypeScript Architecture
- `GameState` interface defines the complete game state shape
- `Tetromino` interface encapsulates piece data with position and shape
- Utility functions are pure and type-safe for reliable game logic
- Enum-like constants for tetromino types ensure type safety

### Styling Approach
Uses Tailwind CSS with dynamic styles for game pieces. Board grid is CSS Grid with individual cell styling based on piece colors.
