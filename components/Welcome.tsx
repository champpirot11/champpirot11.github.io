import React, { useState } from 'react';

interface WelcomeProps {
  onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClickCount(prev => prev + 1);
  };

  const getStartScale = () => {
    return 1 + (clickCount * 0.4); // Grows 40% each click
  };

  const getNoScale = () => {
    return Math.max(0, 1 - (clickCount * 0.2)); // Shrinks 20% each click
  };

  const showNoButton = clickCount < 3;

  return (
    <div className="flex flex-col items-center justify-between h-full py-8 text-center overflow-hidden">
      <div className="animate-float">
        <h1 className="text-xl leading-tight text-green-800 drop-shadow-sm mb-4">
          VALENTINE<br />QUEST<br /><span className="text-xs text-green-700 mt-2 block">VERSION 2026</span>
        </h1>
        
        {/* 8-bit Characters Placeholder */}
        <div className="flex justify-center items-end gap-2 mt-8 mb-4 text-4xl">
           <span>👦🏻</span>
           <span>💚</span>
           <span>👧🏻</span>
        </div>
      </div>

      <div className="w-full px-8 relative h-40 flex flex-col items-center justify-center gap-4">
        {/* Main Start Button */}
        <button
          onClick={onStart}
          style={{ transform: `scale(${getStartScale()})` }}
          className="w-full block bg-green-600 text-white py-3 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all duration-200 mb-2 font-bold shadow-lg z-10"
        >
          START
        </button>

        {/* No Button (disappears after 3 clicks) */}
        {showNoButton && (
           <button
             onClick={handleNoClick}
             style={{ transform: `scale(${getNoScale()})` }}
             className="w-full block bg-gray-400 text-white py-2 border-b-4 border-gray-600 font-bold text-xs active:border-b-0 active:translate-y-1 transition-all duration-200"
           >
             NO
           </button>
        )}
      </div>

      <div className="text-[8px] text-green-800 font-bold mt-4">
        © 2026 CHAMP JA.
      </div>
    </div>
  );
};