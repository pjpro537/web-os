import React, { useState, useEffect, useCallback } from 'react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // Z
  [[0, 1, 1], [1, 1, 0]]  // S
];

const COLORS = [
  '#00f0f0', // Cyan (I)
  '#f0f000', // Yellow (O)
  '#a000f0', // Purple (T)
  '#f0a000', // Orange (L)
  '#0000f0', // Blue (J)
  '#f00000', // Red (Z)
  '#00f000'  // Green (S)
];

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export const Tetris: React.FC = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [nextPiece, setNextPiece] = useState<any>(null);

  const getRandomPiece = () => {
    const typeIdx = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[typeIdx];
    return {
      shape,
      color: COLORS[typeIdx],
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
  };

  // Init game
  useEffect(() => {
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
  }, []);

  const checkCollision = (piece: any, moveX: number, moveY: number, newShape?: number[][]) => {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x + moveX;
          const newY = piece.y + y + moveY;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row: number[], y: number) => {
      row.forEach((value, x) => {
        if (value) {
            if (currentPiece.y + y >= 0) {
                newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        }
      });
    });

    // Check for lines
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++; // Check same row again
      }
    }

    if (linesCleared > 0) {
        setScore(s => s + (linesCleared * 100 * linesCleared));
    }

    setBoard(newBoard);
    
    // Game Over check happens on spawn
    const newItem = nextPiece;
    if (checkCollision(newItem, 0, 0)) {
        setGameOver(true);
    }
    setCurrentPiece(newItem);
    setNextPiece(getRandomPiece());
  };

  const move = useCallback((dirX: number, dirY: number) => {
    if (gameOver || paused || !currentPiece) return;
    if (!checkCollision(currentPiece, dirX, dirY)) {
      setCurrentPiece((prev: any) => ({ ...prev, x: prev.x + dirX, y: prev.y + dirY }));
    } else if (dirY > 0) {
      mergePiece();
    }
  }, [board, currentPiece, gameOver, paused, nextPiece]);

  const rotate = () => {
    if (gameOver || paused || !currentPiece) return;
    const newShape = currentPiece.shape[0].map((_: any, i: number) => 
      currentPiece.shape.map((row: any) => row[i]).reverse()
    );
    if (!checkCollision(currentPiece, 0, 0, newShape)) {
      setCurrentPiece((prev: any) => ({ ...prev, shape: newShape }));
    }
  };

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      move(0, 1);
    }, 800); // Speed
    return () => clearInterval(interval);
  }, [move]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (gameOver) return;
        switch(e.key) {
            case 'ArrowLeft': move(-1, 0); break;
            case 'ArrowRight': move(1, 0); break;
            case 'ArrowDown': move(0, 1); break;
            case 'ArrowUp': rotate(); break;
            case 'p': setPaused(p => !p); break;
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, gameOver]);

  const reset = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
  };

  return (
    <div className="h-full bg-[#111] flex flex-col items-center justify-center text-white font-mono select-none" tabIndex={0}>
        <div className="flex gap-8">
            <div className="border-4 border-gray-700 bg-black relative">
                {board.map((row, y) => (
                    <div key={y} className="flex">
                        {row.map((cell, x) => {
                            let color = cell;
                            // Overlay Active Piece
                            if (!color && currentPiece) {
                                const py = y - currentPiece.y;
                                const px = x - currentPiece.x;
                                if (py >= 0 && py < currentPiece.shape.length && px >= 0 && px < currentPiece.shape[0].length) {
                                    if (currentPiece.shape[py][px]) color = currentPiece.color;
                                }
                            }
                            return (
                                <div 
                                    key={`${x}-${y}`} 
                                    style={{ 
                                        width: BLOCK_SIZE, 
                                        height: BLOCK_SIZE, 
                                        backgroundColor: color || '#1a1a1a',
                                        border: color ? '1px solid rgba(0,0,0,0.2)' : '1px solid #222'
                                    }} 
                                />
                            );
                        })}
                    </div>
                ))}

                {(gameOver || paused) && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold mb-4">{gameOver ? 'GAME OVER' : 'PAUSED'}</h2>
                        {gameOver && (
                            <button onClick={reset} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold">
                                RESTART
                            </button>
                        )}
                        {paused && !gameOver && (
                            <button onClick={() => setPaused(false)} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold">
                                RESUME
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6 w-32">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">SCORE</div>
                    <div className="text-xl font-bold text-yellow-400">{score}</div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-4">NEXT</div>
                    <div className="grid gap-[1px] bg-transparent">
                        {nextPiece && nextPiece.shape.map((row: number[], y: number) => (
                             <div key={y} className="flex">
                                 {row.map((val, x) => (
                                     <div 
                                        key={x} 
                                        style={{ 
                                            width: 15, 
                                            height: 15, 
                                            backgroundColor: val ? nextPiece.color : 'transparent' 
                                        }} 
                                     />
                                 ))}
                             </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-gray-500 space-y-2">
                    <p>↑ Rotate</p>
                    <p>← → Move</p>
                    <p>↓ Drop</p>
                </div>
            </div>
        </div>
    </div>
  );
};