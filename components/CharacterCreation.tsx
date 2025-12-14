import React, { useState } from 'react';
import { CharacterProfile, PlayerStats, Banner } from '../types';
import { Hammer, Target, Users, Mountain, Castle, Wind, Skull, Shield, Flag, PenTool } from 'lucide-react';

interface CharacterCreationProps {
  onComplete: (profile: CharacterProfile) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0); // Start at 0 for Naming
  const [name, setName] = useState<string>('');
  const [clanName, setClanName] = useState<string>('');
  const [culture, setCulture] = useState<CharacterProfile['culture'] | null>(null);
  const [background, setBackground] = useState<CharacterProfile['background'] | null>(null);
  const [banner, setBanner] = useState<Banner>({ color: '#1e3a8a', sigil: 'SWORD', sigilColor: '#fbbf24' });
  const [loading, setLoading] = useState(false);

  const getStartingProfile = async (c: CharacterProfile['culture'], b: CharacterProfile['background'], banner: Banner): Promise<CharacterProfile> => {
    // BASE D&D STATS
    let attrs = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    let gold = 50;
    
    // Culture Modifiers
    if (c === 'STEPPE') { attrs.dex += 2; attrs.con += 1; }
    if (c === 'MOUNTAIN') { attrs.str += 2; attrs.con += 1; }
    if (c === 'CITY') { attrs.int += 2; attrs.cha += 1; gold += 50; }

    // Background Modifiers
    if (b === 'SMITH') { attrs.str += 2; gold += 20; }
    if (b === 'POACHER') { attrs.dex += 2; attrs.wis += 1; }
    if (b === 'ORPHAN') { attrs.dex += 1; attrs.con += 2; }

    // Base AC calculation
    const baseAC = 10 + Math.floor((attrs.dex - 10) / 2);

    let startLoc = 'n1'; // Default Valgard
    if (c === 'CITY') startLoc = 'n4'; // Aethelgard
    if (c === 'MOUNTAIN') startLoc = 'n7'; // Fyrod/Mountain

    return {
      name: name || "İsimsiz Sürgün",
      culture: c,
      background: b,
      stats: {
          attributes: attrs,
          gold: gold,
          food: 10,
          currentHp: 25 + (attrs.con * 2),
          maxHp: 25 + (attrs.con * 2),
          morale: 50,
          speed: 4.0,
          baseAC: baseAC
      },
      clan: {
        name: clanName || "Sürgünler Klanı",
        tier: 0,
        renown: 0,
        influence: 0,
        companions: [],
        banner: banner
      },
      party: [],
      inventory: [],
      equipment: { weapon: null, helmet: null, armor: null, horse: null },
      knownLords: [],
      activeQuests: [],
      currentLocationId: startLoc,
      time: { day: 1, hour: 8, phase: 'DAY' },
      isPrisoner: false,
      prisonerDaysRemaining: 0,
      atWarWith: []
    };
  };

  const handleFinish = async () => {
    if (culture && background) {
      setLoading(true);
      const profile = await getStartingProfile(culture, background, banner);
      onComplete(profile);
    }
  };

  const bannerColors = ['#1e3a8a', '#7f1d1d', '#14532d', '#581c87', '#0f172a', '#78350f'];
  const sigilColors = ['#fbbf24', '#ffffff', '#000000', '#94a3b8'];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-black relative z-20 overflow-y-auto">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=4')] opacity-20 bg-cover bg-center fixed"></div>
      
      <div className="max-w-5xl w-full bg-slate-900/95 border border-slate-800 p-4 md:p-8 rounded shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 my-auto">
        <div className="flex justify-center mb-4 md:mb-6">
           <Skull size={48} className="text-slate-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-cinzel text-slate-200 text-center mb-2 tracking-widest uppercase">Kaderin Başlangıcı</h2>
        
        {loading ? (
            <div className="text-center py-20 animate-pulse text-yellow-500 font-cinzel text-xl">
                Zarlar atılıyor... Tarih yazılıyor...
            </div>
        ) : (
            <>
                <p className="text-center text-slate-500 mb-8 font-cinzel text-xs md:text-sm border-b border-slate-800 pb-6">
                "Kim olduğunu seç, sancağını yükselt ve kışa meydan oku."
                </p>

                {/* STEP 0: NAMING */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-700 max-w-md mx-auto">
                        <h3 className="text-xl text-yellow-700 font-cinzel mb-6 text-center">İsmin Nedir?</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-400 mb-2 font-cinzel text-sm">Karakter Adı</label>
                                <div className="relative">
                                    <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Örn: Ragnar"
                                        className="w-full bg-slate-950 border border-slate-700 p-4 pl-10 text-slate-200 focus:border-yellow-600 outline-none rounded font-cinzel"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-2 font-cinzel text-sm">Klan Adı</label>
                                <div className="relative">
                                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                    <input 
                                        type="text" 
                                        value={clanName}
                                        onChange={(e) => setClanName(e.target.value)}
                                        placeholder="Örn: Kuzeyin Kurtları"
                                        className="w-full bg-slate-950 border border-slate-700 p-4 pl-10 text-slate-200 focus:border-yellow-600 outline-none rounded font-cinzel"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 flex justify-center">
                            <button 
                                disabled={!name || !clanName}
                                onClick={() => setStep(1)}
                                className="bg-yellow-900/50 hover:bg-yellow-900 text-yellow-500 hover:text-white px-12 py-3 border border-yellow-900 uppercase font-cinzel tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed w-full md:w-auto"
                            >
                                Devam Et
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: CULTURE */}
                {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <h3 className="text-xl text-yellow-700 font-cinzel mb-6 text-center">Köklerin Neresi?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                        { id: 'STEPPE', icon: Wind, title: 'Bozkırın Rüzgarı', desc: '+2 DEX (Hız/Defans)', color: 'text-yellow-600' },
                        { id: 'MOUNTAIN', icon: Mountain, title: 'Dağın Kayası', desc: '+2 STR (Güç/Hasar)', color: 'text-slate-400' },
                        { id: 'CITY', icon: Castle, title: 'Şehrin Gürültüsü', desc: '+2 INT (Taktik/Büyü)', color: 'text-blue-500' }
                    ].map((opt) => (
                        <button 
                        key={opt.id}
                        onClick={() => setCulture(opt.id as any)}
                        className={`p-6 border-2 transition-all group flex flex-col items-center text-center rounded
                            ${culture === opt.id ? 'bg-slate-800 border-yellow-700' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}
                        `}
                        >
                        <opt.icon className={`w-10 h-10 mb-3 ${opt.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <div className="font-cinzel text-lg text-slate-200 mb-1">{opt.title}</div>
                        <div className="text-xs text-slate-500 font-inter tracking-wide">{opt.desc}</div>
                        </button>
                    ))}
                    </div>
                    
                    <div className="mt-8 md:mt-12 flex justify-between px-4 md:px-12 items-center">
                    <button onClick={() => setStep(0)} className="text-slate-500 hover:text-white">Geri</button>
                    <button 
                        disabled={!culture}
                        onClick={() => setStep(2)}
                        className="bg-yellow-900/50 hover:bg-yellow-900 text-yellow-500 hover:text-white px-8 py-3 border border-yellow-900 uppercase font-cinzel tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        Seç
                    </button>
                    </div>
                </div>
                )}

                {/* STEP 2: BACKGROUND */}
                {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <h3 className="text-xl text-yellow-700 font-cinzel mb-6 text-center">Ne İş Yapardın?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                        { id: 'SMITH', icon: Hammer, title: 'Demirci Çırağı', desc: '+2 STR. Çelikle dövüldün.', sub: 'Dövüşçü Bonusu', color: 'text-red-500' },
                        { id: 'POACHER', icon: Target, title: 'Kaçak Avcı', desc: '+2 DEX. Gölgelerde büyüdün.', sub: 'Okçu Bonusu', color: 'text-green-600' },
                        { id: 'ORPHAN', icon: Users, title: 'Sokak Çetesi', desc: '+2 CON. Hayatta kaldın.', sub: 'Dayanıklılık Bonusu', color: 'text-slate-500' }
                    ].map((opt) => (
                        <button 
                        key={opt.id}
                        onClick={() => setBackground(opt.id as any)}
                        className={`p-6 border-2 transition-all group flex flex-col items-center text-center rounded
                            ${background === opt.id ? 'bg-slate-800 border-yellow-700' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}
                        `}
                        >
                        <opt.icon className={`w-10 h-10 mb-3 ${opt.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <div className="font-cinzel text-lg text-slate-200 mb-1">{opt.title}</div>
                        <div className="text-xs text-slate-400 font-inter mb-2">{opt.desc}</div>
                        <div className="text-[10px] text-yellow-700 uppercase">{opt.sub}</div>
                        </button>
                    ))}
                    </div>

                    <div className="mt-8 md:mt-12 flex justify-between items-center px-4 md:px-12">
                    <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white">Geri</button>
                    <button 
                        disabled={!background}
                        onClick={() => setStep(3)}
                        className="bg-yellow-900/50 hover:bg-yellow-900 text-yellow-500 hover:text-white px-8 py-3 border border-yellow-900 uppercase font-cinzel tracking-widest disabled:opacity-20"
                    >
                        Seç
                    </button>
                    </div>
                </div>
                )}

                {/* STEP 3: BANNER */}
                {step === 3 && (
                 <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <h3 className="text-xl text-yellow-700 font-cinzel mb-6 text-center">Sancağını Belirle</h3>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                        {/* Banner Preview */}
                        <div 
                          className="w-40 h-56 md:w-48 md:h-64 border-4 border-yellow-700 shadow-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: banner.color }}
                        >
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] opacity-30"></div>
                             {banner.sigil === 'WOLF' && <div className="text-6xl" style={{color: banner.sigilColor}}>🐺</div>}
                             {banner.sigil === 'BEAR' && <div className="text-6xl" style={{color: banner.sigilColor}}>🐻</div>}
                             {banner.sigil === 'EAGLE' && <div className="text-6xl" style={{color: banner.sigilColor}}>🦅</div>}
                             {banner.sigil === 'SWORD' && <Shield size={64} style={{color: banner.sigilColor}} />}
                             {banner.sigil === 'SKULL' && <Skull size={64} style={{color: banner.sigilColor}} />}
                             {banner.sigil === 'TREE' && <div className="text-6xl" style={{color: banner.sigilColor}}>🌲</div>}
                        </div>

                        {/* Controls */}
                        <div className="space-y-6 w-full max-w-sm">
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Zemin Rengi</label>
                                <div className="flex gap-2 flex-wrap">
                                    {bannerColors.map(c => (
                                        <button key={c} onClick={() => setBanner({...banner, color: c})} className="w-8 h-8 border border-slate-500 rounded-sm" style={{backgroundColor: c}}></button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Sembol Rengi</label>
                                <div className="flex gap-2 flex-wrap">
                                    {sigilColors.map(c => (
                                        <button key={c} onClick={() => setBanner({...banner, sigilColor: c})} className="w-8 h-8 border border-slate-500 rounded-sm" style={{backgroundColor: c}}></button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Sembol</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['WOLF', 'BEAR', 'EAGLE', 'SWORD', 'SKULL', 'TREE'].map(s => (
                                        <button key={s} onClick={() => setBanner({...banner, sigil: s as any})} className={`px-2 py-1 text-xs border rounded ${banner.sigil === s ? 'border-yellow-500 text-yellow-500' : 'border-slate-700 text-slate-500'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-12 flex justify-between items-center px-4 md:px-12 pb-4">
                        <button onClick={() => setStep(2)} className="text-slate-500 hover:text-white">Geri</button>
                        <button 
                            onClick={handleFinish}
                            className="bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-white px-8 md:px-12 py-3 border border-red-900 uppercase font-cinzel tracking-widest transition-all shadow-[0_0_20px_rgba(153,27,27,0.3)] hover:shadow-[0_0_40px_rgba(153,27,27,0.6)]"
                        >
                            Maceraya Başla
                        </button>
                    </div>
                 </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default CharacterCreation;