
import React, { useState } from 'react';
import { FileSystemItem } from '../types';
import { INITIAL_FILES } from '../constants';
import { Folder, FileText, Image as ImageIcon, HardDrive, ArrowLeft, Search, FolderPlus, Gamepad, Trash2, AlertTriangle, X } from 'lucide-react';
import { playSound } from '../services/soundService';

interface ExplorerProps {
    onOpenApp?: (appId: string) => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ onOpenApp }) => {
  // Use local state for filesystem to allow modifications
  const [files, setFiles] = useState<FileSystemItem[]>(INITIAL_FILES);
  const [currentPathId, setCurrentPathId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>(['root']);
  
  // Interaction State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, itemId: string} | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
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

  const currentFolder = findItem(currentPathId, files);
  
  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder') {
        setCurrentPathId(item.id);
        setHistory([...history, item.id]);
    } else if (item.appId && onOpenApp) {
        onOpenApp(item.appId);
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

  const handleNewFolder = () => {
    const newId = `folder-${Date.now()}`;
    const newFolder: FileSystemItem = {
        id: newId,
        name: 'New Folder',
        type: 'folder',
        parentId: currentPathId,
        children: []
    };

    const addFolderRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
            if (item.id === currentPathId) {
                return {
                    ...item,
                    children: [...(item.children || []), newFolder]
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: addFolderRecursive(item.children)
                };
            }
            return item;
        });
    };

    setFiles(addFolderRecursive(files));
    playSound('click');
  };

  const handleDelete = () => {
      if (!itemToDelete) return;

      const deleteRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
          return items
            .filter(item => item.id !== itemToDelete)
            .map(item => ({
                ...item,
                children: item.children ? deleteRecursive(item.children) : undefined
            }));
      };

      setFiles(deleteRecursive(files));
      setItemToDelete(null);
      playSound('click'); // Confirm sound
  };

  const getFileIcon = (item: FileSystemItem) => {
      if (item.type === 'folder') return <Folder size={48} className="text-yellow-400 fill-yellow-400/20 group-hover:fill-yellow-400 transition-colors drop-shadow-sm" strokeWidth={1} />;
      if (item.appId) return <Gamepad size={40} className="text-purple-500 drop-shadow-sm" />;
      if (item.name.endsWith('.png')) return <ImageIcon size={40} className="text-purple-400 drop-shadow-sm"/>;
      return <FileText size={40} className="text-blue-300 drop-shadow-sm" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#202020] text-white select-none relative" onClick={() => setContextMenu(null)}>
      {/* Toolbar */}
      <div className="h-12 flex items-center px-2 bg-[#2c2c2c] gap-2 border-b border-white/10">
        <button onClick={handleBack} disabled={history.length <= 1} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <button onClick={handleNewFolder} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded transition-colors text-xs font-medium text-gray-200 border border-transparent hover:border-white/10">
          <FolderPlus size={16} className="text-yellow-400" />
          <span>New</span>
        </button>
        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
        <div className="flex-1 bg-[#1a1a1a] h-8 rounded border border-white/10 flex items-center px-3 text-xs text-gray-400 font-mono">
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
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer text-gray-300">
            <HardDrive size={14} className="text-gray-400"/> This PC
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer text-gray-300">
            <Folder size={14} className="text-yellow-400"/> Desktop
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer text-gray-300">
             <Folder size={14} className="text-blue-400"/> Documents
          </div>
          <div className="px-2 py-1 hover:bg-white/5 rounded text-xs flex items-center gap-2 cursor-pointer text-gray-300">
             <Folder size={14} className="text-green-400"/> Downloads
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 animate-in fade-in duration-300">
            {currentFolder?.children?.map(item => (
              <div 
                key={item.id}
                onDoubleClick={() => handleNavigate(item)}
                onClick={(e) => { e.stopPropagation(); playSound('click'); setContextMenu(null); }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id });
                }}
                className={`flex flex-col items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer group transition-colors border border-transparent hover:border-white/5 ${contextMenu?.itemId === item.id ? 'bg-white/10 border-white/10' : ''}`}
              >
                {getFileIcon(item)}
                <span className="text-xs text-gray-300 text-center truncate w-full px-1 group-hover:text-white">{item.name}</span>
              </div>
            ))}
            {(!currentFolder?.children || currentFolder.children.length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-600 mt-20">
                    <Folder size={48} className="text-gray-700 mb-2 opacity-50"/>
                    <p className="text-xs">This folder is empty.</p>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-[#2c2c2c] flex items-center px-3 text-[10px] text-gray-400 gap-4 border-t border-white/10">
        <span>{currentFolder?.children?.length || 0} items</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-[9999] bg-[#2c2c2c] border border-white/10 rounded-lg shadow-xl p-1 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 100), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={() => {
                    setItemToDelete(contextMenu.itemId);
                    setContextMenu(null);
                    playSound('click');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded text-xs transition-colors"
            >
                <Trash2 size={14} /> Delete
            </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {itemToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="bg-[#202020] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                   {/* Header */}
                   <div className="h-10 bg-[#2c2c2c] border-b border-white/5 flex items-center justify-between px-4">
                       <span className="text-xs font-bold text-gray-300">Delete Item</span>
                       <button onClick={() => setItemToDelete(null)} className="text-gray-500 hover:text-white transition-colors"><X size={14}/></button>
                   </div>
                   
                   {/* Body */}
                   <div className="p-6 flex flex-col items-center text-center gap-4">
                       <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-2 border border-yellow-500/30">
                           <AlertTriangle size={24} />
                       </div>
                       <div>
                           <h3 className="text-sm font-medium text-white mb-1">Are you sure you want to delete this item?</h3>
                           <p className="text-xs text-gray-400">This action cannot be undone.</p>
                       </div>
                       
                       <div className="flex gap-3 w-full mt-2">
                           <button 
                              onClick={() => { setItemToDelete(null); playSound('click'); }}
                              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-colors"
                           >
                              Cancel
                           </button>
                           <button 
                              onClick={handleDelete}
                              className="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-500 border border-red-400/50 rounded text-xs text-white font-medium shadow-lg shadow-red-500/20 transition-all active:scale-95"
                           >
                              Delete
                           </button>
                       </div>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};
