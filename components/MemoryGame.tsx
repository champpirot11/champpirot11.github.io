
import React, { useState, useEffect } from 'react';
import { MemoryCard } from '../types.ts';

interface MemoryGameProps {
  onComplete: () => void;
}

// Reduced to 3 items for easier gameplay
const ICONS = ['💖', '🍦', '🐱'];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [showEndDialogue, setShowEndDialogue] = useState(false);

  useEffect(() => {
    // Initialize Game
    const duplicatedIcons = [...ICONS, ...ICONS];
    const shuffled = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (id: number) => {
    // If already matched or flipped or 2 cards already flipped, ignore
    if (showEndDialogue || flippedIds.length >= 2 || cards.find(c => c.id === id)?.isFlipped || cards.find(c => c.id === id)?.isMatched) {
      return;
    }

    // Flip the card
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlippedIds = [...flippedIds, id];
    setFlippedIds(newFlippedIds);

    // Check Match
    if (newFlippedIds.length === 2) {
      const [firstId, secondId] = newFlippedIds;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        // Match found
        setTimeout(() => {
            setCards(prev => prev.map(c => 
                (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true, isFlipped: true } : c
            ));
            setFlippedIds([]);
            setMatchedCount(prev => {
                const newVal = prev + 1;
                if (newVal === ICONS.length) {
                    setTimeout(() => setShowEndDialogue(true), 1000);
                }
                return newVal;
            });
            // Show +1 animation
            setShowPlusOne(true);
            setTimeout(() => setShowPlusOne(false), 1000);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-4 relative w-full justify-start">
      <h2 className="text-xs text-green-800 font-bold mb-6 mt-2 shrink-0">MATCH THE PAIRS</h2>
      
      {showPlusOne && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-green-700 font-bold text-lg animate-float pointer-events-none drop-shadow-md bg-white px-2 py-1 rounded border border-green-200">
              +1 LOVE
          </div>
      )}

      {/* Grid container: Fixed width and centering to maintain square aspect ratio */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[300px] mx-auto">
        {cards.map(card => (
          <div 
            key={card.id} 
            className="w-full relative cursor-pointer" 
            style={{ aspectRatio: '1 / 1' }}
            onClick={() => handleCardClick(card.id)}
          >
             {/* Inner Container for Flip */}
             <div className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                
                {/* Front Face (Green Cover) */}
                <div className="absolute inset-0 bg-green-500 border-2 border-green-700 rounded backface-hidden flex items-center justify-center shadow-sm hover:bg-green-400 transition-colors">
                    <span className="text-green-800 opacity-50 text-xs font-bold">?</span>
                </div>

                {/* Back Face (Icon) */}
                <div className="absolute inset-0 bg-white border-2 border-green-200 rounded backface-hidden rotate-y-180 flex items-center justify-center text-3xl shadow-sm">
                    {card.icon}
                </div>

             </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-[10px] text-green-700 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200 shrink-0">
          Pairs Found: {matchedCount} / {ICONS.length}
      </div>

      {/* End Dialogue - Standardized Bottom Anchor */}
      {showEndDialogue && (
        <div className="absolute inset-x-0 bottom-0 z-30 animate-float -mx-6 -mb-6">
          <div className="bg-white border-t-4 border-gray-900 p-6 relative shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
            <div className="absolute -top-3 left-4 bg-green-100 px-2 border-2 border-gray-900 text-[10px] font-bold text-green-800 uppercase tracking-wider transform -rotate-2">
              Champ says:
            </div>
            
            <div className="flex gap-4 items-center mt-1">
               <div className="text-4xl drop-shadow">
                  🧙🏻‍♂️
               </div>
               <div className="flex-1 flex flex-col items-start gap-2">
                  <p className="text-sm text-green-900 leading-tight typewriter-cursor font-bold font-['Kanit']">
                     ไม่เลวนี่หน่า เกมต่อไปนี่แหละของจริง หึหึหึ
                  </p>
                  <button 
                    onClick={onComplete}
                    className="self-end bg-green-600 text-white text-[10px] px-3 py-1 mt-1 border-b-2 border-green-800 active:border-b-0 active:translate-y-[2px] rounded"
                  >
                    NEXT &gt;
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
