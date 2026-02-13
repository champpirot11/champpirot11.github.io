import React, { useEffect } from 'react';

interface LevelUpProps {
  onComplete: () => void;
}

export const LevelUp: React.FC<LevelUpProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-green-50/30">
      {/* Confetti / Decor Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
         <div className="absolute top-10 left-10 text-2xl animate-bounce">✨</div>
         <div className="absolute bottom-20 right-10 text-2xl animate-bounce delay-100">🎉</div>
         <div className="absolute top-1/4 left-1/4 text-xl animate-pulse">🌸</div>
         <div className="absolute top-2/3 right-1/3 text-xl animate-spin">💠</div>
         <div className="absolute bottom-1/4 left-1/2 text-2xl animate-bounce delay-300">💖</div>
      </div>

      <div className="z-10 text-center w-full px-6 flex flex-col items-center justify-center">
        {/* Improved layout to prevent clipping. Bounce animation constrained within safe padding. */}
        <div className="py-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-green-600 mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-bounce tracking-widest leading-none">
            LEVEL<br/>UP!
          </h1>
          <div className="h-1.5 w-32 bg-green-800 mx-auto mb-8 rounded-full shadow-sm"></div>
          
          <div className="space-y-3">
            <p className="text-sm sm:text-base text-green-800 font-bold animate-pulse tracking-widest uppercase">
              STAGE CLEARED!
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">
                Preparing Your Reward...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};