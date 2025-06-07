# CLAUDE.md

必ず日本語で回答して下さい。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a Tetris game built with Next.js and TypeScript. The game is fully functional and includes all standard Tetris features.

## Development Setup

### Running the Development Server
```bash
cd tetris-game
npm run dev
```

### Building for Production
```bash
cd tetris-game
npm run build
```

### Linting
```bash
cd tetris-game
npm run lint
```

## Architecture

### Project Structure
- `src/app/` - Next.js app router pages
- `src/components/` - React components for the game
  - `TetrisGame.tsx` - Main game component with game logic
  - `TetrisBoard.tsx` - Game board display component
  - `GameInfo.tsx` - Score and control information component
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions for game logic

### Game Features
- Full Tetris gameplay with 7 tetromino types (I, O, T, S, Z, J, L)
- Ghost piece preview showing where the piece will land
- Line clearing with scoring system
- Level progression that increases game speed
- Keyboard controls (arrow keys, WASD, space for hard drop)
- Pause/resume functionality
- Game over detection and restart

### Controls
- Arrow keys or WASD: Move pieces
- Up arrow or W: Rotate piece clockwise
- Space: Hard drop
- P: Pause/resume
- R: Reset game
- Enter/Space: Restart after game over
