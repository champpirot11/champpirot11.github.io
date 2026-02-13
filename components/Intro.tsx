import React, { useState, useEffect } from 'react';

interface IntroProps {
  onNext: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onNext }) => {
  const fullText = "Hi Babe! You've entered my world. Finish the challenge to unlock my heart (and a gift!)";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + fullText.charAt(index));
        setIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [index, fullText]);

  return (
    <div className="flex flex-col justify-end h-full pb-8 px-4">
      <div className="flex-1 flex items-center justify-center">
        {/* Removed animate-bounce */}
        <div className="text-8xl drop-shadow-md">🧙🏻‍♂️</div>
      </div>
      
      {/* Dialogue Box - Border Reduced to 4px */}
      <div className="bg-white border-4 border-double border-gray-900 p-6 relative shadow-[8px_8px_0_rgba(0,0,0,0.2)] rounded-lg">
        <div className="absolute -top-3 left-4 bg-green-100 px-2 border-2 border-gray-900 text-[10px] font-bold text-green-800 uppercase tracking-wider transform -rotate-2">
          Champ says:
        </div>
        
        <p className="text-sm leading-relaxed min-h-[80px] text-gray-900 font-['Kanit'] font-medium">
          {displayedText}
          <span className="typewriter-cursor"></span>
        </p>
        
        {index >= fullText.length && (
          <div className="mt-4 flex justify-end">
             <button 
              onClick={onNext}
              className="bg-green-600 text-white text-[10px] px-6 py-3 border-b-4 border-green-800 hover:bg-green-700 active:border-b-0 active:translate-y-[2px] font-bold rounded shadow-md"
             >
               I'm Ready! &lt;3
             </button>
          </div>
        )}
      </div>
    </div>
  );
};