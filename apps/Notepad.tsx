import React, { useState } from 'react';

export const Notepad: React.FC = () => {
  const [content, setContent] = useState('');

  return (
    <div className="h-full flex flex-col bg-white text-black">
      <div className="flex gap-1 text-xs p-1 border-b border-gray-200 bg-gray-50">
        <button className="px-2 py-0.5 hover:bg-gray-200 rounded">File</button>
        <button className="px-2 py-0.5 hover:bg-gray-200 rounded">Edit</button>
        <button className="px-2 py-0.5 hover:bg-gray-200 rounded">Format</button>
        <button className="px-2 py-0.5 hover:bg-gray-200 rounded">View</button>
        <button className="px-2 py-0.5 hover:bg-gray-200 rounded">Help</button>
      </div>
      <textarea
        className="flex-1 resize-none p-2 outline-none font-mono text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />
      <div className="bg-gray-100 h-6 border-t border-gray-200 flex items-center justify-end px-3 text-xs text-gray-500">
        Ln {content.split('\n').length}, Col {content.length}
      </div>
    </div>
  );
};