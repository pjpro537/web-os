import React, { useState, useEffect, useRef } from 'react';
import { runPythonSimulation } from '../services/geminiService';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
  path?: string;
}

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'WebOS [Version 11.0.22631.4587]' },
    { type: 'output', content: '(c) WebOS Corporation. All rights reserved.' },
    { type: 'output', content: '' },
    { type: 'output', content: 'Type "python" to enter Python mode, or "help" for commands.' },
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState('C:\\Users\\Admin');
  const [isPythonMode, setIsPythonMode] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (cmd: string) => {
    const newHistory = [...history, { type: 'input' as const, content: cmd, path: isPythonMode ? '>>> ' : `${currentPath}>` }];
    setHistory(newHistory);

    const trimmed = cmd.trim();
    
    if (isPythonMode) {
        if (trimmed.toLowerCase() === 'exit()') {
            setIsPythonMode(false);
            setHistory(prev => [...prev, { type: 'output', content: 'Exiting Python interpreter.' }]);
        } else {
            // Call AI to simulate Python
            const result = await runPythonSimulation(trimmed);
            setHistory(prev => [...prev, { type: 'output', content: result }]);
        }
    } else {
        // Regular Shell Commands
        switch (trimmed.toLowerCase()) {
          case 'help':
            setHistory(prev => [...prev, { type: 'output', content: 'Available commands: help, cls, echo, python, date, ver' }]);
            break;
          case 'cls':
          case 'clear':
            setHistory([]);
            break;
          case 'python':
            setIsPythonMode(true);
            setHistory(prev => [...prev, { type: 'output', content: 'Python 3.12.0 (tags/v3.12.0:0fb18b0) [MSC v.1935 64 bit (AMD64)] on win32\nType "help", "copyright", "credits" or "license" for more information.' }]);
            break;
          case 'date':
            setHistory(prev => [...prev, { type: 'output', content: new Date().toString() }]);
            break;
          case 'ver':
            setHistory(prev => [...prev, { type: 'output', content: 'WebOS 11.0.0' }]);
            break;
          case '':
            break;
          default:
            if (trimmed.startsWith('echo ')) {
                setHistory(prev => [...prev, { type: 'output', content: trimmed.substring(5) }]);
            } else {
                setHistory(prev => [...prev, { type: 'error', content: `'${trimmed}' is not recognized as an internal or external command.` }]);
            }
        }
    }
  };

  return (
    <div className="h-full bg-black/90 p-2 font-mono text-sm overflow-y-auto text-gray-200 flex flex-col" onClick={() => document.getElementById('term-input')?.focus()}>
      {history.map((line, i) => (
        <div key={i} className={`${line.type === 'error' ? 'text-red-400' : 'text-gray-300'} mb-1 whitespace-pre-wrap`}>
          {line.type === 'input' && <span className="text-green-400 mr-2">{line.path}</span>}
          {line.content}
        </div>
      ))}
      <div className="flex items-center">
        <span className="text-green-400 mr-2">{isPythonMode ? '>>> ' : `${currentPath}>`}</span>
        <input
          id="term-input"
          type="text"
          className="bg-transparent border-none outline-none flex-1 text-gray-100"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(input);
              setInput('');
            }
          }}
          autoFocus
        />
      </div>
      <div ref={endRef} />
    </div>
  );
};