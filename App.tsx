
import React, { useState, useEffect } from 'react';
import { WindowState, AppDefinition, BootState } from './types';
import { Window } from './components/Window';
import { Terminal as TerminalIcon, FileText, Image as ImageIcon, LayoutGrid, Power, Gamepad, Settings as SettingsIcon, RefreshCw, FolderPlus, Monitor } from 'lucide-react';
import { Notepad } from './apps/Notepad';
import { Terminal } from './apps/Terminal';
import { Explorer } from './apps/Explorer';
import { Paint } from './apps/Paint';
import { Game } from './apps/Game';
import { Settings } from './apps/Settings';
import { playSound } from './services/soundService';

// App Definitions
const APPS: AppDefinition[] = [
  { 
    id: 'explorer', 
    name: 'File Explorer', 
    icon: LayoutGrid, 
    component: Explorer, 
    defaultWidth: 800, 
    defaultHeight: 500, 
    description: 'Navigate your digital files, organize documents, and manage your system data efficiently.' 
  },
  { 
    id: 'terminal', 
    name: 'Terminal', 
    icon: TerminalIcon, 
    component: Terminal, 
    defaultWidth: 600, 
    defaultHeight: 400, 
    description: 'Advanced command line interface featuring an integrated AI-powered Python environment.' 
  },
  { 
    id: 'notepad', 
    name: 'Notepad', 
    icon: FileText, 
    component: Notepad, 
    defaultWidth: 500, 
    defaultHeight: 400, 
    description: 'A lightweight, distraction-free text editor for all your note-taking and coding needs.' 
  },
  { 
    id: 'paint', 
    name: 'Paint', 
    icon: ImageIcon, 
    component: Paint, 
    defaultWidth: 700, 
    defaultHeight: 500, 
    description: 'Unleash your creativity with a versatile digital canvas and artistic tools.' 
  },
  { 
    id: 'game', 
    name: 'Snake', 
    icon: Gamepad, 
    component: Game, 
    defaultWidth: 450, 
    defaultHeight: 500, 
    description: 'Experience the nostalgia of the classic Snake game. Eat, grow, and survive!' 
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: SettingsIcon, 
    component: Settings, 
    defaultWidth: 900, 
    defaultHeight: 600, 
    description: 'Personalize your experience and configure system preferences.' 
  },
];

const App = () => {
  const [bootState, setBootState] = useState<BootState>(BootState.OFF);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80');
  
  // Tooltip State
  const [hoveredApp, setHoveredApp] = useState<AppDefinition | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean, x: number, y: number }>({ isOpen: false, x: 0, y: 0 });

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePowerOn = () => {
    playSound('boot');
    setBootState(BootState.BOOTING);
    setTimeout(() => setBootState(BootState.LOGIN), 4000);
  };

  const handleLogin = () => {
    playSound('login');
    setBootState(BootState.DESKTOP);
  };

  const handlePowerOff = () => {
      playSound('close');
      setBootState(BootState.OFF);
      setWindows([]);
  };

  // Window Management
  const openApp = (appId: string) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;
    
    playSound('open');
    setStartMenuOpen(false);
    setHoveredApp(null); // Clear tooltip on open
    setContextMenu({ ...contextMenu, isOpen: false });
    
    const id = `${appId}-${Date.now()}`;
    
    let appComponent = <app.component />;
    // Inject props for specific apps
    if (app.id === 'settings') {
        appComponent = <app.component currentWallpaper={wallpaper} onWallpaperChange={setWallpaper} />;
    }
    
    const newWindow: WindowState = {
      id,
      appId: app.id,
      title: app.name,
      icon: app.icon,
      component: appComponent,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 50 + (windows.length * 30),
      y: 50 + (windows.length * 30),
      width: app.defaultWidth || 600,
      height: app.defaultHeight || 400,
      zIndex: nextZIndex
    };

    setWindows([...windows, newWindow]);
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    if (activeWindowId !== id) playSound('click');
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };

  const toggleMinimize = (id: string) => {
    const win = windows.find(w => w.id === id);
    if (win) {
        playSound(win.isMinimized ? 'restore' : 'minimize');
    }
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const toggleMaximize = (id: string) => {
    const win = windows.find(w => w.id === id);
    if (win) {
        playSound(win.isMaximized ? 'minimize' : 'restore');
    }
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const updateWindowPos = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  // Hover Handlers
  const handleMouseEnter = (app: AppDefinition, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredApp(app);
    setHoverPos({ x: rect.right + 15, y: rect.top + (rect.height / 2) });
  };

  const handleMouseLeave = () => {
    setHoveredApp(null);
    setHoverPos(null);
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY
    });
  };

  // Render Logic based on Boot State
  if (bootState === BootState.OFF) {
      return (
        <div className="bg-black h-full w-full flex items-center justify-center">
            <button 
                onClick={handlePowerOn}
                className="flex flex-col items-center group"
            >
                <div className="w-20 h-20 rounded-full border-4 border-zinc-800 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <Power size={40} className="text-zinc-700 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <span className="text-zinc-700 mt-4 font-mono text-xs tracking-[0.2em] uppercase group-hover:text-blue-400 transition-colors duration-300">System Offline</span>
            </button>
        </div>
      );
  }
  
  if (bootState === BootState.BOOTING) {
    return (
      <div className="bg-black h-full w-full flex flex-col items-center justify-center text-white cursor-none">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-slow mb-8" />
        <h1 className="text-2xl font-light tracking-widest animate-pulse">WEB OS 11</h1>
        <div className="w-64 h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-blue-500 animate-[width_3s_ease-in-out_forwards]" style={{width: '0%'}}></div>
        </div>
        <p className="text-zinc-500 mt-4 text-xs font-mono">Initializing Kernel Drivers...</p>
      </div>
    );
  }

  if (bootState === BootState.LOGIN) {
    return (
      <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80')] bg-cover bg-center flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />
        <div className="relative z-10 flex flex-col items-center animate-[fadeIn_1s_ease-out]">
          <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden mb-6 border-4 border-white/20 shadow-2xl">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
          <h2 className="text-3xl text-white font-semibold mb-8 drop-shadow-lg">Administrator</h2>
          <button 
            onClick={handleLogin}
            className="px-12 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Sign In
          </button>
        </div>
        <div className="absolute bottom-12 right-12 text-white text-right">
            <div className="text-7xl font-thin drop-shadow-lg tracking-tighter">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div className="text-xl font-light opacity-80 mt-2">
                {currentTime.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}
            </div>
        </div>
      </div>
    );
  }

  // DESKTOP RENDER
  return (
    <div 
        className="h-full w-full bg-cover bg-center overflow-hidden relative selection:bg-blue-500 selection:text-white transition-[background-image] duration-1000 ease-in-out"
        style={{ backgroundImage: `url('${wallpaper}')` }}
        onClick={() => {
            if (startMenuOpen) playSound('click');
            setStartMenuOpen(false); 
            setActiveWindowId(null);
            setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onContextMenu={handleContextMenu}
    >
        {/* Desktop Icons */}
        <div className="absolute top-6 left-6 flex flex-col gap-8">
            {APPS.filter(app => app.id !== 'settings').map(app => (
                <div 
                    key={app.id} 
                    onDoubleClick={() => openApp(app.id)} 
                    onClick={(e) => { e.stopPropagation(); playSound('click'); }}
                    onMouseEnter={(e) => handleMouseEnter(app, e)}
                    onMouseLeave={handleMouseLeave}
                    className="w-24 flex flex-col items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <div className="w-14 h-14 bg-white/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all border border-white/10 group-hover:scale-105">
                        <app.icon size={32} className="text-blue-300 drop-shadow-md" />
                    </div>
                    <span className="text-xs text-white text-center mt-2 drop-shadow-md px-2 py-1 rounded bg-black/20 backdrop-blur-sm group-hover:bg-blue-600/80 transition-colors line-clamp-2 leading-tight">{app.name}</span>
                </div>
            ))}
        </div>

        {/* Windows */}
        {windows.map(window => (
            <Window 
                key={window.id} 
                window={window}
                onClose={closeWindow}
                onMinimize={toggleMinimize}
                onMaximize={toggleMaximize}
                onFocus={focusWindow}
                updatePosition={updateWindowPos}
                updateSize={updateWindowSize}
            />
        ))}

        {/* Context Menu */}
        {contextMenu.isOpen && (
            <div 
                className="absolute z-[9999] bg-slate-800/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-lg shadow-2xl w-56 text-gray-200 text-xs animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 224) }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => { setContextMenu({ ...contextMenu, isOpen: false }); playSound('click'); }} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors">
                    <LayoutGrid size={14} className="text-blue-400"/> View large icons
                </button>
                <button onClick={() => { setContextMenu({ ...contextMenu, isOpen: false }); playSound('click'); }} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors">
                    <RefreshCw size={14} className="text-green-400"/> Refresh
                </button>
                 <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
                 <button onClick={() => { setContextMenu({ ...contextMenu, isOpen: false }); playSound('click'); }} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors">
                    <FolderPlus size={14} className="text-yellow-400"/> New Folder
                </button>
                <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
                <button 
                    onClick={() => { openApp('settings'); playSound('click'); }} 
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors text-blue-100"
                >
                    <SettingsIcon size={14} className="text-blue-400"/> Personalize
                </button>
            </div>
        )}

        {/* Start Menu */}
        <div className={`absolute bottom-14 left-4 w-[600px] h-[650px] bg-slate-900/90 backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col z-[9999] origin-bottom-left ${startMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}`}
            onClick={(e) => e.stopPropagation()}
        >
             <div className="p-8 flex-1">
                <div className="relative mb-8">
                    <input 
                        type="text" 
                        placeholder="Type here to search..." 
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                        onKeyDown={() => playSound('click')}
                    />
                </div>
                
                <h3 className="text-xs font-bold text-gray-400 mb-4 ml-1 uppercase tracking-wider">Pinned Apps</h3>
                <div className="grid grid-cols-6 gap-6">
                    {APPS.map(app => (
                        <div 
                            key={app.id} 
                            onClick={() => openApp(app.id)} 
                            onMouseEnter={(e) => handleMouseEnter(app, e)}
                            onMouseLeave={handleMouseLeave}
                            className="flex flex-col items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
                        >
                            <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors shadow-sm">
                                <app.icon size={24} className="text-blue-300"/>
                            </div>
                            <span className="text-[10px] text-gray-300 font-medium">{app.name}</span>
                        </div>
                    ))}
                </div>

                <h3 className="text-xs font-bold text-gray-400 mb-4 mt-8 ml-1 uppercase tracking-wider">Recommended</h3>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer group">
                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">
                            <FileText size={16}/>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-200">Project_Alpha_Specs.pdf</span>
                            <span className="text-xs text-gray-500">Recently opened</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer group">
                        <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-purple-400">
                            <ImageIcon size={16}/>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-200">Design_Mockup_v2.png</span>
                            <span className="text-xs text-gray-500">Yesterday at 4:20 PM</span>
                        </div>
                    </div>
                </div>
             </div>
             
             <div className="h-16 bg-black/20 border-t border-white/5 flex items-center justify-between px-8 rounded-b-xl">
                <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors" onClick={() => playSound('click')}>
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
                        </div>
                     </div>
                     <span className="text-sm font-medium text-white">Administrator</span>
                </div>
                <button 
                    onClick={handlePowerOff} 
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                >
                    <Power size={20} />
                </button>
             </div>
        </div>

        {/* Taskbar */}
        <div className="absolute bottom-2 left-2 right-2 h-12 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-xl flex items-center justify-between px-4 z-[10000] shadow-2xl" onClick={(e) => { e.stopPropagation(); setContextMenu({ ...contextMenu, isOpen: false }); }}>
            <div className="flex items-center gap-2">
                {/* Start Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); playSound('click'); setStartMenuOpen(!startMenuOpen); setContextMenu({ ...contextMenu, isOpen: false }); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all group active:scale-95"
                >
                    <LayoutGrid size={22} className={`transition-colors ${startMenuOpen ? 'text-blue-400' : 'text-blue-300 group-hover:text-white'}`} />
                </button>
                
                <div className="w-[1px] h-6 bg-white/10 mx-2" />

                {/* Running Apps */}
                <div className="flex gap-1">
                    {windows.map(w => (
                        <button 
                            key={w.id}
                            onClick={() => w.isMinimized ? toggleMinimize(w.id) : focusWindow(w.id)}
                            className={`
                                p-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group active:scale-95
                                ${activeWindowId === w.id && !w.isMinimized ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'}
                            `}
                        >
                            <w.icon size={20} className={`${activeWindowId === w.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
                            
                            {/* Status Indicators */}
                            {activeWindowId === w.id && !w.isMinimized && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                            )}
                            {w.isMinimized && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-500 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tray */}
            <div className="flex items-center gap-4 h-full">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/20 border border-white/5 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400">ONLINE</span>
                 </div>
                 
                 <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block"></div>

                <div className="flex flex-col items-end justify-center cursor-default hover:bg-white/10 px-3 py-1 rounded-lg transition-all select-none group border border-transparent hover:border-white/5 bg-black/20 shadow-sm">
                    <span className="text-white font-bold text-sm font-mono tracking-tight group-hover:text-blue-100 transition-colors drop-shadow-sm leading-none mb-0.5 shadow-black">
                        {currentTime.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                    </span>
                    <span className="text-[10px] text-blue-200/80 font-medium tracking-wide group-hover:text-blue-200 transition-colors uppercase">
                         {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>

        {/* App Preview Tooltip */}
        {hoveredApp && hoverPos && (
            <div 
                className="fixed z-[11000] w-64 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-none animate-in fade-in slide-in-from-left-2 duration-200 flex flex-col gap-2"
                style={{ top: hoverPos.y, left: hoverPos.x, transform: 'translateY(-50%)' }}
            >
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                    <div className="p-2 bg-white/10 rounded-lg shadow-inner">
                        <hoveredApp.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-sm block">{hoveredApp.name}</span>
                        <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">Application</span>
                    </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                    {hoveredApp.description}
                </p>
            </div>
        )}
    </div>
  );
};

export default App;
