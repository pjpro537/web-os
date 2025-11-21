import React, { useRef, useEffect, useState } from 'react';

export const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Initialize canvas size
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#e0e0e0]">
        {/* Toolbar */}
        <div className="h-24 bg-[#f5f6f7] border-b border-gray-300 px-4 py-2 flex gap-6 shadow-sm items-center select-none">
            
            {/* Color Picker Section */}
            <div className="flex flex-col gap-2 items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Color</span>
                <div className="flex items-center gap-3">
                    {/* Visual Color Input */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow group cursor-pointer ring-2 ring-transparent hover:ring-blue-200">
                         <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer" 
                         />
                    </div>
                    
                    {/* Hex Input */}
                    <div className="flex flex-col">
                        <label className="text-[9px] text-gray-400 font-mono mb-0.5">HEX</label>
                        <input 
                           type="text" 
                           value={color} 
                           onChange={(e) => setColor(e.target.value)}
                           className="w-20 text-xs font-mono border border-gray-300 rounded px-2 py-1 uppercase focus:outline-none focus:border-blue-500 bg-white"
                           maxLength={7}
                        />
                    </div>
                </div>
            </div>

            <div className="w-[1px] bg-gray-300 h-14"></div>

            {/* Brush Size Section */}
            <div className="flex flex-col justify-center gap-2 items-center w-32">
                 <div className="flex justify-between w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Size</span>
                    <span className="text-[10px] text-gray-700 font-mono">{brushSize}px</span>
                 </div>
                 
                 <div className="flex items-center gap-3 w-full">
                    <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))} 
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
                    />
                    {/* Dynamic Brush Preview */}
                    <div className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-inner">
                        <div 
                            style={{ 
                                width: Math.min(24, Math.max(4, brushSize)), 
                                height: Math.min(24, Math.max(4, brushSize)), 
                                backgroundColor: color,
                                borderRadius: '50%'
                            }} 
                        />
                    </div>
                 </div>
            </div>

             <div className="w-[1px] bg-gray-300 h-14"></div>

             {/* Actions */}
             <div className="flex items-center">
                <button 
                    onClick={clearCanvas} 
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all shadow-sm flex flex-col items-center gap-1"
                >
                    <span>Clear Canvas</span>
                </button>
             </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 cursor-crosshair bg-gray-500 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDBoMTB2MTBIMTB6TTAgMTBoMTB2MTBIMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]">
             <canvas 
                ref={canvasRef} 
                onMouseDown={startDrawing} 
                onMouseMove={draw} 
                onMouseUp={stopDrawing} 
                onMouseLeave={stopDrawing}
                className="shadow-2xl bg-white cursor-crosshair"
             />
        </div>
    </div>
  );
};