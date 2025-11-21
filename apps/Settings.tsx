
import React, { useState } from 'react';
import { Monitor, Image, Type, Lock, RotateCcw, Cpu, HardDrive } from 'lucide-react';

const WALLPAPERS = [
  { id: 'default', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80', name: 'Default' },
  { id: 'mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80', name: 'Mountain' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80', name: 'Cyberpunk' },
  { id: 'minimal', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80', name: 'Ocean' },
  { id: 'dark', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80', name: 'Starry Night' },
  { id: 'win11', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80', name: 'Fluid' },
];

interface SettingsProps {
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentWallpaper, onWallpaperChange }) => {
  const [activeTab, setActiveTab] = useState('personalization');
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="h-full flex bg-[#f3f3f3] text-black font-sans select-none">
      {/* Sidebar */}
      <div className="w-60 bg-[#f0f0f0] p-4 flex flex-col gap-1 border-r border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 mb-6">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Monitor size={18} />
             </div>
             <div>
                <div className="font-bold text-sm">Settings</div>
                <div className="text-[10px] text-gray-500">Administrator</div>
             </div>
        </div>
        
        <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-md text-left text-xs flex items-center gap-3 transition-all ${activeTab === 'system' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            <Cpu size={16} /> System
        </button>
        <button 
            onClick={() => setActiveTab('personalization')}
            className={`px-4 py-2 rounded-md text-left text-xs flex items-center gap-3 transition-all ${activeTab === 'personalization' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            <Image size={16} /> Personalization
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        {activeTab === 'personalization' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h1 className="text-2xl font-semibold mb-1">Personalization</h1>
                <p className="text-xs text-gray-500 mb-8">Customize your desktop background and colors.</p>
                
                {/* Preview */}
                <h3 className="font-medium mb-3 text-sm text-gray-700">Current Background</h3>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-8 border-4 border-gray-100 bg-gray-100 relative group">
                    <img src={currentWallpaper} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg pointer-events-none"></div>
                </div>

                <h3 className="font-medium mb-3 text-sm text-gray-700">Choose a photo</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {WALLPAPERS.map(wp => (
                        <button 
                            key={wp.id}
                            onClick={() => onWallpaperChange(wp.url)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 ${currentWallpaper === wp.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-gray-200'}`}
                        >
                            <img src={wp.url} className="w-full h-full object-cover" alt={wp.name} />
                            {currentWallpaper === wp.url && (
                                <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                        </button>
                    ))}
                </div>

                 <h3 className="font-medium mb-3 text-sm text-gray-700">Custom Image URL</h3>
                 <div className="flex gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <input 
                        type="text" 
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white"
                    />
                    <button 
                        onClick={() => { if(customUrl) onWallpaperChange(customUrl); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                    >
                        Apply
                    </button>
                 </div>
            </div>
        )}
        {activeTab === 'system' && (
             <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <h1 className="text-2xl font-semibold mb-1">System</h1>
                 <p className="text-xs text-gray-500 mb-8">Device specifications and OS information.</p>

                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Monitor size={32} />
                        </div>
                        <div>
                            <div className="font-bold text-lg">WebOS Desktop</div>
                            <div className="text-xs text-gray-500">DESKTOP-8392J</div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                            <span className="text-gray-500 text-xs flex items-center gap-2"><Cpu size={12}/> Processor</span>
                            <span className="font-medium text-xs">AI Neural Engine 12-Core</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                            <span className="text-gray-500 text-xs flex items-center gap-2"><HardDrive size={12}/> Installed RAM</span>
                            <span className="font-medium text-xs">32.0 GB (31.8 GB usable)</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                            <span className="text-gray-500 text-xs">System type</span>
                            <span className="font-medium text-xs">64-bit operating system, ARM-based processor</span>
                        </div>
                    </div>
                 </div>

                 <h2 className="text-lg font-semibold mb-4">Windows specifications</h2>
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3">
                     <div className="flex justify-between border-b border-gray-200/50 pb-2">
                        <span className="text-gray-500 text-xs">Edition</span>
                        <span className="font-medium text-xs">WebOS 11 Pro</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                        <span className="text-gray-500 text-xs">Version</span>
                        <span className="font-medium text-xs">23H2</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                        <span className="text-gray-500 text-xs">Experience</span>
                        <span className="font-medium text-xs">Windows Feature Experience Pack 1000.22631.1000.0</span>
                    </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};
