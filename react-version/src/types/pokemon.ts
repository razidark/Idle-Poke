export interface PokemonStats {
  hp: number | string;
  attack: number | string;
  defense: number | string;
  'sp atk': number | string;
  'sp def': number | string;
  speed: number | string;
  types: string[];
  'catch rate'?: string;
  'growth rate'?: string;
}

export interface PokemonModel {
  pokemon: { Pokemon: string; [key: string]: any }[];
  stats: PokemonStats[];
  exp: { 'base exp': string }[];
  images: {
    normal: { front: string; back: string };
    shiny: { front: string; back: string };
  };
}

export interface ActiveMove {
  name: string;
  type: string;
  power: number;
  maxPp: number;
  pp: number;
  cooldownMs: number;
  lastUsed: number;
}

export interface PokemonInstance {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentHp: number;
  maxHp: number;
  isShiny: boolean;
  caughtAt: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  types: string[];
  image: string;
  backImage?: string;
  animatedFront?: string;
  animatedBack?: string;
  model: PokemonModel;
  iv?: number;
  /** How many times this individual has been prestiged. Each point is a
   *  permanent +5% to its battle stats. Survives save/load. */
  prestige?: number;
  quality?: 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Weak';
  gender?: 'male' | 'female';
  moves?: ActiveMove[];
  nature?: string;
  ability?: string;
  heldItem?: string | null;
  ivs?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
  evs?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
  learnedMoves?: string[];
}

export interface WildPokemon {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  isShiny: boolean;
  attack: number;
  defense: number;
  spAtk?: number;
  spDef?: number;
  speed: number;
  types: string[];
  image: string;
  backImage?: string;
  animatedFront?: string;
  animatedBack?: string;
  model: PokemonModel;
  iv?: number;
  quality?: 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Weak';
  gender?: 'male' | 'female';
  nature?: string;
  ability?: string;
  ivs?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
  evs?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
}

export interface GymLeader {
  name: string;
  badge: string | null;
  poke: [string, number][]; // [Name, Level]
}

export interface RouteDetail {
  name: string;
  pokes?: string[];
  minLevel?: number;
  maxLevel?: number;
  respawn?: string;
  town?: boolean;
  trainer?: GymLeader;
  _unlock?: {
    badges?: { [badgeName: string]: boolean };
  };
}

export interface RegionRoutes {
  _global: {
    pokes: string[];
    rarePokes: string[];
    superRare: string[];
  };
  [routeKey: string]: any; // RouteDetail or other metadata
}

export interface PokeballInventory {
  pokeball: number;
  greatball: number;
  ultraball: number;
  masterball: number;
  tms?: { [tmId: string]: number };
  heldItems?: { [itemId: string]: number };
}
