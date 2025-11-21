import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type Point = { x: number, y: number };

export const Game: React.FC = () => {
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 15 });
    const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const gameLoopRef = useRef<number | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    const moveSnake = useCallback(() => {
        if (gameOver) return;

        setSnake(prev => {
            const newHead = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
            
            // Check collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || 
                prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true);
                return prev;
            }

            const newSnake = [newHead, ...prev];
            
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 1);
                setFood({
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                });
            } else {
                newSnake.pop();
            }
            return newSnake;
        });
    }, [dir, food, gameOver]);

    useEffect(() => {
        gameLoopRef.current = window.setInterval(moveSnake, 150);
        return () => clearInterval(gameLoopRef.current);
    }, [moveSnake]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': if (dir.y === 0) setDir({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (dir.y === 0) setDir({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (dir.x === 0) setDir({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (dir.x === 0) setDir({ x: 1, y: 0 }); break;
            }
        };
        // Add event listener to document to catch global keys when focused, but check valid focus
        // For this demo, we'll attach to window but maybe should attach to div and focus div
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dir]);

    const reset = () => {
        setSnake([{ x: 10, y: 10 }]);
        setDir({ x: 1, y: 0 });
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="h-full bg-black flex flex-col items-center justify-center text-white font-mono" tabIndex={0} ref={containerRef}>
            <div className="mb-4 text-xl">Score: {score}</div>
            <div 
                style={{ 
                    width: GRID_SIZE * CELL_SIZE, 
                    height: GRID_SIZE * CELL_SIZE,
                    position: 'relative',
                    border: '2px solid #333'
                }}
                className="bg-gray-900"
            >
                {snake.map((seg, i) => (
                    <div 
                        key={i}
                        style={{
                            position: 'absolute',
                            left: seg.x * CELL_SIZE,
                            top: seg.y * CELL_SIZE,
                            width: CELL_SIZE - 1,
                            height: CELL_SIZE - 1,
                            backgroundColor: i === 0 ? '#4ade80' : '#22c55e'
                        }}
                    />
                ))}
                <div 
                    style={{
                        position: 'absolute',
                        left: food.x * CELL_SIZE,
                        top: food.y * CELL_SIZE,
                        width: CELL_SIZE - 1,
                        height: CELL_SIZE - 1,
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                    }}
                />
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                        <h2 className="text-2xl text-red-500 mb-4">GAME OVER</h2>
                        <button onClick={reset} className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded">
                            Play Again
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-4 text-xs text-gray-500">Use Arrow Keys to Move</div>
        </div>
    );
};