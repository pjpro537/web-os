
import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../services/soundService';
import { X } from 'lucide-react';

// Using Sawara Tsuki's Kawaii Logotypes (Free for Dev use)
// Fallback or specific reliable anime character URL
const CHARACTER_IMG = "https://raw.githubusercontent.com/SAWARATSUKI/KawaiiLogos/main/Character/Sasara/Sasara_01.png";

const DIALOGUES = {
    morning: ["Good morning! ☀️", "Ready for a productive day?", "Don't forget breakfast!", "Let's write some code!"],
    afternoon: ["Staying focused? 💻", "Don't forget to hydrate!", "WebOS is running smoothly.", "You're doing great!"],
    evening: ["Working late? 🌙", "Almost time to relax.", "Look at the stars...", "Don't strain your eyes!"],
    night: ["Go to sleep! 😴", "It's really late...", "The bugs come out at night...", "Zzz..."],
    click: ["Hey! ✨", "Ticklish!", "I'm watching you!", "Ow!", "Need help?", "System stable!"]
};

export const DesktopCompanion: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    // Track mouse for "Look At" effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        
        // Initial Greeting
        const hour = new Date().getHours();
        let greeting = DIALOGUES.morning[0];
        if (hour >= 12 && hour < 18) greeting = DIALOGUES.afternoon[0];
        if (hour >= 18 && hour < 22) greeting = DIALOGUES.evening[0];
        if (hour >= 22 || hour < 5) greeting = DIALOGUES.night[0];
        
        showMessage(greeting, 5000);

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const showMessage = (text: string, duration = 3000) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMessage(text);
        timeoutRef.current = window.setTimeout(() => setMessage(null), duration);
    };

    const handleClick = () => {
        playSound('click');
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);

        // Pick random dialogue
        const r = Math.random();
        const hour = new Date().getHours();
        let list = DIALOGUES.click;
        
        // 30% chance to say time-specific stuff
        if (r > 0.7) {
            if (hour >= 5 && hour < 12) list = DIALOGUES.morning;
            else if (hour >= 12 && hour < 18) list = DIALOGUES.afternoon;
            else if (hour >= 18 && hour < 22) list = DIALOGUES.evening;
            else list = DIALOGUES.night;
        }

        const text = list[Math.floor(Math.random() * list.length)];
        showMessage(text);
    };

    if (!isVisible) return null;

    // Calculate facing direction
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const isLookingLeft = mousePos.x < centerX;
    
    // Parallax effect for "leaning"
    const leanX = rect ? (mousePos.x - centerX) / window.innerWidth * 15 : 0;
    const leanY = rect ? (mousePos.y - rect.top) / window.innerHeight * 5 : 0;

    return (
        <div 
            ref={containerRef}
            className="fixed bottom-12 right-4 z-[50] w-48 h-48 pointer-events-auto select-none flex flex-col items-center justify-end group"
            style={{ 
                transform: `translateY(${isHovered ? -5 : 0}px)`,
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
        >
            {/* Speech Bubble */}
            {message && (
                <div className="absolute bottom-full mb-2 bg-white text-black text-xs font-medium px-3 py-2 rounded-xl rounded-br-none shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 whitespace-nowrap border border-gray-100 max-w-[200px] text-center">
                    {message}
                    <div className="absolute -bottom-1.5 right-0 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 transform origin-center"></div>
                </div>
            )}

            {/* Character Container */}
            <div 
                className="relative cursor-pointer w-full h-full flex items-end justify-center"
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Close Button (Hidden unless hovered) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-50"
                >
                    <X size={10} />
                </button>

                {/* The Character */}
                <img 
                    src={CHARACTER_IMG} 
                    alt="Assistant"
                    className={`
                        w-40 h-auto object-contain drop-shadow-2xl filter transition-transform duration-200 will-change-transform
                        ${isBouncing ? 'animate-bounce' : 'animate-[float_6s_ease-in-out_infinite]'}
                    `}
                    style={{
                        transform: `
                            rotateY(${isLookingLeft ? 180 : 0}deg) 
                            rotateZ(${isLookingLeft ? -leanX : leanX}deg)
                            translateY(${leanY}px)
                            scale(1.1)
                        `,
                        // Add a glow effect
                        filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))'
                    }}
                    draggable={false}
                />
            </div>
            
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
};
