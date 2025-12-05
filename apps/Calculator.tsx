
import React, { useState, useEffect } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string>('');

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(display);
    } else if (operator) {
      const currentValue = prevValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operator);
      
      setHistory(`${currentValue} ${operator} ${inputValue} =`);
      setDisplay(String(newValue));
      setPrevValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return first / second;
      default: return second;
    }
  };

  const handleFunction = (func: string) => {
      const current = parseFloat(display);
      let newVal = current;
      switch(func) {
          case 'AC': 
            setDisplay('0');
            setPrevValue(null);
            setOperator(null);
            setWaitingForOperand(false);
            setHistory('');
            return;
          case '±': newVal = current * -1; break;
          case '%': newVal = current / 100; break;
          case 'x²': newVal = Math.pow(current, 2); break;
          case 'x³': newVal = Math.pow(current, 3); break;
          case '√': newVal = Math.sqrt(current); break;
          case 'sin': newVal = Math.sin(current); break;
          case 'cos': newVal = Math.cos(current); break;
          case 'tan': newVal = Math.tan(current); break;
          case 'log': newVal = Math.log10(current); break;
          case 'ln': newVal = Math.log(current); break;
          case 'π': newVal = Math.PI; break;
          case 'e': newVal = Math.E; break;
      }
      setDisplay(String(newVal));
      setWaitingForOperand(true);
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (/[0-9]/.test(e.key)) inputDigit(e.key);
        if (e.key === '.') inputDigit('.');
        if (e.key === 'Enter' || e.key === '=') performOperation('=');
        if (e.key === 'Backspace') handleFunction('AC'); // Simplified
        if (e.key === '+') performOperation('+');
        if (e.key === '-') performOperation('-');
        if (e.key === '*') performOperation('×');
        if (e.key === '/') performOperation('÷');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, operator, waitingForOperand, prevValue]);

  // Styles for circular buttons
  const btnClass = "h-14 w-14 rounded-full flex items-center justify-center text-xl font-medium transition-all active:scale-95 select-none";
  const grayBtn = `${btnClass} bg-[#333333] text-white hover:bg-[#444]`;
  const lightBtn = `${btnClass} bg-[#a5a5a5] text-black hover:bg-[#d4d4d2]`;
  const orangeBtn = `${btnClass} bg-[#ff9f0a] text-white hover:bg-[#ffb340]`;
  
  // Grid layout helper
  const renderBtn = (label: string, type: 'gray' | 'light' | 'orange', onClick: () => void, wide = false) => (
      <button 
        onClick={onClick}
        className={`${type === 'gray' ? grayBtn : type === 'light' ? lightBtn : orangeBtn} ${wide ? 'w-[7.5rem] !justify-start pl-7' : ''} ${operator === label ? 'bg-white !text-[#ff9f0a]' : ''}`}
      >
          {label}
      </button>
  );

  return (
    <div className="h-full bg-black flex flex-col p-4 select-none">
        {/* Display */}
        <div className="flex-1 flex flex-col items-end justify-end mb-4 px-2">
            <div className="text-gray-400 text-sm h-6">{history}</div>
            <div className="text-6xl font-light text-white tracking-tight truncate w-full text-right">
                {parseFloat(display).toLocaleString('en-US', { maximumFractionDigits: 6 })}
            </div>
        </div>

        {/* Scientific Row */}
        <div className="grid grid-cols-6 gap-3 mb-3">
             {/* Extended functions hidden on mobile usually, but we show them here */}
        </div>

        {/* Main Grid */}
        <div className="flex gap-4">
             {/* Scientific Sidebar */}
             <div className="grid grid-cols-2 gap-3 w-1/3">
                <button onClick={() => handleFunction('x²')} className={`${grayBtn} w-full rounded-2xl text-sm`}>x²</button>
                <button onClick={() => handleFunction('x³')} className={`${grayBtn} w-full rounded-2xl text-sm`}>x³</button>
                <button onClick={() => handleFunction('√')} className={`${grayBtn} w-full rounded-2xl text-sm`}>√x</button>
                <button onClick={() => handleFunction('π')} className={`${grayBtn} w-full rounded-2xl text-sm`}>π</button>
                <button onClick={() => handleFunction('sin')} className={`${grayBtn} w-full rounded-2xl text-sm`}>sin</button>
                <button onClick={() => handleFunction('cos')} className={`${grayBtn} w-full rounded-2xl text-sm`}>cos</button>
                <button onClick={() => handleFunction('tan')} className={`${grayBtn} w-full rounded-2xl text-sm`}>tan</button>
                <button onClick={() => handleFunction('log')} className={`${grayBtn} w-full rounded-2xl text-sm`}>log</button>
             </div>

             {/* Standard Pad */}
             <div className="grid grid-cols-4 gap-3 flex-1">
                {renderBtn(display === '0' ? 'AC' : 'C', 'light', () => handleFunction('AC'))}
                {renderBtn('±', 'light', () => handleFunction('±'))}
                {renderBtn('%', 'light', () => handleFunction('%'))}
                {renderBtn('÷', 'orange', () => performOperation('÷'))}

                {renderBtn('7', 'gray', () => inputDigit('7'))}
                {renderBtn('8', 'gray', () => inputDigit('8'))}
                {renderBtn('9', 'gray', () => inputDigit('9'))}
                {renderBtn('×', 'orange', () => performOperation('×'))}

                {renderBtn('4', 'gray', () => inputDigit('4'))}
                {renderBtn('5', 'gray', () => inputDigit('5'))}
                {renderBtn('6', 'gray', () => inputDigit('6'))}
                {renderBtn('-', 'orange', () => performOperation('-'))}

                {renderBtn('1', 'gray', () => inputDigit('1'))}
                {renderBtn('2', 'gray', () => inputDigit('2'))}
                {renderBtn('3', 'gray', () => inputDigit('3'))}
                {renderBtn('+', 'orange', () => performOperation('+'))}

                {renderBtn('0', 'gray', () => inputDigit('0'), true)}
                {renderBtn('.', 'gray', () => inputDigit('.'))}
                {renderBtn('=', 'orange', () => performOperation('='))}
             </div>
        </div>
    </div>
  );
};
