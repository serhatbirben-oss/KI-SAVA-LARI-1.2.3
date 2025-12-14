

export enum GameView {
  HOME = 'HOME',
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  CAMPAIGN = 'CAMPAIGN',
  GAME_OVER = 'GAME_OVER'
}

export type UnitTier = 1 | 2 | 3 | 4 | 5;
export type UnitType = 
  | 'PEASANT' 
  | 'VALGARD_INFANTRY' | 'VALGARD_HUSCARL'
  | 'AETHELGARD_SOLDIER' | 'AETHELGARD_KNIGHT'
  | 'SARRIN_ARCHER' | 'SARRIN_MAMLUKE'
  | 'FYROD_RANGER' | 'FYROD_CHAMPION'
  | 'MERCENARY'
  | 'BANDIT' | 'DESERTER';

// --- TIME SYSTEM ---
export interface GameTime {
  day: number;
  hour: number; // 0-23
  phase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
}

// --- BANNER ---
export interface Banner {
  color: string;
  sigil: 'WOLF' | 'BEAR' | 'EAGLE' | 'SWORD' | 'SKULL' | 'TREE';
  sigilColor: string;
}

// --- RPG ATTRIBUTES (D&D STYLE) ---
export interface Attributes {
  str: number; // Strength: Melee hit/dmg
  dex: number; // Dexterity: AC, Ranged hit
  con: number; // Constitution: HP
  int: number; // Intelligence: Magic/Tactics
  wis: number; // Wisdom: Perception/Resistance
  cha: number; // Charisma: Morale/Trade
}

// --- BATTLE TYPES ---
export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'INFO' | 'PLAYER_HIT' | 'PLAYER_MISS' | 'ENEMY_HIT' | 'ENEMY_MISS' | 'CRITICAL';
  damage?: number;
}

export interface BattleState {
  isActive: boolean;
  turn: number;
  phase: 'PLAYER_TURN' | 'ENEMY_TURN' | 'VICTORY' | 'DEFEAT';
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyAC: number; // Armor Class
  enemyAttackBonus: number;
  logs: CombatLogEntry[];
  weather: 'CLEAR' | 'SNOW' | 'FOG' | 'STORM';
  rewards: { gold: number; renown: number };
}

// --- MAP TYPES ---
export interface MapNode {
  id: string;
  name: string;
  type: 'TOWN' | 'VILLAGE' | 'CASTLE' | 'RUIN' | 'HIDEOUT' | 'MOUNTAIN_PASS';
  x: number;
  y: number;
  kingdom: KingdomName | 'NEUTRAL' | 'BANDITS';
  description: string;
  ownerId?: string; // Clan ID owner
}

// --- INVENTORY TYPES ---
export type ItemType = 'WEAPON' | 'HELMET' | 'ARMOR' | 'HORSE' | 'TRADE_GOOD' | 'FOOD' | 'SCROLL';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  value: number;
  statBonus: number; // AC for armor, Dmg for weapon
  description?: string;
  tier: number;
}

export interface Equipment {
  weapon: Item | null;
  helmet: Item | null;
  armor: Item | null;
  horse: Item | null;
}

// --- WORLD TYPES ---
export type KingdomName = 'VALGARD' | 'AETHELGARD' | 'SARRIN' | 'FYROD';

export interface Kingdom {
  id: KingdomName;
  name: string;
  description: string;
  ruler: string;
  color: string; // Text color class
  bgHex: string; // For map visual
  bonus: string;
  unitPrefix: string;
  enemies: KingdomName[];
}

export interface Lord {
  id: string;
  name: string;
  clanName: string;
  kingdom: KingdomName;
  relation: number;
  strength: number;
  personality: 'HONORABLE' | 'CRUEL' | 'CALCULATING';
  isMet: boolean;
  locationId: string;
}

export interface VillageProblem {
  title: string;
  description: string;
  rewardGold: number;
  rewardRelation: number;
  type: 'COMBAT' | 'WORK' | 'TRADE';
}

export interface Quest {
  id: string;
  giverId: string;
  title: string;
  description: string;
  rewardGold: number;
  rewardRelation: number;
  type: 'DELIVER_ITEMS' | 'HUNT_BANDITS' | 'TRAIN_TROOPS';
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
}

export interface Unit {
  id: string;
  type: UnitType;
  name: string;
  count: number;
  tier: UnitTier;
  wage: number;
  role: 'INFANTRY' | 'ARCHER' | 'CAVALRY';
  stats: {
    hp: number;
    attack: number;
    defense: number; // Used as AC base
  };
}

export interface Companion {
  id: string;
  name: string;
  role: 'SCOUT' | 'MEDIC' | 'QUARTERMASTER' | 'WARRIOR';
  story: string;
  cost: number;
  wage: number;
}

export interface Clan {
  name: string;
  tier: number; 
  renown: number;
  influence: number;
  companions: Companion[];
  banner: Banner;
}

export interface PlayerStats {
  attributes: Attributes; // D&D Stats
  gold: number;
  food: number;
  currentHp: number;
  maxHp: number;
  morale: number;
  speed: number;
  baseAC: number; // Armor Class
}

export interface GameEvent {
  title: string;
  description: string;
  choices: GameChoice[];
  type?: 'COMBAT' | 'STORY' | 'LOOT' | 'LORD_ENCOUNTER' | 'WAR_DECLARATION' | 'MESSENGER';
  enemyStrength?: number;
  relatedLordId?: string;
  relatedKingdomId?: KingdomName;
}

export interface GameChoice {
  id: 'A' | 'B' | 'C';
  text: string;
  type: 'AGGRESSIVE' | 'DIPLOMATIC' | 'RISKY' | 'TRADE' | 'WORK' | 'COMBAT' | 'SURRENDER' | 'LOOT' | 'ACCEPT' | 'REJECT';
  requiresSkill?: boolean; 
}

export interface CharacterProfile {
  name: string;
  culture: 'STEPPE' | 'MOUNTAIN' | 'CITY'; 
  background: 'SMITH' | 'POACHER' | 'ORPHAN'; 
  stats: PlayerStats;
  clan: Clan;
  party: Unit[];
  inventory: Item[];
  equipment: Equipment;
  knownLords: Lord[];
  activeQuests: Quest[];
  currentLocationId: string | null;
  time: GameTime;
  isPrisoner: boolean;
  prisonerDaysRemaining: number;
  atWarWith: KingdomName[];
}

export interface CutsceneData {
  title: string;
  text: string;
  imageUrl?: string;
  onFinish: () => void;
}

// --- CONSTANT DATA ---
export const MARKET_ITEMS: Item[] = [
    { id: 'f1', name: 'Tahıl Çuvalı', type: 'FOOD', value: 10, statBonus: 0, tier: 1 },
    { id: 'f2', name: 'Kurutulmuş Et', type: 'FOOD', value: 25, statBonus: 0, tier: 1 },
    { id: 'w1', name: 'Paslı Kılıç', type: 'WEAPON', value: 40, statBonus: 4, tier: 1 }, // 1d6 roughly
    { id: 'w2', name: 'Demir Balta', type: 'WEAPON', value: 120, statBonus: 6, tier: 2 }, // 1d8
    { id: 'w3', name: 'Şövalye Kılıcı', type: 'WEAPON', value: 450, statBonus: 8, tier: 3 }, // 1d10
    { id: 'a1', name: 'Deri Zırh', type: 'ARMOR', value: 100, statBonus: 12, tier: 1 }, // AC 12
    { id: 'a2', name: 'Zincir Zırh', type: 'ARMOR', value: 350, statBonus: 15, tier: 2 }, // AC 15
    { id: 'a3', name: 'Plaka Zırh', type: 'ARMOR', value: 1200, statBonus: 18, tier: 4 }, // AC 18
    { id: 'h1', name: 'Deri Başlık', type: 'HELMET', value: 50, statBonus: 1, tier: 1 }, // +1 AC
    { id: 'ho1', name: 'Savaş Atı', type: 'HORSE', value: 500, statBonus: 5, tier: 3 },
];

export const KINGDOMS: Record<KingdomName, Kingdom> = {
  VALGARD: { 
    id: 'VALGARD', 
    name: 'Valgard Buz Krallığı', 
    description: 'Ebedi kışın çocukları.', 
    ruler: 'Kral Thorgar', 
    color: 'text-cyan-400', 
    bgHex: '#164e63', 
    bonus: '+2 CON', 
    unitPrefix: 'VALGARD', 
    enemies: ['SARRIN'] 
  },
  AETHELGARD: { 
    id: 'AETHELGARD', 
    name: 'Aethelgard İmparatorluğu', 
    description: 'Disiplin ve nizam.', 
    ruler: 'İmparatoriçe Valeriana', 
    color: 'text-fuchsia-400', 
    bgHex: '#701a75', 
    bonus: '+2 INT', 
    unitPrefix: 'AETHELGARD', 
    enemies: ['FYROD'] 
  },
  SARRIN: { 
    id: 'SARRIN', 
    name: 'Sarrin Kum Sultanlığı', 
    description: 'Hız ve ticaret.', 
    ruler: 'Sultan Malik', 
    color: 'text-amber-500', 
    bgHex: '#78350f', 
    bonus: '+2 CHA', 
    unitPrefix: 'SARRIN', 
    enemies: ['VALGARD'] 
  },
  FYROD: { 
    id: 'FYROD', 
    name: 'Fyrod Kadim Birlik', 
    description: 'Doğa ve pusu.', 
    ruler: 'Druid Caelen', 
    color: 'text-emerald-500', 
    bgHex: '#064e3b', 
    bonus: '+2 WIS', 
    unitPrefix: 'FYROD', 
    enemies: ['AETHELGARD'] 
  }
};

export const MAP_NODES: MapNode[] = [
  { id: 'n1', name: 'Frosthold', type: 'TOWN', x: 20, y: 20, kingdom: 'VALGARD', description: 'Kuzeyin başkenti.' },
  { id: 'n2', name: 'Demir Diş', type: 'CASTLE', x: 35, y: 15, kingdom: 'VALGARD', description: 'Sınır kalesi.' },
  { id: 'n3', name: 'Kurt Köyü', type: 'VILLAGE', x: 10, y: 30, kingdom: 'VALGARD', description: 'Dağ köyü.' },
  { id: 'n4', name: 'Sanctum', type: 'TOWN', x: 50, y: 50, kingdom: 'AETHELGARD', description: 'Altın şehir.' },
  { id: 'n5', name: 'Maden', type: 'HIDEOUT', x: 42, y: 42, kingdom: 'BANDITS', description: 'Terk edilmiş.' },
  { id: 'n6', name: 'Al-Miraj', type: 'TOWN', x: 80, y: 80, kingdom: 'SARRIN', description: 'Çöl incisi.' },
  { id: 'n7', name: 'Sylvaris', type: 'TOWN', x: 70, y: 30, kingdom: 'FYROD', description: 'Orman şehri.' },
  { id: 'n8', name: 'Son Kale', type: 'CASTLE', x: 25, y: 5, kingdom: 'VALGARD', description: 'Dünyanın sonu.' },
  { id: 'n14', name: 'Akrep Yuvası', type: 'HIDEOUT', x: 85, y: 15, kingdom: 'BANDITS', description: 'Haydut ini.' },
];