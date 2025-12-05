
import React, { useState, useEffect, useRef } from 'react';
import { WindowState } from '../types';
import { X, Minus, Square, Copy } from 'lucide-react';
import { playSound } from '../services/soundService';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, w: number, h: number) => void;
}

// Optimization: Use React.memo to prevent re-renders of the content when dragging
export const Window = React.memo<WindowProps>(({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  updatePosition,
  updateSize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const [isMounting, setIsMounting] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);

  // Mount animation trigger
  useEffect(() => {
    // Force layout reflow before starting animation
    if(windowRef.current) {
        // void windowRef.current.offsetWidth; 
    }
    const timer = setTimeout(() => setIsMounting(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    e.stopPropagation();
    onFocus(window.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Using requestAnimationFrame could make it even smoother, but React 18 auto-batching handles this well
        updatePosition(window.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, window.id, updatePosition]);

  // Close Handler with Animation
  const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      playSound('close'); 
      setIsClosing(true);
      setTimeout(() => onClose(window.id), 200);
  };

  // Determine styles based on state
  const isTransitioning = !isDragging && !isResizing;
  
  const style: React.CSSProperties = {
    zIndex: window.zIndex,
    // Only transition if not dragging (prevents lag)
    transition: isTransitioning ? 'top 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.3s ease, height 0.3s ease' : 'none',
    // Geometry
    ...(window.isMaximized 
      ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', borderRadius: 0 } 
      : { top: window.y, left: window.x, width: window.width, height: window.height, borderRadius: '0.75rem' }
    ),
    // Performance optimization for moving elements
    willChange: isDragging ? 'top, left' : 'auto',
  };

  // CSS Classes for visual states (Animation)
  let animationClasses = 'scale-100 opacity-100';
  let pointerEvents = 'pointer-events-auto';

  if (isMounting) {
      animationClasses = 'scale-95 opacity-0 translate-y-4';
  } else if (isClosing) {
      animationClasses = 'scale-90 opacity-0 translate-y-4';
      pointerEvents = 'pointer-events-none';
  } else if (window.isMinimized) {
      animationClasses = 'scale-75 opacity-0 translate-y-24';
      pointerEvents = 'pointer-events-none';
  }

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${animationClasses} ${pointerEvents}`}
      style={style}
      onMouseDown={() => !window.isMinimized && onFocus(window.id)}
    >
      {/* Title Bar */}
      <div
        className="h-10 flex items-center justify-between px-4 bg-white/5 border-b border-white/5 select-none shrink-0"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => {
            if(!window.isMaximized) playSound('click');
            onMaximize(window.id);
        }}
      >
        <div className="flex items-center gap-3 text-xs font-medium text-gray-300">
          <window.icon size={16} className="text-blue-400 drop-shadow" />
          <span className="tracking-wide">{window.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); playSound('click'); onMinimize(window.id); }} 
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors group"
          >
            <Minus size={14} className="group-hover:scale-110 transition-transform"/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); playSound('click'); onMaximize(window.id); }} 
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors group"
          >
            {window.isMaximized ? <Copy size={14} className="rotate-180"/> : <Square size={14} />}
          </button>
          <button 
            onClick={handleClose} 
            className="p-1.5 hover:bg-red-500/80 rounded-md text-gray-400 hover:text-white transition-colors group ml-1"
          >
            <X size={14} className="group-hover:scale-110 transition-transform"/>
          </button>
        </div>
      </div>

      {/* Window Content - Preserved even when minimized to maintain state */}
      <div className="flex-1 overflow-hidden relative bg-slate-950/50">
        {window.component}
      </div>
      
      {/* Resizer Handle */}
      {!window.isMaximized && (
        <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1"
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsResizing(true);
                const startX = e.clientX;
                const startY = e.clientY;
                const startW = window.width;
                const startH = window.height;
                
                const handleResize = (moveEvent: MouseEvent) => {
                    requestAnimationFrame(() => {
                        updateSize(window.id, Math.max(300, startW + (moveEvent.clientX - startX)), Math.max(200, startH + (moveEvent.clientY - startY)));
                    });
                };
                const stopResize = () => {
                    setIsResizing(false);
                    document.removeEventListener('mousemove', handleResize);
                    document.removeEventListener('mouseup', stopResize);
                };
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
            }}
        >
             <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 rounded-br-[1px]"></div>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
    // Custom comparison for memo
    return prev.window.x === next.window.x && 
           prev.window.y === next.window.y && 
           prev.window.width === next.window.width && 
           prev.window.height === next.window.height &&
           prev.window.zIndex === next.window.zIndex &&
           prev.window.isOpen === next.window.isOpen &&
           prev.window.isMinimized === next.window.isMinimized &&
           prev.window.isMaximized === next.window.isMaximized;
});
