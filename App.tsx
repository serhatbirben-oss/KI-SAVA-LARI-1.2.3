import React, { useState } from 'react';
import { GameView, CharacterProfile } from './types';
import SnowEffect from './components/SnowEffect';
import Hero from './components/Hero';
import CampaignScreen from './components/WarRoom'; // Mapped to new logical component
import CharacterCreation from './components/CharacterCreation';
import { Skull } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>(GameView.HOME);
  const [character, setCharacter] = useState<CharacterProfile | undefined>(undefined);

  const handleCharacterComplete = (profile: CharacterProfile) => {
    setCharacter(profile);
    setCurrentView(GameView.CAMPAIGN);
  };

  const handleGameOver = () => {
    setCurrentView(GameView.GAME_OVER);
  };

  const resetGame = () => {
    setCharacter(undefined);
    setCurrentView(GameView.HOME);
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-inter selection:bg-red-900 selection:text-white">
      <SnowEffect />

      <main className="relative z-10 h-screen flex flex-col">
        {currentView === GameView.HOME && (
          <Hero onStart={() => setCurrentView(GameView.CHARACTER_CREATION)} />
        )}

        {currentView === GameView.CHARACTER_CREATION && (
          <CharacterCreation onComplete={handleCharacterComplete} />
        )}

        {currentView === GameView.CAMPAIGN && character && (
          <CampaignScreen playerProfile={character} onGameOver={handleGameOver} />
        )}

        {currentView === GameView.GAME_OVER && (
           <div className="flex-1 flex flex-col items-center justify-center bg-black relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/blood-splatter.png')] opacity-30 z-0"></div>
              <Skull size={80} className="text-red-900 mb-6 animate-pulse z-10" />
              <h1 className="text-6xl font-cinzel font-bold text-red-700 z-10 mb-4">ÖLÜM SENİ BULDU</h1>
              <p className="text-slate-500 font-cinzel mb-8 z-10">Hikayen burada, karların altında sona erdi.</p>
              <button 
                onClick={resetGame}
                className="z-10 px-8 py-3 border border-slate-700 hover:border-red-600 hover:text-red-500 transition-colors uppercase font-cinzel tracking-widest"
              >
                Yeni Bir Kader Çiz
              </button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;