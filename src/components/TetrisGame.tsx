'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types/tetris';
import { 
  createEmptyBoard,
  getRandomTetromino,
  rotatePiece,
  isValidPosition,
  placePiece,
  clearLines,
  createParticles
} from '../utils/tetrisUtils';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';

const INITIAL_DROP_TIME = 1000;

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: getRandomTetromino(),
    nextPiece: getRandomTetromino(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    lineEffect: {
      flashingLines: [],
      shaking: false,
      particles: []
    }
  }));

  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME);

  const updateParticles = useCallback((newParticles: typeof gameState.lineEffect.particles) => {
    setGameState(prevState => ({
      ...prevState,
      lineEffect: {
        ...prevState.lineEffect,
        particles: newParticles
      }
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: getRandomTetromino(),
      nextPiece: getRandomTetromino(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isPaused: false,
      lineEffect: {
        flashingLines: [],
        shaking: false,
        particles: []
      }
    });
    setDropTime(INITIAL_DROP_TIME);
  }, []);

  const movePiece = useCallback((dir: { x: number; y: number }) => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      const newPosition = {
        x: prevState.currentPiece.position.x + dir.x,
        y: prevState.currentPiece.position.y + dir.y
      };

      if (isValidPosition(prevState.board, prevState.currentPiece, newPosition)) {
        return {
          ...prevState,
          currentPiece: {
            ...prevState.currentPiece,
            position: newPosition
          }
        };
      }

      if (dir.y > 0) {
        // Piece hit bottom, place it
        const newBoard = placePiece(prevState.board, prevState.currentPiece);
        const { newBoard: clearedBoard, linesCleared, linesToClear } = clearLines(newBoard);
        
        const newLines = prevState.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        const newScore = prevState.score + 
          (linesCleared * 100 * newLevel) + 
          (linesCleared === 4 ? 300 * newLevel : 0); // Tetris bonus

        const nextPiece = getRandomTetromino();
        
        // ライン消去アニメーション効果
        let newLineEffect = { ...prevState.lineEffect };
        if (linesCleared > 0) {
          newLineEffect = {
            flashingLines: linesToClear,
            shaking: true,
            particles: [
              ...prevState.lineEffect.particles,
              ...createParticles(linesToClear, newBoard)
            ]
          };
          
          // アニメーション後にエフェクトをリセット
          setTimeout(() => {
            setGameState(currentState => ({
              ...currentState,
              lineEffect: {
                ...currentState.lineEffect,
                flashingLines: [],
                shaking: false
              }
            }));
          }, 300);
        }
        
        // Check if game is over
        if (!isValidPosition(clearedBoard, prevState.nextPiece!, prevState.nextPiece!.position)) {
          return {
            ...prevState,
            board: clearedBoard,
            gameOver: true,
            score: newScore,
            level: newLevel,
            lines: newLines,
            lineEffect: newLineEffect
          };
        }

        return {
          ...prevState,
          board: clearedBoard,
          currentPiece: prevState.nextPiece,
          nextPiece: nextPiece,
          score: newScore,
          level: newLevel,
          lines: newLines,
          lineEffect: newLineEffect
        };
      }

      return prevState;
    });
  }, []);

  const rotatePieceClockwise = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      const rotatedPiece = rotatePiece(prevState.currentPiece);
      
      if (isValidPosition(prevState.board, rotatedPiece, rotatedPiece.position)) {
        return {
          ...prevState,
          currentPiece: rotatedPiece
        };
      }

      return prevState;
    });
  }, []);

  const dropPiece = useCallback(() => {
    movePiece({ x: 0, y: 1 });
  }, [movePiece]);

  const hardDrop = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      let dropY = prevState.currentPiece.position.y;
      while (isValidPosition(prevState.board, prevState.currentPiece, { 
        x: prevState.currentPiece.position.x, 
        y: dropY + 1 
      })) {
        dropY++;
      }

      const droppedPiece = {
        ...prevState.currentPiece,
        position: { x: prevState.currentPiece.position.x, y: dropY }
      };

      const newBoard = placePiece(prevState.board, droppedPiece);
      const { newBoard: clearedBoard, linesCleared, linesToClear } = clearLines(newBoard);
      
      const newLines = prevState.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const newScore = prevState.score + 
        (linesCleared * 100 * newLevel) + 
        (linesCleared === 4 ? 300 * newLevel : 0) +
        (dropY - prevState.currentPiece.position.y) * 2; // Hard drop bonus

      const nextPiece = getRandomTetromino();
      
      // ライン消去アニメーション効果
      let newLineEffect = { ...prevState.lineEffect };
      if (linesCleared > 0) {
        newLineEffect = {
          flashingLines: linesToClear,
          shaking: true,
          particles: [
            ...prevState.lineEffect.particles,
            ...createParticles(linesToClear, newBoard)
          ]
        };
        
        // アニメーション後にエフェクトをリセット
        setTimeout(() => {
          setGameState(currentState => ({
            ...currentState,
            lineEffect: {
              ...currentState.lineEffect,
              flashingLines: [],
              shaking: false
            }
          }));
        }, 300);
      }
      
      if (!isValidPosition(clearedBoard, prevState.nextPiece!, prevState.nextPiece!.position)) {
        return {
          ...prevState,
          board: clearedBoard,
          gameOver: true,
          score: newScore,
          level: newLevel,
          lines: newLines,
          lineEffect: newLineEffect
        };
      }

      return {
        ...prevState,
        board: clearedBoard,
        currentPiece: prevState.nextPiece,
        nextPiece: nextPiece,
        score: newScore,
        level: newLevel,
        lines: newLines,
        lineEffect: newLineEffect
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused
    }));
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.key === 'Enter' || event.key === ' ') {
          resetGame();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          movePiece({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          movePiece({ x: 1, y: 0 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          movePiece({ x: 0, y: 1 });
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          rotatePieceClockwise();
          break;
        case ' ':
          event.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          togglePause();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, movePiece, rotatePieceClockwise, hardDrop, togglePause, resetGame]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const gameLoop = setInterval(() => {
      dropPiece();
    }, dropTime);

    return () => clearInterval(gameLoop);
  }, [dropPiece, dropTime, gameState.gameOver, gameState.isPaused]);

  // Update drop time based on level
  useEffect(() => {
    const newDropTime = Math.max(50, INITIAL_DROP_TIME - (gameState.level - 1) * 100);
    setDropTime(newDropTime);
  }, [gameState.level]);

  return (
    <div className="flex gap-8 items-start">
      <TetrisBoard 
        board={gameState.board}
        currentPiece={gameState.currentPiece}
        gameOver={gameState.gameOver}
        isPaused={gameState.isPaused}
        lineEffect={gameState.lineEffect}
        onParticleUpdate={updateParticles}
      />
      <GameInfo 
        score={gameState.score}
        level={gameState.level}
        lines={gameState.lines}
        nextPiece={gameState.nextPiece}
        gameOver={gameState.gameOver}
        isPaused={gameState.isPaused}
        onReset={resetGame}
        onTogglePause={togglePause}
      />
    </div>
  );
}