
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types.ts';

interface QuizProps {
  onComplete: () => void;
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: "แชมป์ชอบกินอะไร?",
    options: ["ข้าวผัดใส่แครอทเยอะๆ", "ผัดพริกแกงไก่เผ็ดๆ", "ถั่วลันเตา", "ข้าวกะเพราหมูกรอบ"],
    correctIndex: 0
  },
  {
    question: "เราเจอกันที่ไหน?",
    options: ["ทินเดอร์", "ห้องสมุด", "วัด", "บนบีทีเอส"],
    correctIndex: 0 
  },
  {
    question: "แชมป์ชื่อจริงว่าอะไร?",
    options: ["ภานุพงศ์ เพ็งอ่วม", "สุจริต พิชิตวังวน", "เทพกร ทรพี", "ณเดช คุกิมิยะ"],
    correctIndex: 0
  }
];

export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{text: string, originalIndex: number}[]>([]);
  const [showEndDialogue, setShowEndDialogue] = useState(false);

  const currentQ = QUESTIONS[currentQIndex];

  // Shuffle options whenever the current question index changes
  useEffect(() => {
    if (currentQ) {
      const optionsWithIndex = currentQ.options.map((opt, i) => ({
        text: opt,
        originalIndex: i
      }));
      // Simple shuffle
      const shuffled = optionsWithIndex.sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    }
  }, [currentQIndex, currentQ]);

  const handleAnswer = (originalIndex: number) => {
    if (feedback || showEndDialogue) return; 

    if (originalIndex === currentQ.correctIndex) {
      setFeedback('CORRECT');
      setTimeout(() => {
        setFeedback(null);
        if (currentQIndex < QUESTIONS.length - 1) {
          setCurrentQIndex(prev => prev + 1);
        } else {
          // All questions done, show end dialogue
          setShowEndDialogue(true);
        }
      }, 1500);
    } else {
      setFeedback('WRONG');
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 relative">
      <h2 className="text-center text-xs text-green-900 font-bold mb-6 border-b-2 border-green-300 pb-2">
        DO YOU REALLY KNOW ME?
      </h2>

      {/* Progress */}
      <div className="text-[10px] text-green-700 font-bold text-center mb-4">
        Question {currentQIndex + 1}/{QUESTIONS.length}
      </div>

      <div className="bg-green-50 border-2 border-green-800 p-4 mb-4 min-h-[80px] flex items-center justify-center shadow-md rounded">
        <p className="text-sm text-center leading-relaxed text-green-900 font-bold font-['Kanit']">{currentQ?.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {shuffledOptions.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.originalIndex)}
            disabled={feedback !== null || showEndDialogue}
            className={`
              text-xs py-3 px-4 text-left border-2 rounded transition-all shadow-sm font-bold font-['Kanit']
              ${feedback !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100 hover:border-green-400 active:translate-y-0.5'}
              bg-white text-green-900 border-green-200
            `}
          >
            {String.fromCharCode(65 + idx)}. {option.text}
          </button>
        ))}
      </div>

      {/* Feedback Dialogue Box - Standardized Bottom Anchor */}
      {feedback && (
        <div className="absolute inset-x-0 bottom-0 z-20 animate-float -mx-6 -mb-6">
          <div className="bg-white border-t-4 border-gray-900 p-6 relative shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
             <div className="absolute -top-3 left-4 bg-green-100 px-2 border-2 border-gray-900 text-[10px] font-bold text-green-800 uppercase tracking-wider transform -rotate-2">
              Champ says:
            </div>
            
            <div className="flex gap-4 items-center mt-1">
               <div className="text-4xl drop-shadow">
                  🧙🏻‍♂️
               </div>
               <div className="flex-1">
                  <p className={`text-sm leading-tight typewriter-cursor font-bold font-['Kanit'] ${feedback === 'CORRECT' ? 'text-green-700' : 'text-red-600'}`}>
                     {feedback === 'CORRECT' ? "เก่งมากกบี๋! ถูกต้องครับ <3" : "ผิดครับ! ลองใหม่นะบี๋"}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* End Level Dialogue - Standardized Bottom Anchor */}
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
                     เก่งมาก ดูซิจะผ่านด่านต่อไปได้ไหม
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
