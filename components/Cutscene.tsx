import React, { useEffect, useState } from 'react';
import { CutsceneData } from '../types';

interface CutsceneProps {
  data: CutsceneData;
}

const Cutscene: React.FC<CutsceneProps> = ({ data }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center cursor-pointer" onClick={data.onFinish}>
       {/* Background Image with Ken Burns effect simulation */}
       <div 
         className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-[20s] ease-linear scale-110"
         style={{ backgroundImage: `url('${data.imageUrl || "https://picsum.photos/1920/1080?grayscale"}')` }}
       ></div>
       
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

       <div className={`relative z-10 max-w-4xl transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-slate-200 mb-8 border-b-2 border-slate-700 pb-4 inline-block tracking-widest cinematic-text">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-serif leading-relaxed drop-shadow-lg">
            {data.text}
          </p>
          
          <div className="mt-16 animate-pulse">
             <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Devam Etmek İçin Tıkla</span>
          </div>
       </div>
    </div>
  );
};

export default Cutscene;