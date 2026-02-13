import React, { useState, useEffect, useRef } from 'react';

interface ShooterGameProps {
  onComplete: () => void;
}

type Entity = {
  id: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  type: 'TARGET' | 'FRIENDLY';
  icon: string;
  name?: string;
  isHit?: boolean;
};

const TARGETS = [
  { icon: '🫛', name: 'Green Bean' },
  { icon: '🪳', name: 'Cockroach' }
];

const FRIENDLIES = [
  { icon: '🍗', name: 'Chicken' },
  { icon: '🐱', name: 'Cat' },
  { icon: '🍞', name: 'Bread' }
];

export const ShooterGame: React.FC<ShooterGameProps> = ({ onComplete }) => {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Entity[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [redFlash, setRedFlash] = useState(false); 
  const [shake, setShake] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const lastSpawnTime = useRef(0);
  const itemsRef = useRef<Entity[]>([]);
  const scoreRef = useRef(0);

  const handleItemClick = (e: React.MouseEvent | React.TouchEvent, item: Entity) => {
    e.stopPropagation();
    if (gameWon || item.isHit) return;

    if (item.type === 'TARGET') {
        scoreRef.current += 1;
        
        // Mark as hit to trigger animation
        itemsRef.current = itemsRef.current.map(i => 
          i.id === item.id ? { ...i, isHit: true } : i
        );
        
        setItems([...itemsRef.current]);
        setScore(scoreRef.current);

        // Remove after animation
        setTimeout(() => {
          itemsRef.current = itemsRef.current.filter(i => i.id !== item.id);
          setItems([...itemsRef.current]);
        }, 300);

        if (scoreRef.current >= 10) {
            setGameWon(true);
        }
    } else {
        scoreRef.current = Math.max(0, scoreRef.current - 2);
        setScore(scoreRef.current);
        
        setRedFlash(true);
        setShake(true);
        setTimeout(() => {
          setRedFlash(false);
          setShake(false);
        }, 200);
    }
  };

  useEffect(() => {
    const loopInterval = setInterval(() => {
      if (gameWon) return;
      const now = Date.now();

      // Faster spawn rate for more action
      if (now - lastSpawnTime.current > 800) {
        lastSpawnTime.current = now;
        const isTarget = Math.random() > 0.4;
        const pool = isTarget ? TARGETS : FRIENDLIES;
        const template = pool[Math.floor(Math.random() * pool.length)];
        itemsRef.current.push({
            id: idCounter.current++,
            x: Math.random() * 80 + 10,
            y: -10, 
            type: isTarget ? 'TARGET' : 'FRIENDLY',
            icon: template.icon,
            name: template.name
        });
      }

      // Increased vertical movement speed (from 1.0 to 2.2)
      itemsRef.current.forEach(i => {
        if (!i.isHit) i.y += 2.2;
      });

      // Filter items that have gone off-screen
      itemsRef.current = itemsRef.current.filter(i => i.y < 115);
      setItems([...itemsRef.current]);

    }, 30);

    return () => clearInterval(loopInterval);
  }, [gameWon]);

  return (
    <div 
        ref={containerRef}
        className={`h-[500px] w-full relative overflow-hidden bg-slate-900 border-4 border-green-800 rounded select-none touch-none cursor-crosshair flex-shrink-0 transition-transform ${shake ? 'animate-shake' : ''}`}
    >
        {redFlash && (
            <div className="absolute inset-0 bg-red-500/30 z-50 pointer-events-none animate-pulse"></div>
        )}

        {/* Score Board */}
        <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-50 pointer-events-none">
            <div className={`border-2 px-3 py-1 rounded shadow-md transition-colors duration-200 ${redFlash ? 'bg-red-100 border-red-800 text-red-900' : 'bg-green-100 border-green-800 text-green-900'}`}>
                <p className="text-[10px] font-bold">SCORE: {score}/10</p>
            </div>
        </div>

        {/* Instructions */}
        <div className="absolute top-12 left-0 right-0 z-40 pointer-events-none flex justify-center">
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded text-center border border-white/10 shadow-lg">
                <p className="text-white font-['Kanit'] font-bold text-sm drop-shadow-md">
                   ภารกิจ: ยิงสิ่งที่แชมป์ไม่ชอบ!
                </p>
                <p className="text-green-300 text-[10px] mt-1">
                    (Shoot bad things, ignore cute things!)
                </p>
            </div>
        </div>

        {gameWon && (
             <div className="absolute inset-x-0 bottom-0 z-50 animate-float">
               <div className="bg-white border-t-4 border-gray-900 p-6 relative shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
                 <div className="absolute -top-3 left-4 bg-green-100 px-2 border-2 border-gray-900 text-[10px] font-bold text-green-800 uppercase tracking-wider transform -rotate-2">
                   Champ says:
                 </div>
                 
                 <div className="flex gap-4 items-center mt-1">
                    <div className="text-4xl drop-shadow">
                       🧙🏻‍♂️
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-2">
                       <p className="text-sm text-green-900 leading-tight typewriter-cursor font-bold font-['Kanit']">
                          เก่งมากๆ ถือว่ารู้จักกันดี <br/>
                          <span className="text-[10px] text-green-600">(Very good! You know me well!)</span>
                       </p>
                       <button 
                         onClick={onComplete}
                         className="self-end bg-green-600 text-white text-[10px] px-3 py-1 mt-1 border-b-2 border-green-800 active:border-b-0 active:translate-y-[2px] rounded font-bold"
                       >
                         NEXT &gt;
                       </button>
                    </div>
                 </div>
               </div>
             </div>
        )}

        <div className="absolute inset-0 z-10">
            {items.map(item => (
                <div
                    key={item.id}
                    className={`absolute transform -translate-x-1/2 cursor-pointer flex flex-col items-center
                      ${item.isHit ? 'scale-150 opacity-0 rotate-12 transition-all duration-300' : 'hover:scale-110 active:scale-95'}`}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    onMouseDown={(e) => handleItemClick(e, item)}
                    onTouchStart={(e) => handleItemClick(e, item)}
                >
                    <span className="text-6xl drop-shadow-lg filter select-none">
                      {item.icon}
                    </span>
                    {item.isHit && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl text-yellow-400 animate-ping">💥</span>
                    )}
                </div>
            ))}
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.3) 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}
        ></div>
    </div>
  );
};