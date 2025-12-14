import React from 'react';
import { CharacterProfile, Item, Equipment, ItemType } from '../types';
import { Shield, Sword, Box, CircuitBoard, Shirt, RefreshCcw, X } from 'lucide-react';

interface InventoryScreenProps {
  profile: CharacterProfile;
  onEquip: (item: Item) => void;
  onUnequip: (item: Item) => void;
  onClose: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ profile, onEquip, onUnequip, onClose }) => {
  const { equipment, inventory } = profile;

  // Calculate stats for display
  const strMod = Math.floor((profile.stats.attributes.str - 10) / 2);
  const attackPower = strMod + 2 + (profile.equipment.weapon?.statBonus || 0);

  let defensePower = profile.stats.baseAC;
  if (profile.equipment.armor) defensePower += (profile.equipment.armor.statBonus - 10);
  if (profile.equipment.helmet) defensePower += profile.equipment.helmet.statBonus;

  const renderSlot = (title: string, item: Item | null, type: ItemType, icon: React.ReactNode) => (
    <div className="bg-black/40 p-2 md:p-4 rounded border border-slate-700/50 flex flex-col items-center gap-2 relative group backdrop-blur-sm shadow-inner">
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-cinzel">{title}</div>
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded flex items-center justify-center border transition-all ${item ? 'border-yellow-600/70 bg-slate-800 shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'border-slate-800 bg-slate-900/50 border-dashed'}`}>
        {item ? (
            type === 'WEAPON' ? <Sword size={24} className="text-yellow-100 drop-shadow-lg"/> :
            type === 'HELMET' ? <CircuitBoard size={24} className="text-yellow-100 drop-shadow-lg"/> :
            type === 'ARMOR' ? <Shirt size={24} className="text-yellow-100 drop-shadow-lg"/> :
            <RefreshCcw size={24} className="text-yellow-100 drop-shadow-lg"/> 
        ) : <div className="opacity-20">{icon}</div>}
      </div>
      {item ? (
        <div className="text-center w-full">
            <div className="text-xs font-bold text-yellow-500 truncate px-1">{item.name}</div>
            <div className="text-[10px] text-green-400">
                {type === 'WEAPON' && `+${item.statBonus} Atk`}
                {(type === 'ARMOR' || type === 'HELMET') && `+${item.statBonus} Def`}
                {type === 'HORSE' && `+${item.statBonus} Hız`}
            </div>
            <button 
                onClick={() => onUnequip(item)}
                className="absolute -top-2 -right-2 bg-red-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-red-500 shadow-lg z-10"
            >
                <X size={12}/>
            </button>
        </div>
      ) : (
          <div className="text-[10px] text-slate-700">BOŞ</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-2 md:p-8 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#050505] w-full max-w-5xl h-[90dvh] rounded-xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col md:flex-row overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-50 p-2 bg-black/50 rounded-full border border-slate-700 hover:border-red-500 transition-all">
            <X size={20}/>
        </button>
        
        {/* Left: Character Paper Doll */}
        <div className="w-full md:w-1/3 bg-gradient-to-b from-[#0f172a] to-black border-r border-slate-800 flex flex-col p-6 overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">{profile.name}</h2>
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-1">{profile.clan.name}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
                {renderSlot("Kask", equipment.helmet, 'HELMET', <CircuitBoard size={24}/>)}
                {renderSlot("Zırh", equipment.armor, 'ARMOR', <Shield size={24}/>)}
                {renderSlot("Silah", equipment.weapon, 'WEAPON', <Sword size={24}/>)}
                {renderSlot("Binek", equipment.horse, 'HORSE', <RefreshCcw size={24}/>)}
            </div>

            <div className="mt-auto bg-slate-900/50 p-4 rounded border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-cinzel">Saldırı</span>
                    <span className="text-red-400 font-bold font-mono text-lg">{attackPower}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-cinzel">Defans</span>
                    <span className="text-blue-400 font-bold font-mono text-lg">{defensePower}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-cinzel">Hız</span>
                    <span className="text-green-400 font-bold font-mono text-lg">{profile.stats.speed.toFixed(1)}</span>
                </div>
            </div>
        </div>

        {/* Right: Inventory Grid */}
        <div className="flex-1 bg-[#020617] p-6 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <Box className="text-yellow-600"/>
                <h3 className="text-xl font-cinzel text-slate-200">Envanter</h3>
                <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {inventory.length} / 50
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {inventory.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-600 font-cinzel italic border-2 border-dashed border-slate-800 rounded">
                            Çantan boş, gezgin.
                        </div>
                    )}
                    {inventory.map((item, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => onEquip(item)}
                            className="relative bg-slate-900/80 p-3 rounded border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all group text-left flex flex-col gap-1 h-24 justify-between"
                        >
                            <div className="font-bold text-xs text-slate-200 line-clamp-2 leading-tight group-hover:text-yellow-400 transition-colors">
                                {item.name}
                            </div>
                            <div className="flex justify-between items-end mt-auto">
                                <span className="text-[10px] text-slate-500 uppercase">{item.type.slice(0,3)}</span>
                                <span className="text-[10px] text-yellow-700 font-mono">{item.value}g</span>
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-yellow-900/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold tracking-widest uppercase rounded backdrop-blur-[1px]">
                                KUŞAN
                            </div>
                        </button>
                    ))}
                    {/* Empty Slots Filler */}
                    {Array.from({ length: Math.max(0, 20 - inventory.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-950/30 border border-slate-800/30 rounded h-24"></div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;