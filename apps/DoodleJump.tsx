import React, { useRef, useEffect, useState } from 'react';

export const DoodleJump: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game Constants
        const GRAVITY = 0.4;
        const JUMP_FORCE = -10;
        const PLAYER_SIZE = 40;
        const PLATFORM_WIDTH = 60;
        const PLATFORM_HEIGHT = 15;

        // State
        let player = { x: 200, y: 300, vx: 0, vy: 0 };
        let platforms: {x: number, y: number}[] = [];
        let scoreVal = 0;
        let running = true;
        let keys: {[key: string]: boolean} = {};
        let cameraY = 0;

        // Init Platforms
        for (let i = 0; i < 7; i++) {
            platforms.push({
                x: Math.random() * (400 - PLATFORM_WIDTH),
                y: 600 - i * 100
            });
        }
        // Ensure starting platform under player
        platforms[0] = { x: 180, y: 500 };

        const update = () => {
            if (!running) return;

            // Controls
            if (keys['ArrowLeft']) player.vx = -5;
            else if (keys['ArrowRight']) player.vx = 5;
            else player.vx = 0;

            // Physics
            player.x += player.vx;
            player.vy += GRAVITY;
            player.y += player.vy;

            // Screen Wrap
            if (player.x > 400) player.x = -PLAYER_SIZE;
            else if (player.x < -PLAYER_SIZE) player.x = 400;

            // Camera Scroll (Move platforms down)
            if (player.y < 300) {
                const diff = 300 - player.y;
                player.y = 300;
                scoreVal += Math.floor(diff);
                setScore(scoreVal);
                
                platforms.forEach(p => {
                    p.y += diff;
                    // Recycle platforms
                    if (p.y > 600) {
                        p.y = 0;
                        p.x = Math.random() * (400 - PLATFORM_WIDTH);
                    }
                });
            }

            // Collision with Platforms (Only when falling)
            if (player.vy > 0) {
                platforms.forEach(p => {
                    if (
                        player.x + PLAYER_SIZE * 0.8 > p.x && 
                        player.x + PLAYER_SIZE * 0.2 < p.x + PLATFORM_WIDTH &&
                        player.y + PLAYER_SIZE > p.y && 
                        player.y + PLAYER_SIZE < p.y + PLATFORM_HEIGHT + 10
                    ) {
                        player.vy = JUMP_FORCE;
                    }
                });
            }

            // Game Over
            if (player.y > 600) {
                running = false;
                setGameOver(true);
            }
        };

        const draw = () => {
            if (!ctx) return;
            // Background
            ctx.fillStyle = '#fdf6e3'; // Solarized light bg
            ctx.fillRect(0, 0, 400, 600);
            
            // Grid paper effect
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for(let i=0; i<400; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,600); ctx.stroke(); }
            for(let i=0; i<600; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke(); }

            // Platforms
            ctx.fillStyle = '#859900'; // Green
            platforms.forEach(p => {
                ctx.fillRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
                // Detail
                ctx.fillStyle = '#758800';
                ctx.fillRect(p.x + 2, p.y + 2, PLATFORM_WIDTH - 4, PLATFORM_HEIGHT - 4);
                ctx.fillStyle = '#859900';
            });

            // Player (Doodle style)
            ctx.fillStyle = '#268bd2'; // Blue body
            ctx.beginPath();
            ctx.rect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(player.x + 5, player.y + 10, 10, 10);
            ctx.fillRect(player.x + 25, player.y + 10, 10, 10);
            ctx.fillStyle = 'black';
            ctx.fillRect(player.x + 8, player.y + 13, 4, 4);
            ctx.fillRect(player.x + 28, player.y + 13, 4, 4);

            // Legs
            ctx.strokeStyle = '#268bd2';
            ctx.lineWidth = 4;
            if (player.vy < 0) { // Jumping
                 ctx.beginPath(); ctx.moveTo(player.x + 5, player.y + 40); ctx.lineTo(player.x + 5, player.y + 45); ctx.stroke();
                 ctx.beginPath(); ctx.moveTo(player.x + 35, player.y + 40); ctx.lineTo(player.x + 35, player.y + 45); ctx.stroke();
            } else {
                 ctx.beginPath(); ctx.moveTo(player.x + 5, player.y + 40); ctx.lineTo(player.x + 5, player.y + 35); ctx.stroke();
                 ctx.beginPath(); ctx.moveTo(player.x + 35, player.y + 40); ctx.lineTo(player.x + 35, player.y + 35); ctx.stroke();
            }

            requestAnimationFrame(() => {
                update();
                draw();
            });
        };

        draw();

        const handleKey = (e: KeyboardEvent) => { keys[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            running = false;
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameOver]); // Re-run if game over status changes (to restart logic if we added restart here)

    return (
        <div className="h-full bg-[#fdf6e3] flex flex-col items-center justify-center font-mono relative overflow-hidden">
            <canvas ref={canvasRef} width={400} height={600} className="bg-white shadow-xl rounded" />
            
            <div className="absolute top-4 left-4 bg-yellow-300 px-3 py-1 rounded text-yellow-900 font-bold shadow-md border border-yellow-400">
                SCORE: {score}
            </div>

            {gameOver && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">GAME OVER</h2>
                    <div className="bg-white p-6 rounded-xl shadow-2xl text-center transform scale-110">
                         <p className="text-gray-500 text-sm mb-1">Final Score</p>
                         <p className="text-3xl font-bold text-blue-600 mb-6">{score}</p>
                         <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold shadow-lg active:scale-95 transition-all">
                             Try Again
                         </button>
                         <p className="text-[10px] text-gray-400 mt-2">(Close/Reopen app to restart safely)</p>
                    </div>
                </div>
            )}
        </div>
    );
};