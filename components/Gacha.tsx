
import React, { useState } from 'react';
import { GachaItem } from '../types.ts';

interface GachaProps {
  onReset?: () => void;
  onKeepMemories?: () => void;
}

// Reordered as requested: Hug, Massage, Letter, Bouquet
const SEQUENTIAL_REWARDS: GachaItem[] = [
  { text: "กอด (Warm Hug)", rarity: "COMMON", icon: "🫂" },
  { text: "บัตรนวด (Massage Coupon)", rarity: "RARE", icon: "💆‍♂️" },
  { text: "จดหมายลับ (Secret Letter)", rarity: "SPECIAL", icon: "💌" },
  { text: "ช่อดอกไม้ (Bouquet)", rarity: "LEGENDARY", icon: "💐" },
];

export const Gacha: React.FC<GachaProps> = ({ onReset, onKeepMemories }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [currentReward, setCurrentReward] = useState<GachaItem | null>(null);
  const [nextRewardIndex, setNextRewardIndex] = useState(0);
  const [showEndDialogue, setShowEndDialogue] = useState(false);
  const [isReadingLetter, setIsReadingLetter] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(false);

  const totalBoxes = SEQUENTIAL_REWARDS.length;
  const remainingBoxes = totalBoxes - nextRewardIndex;
  const allUnlocked = nextRewardIndex >= totalBoxes;

  const handleOpen = () => {
    if (nextRewardIndex >= totalBoxes) {
        setShowEndDialogue(true);
        return;
    }

    setIsShaking(true);
    setCurrentReward(null);
    setShowEndDialogue(false);
    
    setTimeout(() => {
      setIsShaking(false);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 500);

      setCurrentReward(SEQUENTIAL_REWARDS[nextRewardIndex]);
      setNextRewardIndex(prev => prev + 1);
    }, 2000);
  };

  const handleRevisit = (item: GachaItem) => {
      setCurrentReward(item);
      setViewingHistory(true);
      setShowEndDialogue(false);
  };

  const handleNextAction = () => {
      if (currentReward?.rarity === 'SPECIAL') {
          setIsReadingLetter(true);
      } else {
          setCurrentReward(null);
          setViewingHistory(false);
          if (!viewingHistory && nextRewardIndex >= SEQUENTIAL_REWARDS.length) {
              setShowEndDialogue(true);
          }
      }
  };

  const closeLetter = () => {
      setIsReadingLetter(false);
      setCurrentReward(null);
      setViewingHistory(false);
      if (nextRewardIndex >= SEQUENTIAL_REWARDS.length) {
          setShowEndDialogue(true);
      }
  };

  const getRarityBg = (rarity: string) => {
      if (rarity === 'SPECIAL') return 'bg-pink-50 border-pink-400';
      if (rarity === 'LEGENDARY') return 'bg-yellow-50 border-yellow-500';
      if (rarity === 'RARE') return 'bg-purple-50 border-purple-400';
      return 'bg-gray-50 border-gray-400';
  }

  const renderRarityBadge = (rarity: string) => {
      if (rarity === 'SPECIAL') {
          return (
            <div className="mb-6 relative">
                <div className="absolute -inset-2 bg-pink-300 blur-xl opacity-30 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-b from-pink-400 to-pink-600 border-2 border-pink-800 text-white px-5 py-2 shadow-[0_4px_0_rgba(157,23,77,1)] rounded-sm">
                    <span className="font-bold tracking-[0.2em] text-[9px] drop-shadow-sm flex items-center gap-2">
                      <span className="animate-ping">♥</span> SPECIAL <span className="animate-ping">♥</span>
                    </span>
                </div>
            </div>
          );
      }
      if (rarity === 'LEGENDARY') {
          return (
            <div className="mb-6 relative animate-bounce">
                <div className="absolute -inset-4 bg-yellow-400 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-500 border-2 border-yellow-700 text-red-900 px-6 py-2 shadow-[0_4px_0_rgba(161,98,7,1)] rounded-sm">
                    <span className="font-bold tracking-[0.2em] text-xs drop-shadow-sm">★ {rarity} ★</span>
                </div>
            </div>
          );
      }
      if (rarity === 'RARE') {
          return (
            <div className="mb-6 bg-gradient-to-b from-purple-400 to-purple-600 border-2 border-purple-800 text-white px-5 py-2 shadow-[0_4px_0_rgba(88,28,135,1)] rounded-sm">
                <span className="font-bold tracking-wider text-xs drop-shadow-sm">✦ {rarity} ✦</span>
            </div>
          );
      }
      return (
        <div className="mb-6 bg-slate-200 border-2 border-slate-400 text-slate-600 px-4 py-1 shadow-[0_3px_0_rgba(148,163,184,1)] rounded-sm">
            <span className="font-bold tracking-wide text-[10px]">{rarity}</span>
        </div>
      );
  };

  if (isReadingLetter) {
      return (
        <div className="absolute inset-0 z-50 bg-pink-50 flex flex-col items-center justify-start overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute text-pink-400 animate-fall"
                        style={{
                            left: `${Math.random() * 100}%`,
                            fontSize: `${Math.random() * 20 + 10}px`,
                            animationDuration: `${Math.random() * 3 + 3}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    >
                        {['♥', '💖', '💌', '🌸'][Math.floor(Math.random() * 4)]}
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full h-full p-6 flex flex-col">
                <div className="bg-white border-4 border-pink-300 shadow-lg flex-1 p-6 rounded-sm overflow-y-auto relative animate-pop">
                    <div className="absolute top-0 left-0 right-0 h-4 bg-pink-200 opacity-30"></div>
                    <h2 className="text-center text-pink-600 font-bold text-lg mb-6 border-b-2 border-pink-100 pb-2">To: อุ้ย (Oui)</h2>
                    <div className="font-['Kanit'] text-gray-700 leading-relaxed text-sm space-y-4">
                        <p>สวัสดีเราแชมป์นะ ยินดีที่ได้รู้จัก และยินดีที่ได้พบนะครับ ^-^</p>
                        <p>อุ้ยเป็นคนน่ารักมาก ใจเย็น มีเหตุผล ชอบที่อุ้ยเป็นแบบนี้นะครับ</p>
                        <p>ขอบคุณที่เข้ามาในชีวิตมากๆนะ</p>
                        <p>แล้วก็ขอโทษสำหรับทุกอย่างที่อาจจะมีผิดพลาดไป T-T</p>
                        <br/>
                        <p className="font-bold text-pink-600">สุดท้ายแล้ว สุขสันต์วันวาเลนไทน์</p>
                        <p>ขอให้อุ้ยมีแต่ความสุขกับทุกๆเรื่อง ยิ้มเยอะๆ สุขภาพแข็งแรง ไม่ว่าอะไรก็ขอให้ได้ดั่งใจทุกอย่าง เงินไหลมาเทมา แฮปปี้ๆ enjoy กับชีวิตนะครับ</p>
                    </div>
                    <div className="mt-8 text-right text-xs text-gray-400 font-['Press_Start_2P']">From: Champ</div>
                </div>
                <button 
                    onClick={closeLetter}
                    className="mt-4 bg-pink-500 text-white py-3 px-6 rounded border-b-4 border-pink-700 font-bold active:border-b-0 active:translate-y-1 transition-all shadow-md w-full"
                >
                    CLOSE LETTER
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center relative w-full">
      {showFlash && <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none"></div>}
        
      {showEndDialogue && !currentReward && (
        <div className="absolute inset-x-0 bottom-0 z-50 animate-float -mx-6 -mb-6">
          <div className="bg-white border-t-4 border-gray-900 p-3 relative shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
            <div className="absolute -top-3 left-4 bg-green-100 px-2 border-2 border-gray-900 text-[8px] font-bold text-green-800 uppercase tracking-wider transform -rotate-1">
              Champ says:
            </div>
            <div className="flex gap-3 items-center">
               <div className="text-2xl drop-shadow">🧙🏻‍♂️</div>
               <div className="flex-1 flex flex-col items-start gap-1">
                  <p className="text-[12px] text-green-900 leading-tight typewriter-cursor font-bold font-['Kanit']">
                     หมดแล้ว อิอิ สุขสันต์วันวาเลนไทน์ครับ
                  </p>
                  <button 
                    onClick={onKeepMemories}
                    className="self-end bg-pink-500 text-white text-[10px] px-3 py-2 mt-1 border-2 border-pink-700 active:border-b-2 active:translate-y-[1px] rounded font-bold hover:bg-pink-600 transition-colors shadow-sm"
                  >
                    KEEP MEMORIES 📸
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {!currentReward ? (
        <div className="flex flex-col items-center justify-between h-full pb-2 w-full relative">
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
            {!allUnlocked ? (
              <div className="flex flex-col items-center justify-center h-full pb-16 w-full">
                <div className="mb-6 text-center animate-pop">
                    <p className="text-[10px] text-green-800 font-bold uppercase tracking-widest mb-1">คุณได้รับกล่องสุ่ม</p>
                    <h3 className="text-xl text-green-900 font-bold leading-tight uppercase tracking-tight">Mystery Boxes</h3>
                    <div className="inline-flex items-center justify-center mt-3 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold border-2 border-green-800 shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                       จำนวน: {remainingBoxes}
                    </div>
                </div>

                <div className="flex flex-col items-center relative">
                  <div 
                      onClick={!isShaking ? handleOpen : undefined}
                      className={`text-[8.5rem] cursor-pointer transition-transform select-none drop-shadow-2xl ${isShaking ? 'animate-shake' : 'animate-float hover:scale-110 active:scale-95'}`}
                  >
                      🎁
                  </div>
                  
                  {/* Simple text below box as requested */}
                  <div className="mt-4 text-center">
                     <p className="text-[11px] text-green-800 font-bold tracking-tight font-['Kanit'] animate-pulse">
                        แตะเพื่อเปิด กล่องสุ่มมหัศจรรย์
                     </p>
                  </div>

                  {isShaking && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-yellow-400 animate-ping opacity-70 text-8xl">✨</div>
                      </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col px-2 pt-2 mb-16 overflow-hidden">
                 <div className="bg-green-100 border-2 border-green-600 rounded p-1 mb-2 text-center shrink-0">
                    <h3 className="text-[10px] font-bold text-green-800 uppercase tracking-widest">My Collection</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-2 overflow-y-auto p-1 flex-1">
                    {SEQUENTIAL_REWARDS.map((item, idx) => (
                        <div 
                           key={idx}
                           onClick={() => handleRevisit(item)}
                           className="bg-white border-2 border-gray-200 rounded p-2 flex flex-col items-center gap-1 cursor-pointer hover:border-green-500 hover:shadow-md transition-all active:scale-95"
                        >
                           <div className="text-2xl">{item.icon}</div>
                           <span className="text-[9px] text-center font-bold text-gray-600 truncate w-full font-['Kanit']">
                               {item.text.split('(')[0]}
                           </span>
                        </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {!allUnlocked && nextRewardIndex > 0 && (
             <div className="w-full flex justify-center gap-3 animate-pop z-10 px-4 h-12 items-end shrink-0 mb-2">
                <div className="bg-white/80 border-2 border-green-100 rounded-full px-3 py-1 flex gap-2 shadow-sm backdrop-blur-sm">
                   {SEQUENTIAL_REWARDS.slice(0, nextRewardIndex).map((item, idx) => (
                       <div key={idx} className="text-lg filter drop-shadow-sm transform hover:scale-125 transition-transform cursor-help" title={item.text}>
                           {item.icon}
                       </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full animate-pop px-4">
          <div className="relative mb-6">
            {/* Legendary / Special Particles */}
            {currentReward.rarity === 'SPECIAL' && (
               <div className="absolute inset-0 -m-8 pointer-events-none">
                  <div className="absolute inset-0 bg-pink-400 opacity-20 blur-3xl animate-pulse"></div>
                  <div className="absolute top-0 left-0 text-xl animate-bounce">💖</div>
                  <div className="absolute top-0 right-0 text-xl animate-bounce delay-100">✨</div>
               </div>
            )}
            
            {currentReward.rarity === 'LEGENDARY' && (
               <div className="absolute inset-0 -m-12 pointer-events-none overflow-visible">
                  <div className="absolute inset-0 bg-yellow-400 opacity-25 blur-3xl animate-pulse"></div>
                  {/* Falling Petals for Bouquet */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute animate-fall" 
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                        fontSize: '20px'
                      }}
                    >
                      {['🌸', '🌹', '✨'][Math.floor(Math.random() * 3)]}
                    </div>
                  ))}
               </div>
            )}

            <div className={`text-7xl drop-shadow-md transform hover:rotate-12 transition-transform duration-300 ${currentReward.rarity === 'SPECIAL' || currentReward.rarity === 'LEGENDARY' ? 'animate-float scale-110' : ''}`}>
              {currentReward.icon}
            </div>
          </div>
          
          <div className={`w-full max-w-[280px] border-4 p-5 text-center shadow-[10px_10px_0_rgba(0,0,0,0.1)] rounded-sm ${getRarityBg(currentReward.rarity)}`}>
            <div className="flex justify-center -mt-11">
               {renderRarityBadge(currentReward.rarity)}
            </div>
            
            <p className="text-xs leading-relaxed mb-6 text-gray-900 font-bold min-h-[3rem] flex items-center justify-center font-['Kanit'] px-2">
                {currentReward.text}
            </p>
            
            <button 
                onClick={handleNextAction}
                className={`w-full text-white text-[11px] px-3 py-3 border-b-4 hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all font-bold uppercase tracking-wider rounded-sm ${currentReward.rarity === 'SPECIAL' ? 'bg-pink-500 border-pink-700' : 'bg-green-600 border-green-800'}`}
            >
                {currentReward.rarity === 'SPECIAL' ? 'OPEN SPECIAL LETTER ♥' : (viewingHistory ? 'BACK TO COLLECTION' : (nextRewardIndex < SEQUENTIAL_REWARDS.length ? 'OPEN NEXT BOX' : 'VIEW COLLECTION'))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
