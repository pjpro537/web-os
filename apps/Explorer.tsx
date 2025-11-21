import React, { useState } from 'react';
import { FileSystemItem } from '../types';
import { INITIAL_FILES } from '../constants';
import { Folder, FileText, Image as ImageIcon, HardDrive, ArrowLeft, Search } from 'lucide-react';

export const Explorer: React.FC = () => {
  // In a real app, fileSystem would be in Context. Using simplified local state here.
  const [currentPathId, setCurrentPathId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>(['root']);
  
  // Helper to find folder by ID recursively
  const findItem = (id: string, items: FileSystemItem[]): FileSystemItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(id, item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const currentFolder = findItem(currentPathId, INITIAL_FILES);
  
  const handleNavigate = (id: string) => {
    const item = findItem(id, INITIAL_FILES);
    if (item && item.type === 'folder') {
      setCurrentPathId(id);
      setHistory([...history, id]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setCurrentPathId(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#202020] text-white select-none">
      {/* Toolbar */}
      <div className="h-12 flex items-center px-2 bg-[#2c2c2c] gap-2 border-b border-white/10">
        <button onClick={handleBack} disabled={history.length <= 1} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 bg-[#1a1a1a] h-8 rounded border border-white/10 flex items-center px-3 text-xs text-gray-400">
           {currentFolder?.name || 'Computer'}
        </div>
        <div className="w-48 bg-[#1a1a1a] h-8 rounded border border-white/10 flex items-center px-3 gap-2">
           <Search size={14} className="text-gray-500"/>
           <span className="text-xs text-gray-500">Search</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#191919] border-r border-white/5 p-2 flex flex-col gap-1 hidden md:flex">
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer">
            <HardDrive size={14} className="text-gray-400"/> This PC
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer">
            <Folder size={14} className="text-yellow-400"/> Desktop
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer">
             <Folder size={14} className="text-blue-400"/> Documents
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer">
             <Folder size={14} className="text-green-400"/> Downloads
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {currentFolder?.children?.map(item => (
              <div 
                key={item.id}
                onDoubleClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer group"
              >
                {item.type === 'folder' ? (
                  <Folder size={48} className="text-yellow-400 fill-yellow-400/20 group-hover:fill-yellow-400 transition-colors" strokeWidth={1} />
                ) : (
                   item.name.endsWith('.png') ? <ImageIcon size={40} className="text-purple-400"/> : <FileText size={40} className="text-blue-300" />
                )}
                <span className="text-xs text-gray-300 text-center truncate w-full px-1">{item.name}</span>
              </div>
            ))}
            {(!currentFolder?.children || currentFolder.children.length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-600 mt-10">
                    <p>This folder is empty.</p>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-[#2c2c2c] flex items-center px-3 text-[10px] text-gray-400 gap-4 border-t border-white/10">
        <span>{currentFolder?.children?.length || 0} items</span>
        <span>1 selected item</span>
      </div>
    </div>
  );
};