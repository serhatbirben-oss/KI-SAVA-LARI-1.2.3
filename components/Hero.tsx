import React from 'react';
import { ChevronDown, Flame, Snowflake } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with dynamic overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0b1221] to-slate-950 z-0"></div>
      
      {/* High Fidelity Background Image Simulation */}
      <div className="absolute inset-0 opacity-40 z-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center mix-blend-overlay scale-105 animate-pulse-slow"></div>
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)] z-10"></div>

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-6">
           <div className="flex items-center justify-center gap-4 text-cyan-500 tracking-[0.4em] text-xs md:text-sm font-inter uppercase font-bold opacity-80">
              <span className="w-12 h-[1px] bg-cyan-500/50"></span>
              <Snowflake size={14} className="animate-spin-slow"/> EBEDİ KIŞ BAŞLADI <Snowflake size={14} className="animate-spin-slow"/>
              <span className="w-12 h-[1px] bg-cyan-500/50"></span>
           </div>
           
           <h1 className="text-5xl md:text-7xl lg:text-9xl font-cinzel font-black text-slate-100 tracking-tight cinematic-text leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            SONSUZ<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-500 to-slate-800 relative">
                HÜKÜMDARLAR
                <span className="absolute inset-0 blur-xl bg-cyan-500/20 -z-10"></span>
            </span>
           </h1>
           
           <div className="text-xl md:text-2xl font-cinzel text-slate-400 tracking-widest border-t border-b border-slate-800 py-4 mx-auto max-w-2xl">
              KIŞ SAVAŞLARI DESTANI
           </div>
        </div>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-inter font-light leading-relaxed opacity-80">
          "Eski krallar buzun altında dondu. Valeriana'nın yasaları çatırdıyor. Thorgar'ın baltası bileniyor. 
          Bu, sadece bir savaş değil; bu, hayatta kalmanın en vahşi, en karanlık ve en görkemli çağı."
        </p>

        <div className="pt-12">
          <button 
            onClick={onStart}
            className="group relative px-12 py-5 bg-transparent border border-cyan-900/50 text-cyan-500 font-cinzel font-bold text-xl overflow-hidden transition-all hover:border-cyan-400 hover:text-white hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-950 to-cyan-800 transition-all duration-[500ms] ease-out group-hover:w-full opacity-80"></div>
            <span className="relative flex items-center gap-3 z-10">
              <Flame size={20} className={ "text-orange-500 group-hover:animate-pulse"} />
              KADERİNİ YAZ
              <ChevronDown className="animate-bounce" size={20} />
            </span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-20 flex justify-center gap-8 text-[10px] md:text-xs text-slate-600 tracking-[0.2em] uppercase font-bold">
        <span>PS5 Fidelity Mode</span>
        <span>•</span>
        <span>Ray Tracing: ON</span>
        <span>•</span>
        <span>60 FPS Locked</span>
      </div>
    </div>
  );
};

export default Hero;