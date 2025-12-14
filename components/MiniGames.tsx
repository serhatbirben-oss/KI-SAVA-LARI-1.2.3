import React, { useState, useEffect, useRef } from 'react';
import { Timer, Sword, Zap } from 'lucide-react';

// --- GENERIC ACTION BAR GAME ---
// Used for Smithing, Harvesting, and Critical Combat Strikes
interface ActionBarGameProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  onSuccess: () => void;
  onFail: () => void;
  onClose: () => void;
}

export const ActionBarGame: React.FC<ActionBarGameProps> = ({ title, description, icon, difficulty = 'MEDIUM', onSuccess, onFail, onClose }) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const requestRef = useRef<number>(0);

  // Config based on difficulty
  let speed = 1.5;
  let targetSize = 20; // Percent width

  switch (difficulty) {
    case 'EASY': speed = 1.0; targetSize = 35; break;
    case 'MEDIUM': speed = 2.0; targetSize = 25; break;
    case 'HARD': speed = 3.0; targetSize = 15; break;
    case 'EXPERT': speed = 4.5; targetSize = 10; break;
  }

  // Randomized start position for target zone each time
  const [targetStart] = useState(() => Math.floor(Math.random() * (90 - targetSize)) + 5);
  const targetEnd = targetStart + targetSize;

  useEffect(() => {
    const animate = () => {
      if (isRunning) {
        setPosition(prev => {
          let next = prev + (speed * direction);
          if (next >= 100) {
            setDirection(-1);
            next = 100;
          } else if (next <= 0) {
            setDirection(1);
            next = 0;
          }
          return next;
        });
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [direction, isRunning, speed]);

  const handleAction = () => {
    if (!isRunning) return;
    setIsRunning(false);
    
    if (position >= targetStart && position <= targetEnd) {
      setTimeout(() => onSuccess(), 300);
    } else {
      setTimeout(() => onFail(), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-yellow-700 rounded-lg p-8 max-w-md w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        {/* Cinematic Header */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-900 px-6 py-1 border border-yellow-600 rounded">
            <span className="text-yellow-100 font-cinzel font-bold tracking-widest text-sm uppercase">Refleks Testi</span>
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 text-slate-500 hover:text-white">X</button>
        
        <h2 className="text-3xl font-cinzel text-white mb-4 flex items-center justify-center gap-3">
           {icon || <Sword className="text-yellow-500 animate-pulse"/>} {title}
        </h2>
        
        <p className="text-slate-400 mb-8 font-inter">{description}</p>

        {/* The Bar */}
        <div className="relative w-full h-12 bg-slate-950 rounded border-2 border-slate-600 mb-8 overflow-hidden shadow-inner">
           {/* Zone Indicators for decoration */}
           <div className="absolute inset-0 flex justify-between px-2 items-center opacity-20">
               <div className="h-full w-[1px] bg-slate-500"></div>
               <div className="h-full w-[1px] bg-slate-500"></div>
               <div className="h-full w-[1px] bg-slate-500"></div>
           </div>

           {/* Sweet Spot */}
           <div 
             className="absolute top-0 bottom-0 bg-gradient-to-r from-green-600 via-green-400 to-green-600 border-x-2 border-white shadow-[0_0_20px_rgba(74,222,128,0.5)]"
             style={{ left: `${targetStart}%`, width: `${targetSize}%` }}
           >
              <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
           </div>
           
           {/* Moving Marker */}
           <div 
             className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_white,0_0_30px_yellow] z-10"
             style={{ left: `${position}%` }}
           >
               <div className="absolute -top-1 -bottom-1 -left-1 -right-1 bg-white/30 blur-sm"></div>
           </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAction}
          disabled={!isRunning}
          className="w-full bg-gradient-to-t from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white font-bold py-5 rounded border-2 border-red-950 shadow-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 group"
        >
          <div className="flex items-center justify-center gap-2 text-xl font-cinzel tracking-[0.2em] group-hover:text-yellow-200">
             <Zap size={24} className="group-hover:animate-bounce"/> HAREKETE GEÇ
          </div>
        </button>
      </div>
    </div>
  );
};