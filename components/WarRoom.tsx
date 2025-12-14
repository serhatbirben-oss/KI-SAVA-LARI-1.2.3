import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Wheat, Coins, Crown, Sword, Shield, Home, Hammer, Scroll, 
  ShoppingBag, Book, Flag, X, Axe, Skull, Crosshair, ChevronRight,
  Move, ShieldAlert, Tent, Ghost, Sun, Moon, Map as MapIcon, Gavel,
  Search, Wine, Anvil, Eye, ArrowRightCircle, Hand, GraduationCap, Dice5, UserPlus, Mail, UserCheck, TrendingUp, Heart
} from 'lucide-react';
import { generateTravelEvent, generateVillageProblem } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { CharacterProfile, GameEvent, Unit, UnitType, Item, KINGDOMS, KingdomName, MapNode, VillageProblem, BattleState, MAP_NODES, UnitTier, MARKET_ITEMS, CombatLogEntry } from '../types';
import InventoryScreen from './InventoryScreen';
import Encyclopedia from './Encyclopedia';
import WorldMap from './WorldMap';
import { ActionBarGame } from './MiniGames';

interface CampaignScreenProps {
  playerProfile: CharacterProfile;
  onGameOver: () => void;
}

// --- UNIT DEFINITIONS ---
interface UnitDef { name: string; tier: UnitTier; wage: number; upgradeCost: number; role: 'INFANTRY'|'ARCHER'|'CAVALRY'; stats: { hp: number; attack: number; defense: number; }; next: UnitType[]; }
const UNIT_DATA: Record<UnitType, UnitDef> = {
  'PEASANT': { name: 'Köy Gönüllüsü', tier: 1, wage: 2, upgradeCost: 20, role: 'INFANTRY', stats: { hp: 30, attack: 5, defense: 0 }, next: ['MERCENARY'] },
  'MERCENARY': { name: 'Paralı Kılıç', tier: 2, wage: 5, upgradeCost: 50, role: 'INFANTRY', stats: { hp: 50, attack: 10, defense: 5 }, next: [] },
  'VALGARD_INFANTRY': { name: 'Buzkıran Muhafızı', tier: 2, wage: 8, upgradeCost: 60, role: 'INFANTRY', stats: { hp: 70, attack: 18, defense: 5 }, next: ['VALGARD_HUSCARL'] },
  'VALGARD_HUSCARL': { name: 'Valgard Savaş Lordu', tier: 3, wage: 15, upgradeCost: 0, role: 'INFANTRY', stats: { hp: 100, attack: 25, defense: 15 }, next: [] },
  'AETHELGARD_SOLDIER': { name: 'Güneş Lejyoneri', tier: 2, wage: 8, upgradeCost: 60, role: 'INFANTRY', stats: { hp: 60, attack: 12, defense: 12 }, next: ['AETHELGARD_KNIGHT'] },
  'AETHELGARD_KNIGHT': { name: 'İmparatorluk Şövalyesi', tier: 3, wage: 20, upgradeCost: 0, role: 'CAVALRY', stats: { hp: 90, attack: 20, defense: 25 }, next: [] },
  'SARRIN_ARCHER': { name: 'Çöl Akrebi', tier: 2, wage: 8, upgradeCost: 60, role: 'ARCHER', stats: { hp: 40, attack: 15, defense: 2 }, next: ['SARRIN_MAMLUKE'] },
  'SARRIN_MAMLUKE': { name: 'Kumul Süvarisi', tier: 3, wage: 18, upgradeCost: 0, role: 'CAVALRY', stats: { hp: 80, attack: 22, defense: 10 }, next: [] },
  'FYROD_RANGER': { name: 'Gölge Korucusu', tier: 2, wage: 8, upgradeCost: 60, role: 'ARCHER', stats: { hp: 50, attack: 18, defense: 5 }, next: ['FYROD_CHAMPION'] },
  'FYROD_CHAMPION': { name: 'Doğa Muhafızı', tier: 3, wage: 16, upgradeCost: 0, role: 'ARCHER', stats: { hp: 70, attack: 28, defense: 8 }, next: [] },
  'BANDIT': { name: 'Yolkesen', tier: 1, wage: 0, upgradeCost: 0, role: 'INFANTRY', stats: { hp: 40, attack: 8, defense: 0 }, next: [] },
  'DESERTER': { name: 'Hain Asker', tier: 2, wage: 0, upgradeCost: 0, role: 'INFANTRY', stats: { hp: 60, attack: 15, defense: 5 }, next: [] },
};

const CampaignScreen: React.FC<CampaignScreenProps> = ({ playerProfile, onGameOver }) => {
  const [profile, setProfile] = useState<CharacterProfile>(playerProfile);
  const [view, setView] = useState<'MAP' | 'TOWN' | 'VILLAGE' | 'BATTLE' | 'CAPTURED'>('MAP');
  const [townSubView, setTownSubView] = useState<'CENTER' | 'MARKET' | 'ARENA' | 'TAVERN' | 'KEEP' | 'HALL' | 'ACADEMY' | 'BARRACKS' | 'STRATEGY'>('CENTER');
  
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [logs, setLogs] = useState<string[]>(["Kışın soğuğu kemiklerine işliyor. Kaderini yaz."]);
  const [loading, setLoading] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  
  const [showInventory, setShowInventory] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  
  const [villageProblem, setVillageProblem] = useState<VillageProblem | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [marketInventory, setMarketInventory] = useState<Item[]>([]);
  const [recruitList, setRecruitList] = useState<{type: UnitType, count: number, cost: number}[]>([]);
  const [arenaActive, setArenaActive] = useState(false);
  const [arenaDifficulty, setArenaDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  
  // Refs for auto-scrolling combat log
  const combatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioService.init();
    audioService.playSFX('WAR_HORN');
  }, []);

  useEffect(() => {
    if (combatLogRef.current) {
        combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [battle?.logs]);

  const advanceTime = (hours: number) => {
    setProfile(prev => {
        let newHour = prev.time.hour + hours;
        let newDay = prev.time.day;
        if (newHour >= 24) {
            newDay += Math.floor(newHour / 24);
            newHour = newHour % 24;
            const dailyWage = prev.party.reduce((sum, u) => sum + (u.wage * u.count), 0);
            prev.stats.gold = Math.max(0, prev.stats.gold - dailyWage);
            if(dailyWage > 0) addLog(`Günlük maaş ödendi: ${dailyWage} altın.`);
            
            // Natural Healing
            if (prev.stats.currentHp < prev.stats.maxHp) {
                prev.stats.currentHp = Math.min(prev.stats.maxHp, prev.stats.currentHp + (prev.stats.attributes.con));
            }
        }
        let phase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT' = 'DAY';
        if (newHour >= 5 && newHour < 8) phase = 'DAWN';
        else if (newHour >= 8 && newHour < 18) phase = 'DAY';
        else if (newHour >= 18 && newHour < 21) phase = 'DUSK';
        else phase = 'NIGHT';
        return { ...prev, time: { day: newDay, hour: newHour, phase } };
    });
  };

  const addLog = (msg: string) => setLogs(prev => [`> ${msg}`, ...prev].slice(0, 5));

  // --- NAVIGATION ---
  const handleNodeClick = (targetNode: MapNode) => {
      audioService.playSFX('CLICK');
      if (isTraveling) return;
      if (profile.currentLocationId === targetNode.id) {
          enterLocation(targetNode);
      } else {
          startTravel(targetNode);
      }
  };

  const startTravel = (targetNode: MapNode) => {
      const currentNode = MAP_NODES.find(n => n.id === profile.currentLocationId);
      const dist = currentNode ? Math.sqrt(Math.pow(currentNode.x - targetNode.x, 2) + Math.pow(currentNode.y - targetNode.y, 2)) : 10;
      const travelHours = Math.max(1, Math.ceil((dist * 2) / profile.stats.speed));

      setIsTraveling(true);
      addLog(`${targetNode.name} için yola çıkıldı.`);
      
      let elapsed = 0;
      const travelInterval = setInterval(() => {
          elapsed++;
          advanceTime(1); 
          
          // INCREASED ENCOUNTER CHANCE for Bandits (User Request)
          if (Math.random() < 0.15) { // 15% chance per tick (high)
              clearInterval(travelInterval);
              setIsTraveling(false);
              triggerRandomEncounter();
              audioService.playSFX('WAR_HORN');
              return;
          }

          if (elapsed >= travelHours) {
              clearInterval(travelInterval);
              setIsTraveling(false);
              setProfile(p => ({...p, currentLocationId: targetNode.id}));
              addLog(`${targetNode.name} bölgesine ulaştın.`);
              audioService.playSFX('SUCCESS');
          }
      }, 100); 
  };

  const enterLocation = async (node: MapNode) => {
      audioService.playSFX('SWORD');
      if (node.type === 'TOWN' || node.type === 'CASTLE') {
          const randomItems = MARKET_ITEMS.sort(() => 0.5 - Math.random()).slice(0, 8);
          setMarketInventory(randomItems);
          
          const kingdom = node.kingdom !== 'NEUTRAL' && node.kingdom !== 'BANDITS' ? KINGDOMS[node.kingdom] : null;
          const recruits: {type: UnitType, count: number, cost: number}[] = [];
          
          if (kingdom) {
             const basicUnit = kingdom.unitPrefix === 'VALGARD' ? 'VALGARD_INFANTRY' : 
                               kingdom.unitPrefix === 'SARRIN' ? 'SARRIN_ARCHER' :
                               kingdom.unitPrefix === 'AETHELGARD' ? 'AETHELGARD_SOLDIER' : 'FYROD_RANGER';
             recruits.push({ type: basicUnit as UnitType, count: Math.floor(Math.random() * 5) + 2, cost: 50 });
          }
          recruits.push({ type: 'MERCENARY', count: Math.floor(Math.random() * 3) + 1, cost: 100 });
          setRecruitList(recruits);

          setView('TOWN');
          setTownSubView('CENTER');
      } else if (node.type === 'VILLAGE') {
          setLoading(true);
          const prob = await generateVillageProblem(node.name);
          setVillageProblem(prob);
          setView('VILLAGE');
          setLoading(false);
      } else if (node.type === 'HIDEOUT') {
          setEvent({
              title: "Haydut İni",
              description: "İçerisi karanlık. Kılıç sesleri geliyor.",
              enemyStrength: 300, 
              choices: [ { id: 'A', text: "Saldır", type: 'COMBAT' }, { id: 'B', text: "Geri Çekil", type: 'DIPLOMATIC' } ]
          });
      } else if (node.type === 'MOUNTAIN_PASS') {
          triggerRandomEncounter();
      }
  };

  const triggerRandomEncounter = async () => {
      // Dynamic Bandit Parties (5-20 size)
      const size = Math.floor(Math.random() * 16) + 5; // 5 to 20
      const banditHP = size * 35; // Rough estimate of strength
      
      setEvent({
          title: "Haydut Pusu!",
          description: `Yolunu kesen ${size} kişilik bir haydut grubu var. Silahları paslı ama gözleri aç.`,
          type: 'COMBAT',
          enemyStrength: banditHP,
          choices: [
              { id: 'A', text: "Saldır!", type: 'COMBAT' },
              { id: 'B', text: "Haraç Ver (100g)", type: 'DIPLOMATIC' },
              { id: 'C', text: "Kaçmaya Çalış", type: 'RISKY' }
          ]
      });
  };

  // --- COMBAT ENGINE (D&D STYLE) ---
  const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const initBattle = (enemyName: string, enemyTotalHp: number) => {
    audioService.playSFX('WAR_HORN');
    
    // Scale enemy stats loosely based on HP
    const enemyAC = Math.min(18, 12 + Math.floor(enemyTotalHp / 200));
    const enemyAtk = 2 + Math.floor(enemyTotalHp / 200);

    setBattle({
        isActive: true,
        turn: 1,
        phase: 'PLAYER_TURN',
        playerHp: profile.stats.currentHp,
        playerMaxHp: profile.stats.maxHp,
        enemyHp: enemyTotalHp,
        enemyMaxHp: enemyTotalHp,
        enemyName: enemyName,
        enemyAC: enemyAC,
        enemyAttackBonus: enemyAtk,
        logs: [{ id: 'start', text: `Savaş Başladı! ${enemyName} (AC: ${enemyAC}) karşısında kılıcını çektin.`, type: 'INFO' }],
        weather: 'CLEAR',
        rewards: { gold: 50 + Math.floor(enemyTotalHp / 3), renown: 5 }
    });
    setEvent(null);
    setView('BATTLE');
  };

  const processPlayerTurn = (action: 'ATTACK' | 'DEFEND' | 'MANEUVER') => {
      if (!battle) return;
      const { str } = profile.stats.attributes;
      const weaponBonus = profile.equipment.weapon?.statBonus || 0; 
      const atkBonus = Math.floor((str - 10) / 2) + 2; 

      const d20 = rollDie(20);
      let hitTotal = d20 + atkBonus;
      let newLogs = [...battle.logs];
      let damage = 0;
      let newEnemyHp = battle.enemyHp;

      if (action === 'ATTACK') {
          if (d20 === 20) {
              damage = (rollDie(8) + rollDie(8)) + Math.floor((str - 10) / 2) + weaponBonus;
              newEnemyHp -= damage;
              newLogs.push({ id: Date.now().toString(), text: `KRİTİK VURUŞ! (Nat 20): Mükemmel bir darbe! (${damage} Hasar)`, type: 'CRITICAL', damage });
              audioService.playSFX('CRIT');
          } else if (d20 === 1) {
              newLogs.push({ id: Date.now().toString(), text: `ISKA (Nat 1): Saldırın boşa gitti.`, type: 'PLAYER_MISS' });
              audioService.playSFX('MISS');
          } else if (hitTotal >= battle.enemyAC) {
              damage = rollDie(8) + Math.floor((str - 10) / 2) + weaponBonus;
              newEnemyHp -= damage;
              newLogs.push({ id: Date.now().toString(), text: `İSABET (${d20}+${atkBonus}): Düşmanı yaraladın. (${damage} Hasar)`, type: 'PLAYER_HIT', damage });
              audioService.playSFX('HIT');
          } else {
              newLogs.push({ id: Date.now().toString(), text: `ISKA (${d20}+${atkBonus}): Zırhı aşamadın.`, type: 'PLAYER_MISS' });
              audioService.playSFX('BLOCK');
          }
      }

      if (newEnemyHp <= 0) {
          setBattle({ ...battle, enemyHp: 0, logs: newLogs, phase: 'VICTORY' });
          audioService.playSFX('SUCCESS');
          return;
      }

      setBattle({ ...battle, enemyHp: newEnemyHp, logs: newLogs, phase: 'ENEMY_TURN' });
      setTimeout(() => processEnemyTurn({ ...battle, enemyHp: newEnemyHp, logs: newLogs }), 1000);
  };

  const processEnemyTurn = (currentBattleState: BattleState) => {
      const d20 = rollDie(20);
      const atkBonus = currentBattleState.enemyAttackBonus;
      let hitTotal = d20 + atkBonus;
      let damage = 0;
      let newPlayerHp = currentBattleState.playerHp;
      let newLogs = [...currentBattleState.logs];

      let playerAC = profile.stats.baseAC;
      if (profile.equipment.armor) playerAC += (profile.equipment.armor.statBonus - 10);
      if (profile.equipment.helmet) playerAC += profile.equipment.helmet.statBonus;

      if (d20 === 20) {
           damage = (rollDie(6) + rollDie(6)) + 2;
           newPlayerHp -= damage;
           newLogs.push({ id: Date.now().toString(), text: `DÜŞMAN KRİTİK! (${damage} Hasar)`, type: 'CRITICAL', damage });
           audioService.playSFX('CRIT');
      } else if (hitTotal >= playerAC) {
           damage = rollDie(6) + 2;
           newPlayerHp -= damage;
           newLogs.push({ id: Date.now().toString(), text: `DÜŞMAN İSABETİ (${damage} Hasar)`, type: 'ENEMY_HIT', damage });
           audioService.playSFX('HIT');
      } else {
           newLogs.push({ id: Date.now().toString(), text: `SAVUŞTURDUN.`, type: 'ENEMY_MISS' });
           audioService.playSFX('BLOCK');
      }

      if (newPlayerHp <= 0) {
          setBattle({ ...currentBattleState, playerHp: 0, logs: newLogs, phase: 'DEFEAT' });
          audioService.playSFX('ERROR');
      } else {
          setBattle({ ...currentBattleState, playerHp: newPlayerHp, logs: newLogs, phase: 'PLAYER_TURN', turn: currentBattleState.turn + 1 });
      }
  };

  const resolveBattle = () => {
      if (!battle) return;
      if (battle.phase === 'VICTORY') {
          // LOOT SYSTEM
          let gainedLoot: Item[] = [];
          if (Math.random() > 0.5) { // 50% chance to loot item
              const randomLoot = MARKET_ITEMS[Math.floor(Math.random() * MARKET_ITEMS.length)];
              gainedLoot.push(randomLoot);
          }
          
          // RECRUITMENT SYSTEM (Volunteers)
          let recruitMsg = "";
          let newParty = [...profile.party];
          if (Math.random() < 0.3) { // 30% chance some enemies surrender/join
               const count = Math.floor(Math.random() * 3) + 1;
               recruitMsg = `Ayrıca ${count} düşman askeri canlarını bağışlaman karşılığında sana katıldı.`;
               
               const banditDef = UNIT_DATA['BANDIT'];
               const existing = newParty.find(u => u.type === 'BANDIT');
               if (existing) existing.count += count;
               else newParty.push({
                   id: `u_${Date.now()}`, type: 'BANDIT', name: banditDef.name, count, tier: banditDef.tier, wage: banditDef.wage, role: banditDef.role, stats: banditDef.stats
               });
          }

          setProfile(p => ({
              ...p,
              stats: { ...p.stats, gold: p.stats.gold + battle.rewards.gold, currentHp: battle.playerHp },
              clan: { ...p.clan, renown: p.clan.renown + battle.rewards.renown },
              inventory: [...p.inventory, ...gainedLoot],
              party: newParty
          }));
          
          addLog(`Zafer! ${battle.rewards.gold} altın kazandın. ${gainedLoot.length > 0 ? `${gainedLoot[0].name} buldun.` : ''} ${recruitMsg}`);
          setView('MAP');
      } else {
          setProfile(p => ({ ...p, isPrisoner: true, prisonerDaysRemaining: 3, stats: { ...p.stats, currentHp: 10 } })); 
          setView('CAPTURED');
      }
      setBattle(null);
  };

  // --- ARENA REWARDS ---
  const handleArenaWin = () => {
      audioService.playSFX('SUCCESS');
      let goldReward = 0;
      let itemReward: Item | null = null;

      if (arenaDifficulty === 'EASY') goldReward = 50;
      if (arenaDifficulty === 'MEDIUM') goldReward = 150;
      if (arenaDifficulty === 'HARD') {
          goldReward = 300;
          // Reward random equipment on Hard
          const equipmentItems = MARKET_ITEMS.filter(i => ['WEAPON', 'ARMOR', 'HELMET'].includes(i.type));
          itemReward = equipmentItems[Math.floor(Math.random() * equipmentItems.length)];
      }

      let newInv = [...profile.inventory];
      if (itemReward) newInv.push(itemReward);

      setProfile(p => ({
          ...p,
          stats: { ...p.stats, gold: p.stats.gold + goldReward },
          inventory: newInv
      }));

      addLog(`Arena Şampiyonu! ${goldReward} altın kazandın. ${itemReward ? `${itemReward.name} hediye edildi!` : ''}`);
      setArenaActive(false);
  };

  // --- MARKET ---
  const buyItem = (item: Item) => {
      if (profile.stats.gold >= item.value) {
          audioService.playSFX('GOLD');
          setProfile(p => ({
              ...p,
              stats: { ...p.stats, gold: p.stats.gold - item.value },
              inventory: [...p.inventory, item]
          }));
          setMarketInventory(prev => prev.filter(i => i.id !== item.id));
          addLog(`${item.name} satın alındı.`);
      } else {
          audioService.playSFX('ERROR');
          addLog("Yetersiz altın.");
      }
  };

  const sellItem = (item: Item) => {
      audioService.playSFX('GOLD');
      const sellPrice = Math.floor(item.value * 0.7);
      setProfile(p => ({
          ...p,
          stats: { ...p.stats, gold: p.stats.gold + sellPrice },
          inventory: p.inventory.filter(i => i !== item)
      }));
      setMarketInventory(prev => [...prev, item]);
      addLog(`${item.name} satıldı (${sellPrice}g).`);
  };

  // --- RECRUIT ---
  const recruitUnit = (unitType: UnitType, cost: number) => {
      if (profile.stats.gold >= cost) {
          audioService.playSFX('GOLD');
          const unitDef = UNIT_DATA[unitType];
          
          const existingUnitIndex = profile.party.findIndex(u => u.type === unitType);
          const newParty = [...profile.party];

          if (existingUnitIndex >= 0) {
              newParty[existingUnitIndex].count += 1;
          } else {
              newParty.push({
                  id: `u_${Date.now()}`,
                  type: unitType,
                  name: unitDef.name,
                  count: 1,
                  tier: unitDef.tier,
                  wage: unitDef.wage,
                  role: unitDef.role,
                  stats: unitDef.stats
              });
          }

          setProfile(p => ({
              ...p,
              stats: { ...p.stats, gold: p.stats.gold - cost },
              party: newParty
          }));
          addLog(`${unitDef.name} birliğe katıldı.`);
      } else {
          audioService.playSFX('ERROR');
          addLog("Yetersiz altın.");
      }
  };

  // --- UI RENDERERS ---

  if (view === 'CAPTURED') {
      return (
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 relative h-full">
              <div className="z-10 text-center space-y-6 max-w-lg glass-panel p-12 rounded-xl">
                  <ShieldAlert size={64} className="mx-auto text-red-800 animate-pulse"/>
                  <h1 className="text-4xl font-cinzel text-red-600 tracking-widest">ESİR DÜŞTÜN</h1>
                  <p className="text-slate-400 font-cinzel">{profile.prisonerDaysRemaining} gün kaldı.</p>
                  <button onClick={() => { advanceTime(24); setProfile(p => ({...p, prisonerDaysRemaining: p.prisonerDaysRemaining - 1})); if(profile.prisonerDaysRemaining<=1) { addLog("Özgürsün."); setView('MAP'); setProfile(p=>({...p, isPrisoner:false})); } }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold tracking-wider rounded transition-all active:scale-95">
                      ZAMANI BEKLE
                  </button>
              </div>
          </div>
      );
  }

  if (view === 'BATTLE' && battle) {
      return (
          <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden h-full">
               {/* Background */}
               <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale')] bg-cover opacity-20 z-0"></div>
               
               {/* Top Bar */}
               <div className="relative z-10 flex justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
                   <div className="flex flex-col gap-1 w-1/3">
                       <div className="text-green-500 font-bold text-lg md:text-xl flex items-center gap-2"><Heart size={20} fill="currentColor"/> {battle.playerHp}</div>
                       <div className="w-full h-1 md:h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(battle.playerHp / battle.playerMaxHp) * 100}%`}}></div>
                       </div>
                   </div>

                   <div className="text-yellow-500 font-cinzel text-xl md:text-2xl font-bold tracking-widest text-center">TUR {battle.turn}</div>

                   <div className="flex flex-col gap-1 w-1/3 items-end">
                       <div className="text-red-500 font-bold text-lg md:text-xl flex items-center gap-2">{battle.enemyHp} <Skull size={20} fill="currentColor"/></div>
                       <div className="w-full h-1 md:h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(battle.enemyHp / battle.enemyMaxHp) * 100}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Log Area - Flexible Height */}
               <div ref={combatLogRef} className="flex-1 relative z-10 overflow-y-auto p-4 space-y-2 mask-linear-fade">
                   {battle.logs.map((log) => (
                       <div key={log.id} className={`p-2 md:p-3 rounded border-l-2 text-xs md:text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300
                           ${log.type === 'CRITICAL' ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 
                             log.type === 'PLAYER_HIT' ? 'bg-green-900/20 border-green-500 text-green-100' :
                             log.type === 'ENEMY_HIT' ? 'bg-red-900/20 border-red-500 text-red-200' :
                             log.type === 'INFO' ? 'bg-blue-900/20 border-blue-500 text-blue-200' :
                             'bg-slate-800/40 border-slate-600 text-slate-400 italic'
                           }
                       `}>
                           {log.text}
                       </div>
                   ))}
               </div>

               {/* Actions Bar - Fixed at Bottom */}
               <div className="relative z-20 p-4 md:p-6 bg-black/90 border-t border-slate-800">
                   {battle.phase === 'PLAYER_TURN' && (
                       <div className="flex gap-4 justify-center max-w-4xl mx-auto">
                           <button onClick={() => processPlayerTurn('ATTACK')} className="flex-1 py-4 bg-slate-900 hover:bg-red-900 border border-slate-600 hover:border-red-500 text-slate-200 hover:text-white rounded transition-all group relative overflow-hidden">
                               <div className="absolute inset-0 bg-red-600/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                               <span className="relative font-cinzel font-bold text-lg flex flex-col items-center">
                                   <Sword className="mb-1"/> SALDIR
                               </span>
                           </button>
                           {/* Placeholder */}
                           <button className="flex-1 py-4 bg-slate-900 border border-slate-700 text-slate-500 rounded cursor-not-allowed opacity-50 flex flex-col items-center justify-center font-cinzel">
                               <Shield className="mb-1"/> SAVUNMA
                           </button>
                       </div>
                   )}
                   {battle.phase === 'ENEMY_TURN' && (
                       <div className="text-center text-slate-400 font-cinzel animate-pulse">
                           Düşman hamle yapıyor...
                       </div>
                   )}
                   {(battle.phase === 'VICTORY' || battle.phase === 'DEFEAT') && (
                        <button onClick={resolveBattle} className="w-full py-4 bg-yellow-900 hover:bg-yellow-800 text-white font-bold rounded font-cinzel text-xl border border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse">
                            DEVAM ET
                        </button>
                   )}
               </div>
          </div>
      );
  }

  // --- STANDARD CAMPAIGN UI ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-slate-200 relative overflow-hidden font-inter">
      {showInventory && <InventoryScreen profile={profile} onEquip={() => {}} onUnequip={() => {}} onClose={() => setShowInventory(false)} />}
      {showEncyclopedia && <Encyclopedia knownLords={profile.knownLords} onClose={() => setShowEncyclopedia(false)} />}
      
      {/* HUD - Fixed Top */}
      <div className="flex-none bg-gradient-to-b from-black/90 to-transparent p-4 z-40 relative pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="flex gap-3 items-center glass-panel px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-lg shadow-inner">
                    {profile.clan.banner.sigil === 'WOLF' ? '🐺' : '🛡️'}
                </div>
                <div className="hidden md:block">
                    <div className="font-cinzel font-bold text-slate-100 text-sm">{profile.name}</div>
                    <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-gold-500 font-bold"><Coins size={12}/> {profile.stats.gold}</span>
                        <span className="flex items-center gap-1 text-green-500 font-bold"><Heart size={12}/> {profile.stats.currentHp}/{profile.stats.maxHp}</span>
                    </div>
                </div>
                {/* Mobile compact stats */}
                 <div className="block md:hidden text-xs">
                     <span className="text-gold-500 font-bold mr-2">{profile.stats.gold}g</span>
                     <span className="text-green-500 font-bold">{profile.stats.currentHp}hp</span>
                 </div>
            </div>
            {isTraveling && (
                 <div className="absolute left-1/2 -translate-x-1/2 top-4 glass-panel px-6 py-2 rounded-full border border-yellow-500/30 whitespace-nowrap">
                     <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest animate-pulse">Yolculuk...</span>
                 </div>
            )}
            <div className="flex gap-2">
                 <button onClick={() => setShowInventory(true)} onMouseEnter={() => audioService.playSFX('HOVER')} className="p-3 glass-panel hover:bg-slate-800 rounded-full text-slate-300 transition-all active:scale-95 border border-slate-700 hover:border-white"><ShoppingBag size={18}/></button>
                 <button onClick={() => setShowEncyclopedia(true)} onMouseEnter={() => audioService.playSFX('HOVER')} className="p-3 glass-panel hover:bg-slate-800 rounded-full text-slate-300 transition-all active:scale-95 border border-slate-700 hover:border-white"><Book size={18}/></button>
            </div>
        </div>
      </div>

      <div className="flex-1 relative bg-[#050505] overflow-hidden flex flex-col">
         {/* Log Overlay */}
         <div className="absolute bottom-24 md:bottom-4 left-4 z-30 pointer-events-none max-w-sm">
            <div className="flex flex-col-reverse gap-2">
                {logs.map((log, i) => (
                    <div key={i} className={`text-xs text-slate-200 font-medium leading-tight bg-black/70 px-4 py-2 rounded-r-lg border-l-4 border-yellow-700/50 backdrop-blur-sm transition-all duration-500 ${i === 0 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                        {log}
                    </div>
                ))}
            </div>
         </div>

         {view === 'MAP' && (
            <div className="w-full h-full relative flex-1">
                <WorldMap 
                  currentLocationId={profile.currentLocationId} 
                  time={profile.time} 
                  onTravel={handleNodeClick}
                  isTraveling={isTraveling} 
                />
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-30 pointer-events-auto items-center w-full justify-center px-4">
                    <button onClick={() => { audioService.playSFX('CLICK'); advanceTime(1); }} disabled={isTraveling} className="glass-panel text-slate-300 px-4 py-3 md:px-6 rounded-full hover:bg-slate-800 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all border border-slate-700 shadow-lg whitespace-nowrap">BEKLE</button>
                    {!isTraveling && profile.currentLocationId && (
                       <button onClick={() => handleNodeClick(MAP_NODES.find(n => n.id === profile.currentLocationId)!)} className="bg-gradient-to-r from-yellow-700 to-yellow-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full border border-yellow-400 hover:from-yellow-600 hover:to-yellow-500 hover:scale-105 text-xs md:text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse-fast active:scale-95 flex items-center gap-2 transition-all whitespace-nowrap">
                           ŞEHRE GİR <ArrowRightCircle size={18}/>
                       </button>
                    )}
                    <button onClick={() => { audioService.playSFX('CLICK'); triggerRandomEncounter(); }} disabled={isTraveling} className="glass-panel text-slate-300 px-4 py-3 md:px-6 rounded-full hover:bg-slate-800 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all border border-slate-700 shadow-lg whitespace-nowrap">DEVRİYE</button>
                </div>
            </div>
         )}

         {view === 'TOWN' && (
             <div className="absolute inset-0 z-20 flex flex-col md:flex-row bg-[#0b1221] h-full overflow-hidden">
                 {/* MENU SIDEBAR - Responsive */}
                 <div className="w-full md:w-64 lg:w-80 bg-slate-950/95 border-b md:border-b-0 md:border-r border-slate-800 p-2 md:p-6 flex flex-row md:flex-col gap-2 shadow-2xl z-30 relative overflow-x-auto md:overflow-x-visible no-scrollbar">
                     <h2 className="hidden md:block text-2xl font-cinzel font-bold text-slate-100 mb-6 border-b border-slate-700 pb-4 relative z-10 text-glow">
                         {MAP_NODES.find(n => n.id === profile.currentLocationId)?.name}
                     </h2>
                     <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                         {[
                            {id: 'CENTER', label: 'MEYDAN', icon: Home},
                            {id: 'BARRACKS', label: 'KIŞLA', icon: Users},
                            {id: 'MARKET', label: 'PAZAR', icon: ShoppingBag},
                            {id: 'ARENA', label: 'ARENA', icon: Sword},
                            {id: 'TAVERN', label: 'HAN', icon: Wine},
                            {id: 'HALL', label: 'SARAY', icon: Crown}
                         ].map((v) => (
                             <button 
                                key={v.id} 
                                onClick={() => { audioService.playSFX('CLICK'); setTownSubView(v.id as any); }}
                                onMouseEnter={() => audioService.playSFX('HOVER')}
                                className={`p-3 md:p-4 text-left rounded font-cinzel font-bold text-xs tracking-wide transition-all border flex items-center gap-2 md:gap-3 ${townSubView === v.id ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'}`}
                             >
                                 <v.icon size={16}/> <span className="hidden md:inline">{v.label}</span>
                                 <span className="md:hidden">{v.label.substring(0, 3)}</span>
                             </button>
                         ))}
                         <div className="md:mt-auto relative z-10">
                             <button onClick={() => { audioService.playSFX('CLICK'); setView('MAP'); }} className="px-4 py-3 md:py-4 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg uppercase font-bold text-xs tracking-[0.2em] transition-all hover:shadow-[0_0_20px_rgba(153,27,27,0.2)] active:scale-95 whitespace-nowrap">AYRIL</button>
                         </div>
                     </div>
                 </div>

                 {/* CONTENT AREA - Scrollable */}
                 <div className="flex-1 relative bg-cover bg-center overflow-hidden flex flex-col" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')"}}>
                     <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/70 backdrop-blur-sm"></div>
                     <div className="relative z-10 p-4 md:p-8 h-full overflow-y-auto custom-scrollbar">
                         
                         {townSubView === 'CENTER' && (
                             <div className="text-center py-20">
                                 <h2 className="text-4xl md:text-5xl font-cinzel text-white mb-6 drop-shadow-lg">{MAP_NODES.find(n => n.id === profile.currentLocationId)?.name}</h2>
                                 <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                                     Şehir meydanı kalabalık. Muhafızlar tetikte. Ne yapmak istersin?
                                 </p>
                             </div>
                         )}

                         {townSubView === 'BARRACKS' && (
                             <div className="h-full">
                                 <h2 className="text-3xl font-cinzel text-slate-200 mb-6 border-b border-slate-700 pb-2">Kışla</h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {recruitList.map((unit, i) => (
                                         <button key={i} onClick={() => recruitUnit(unit.type, unit.cost)} className="bg-slate-900/60 border border-slate-600 p-4 rounded hover:border-blue-500 text-left group">
                                             <div className="font-bold text-white group-hover:text-blue-400">{UNIT_DATA[unit.type].name}</div>
                                             <div className="text-xs text-slate-400">Maaş: {UNIT_DATA[unit.type].wage}g | Tier: {UNIT_DATA[unit.type].tier}</div>
                                             <div className="mt-2 text-yellow-500 font-bold">{unit.cost} Altın</div>
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {townSubView === 'MARKET' && (
                             <div className="h-full flex flex-col">
                                 <h2 className="text-3xl font-cinzel text-green-500 mb-6 flex items-center gap-3 border-b border-slate-700 pb-4"><ShoppingBag/> Pazar Yeri</h2>
                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden min-h-0">
                                     <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg overflow-y-auto min-h-[300px]">
                                         <h3 className="text-center font-bold text-slate-300 border-b border-slate-700 pb-2 mb-4">Tüccar</h3>
                                         <div className="grid grid-cols-2 gap-3">
                                             {marketInventory.map((item) => (
                                                 <button key={item.id} onClick={() => buyItem(item)} className="bg-black/40 p-3 rounded border border-slate-600 hover:border-green-500 text-left">
                                                     <div className="text-xs font-bold text-slate-200">{item.name}</div>
                                                     <div className="text-xs text-yellow-600">{item.value}g</div>
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                     <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg overflow-y-auto min-h-[300px]">
                                         <h3 className="text-center font-bold text-slate-300 border-b border-slate-700 pb-2 mb-4">Sen ({profile.stats.gold}g)</h3>
                                         <div className="grid grid-cols-2 gap-3">
                                             {profile.inventory.map((item, idx) => (
                                                 <button key={idx} onClick={() => sellItem(item)} className="bg-black/40 p-3 rounded border border-slate-600 hover:border-red-500 text-left">
                                                     <div className="text-xs font-bold text-slate-200">{item.name}</div>
                                                     <div className="text-xs text-yellow-600">{Math.floor(item.value*0.7)}g</div>
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         )}

                         {townSubView === 'ARENA' && (
                             <div className="h-full flex items-center justify-center">
                                 {!arenaActive ? (
                                     <div className="text-center space-y-6">
                                         <h2 className="text-4xl md:text-5xl font-cinzel text-red-600 mb-6">Arena</h2>
                                         <div className="flex gap-4 justify-center">
                                             <button onClick={() => setArenaDifficulty('EASY')} className={`px-4 py-2 border ${arenaDifficulty === 'EASY' ? 'bg-green-900 border-green-500' : 'border-slate-700'}`}>Kolay (50g)</button>
                                             <button onClick={() => setArenaDifficulty('MEDIUM')} className={`px-4 py-2 border ${arenaDifficulty === 'MEDIUM' ? 'bg-yellow-900 border-yellow-500' : 'border-slate-700'}`}>Orta (150g)</button>
                                             <button onClick={() => setArenaDifficulty('HARD')} className={`px-4 py-2 border ${arenaDifficulty === 'HARD' ? 'bg-red-900 border-red-500' : 'border-slate-700'}`}>Zor (300g + Eşya)</button>
                                         </div>
                                         <button onClick={() => { audioService.playSFX('CLICK'); setArenaActive(true); }} className="px-12 py-5 bg-red-900 hover:bg-red-800 text-white font-bold rounded border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] tracking-widest text-xl transition-transform hover:scale-105">
                                             MEYDAN OKU
                                         </button>
                                     </div>
                                 ) : (
                                     <ActionBarGame 
                                        title={`Arena (${arenaDifficulty})`}
                                        description="Zamanlama her şeydir." 
                                        difficulty={arenaDifficulty === 'EASY' ? 'EASY' : arenaDifficulty === 'MEDIUM' ? 'MEDIUM' : 'HARD'}
                                        onSuccess={handleArenaWin}
                                        onFail={() => { audioService.playSFX('ERROR'); addLog("Yenildin."); setProfile(p=>({...p, stats:{...p.stats, currentHp: Math.max(0, p.stats.currentHp-10)}})); setArenaActive(false); }}
                                        onClose={() => setArenaActive(false)}
                                     />
                                 )}
                             </div>
                         )}

                         {/* Other views handled similarly... */}
                     </div>
                 </div>
             </div>
         )}

      </div>

      {event && (
            <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
                <div className="max-w-md w-full border border-slate-600 bg-[#0a0a0a] rounded-lg p-8 shadow-2xl animate-in zoom-in-95 relative">
                    <h2 className="text-2xl font-cinzel text-center mb-4 text-white">{event.title}</h2>
                    <p className="text-slate-300 text-center mb-8">{event.description}</p>
                    <div className="space-y-3">
                        {event.choices.map(c => (
                        <button key={c.id} onClick={() => {
                            audioService.playSFX('CLICK');
                            if(c.type === 'COMBAT') initBattle("Haydut Lideri", event.enemyStrength || 50);
                            else { addLog(c.text); setEvent(null); }
                        }} className="w-full p-4 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 font-bold rounded flex justify-between">
                            <span>{c.text}</span>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
      )}
    </div>
  );
};

export default CampaignScreen;