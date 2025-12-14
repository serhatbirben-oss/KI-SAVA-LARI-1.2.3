import React, { useState } from 'react';
import { KINGDOMS, KingdomName, Lord } from '../types';
import { BookOpen, Users, Flag, ChevronRight } from 'lucide-react';

interface EncyclopediaProps {
  knownLords: Lord[];
  onClose: () => void;
}

const Encyclopedia: React.FC<EncyclopediaProps> = ({ knownLords, onClose }) => {
  const [tab, setTab] = useState<'KINGDOMS' | 'LORDS'>('KINGDOMS');
  const [selectedKingdom, setSelectedKingdom] = useState<KingdomName | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
       <div className="bg-slate-900 w-full max-w-5xl h-[80vh] flex rounded-lg border border-slate-600 shadow-2xl overflow-hidden relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">KAPAT [X]</button>
          
          {/* Sidebar */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-2">
             <div className="text-2xl font-cinzel text-yellow-600 mb-6 flex items-center gap-2">
                <BookOpen/> Ansiklopedi
             </div>
             
             <button 
                onClick={() => setTab('KINGDOMS')} 
                className={`p-3 text-left rounded flex items-center gap-3 transition-colors ${tab === 'KINGDOMS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
             >
                <Flag size={18}/> Krallıklar
             </button>
             <button 
                onClick={() => setTab('LORDS')} 
                className={`p-3 text-left rounded flex items-center gap-3 transition-colors ${tab === 'LORDS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
             >
                <Users size={18}/> Tanınan Lordlar
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
             {tab === 'KINGDOMS' && (
                <div className="grid grid-cols-1 gap-6">
                   {Object.values(KINGDOMS).map(k => (
                      <div key={k.id} className="bg-slate-800 p-6 rounded border border-slate-700">
                         <h3 className={`text-2xl font-cinzel font-bold mb-2 ${k.color}`}>{k.name}</h3>
                         <div className="text-sm text-slate-500 uppercase tracking-widest mb-4">Hükümdar: {k.ruler}</div>
                         <p className="text-slate-300 leading-relaxed mb-4">{k.description}</p>
                         <div className="bg-slate-900/50 p-3 rounded text-green-400 text-sm font-bold border border-slate-700 inline-block">
                            Kültür Bonusu: {k.bonus}
                         </div>
                      </div>
                   ))}
                </div>
             )}

             {tab === 'LORDS' && (
                <div className="space-y-4">
                   <h2 className="text-xl font-cinzel text-white mb-4">Karşılaştığın Soylular</h2>
                   {knownLords.length === 0 ? (
                      <div className="text-slate-500 italic">Henüz hiçbir lord ile tanışmadın. Dünyayı gez.</div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {knownLords.map(lord => (
                            <div key={lord.id} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center">
                               <div>
                                  <div className="font-bold text-lg text-white">{lord.name}</div>
                                  <div className="text-xs text-slate-400">{KINGDOMS[lord.kingdom].name} | {lord.clanName} Klanı</div>
                                  <div className="text-xs text-slate-500 mt-1">Kişilik: {lord.personality}</div>
                               </div>
                               <div className={`text-xl font-bold ${lord.relation > 0 ? 'text-green-500' : lord.relation < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                  {lord.relation}
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default Encyclopedia;