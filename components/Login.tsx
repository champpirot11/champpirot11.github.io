import React, { useState } from 'react';

export type LoginDestination = 'INTRO' | 'GACHA' | 'MEMORIES' | 'MEMORIES_TEST';

interface LoginProps {
  onSuccess: (destination: LoginDestination) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handlePress = (num: string) => {
    if (code.length < 8) {
      const newCode = code + num;
      setCode(newCode);
      // Auto-submit on 8th digit
      if (newCode.length === 8) {
        checkCode(newCode);
      }
    }
  };

  const handleClear = () => {
    setCode('');
    setErrorMsg('');
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const checkCode = (inputCode: string) => {
    // Cheat code: Skip to Gacha
    if (inputCode === '41280000') {
      onSuccess('GACHA');
      return;
    }
    
    // Cheat code: Skip to Photo Booth (Memories)
    if (inputCode === '45777777') {
      onSuccess('MEMORIES');
      return;
    }

    // Cheat code: Test Photo Booth Layout
    if (inputCode === '45777771') {
      onSuccess('MEMORIES_TEST');
      return;
    }

    // Correct code: 29062544
    if (inputCode === '29062544') {
      onSuccess('INTRO');
    } else {
      setAttempts(prev => prev + 1);
      setCode('');
      if (attempts === 0) {
        setErrorMsg("Hint: The special date? (DDMMYYYY)");
      } else if (attempts === 1) {
        setErrorMsg("Still wrong? It's our day!");
      } else {
        setErrorMsg("Try 29062544 directly!");
      }
    }
  };

  return (
    <div className="flex flex-col h-full items-center pt-6 px-4">
      <h2 className="text-green-900 text-sm mb-4 text-center font-bold tracking-wider">PASSWORD</h2>
      
      {/* Display */}
      <div className="bg-green-900 border-4 border-green-700 w-full p-4 mb-4 text-center rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
        <span className="text-xl tracking-[0.2em] text-green-400 font-bold font-mono text-shadow-glow">
          {code.padEnd(8, '_')}
        </span>
      </div>

      {/* Error Message */}
      <div className="h-12 mb-2 text-center">
        {errorMsg && (
          <p className="text-[10px] text-red-600 font-bold typewriter-cursor leading-tight">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="aspect-square bg-white border-2 border-b-[6px] border-green-800 text-green-900 hover:bg-green-50 active:border-b-2 active:translate-y-[4px] active:shadow-none rounded-lg font-bold text-xl shadow-md transition-all"
          >
            {num}
          </button>
        ))}
        <button 
          onClick={handleClear} 
          className="col-span-1 bg-red-100 text-red-800 text-xs rounded-lg border-2 border-b-[6px] border-red-800 active:border-b-2 active:translate-y-[4px] font-bold shadow-md flex items-center justify-center transition-all"
        >
          CLR
        </button>
        <button 
           onClick={() => handlePress('0')}
           className="aspect-square bg-white border-2 border-b-[6px] border-green-800 text-green-900 hover:bg-green-50 active:border-b-2 active:translate-y-[4px] active:shadow-none rounded-lg font-bold text-xl shadow-md transition-all"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="col-span-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg border-2 border-b-[6px] border-yellow-600 active:border-b-2 active:translate-y-[4px] font-bold shadow-md flex items-center justify-center transition-all"
        >
          DEL
        </button>
      </div>
    </div>
  );
};