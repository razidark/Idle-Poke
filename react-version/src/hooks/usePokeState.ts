import { useState, useEffect, useRef, useCallback } from 'react';
import { POKEDEX } from '../data/db.js';
import { getDexNumber } from '../data/dexNumbers';
import { EVOLUTIONS } from '../data/evolutions.js';
import { ROUTES } from '../data/routes.js';
import { TYPES } from '../data/typeModifiers.js';
import { EXP_TABLE } from '../data/expTable';
import type { PokemonInstance, WildPokemon, PokeballInventory, RouteDetail, ActiveMove } from '../types/pokemon';
import { audio } from '../utils/audio';
import { MOVES } from '../data/moves';
import type { Move } from '../data/moves';
import { Upgrades, UPGRADES_CONFIG } from '../data/upgrades';
import { getLearnableMoves, TMS_CONFIG, NATURES } from '../data/learnsets';

const SHINY_CHANCE = 1 / 128; // Increased chance for satisfying idle gameplay

export const MEGA_ELIGIBLE: { [name: string]: { to: string; suffix: string } } = {
  'Venusaur': { to: 'Mega Venusaur', suffix: 'venusaur-mega' },
  'Charizard': { to: 'Mega Charizard X', suffix: 'charizard-megax' },
  'Blastoise': { to: 'Mega Blastoise', suffix: 'blastoise-mega' },
  'Alakazam': { to: 'Mega Alakazam', suffix: 'alakazam-mega' },
  'Gengar': { to: 'Mega Gengar', suffix: 'gengar-mega' },
  'Kangaskhan': { to: 'Mega Kangaskhan', suffix: 'kangaskhan-mega' },
  'Pinsir': { to: 'Mega Pinsir', suffix: 'pinsir-mega' },
  'Gyarados': { to: 'Mega Gyarados', suffix: 'gyarados-mega' },
  'Aerodactyl': { to: 'Mega Aerodactyl', suffix: 'aerodactyl-mega' },
  'Mewtwo': { to: 'Mega Mewtwo Y', suffix: 'mewtwo-megay' },
  'Ampharos': { to: 'Mega Ampharos', suffix: 'ampharos-mega' },
  'Steelix': { to: 'Mega Steelix', suffix: 'steelix-mega' },
  'Scizor': { to: 'Mega Scizor', suffix: 'scizor-mega' },
  'Heracross': { to: 'Mega Heracross', suffix: 'heracross-mega' },
  'Houndoom': { to: 'Mega Houndoom', suffix: 'houndoom-mega' },
  'Tyranitar': { to: 'Mega Tyranitar', suffix: 'tyranitar-mega' }
};

// Helper to calculate stats
const getIndividualStatValue = (raw: number, level: number, iv: number = 15, ev: number = 0, multiplier: number = 1.0) => {
  const base = Math.floor(((raw * 2 + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(base * multiplier) || 1;
};

const getIndividualHpValue = (rawHp: number, level: number, iv: number = 15, ev: number = 0) => {
  if (rawHp === 1) return 1;
  return Math.floor(((rawHp * 2 + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
};

const getPokemonAbility = (name: string, types: string[]): string => {
  const n = name.toLowerCase();
  if (n.includes('bulbasaur') || n.includes('ivysaur') || n.includes('venusaur')) return 'Overgrow';
  if (n.includes('charmander') || n.includes('charmeleon') || n.includes('charizard')) return 'Blaze';
  if (n.includes('squirtle') || n.includes('wartortle') || n.includes('blastoise')) return 'Torrent';
  if (n.includes('dratini') || n.includes('dragonair') || n.includes('dragonite')) return 'Shed Skin';
  if (n.includes('aerodactyl')) return 'Rock Head';
  if (n.includes('pikachu') || n.includes('raichu') || n.includes('electabuzz')) return 'Static';
  if (n.includes('gengar') || n.includes('haunter') || n.includes('gastly')) return 'Levitate';

  const type = types[0] || 'Normal';
  if (type === 'Fire') return 'Flash Fire';
  if (type === 'Water') return 'Swift Swim';
  if (type === 'Grass') return 'Chlorophyll';
  if (type === 'Electric') return 'Volt Absorb';
  if (type === 'Normal') return 'Run Away';
  if (type === 'Bug') return 'Swarm';
  if (type === 'Psychic') return 'Inner Focus';
  if (type === 'Rock' || type === 'Ground') return 'Sturdy';
  return 'Keen Eye';
};

/**
 * Prestige.
 *
 * A Pokémon at Lv.50+ can be prestiged: its level resets, and it gains
 * (a) a permanent +5% to its battle stats per prestige point, and
 * (b) a level FLOOR that grows with each prestige -- prestige 1 starts you
 * at Lv.20, prestige 2 at Lv.40, and so on.
 *
 * The floor is what makes the mechanic work. A flat percentage on a Lv.1
 * Pokémon would always be worse than simply levelling up (Lv.1 * 1.05 is
 * weaker than Lv.50), so prestige would be a trap. With the floor:
 *
 *   prestige 1 -> Lv.20, +5%   (a wash vs. plain Lv.50)
 *   prestige 2 -> Lv.40, +10%  (still a wash)
 *   prestige 3 -> Lv.60, +15%  (now beats a plain Lv.50)
 *
 * So the first two prestiges buy you progress, and from the third on the
 * Pokémon is strictly stronger than where it would otherwise be. The bonus
 * belongs to the individual, not the species, so it survives a save/load.
 */
export const PRESTIGE_BONUS_PER_POINT = 0.05;

/** Level floor granted by the Nth prestige. */
export const PRESTIGE_LEVEL_FLOOR_PER_POINT = 20;

/** Level a Pokémon must reach before it can be prestiged. */
export const PRESTIGE_MIN_LEVEL = 50;

export const getPrestigeMultiplier = (prestigeCount: number): number =>
  1 + Math.max(0, prestigeCount || 0) * PRESTIGE_BONUS_PER_POINT;

/** The level a prestiged Pokémon starts at, given its prestige count. */
export const getPrestigeLevelFloor = (prestigeCount: number): number =>
  Math.max(1, Math.max(0, prestigeCount || 0) * PRESTIGE_LEVEL_FLOOR_PER_POINT);

export const recalculatePokemonStats = (poke: PokemonInstance) => {
  const model = poke.model || POKEDEX.find(p => p.pokemon[0].Pokemon === poke.name);
  if (!model) return poke;
  const stats = model.stats[0];
  const level = poke.level;
  const prestigeMult = getPrestigeMultiplier(poke.prestige || 0);

  const ivs = poke.ivs || { hp: 15, attack: 15, defense: 15, spAtk: 15, spDef: 15, speed: 15 };
  const evs = poke.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };

  const natureInfo = NATURES.find(n => n.name === poke.nature) || { name: 'Hardy', increased: null, decreased: null };
  const getMultiplier = (statName: string) => {
    if (natureInfo.increased === statName) return 1.1;
    if (natureInfo.decreased === statName) return 0.9;
    return 1.0;
  };

  const newMaxHp = getIndividualHpValue(Number(stats.hp), level, ivs.hp, evs.hp) * 3;
  poke.maxHp = newMaxHp;
  poke.attack = Math.round(getIndividualStatValue(Number(stats.attack), level, ivs.attack, evs.attack, getMultiplier('attack')) * prestigeMult);
  poke.defense = Math.round(getIndividualStatValue(Number(stats.defense), level, ivs.defense, evs.defense, getMultiplier('defense')) * prestigeMult);
  poke.spAtk = Math.round(getIndividualStatValue(Number(stats['sp atk'] || stats.attack), level, ivs.spAtk, evs.spAtk, getMultiplier('spAtk')) * prestigeMult);
  poke.spDef = Math.round(getIndividualStatValue(Number(stats['sp def'] || stats.defense), level, ivs.spDef, evs.spDef, getMultiplier('spDef')) * prestigeMult);
  poke.speed = Math.round(getIndividualStatValue(Number(stats.speed), level, ivs.speed, evs.speed, getMultiplier('speed')) * prestigeMult);

  // Backwards compatibility
  const sumIvs = ivs.hp + ivs.attack + ivs.defense + ivs.spAtk + ivs.spDef + ivs.speed;
  poke.iv = Math.round((sumIvs / 186) * 100);

  return poke;
};

const getHeldItemMultiplier = (poke: PokemonInstance, moveType: string): number => {
  const item = (poke.heldItem || '').toLowerCase();
  if (item === 'charcoal' && moveType === 'Fire') return 1.2;
  if (item === 'mystic water' && moveType === 'Water') return 1.2;
  if (item === 'miracle seed' && moveType === 'Grass') return 1.2;
  if (item === 'magnet' && moveType === 'Electric') return 1.2;
  if (item === 'soft sand' && moveType === 'Ground') return 1.2;
  if (item === 'sharp beak' && moveType === 'Flying') return 1.2;
  if (item === 'dragon fang' && moveType === 'Dragon') return 1.2;
  if (item === 'black belt' && moveType === 'Fighting') return 1.2;
  return 1.0;
};

const awardEvs = (poke: PokemonInstance) => {
  const evs = poke.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
  const currentTotal = evs.hp + evs.attack + evs.defense + evs.spAtk + evs.spDef + evs.speed;
  if (currentTotal >= 510) return;

  const statsKeys: (keyof typeof evs)[] = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];
  const chosenKey = statsKeys[Math.floor(Math.random() * statsKeys.length)];
  const roll = Math.min(252 - evs[chosenKey], Math.min(4, 510 - currentTotal));
  if (roll > 0) {
    evs[chosenKey] += roll;
    poke.evs = evs;
  }
};

const checkNewMoves = (poke: PokemonInstance, newLvl: number, addLogCallback: (msg: string) => void) => {
  const learnable = getLearnableMoves(poke.name, poke.types);
  const learned = poke.learnedMoves || [];

  learnable.forEach(m => {
    if (m.level <= newLvl && !learned.includes(m.name)) {
      learned.push(m.name);
      addLogCallback(`💡 ${poke.name} learned a new move: ${m.name.toUpperCase()}! Open detail to manage.`);
    }
  });
  poke.learnedMoves = learned;
};


// Resolve the National Dex number for a Pokemon.
//
// This used to be the array index in POKEDEX, which is NOT the dex number:
// the database orders its alternate forms (Mega, Alolan, Galarian, Ash...)
// after the base species, so the index ran far past the real dex range.
// 93 of the 895 entries were wrong -- "M-Charizard X" resolved to 1 and
// drew Bulbasaur, and every Alolan form drew some unrelated late-gen
// Pokemon. The correct numbers already exist in data/dexNumbers.ts
// (resolved from PokeAPI), so they are used directly.
const getPokemonId = (name: string): number => getDexNumber(name);

export const getPokemonSprites = (name: string, isShiny: boolean) => {
  const id = getPokemonId(name);
  const path = isShiny ? 'shiny/' : '';
  return {
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${path}${id}.png`,
    backImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${path}${id}.png`,
    animatedFront: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${path}${id}.gif`,
    animatedBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${path}${id}.gif`
  };
};

// Helper to make a Pokemon instance
export const createPokemon = (name: string, level: number, shiny?: boolean, gender?: 'male' | 'female', shinyMultiplier: number = 1): PokemonInstance => {
  const model = POKEDEX.find(p => p.pokemon[0].Pokemon === name);
  if (!model) throw new Error(`Pokemon ${name} not found in database.`);

  const stats = model.stats[0];
  const isShiny = shiny !== undefined ? shiny : Math.random() < (SHINY_CHANCE * shinyMultiplier);

  // Nature roll
  const natureRoll = NATURES[Math.floor(Math.random() * NATURES.length)];
  const nature = natureRoll.name;

  // IV rolls (0 - 31)
  const ivs = {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32)
  };
  const sumIvs = ivs.hp + ivs.attack + ivs.defense + ivs.spAtk + ivs.spDef + ivs.speed;
  const ivPercent = Math.round((sumIvs / 186) * 100);

  let quality: 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Weak' = 'Common';
  if (ivPercent >= 95) quality = 'Epic';
  else if (ivPercent >= 80) quality = 'Rare';
  else if (ivPercent >= 50) quality = 'Uncommon';
  else if (ivPercent >= 20) quality = 'Common';
  else quality = 'Weak';

  // Initial EVs
  const evs = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };

  const ability = getPokemonAbility(name, stats.types);

  // Calculate experience requirement based on growth rate
  const growthRate = stats['growth rate'] || 'Medium Fast';
  const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];
  const xp = table[level - 1] || 0;

  const sprites = getPokemonSprites(name, isShiny);

  // Learnable moves
  const learnable = getLearnableMoves(name, stats.types);
  const learnedMoves = learnable.filter(m => m.level <= level).map(m => m.name);
  if (learnedMoves.length === 0) learnedMoves.push('Tackle');

  // Set active 4 moves
  const activeMovesList = learnable
    .filter(m => m.level <= level)
    .slice(-4)
    .map(m => ({
      name: m.name,
      type: m.type,
      power: m.power,
      maxPp: m.pp,
      pp: m.pp,
      cooldownMs: m.cooldownMs,
      lastUsed: 0
    }));

  const inst: PokemonInstance = {
    id: `poke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    level,
    xp,
    currentHp: 1,
    maxHp: 1,
    isShiny,
    caughtAt: Date.now(),
    attack: 1,
    defense: 1,
    spAtk: 1,
    spDef: 1,
    speed: 1,
    types: stats.types,
    image: sprites.image,
    backImage: sprites.backImage,
    animatedFront: sprites.animatedFront,
    animatedBack: sprites.animatedBack,
    model,
    iv: ivPercent,
    quality,
    gender: gender || (Math.random() < 0.5 ? 'male' : 'female'),
    nature,
    ability,
    heldItem: null,
    ivs,
    evs,
    learnedMoves,
    moves: activeMovesList
  };

  recalculatePokemonStats(inst);
  inst.currentHp = inst.maxHp;
  return inst;
};

const TAB_SESSION_ID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

// A lock whose owner has not checked in for this long is considered stale
// (the tab was closed, crashed, or the machine slept) and can be taken over.
const STALE_LOCK_MS = 15000;

export const usePokeState = () => {
  const [activeProfile, setActiveProfile] = useState<string | null>(() => {
    return localStorage.getItem('idle_poke_active_profile');
  });

  // Mirror of the active profile, readable from the unload handler without
  // re-subscribing the listener every time the profile changes.
  const activeProfileRef = useRef<string | null>(activeProfile);
  useEffect(() => {
    activeProfileRef.current = activeProfile;
  }, [activeProfile]);

  const [profiles, setProfiles] = useState<any[]>(() => {
    const saved = localStorage.getItem('idle_poke_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRegion, setActiveRegion] = useState<string>('Kanto');
  const [battleSpeed, setBattleSpeed] = useState<'1x' | '3x' | '5x'>('1x');
  const [upgrades, setUpgrades] = useState<Upgrades>({
    shoes: 0,
    share: 0,
    coin: 0,
    charm: 0
  });
  const [activeRouteKey, setActiveRouteKey] = useState<string>('route'); // Route 1
  const [money, setMoney] = useState<number>(500);
  const [activeTeam, setActiveTeam] = useState<PokemonInstance[]>([]);
  const [box, setBox] = useState<PokemonInstance[]>([]);
  const [pokedex, setPokedex] = useState<{ [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } }>({});
  const [inventory, setInventory] = useState<PokeballInventory>({
    pokeball: 50,
    greatball: 10,
    ultraball: 0,
    masterball: 0
  });
  const [badges, setBadges] = useState<string[]>([]);
  const [rods, setRods] = useState<{ old: boolean; good: boolean; super: boolean }>({ old: false, good: false, super: false });
  const [statistics, setStatistics] = useState<{
    caught: number;
    throws: number;
    moneyGained: number;
    wildWins: number;
    trainerWins: number;
    eliteFourWins: number;
    championWins: number;
  }>({
    caught: 0,
    throws: 0,
    moneyGained: 0,
    wildWins: 0,
    trainerWins: 0,
    eliteFourWins: 0,
    championWins: 0
  });
  const [pvpElo, setPvpElo] = useState<number>(1000);
  const [instantHealCooldown, setInstantHealCooldown] = useState<number>(0);
  const [activeBallType, setActiveBallType] = useState<'pokeball' | 'greatball' | 'ultraball' | 'masterball'>('pokeball');
  const [catchMode, setCatchMode] = useState<'none' | 'all' | 'new'>('all');

  const [wildPoke, setWildPoke] = useState<WildPokemon | null>(null);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [wildProgress, setWildProgress] = useState<number>(0);
  const [combatLogs, setCombatLogs] = useState<{ id: string; text: string }[]>([{ id: 'init', text: '🎒 Welcome to IdlePoke! Choose a starter.' }]);
  const [activeTrainer, setActiveTrainer] = useState<any | null>(null);
  const [trainerPokeIndex, setTrainerPokeIndex] = useState<number>(0);
  const [healingCooldown, setHealingCooldown] = useState<number>(0); // Seconds left in PokéCenter
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; text: string; isPlayerTarget: boolean }[]>([]);
  const [movePopups, setMovePopups] = useState<{ id: string; name: string; type: string; isPlayer: boolean }[]>([]);
  const [catchAnim, setCatchAnim] = useState<{ active: boolean; ballType: string; isSuccess: boolean; name: string } | null>(null);
  const [spriteZoom, setSpriteZoom] = useState<number>(1.5);

  // Auto-Helper and Capture Log States
  const [autoPotion, setAutoPotion] = useState<boolean>(false);
  const [autoRevive, setAutoRevive] = useState<boolean>(false);
  const [captureLog, setCaptureLog] = useState<{
    id: string;
    name: string;
    level: number;
    iv: number;
    quality: 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Weak';
    ballType: string;
    isShiny: boolean;
    timestamp: number;
  }[]>([]);
  const [offlineReport, setOfflineReport] = useState<{
    elapsedSeconds: number;
    battles: number;
    money: number;
    xp: number;
    caughtCount: number;
  } | null>(null);

  const spawnDamageNumber = useCallback((dmg: number, isPlayerTarget: boolean) => {
    const id = `dmg-${Math.random().toString(36).substr(2, 9)}`;
    setDamageNumbers(prev => [...prev, { id, text: `-${dmg}`, isPlayerTarget }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(n => n.id !== id));
    }, 800);
  }, []);

  const spawnMovePopup = useCallback((name: string, type: string, isPlayer: boolean) => {
    const id = `move-${Math.random().toString(36).substr(2, 9)}`;
    setMovePopups(prev => [...prev, { id, name, type, isPlayer }]);
    setTimeout(() => {
      setMovePopups(prev => prev.filter(m => m.id !== id));
    }, 800);
  }, []);

  const getPokemonMove = useCallback((pokeTypes: string[], level: number): Move => {
    const primaryType = pokeTypes[0] || 'Normal';
    const moveGroup = MOVES[primaryType] || MOVES['Normal'];
    if (level >= 18 && Math.random() < 0.4) {
      return moveGroup.advanced;
    }
    return moveGroup.basic;
  }, []);

  const stateRef = useRef({ activeTeam, box, pokedex, inventory, money, badges, activeRegion, activeRouteKey });

  useEffect(() => {
    stateRef.current = { activeTeam, box, pokedex, inventory, money, badges, activeRegion, activeRouteKey };
  }, [activeTeam, box, pokedex, inventory, money, badges, activeRegion, activeRouteKey]);

  // Gym leaders / Elite Four / champion already defeated. Kept globally (one
  // key for every profile) exactly as before, but now it is actually written.
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('idle_poke_defeated_bosses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('idle_poke_defeated_bosses', JSON.stringify(defeatedBosses));
  }, [defeatedBosses]);

  // Trainer-victory rewards must be granted exactly once per battle: the
  // state updater that resolves the fight runs twice under StrictMode.
  const trainerWinHandled = useRef(false);

  const addLog = useCallback((text: string) => {
    const id = `log-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    setCombatLogs(prev => [...prev, { id, text }].slice(-50));
  }, []);

  const addMoney = useCallback((amount: number) => {
    setMoney(prev => prev + amount);
    setStatistics(prev => ({
      ...prev,
      moneyGained: prev.moneyGained + amount
    }));
  }, []);

  // Resolves a won trainer battle: log, statistics, gym badge, cash reward
  // and boss-defeat bookkeeping. Guarded so it can only fire once per battle.
  const handleTrainerWin = useCallback((trainer: any) => {
    if (!trainer) return;
    if (trainerWinHandled.current) return;
    trainerWinHandled.current = true;

    if (trainer.isPvP) {
      addLog(`🏆 Defeated Rival ${trainer.name} in PVP!`);
      setPvpElo(prev => prev + 18);
    } else if (trainer.isE4) {
      addLog(`🏆 Defeated Elite Four Master ${trainer.name}!`);
    } else if (trainer.isChamp) {
      addLog(`👑 Defeated Champion ${trainer.name}!`);
    } else if (trainer.badge) {
      addLog(`🏆 Defeated Gym Leader ${trainer.name}!`);
    } else {
      addLog(`🏆 Defeated Trainer ${trainer.name}!`);
    }

    setStatistics(prev => ({
      ...prev,
      trainerWins: prev.trainerWins + 1,
      eliteFourWins: prev.eliteFourWins + (trainer.isE4 ? 1 : 0),
      championWins: prev.championWins + (trainer.isChamp ? 1 : 0)
    }));

    if (trainer.badge && !stateRef.current.badges.includes(trainer.badge)) {
      setBadges(b => [...b, trainer.badge]);
      addLog(`🏅 You earned the ${trainer.badge.toUpperCase()}!`);
    }

    if (trainer.trophy) {
      addLog(`🏆 You earned the ${trainer.trophy}!`);
    }

    if (trainer.cashReward) {
      addMoney(trainer.cashReward);
      addLog(`💰 Earned $${trainer.cashReward.toLocaleString()} from ${trainer.name}!`);
    }

    if (trainer.id) {
      setDefeatedBosses(prev => (prev.includes(trainer.id) ? prev : [...prev, trainer.id]));
    }
  }, [addLog, addMoney]);

  // Set starter Pokemon
  const chooseStarter = (name: string) => {
    const starter = createPokemon(name, 5);
    starter.ivs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 };
    starter.iv = 100;
    starter.quality = 'Epic';
    recalculatePokemonStats(starter);
    starter.currentHp = starter.maxHp;

    setActiveTeam([starter]);

    setPokedex(prev => ({
      ...prev,
      [name]: { caught: true, seen: true, shinyCaught: starter.isShiny }
    }));
    addLog(`🔴 You received your starter: ${name}! (Perfect 100% IV & Epic Quality)`);
  };

  // Generate Wild Pokemon on current Route
  const generateWildPokemon = useCallback(() => {
    const route = (ROUTES as any)[activeRegion]?.[activeRouteKey] as RouteDetail;
    if (!route || route.town) {
      setWildPoke(null);
      return;
    }

    const pokesPool = route.pokes || ['Pidgey', 'Rattata'];

    // Encounter probabilities: check rare/super rare rolls
    const regionGlobal = (ROUTES as any)[activeRegion]._global;
    let selectedName = pokesPool[Math.floor(Math.random() * pokesPool.length)];

    const roll = Math.random();
    if (roll < 0.01 && regionGlobal?.superRare?.length > 0) {
      selectedName = regionGlobal.superRare[Math.floor(Math.random() * regionGlobal.superRare.length)];
    } else if (roll < 0.08 && regionGlobal?.rarePokes?.length > 0) {
      selectedName = regionGlobal.rarePokes[Math.floor(Math.random() * regionGlobal.rarePokes.length)];
    }

    const minLvl = route.minLevel || 2;
    const maxLvl = route.maxLevel || 5;
    const level = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl;

    try {
      const charmMultiplier = UPGRADES_CONFIG.charm.getBenefit(upgrades.charm);
      const wild = createPokemon(selectedName, level, undefined, undefined, charmMultiplier) as unknown as WildPokemon;
      setWildPoke(wild);
      setWildProgress(0);
      setPlayerProgress(0);

      // Update Pokedex Seen
      setPokedex(prev => {
        const entry = prev[selectedName] || { caught: false, seen: false, shinyCaught: false };
        if (!entry.seen) {
          return { ...prev, [selectedName]: { ...entry, seen: true } };
        }
        return prev;
      });
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegion, activeRouteKey]);

  // Load Trainer Battle
  // Accepts several team shapes and normalizes them to the canonical
  // `poke: [name, level][]` contract the battle loop consumes:
  //   poke:   [['Geodude', 12], ...]        (canonical)
  //   team:   [{ name, level }, ...]         (gym/E4 modal challenge)
  //   pokemon:[{ name, level }, ...]         (alias)
  const startTrainerBattle = (trainer: any) => {
    const rawTeam = trainer?.poke || trainer?.team || trainer?.pokemon || [];
    const team: [string, number][] = rawTeam
      .map((entry: any) => {
        if (Array.isArray(entry)) return [entry[0], entry[1]] as [string, number];
        const name = entry?.name ?? entry?.Pokemon ?? entry?.species;
        const level = Number(entry?.level ?? 1);
        return [name, level] as [string, number];
      })
      .filter((entry: [string, number]) => !!entry[0]);

    if (!team.length) {
      addLog('⚠️ That trainer has no Pokémon — battle cancelled.');
      return;
    }

    const normalized = { ...trainer, poke: team };
    setActiveTrainer(normalized);
    setTrainerPokeIndex(0);
    setWildProgress(0);
    setPlayerProgress(0);
    trainerWinHandled.current = false;

    const [pokeName, level] = team[0];
    const firstPoke = createPokemon(pokeName, level) as unknown as WildPokemon;
    setWildPoke(firstPoke);
    const isGym = !!normalized.badge;
    addLog(`⚔️ ${isGym ? 'Gym Leader' : 'Trainer'} Battle started: ${normalized.name} sent out ${pokeName}!`);
  };

  // Change route
  const selectRoute = (routeKey: string) => {
    const route = (ROUTES as any)[activeRegion][routeKey];
    if (!route) return;

    // Check fishing rod requirement
    const name = route.name.toLowerCase();
    if (name.includes('route 12') || name.includes('route 13')) {
      if (!rods.old) {
        addLog(`❌ You need an OLD ROD to fish on ${route.name}! Purchase it at the Mart.`);
        return;
      }
    } else if (name.includes('route 19') || name.includes('route 20') || name.includes('route 21') || name.includes('route 40') || name.includes('route 41')) {
      if (!rods.good) {
        addLog(`❌ You need a GOOD ROD to sail on ${route.name}! Purchase it at the Mart.`);
        return;
      }
    } else if (name.includes('route 27') || name.includes('route 28') || name.includes('cerulean cave') || name.includes('water')) {
      if (!rods.super) {
        addLog(`❌ You need a SUPER ROD to fish in deep waters on ${route.name}! Purchase it at the Mart.`);
        return;
      }
    }

    // Check unlocking badges prereq
    if (route._unlock?.badges) {
      const requiredBadges = Object.keys(route._unlock.badges);
      const hasAll = requiredBadges.every(b => badges.includes(b));
      if (!hasAll) {
        addLog(`🔒 You need the following badges to enter this route: ${requiredBadges.join(', ')}`);
        return;
      }
    }

    setActiveRouteKey(routeKey);
    setActiveTrainer(null);
    setWildPoke(null);
    setWildProgress(0);
    setPlayerProgress(0);
  };

  const buyUpgrade = useCallback((key: keyof Upgrades) => {
    setUpgrades(prev => {
      const currentLvl = prev[key];
      const config = UPGRADES_CONFIG[key];
      if (currentLvl >= config.maxLevel) return prev;

      const cost = Math.floor(config.getCost(currentLvl));
      if (money >= cost) {
        setMoney(m => m - cost);
        addLog(`✨ Upgraded ${config.name} to Level ${currentLvl + 1}!`);
        return {
          ...prev,
          [key]: currentLvl + 1
        };
      } else {
        addLog(`❌ Not enough money to upgrade ${config.name}! Need ¤${cost}.`);
        return prev;
      }
    });
  }, [money, addLog]);

  const buyCandy = useCallback((cost: number, xpAmount: number) => {
    if (money < cost) {
      addLog(`❌ Not enough money to buy EXP Candy!`);
      return;
    }
    if (activeTeam.length === 0) {
      addLog(`❌ You don't have an active Pokémon to feed!`);
      return;
    }
    setMoney(prev => prev - cost);
    setActiveTeam(currentTeam => {
      return currentTeam.map((p, idx) => {
        if (idx !== 0) return p; // Only active team leader gets candy

        let pXp = p.xp + xpAmount;
        let pLvl = p.level;

        const growthRate = p.model.stats[0]['growth rate'] || 'Medium Fast';
        const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];

        let leveledUp = false;
        while (pXp >= table[pLvl] && pLvl < 100) {
          pLvl += 1;
          leveledUp = true;
        }

        if (leveledUp) {
          addLog(`✨ Your ${p.name} leveled up to Lv ${pLvl}!`);
          audio.playLevelUp();

          let pName = p.name;
          let pModel = p.model;
          let pTypes = p.types;
          let pImage = p.image;

          const evolInfo = (EVOLUTIONS as any)[pName];
          if (evolInfo && pLvl >= Number(evolInfo.level)) {
            const nextForm = evolInfo.to;
            const nextModel = POKEDEX.find(poke => poke.pokemon[0].Pokemon === nextForm);
            if (nextModel) {
              addLog(`✨ What's this? ${pName} is evolving into ${nextForm}!`);
              pName = nextForm;
              pModel = nextModel;
              pTypes = nextModel.stats[0].types;
              const evoSprites = getPokemonSprites(nextForm, p.isShiny);
              pImage = evoSprites.image;
            }
          }

          const evoSpr = pName !== p.name ? getPokemonSprites(pName, p.isShiny) : null;
          const updatedPoke: PokemonInstance = {
            ...p,
            name: pName,
            model: pModel,
            types: pTypes,
            image: pImage,
            ...(evoSpr ? { backImage: evoSpr.backImage, animatedFront: evoSpr.animatedFront, animatedBack: evoSpr.animatedBack } : {}),
            level: pLvl,
            xp: pXp
          };
          recalculatePokemonStats(updatedPoke);
          updatedPoke.currentHp = updatedPoke.maxHp;
          return updatedPoke;
        }

        addLog(`🍬 Fed ${p.name} an EXP Candy! Gained ${xpAmount.toLocaleString()} XP.`);
        return {
          ...p,
          xp: pXp
        };
      });
    });
  }, [money, activeTeam, addLog]);

  const buyRod = useCallback((rodType: 'old' | 'good' | 'super', cost: number) => {
    if (money < cost) {
      addLog(`❌ Not enough money to buy ${rodType.toUpperCase()} ROD! Need ¤${cost}.`);
      return;
    }
    setMoney(prev => prev - cost);
    setRods(prev => ({
      ...prev,
      [rodType]: true
    }));
    addLog(`🎣 You purchased the ${rodType.toUpperCase()} ROD!`);
  }, [money, addLog]);

  // Capture loop
  const attemptCatch = (poke: WildPokemon): boolean => {
    const caught = stateRef.current.pokedex[poke.name]?.caught || false;
    const shouldCatch =
      catchMode === 'all' ||
      (catchMode === 'new' && !caught) ||
      poke.isShiny;

    if (!shouldCatch) return false;

    // Check if we have balls
    let ballToUse = activeBallType;
    if (poke.isShiny && inventory.masterball > 0) {
      ballToUse = 'masterball'; // Use best ball automatically on shinies
    } else if ((inventory[ballToUse] as number) <= 0) {
      // Auto-fallback to any other ball in order of quality
      const order: ('pokeball' | 'greatball' | 'ultraball' | 'masterball')[] = ['pokeball', 'greatball', 'ultraball', 'masterball'];
      const available = order.find(b => (inventory[b] as number) > 0);
      if (!available) {
        addLog(`❌ You have no Pokéballs left to catch ${poke.name}!`);
        return false;
      }
      ballToUse = available;
    }

    // Deduct ball
    setInventory(prev => ({ ...prev, [ballToUse]: (prev[ballToUse] as number) - 1 }));
    setStatistics(prev => ({ ...prev, throws: prev.throws + 1 }));

    // Catch chance math (classic formula: catchRate/255 * ball multiplier; Master Ball is a guaranteed catch)
    const catchRate = Number(poke.model.stats[0]['catch rate']) || 45;
    const ballMod = { pokeball: 1, greatball: 1.5, ultraball: 2, masterball: 1 } as const;
    const catchChance = ballToUse === 'masterball'
      ? 1
      : Math.min(1, (catchRate / 255) * ballMod[ballToUse]);
    const isSuccess = Math.random() < catchChance;

    // Trigger catch animation
    setCatchAnim({
      active: true,
      ballType: ballToUse,
      isSuccess,
      name: poke.name
    });

    setTimeout(() => {
      if (isSuccess) {
        setStatistics(prev => ({ ...prev, caught: prev.caught + 1 }));
        const caughtPoke = createPokemon(poke.name, poke.level, poke.isShiny, poke.gender);
        addLog(`🎉 Gotcha! ${poke.name} was caught using a ${ballToUse.toUpperCase()}!`);
        audio.playCatch();

        // Add to capture log
        setCaptureLog(prev => [
          {
            id: caughtPoke.id,
            name: caughtPoke.name,
            level: caughtPoke.level,
            iv: caughtPoke.iv || 0,
            quality: caughtPoke.quality || 'Common',
            ballType: ballToUse,
            isShiny: caughtPoke.isShiny,
            timestamp: Date.now()
          },
          ...prev.slice(0, 49) // Keep last 50 captures
        ]);

        // Update Pokedex
        setPokedex(prev => ({
          ...prev,
          [poke.name]: {
            caught: true,
            seen: true,
            shinyCaught: prev[poke.name]?.shinyCaught || poke.isShiny
          }
        }));

        // Add to team if space, otherwise Box
        setActiveTeam(prev => {
          if (prev.length < 6) {
            return [...prev, caughtPoke];
          } else {
            setBox(b => [...b, caughtPoke]);
            return prev;
          }
        });
      } else {
        addLog(`💨 Oh no! ${poke.name} broke free!`);
        audio.playFaint(); // Thump or faint sound
      }

      setCatchAnim(null);
      setWildPoke(null);
    }, 2400);

    return true;
  };

  // Buy Pokeballs
  const buyPokeballs = (type: 'pokeball' | 'greatball' | 'ultraball' | 'masterball', cost: number, count: number) => {
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setInventory(prev => ({ ...prev, [type]: prev[type] + count }));
      addLog(`🛒 Purchased ${count}x ${type.toUpperCase()}s!`);
    } else {
      addLog(`❌ Not enough money to buy ${type.toUpperCase()}s.`);
    }
  };

  // Heal player team
  const healTeam = () => {
    setActiveTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
    setHealingCooldown(0);
    addLog(`🏥 Your team was completely healed!`);
  };

  const triggerInstantHeal = () => {
    if (instantHealCooldown > 0) {
      addLog(`❌ PokéCenter Heal is on cooldown for ${instantHealCooldown}s!`);
      return;
    }
    setActiveTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
    setHealingCooldown(0);
    setInstantHealCooldown(15);
    addLog(`🏥 Instantly restored your party's health!`);
    audio.playLevelUp();
  };

  // Reorder team
  const movePokeToTop = (index: number) => {
    setActiveTeam(prev => {
      const newTeam = [...prev];
      const [poke] = newTeam.splice(index, 1);
      newTeam.unshift(poke);
      return newTeam;
    });
  };

  const movePokeUp = (index: number) => {
    if (index <= 0) return;
    setActiveTeam(prev => {
      const newTeam = [...prev];
      [newTeam[index - 1], newTeam[index]] = [newTeam[index], newTeam[index - 1]];
      return newTeam;
    });
  };

  const movePokeDown = (index: number) => {
    setActiveTeam(prev => {
      if (index >= prev.length - 1) return prev;
      const newTeam = [...prev];
      [newTeam[index], newTeam[index + 1]] = [newTeam[index + 1], newTeam[index]];
      return newTeam;
    });
  };

  /**
   * Prestige a Pokémon: reset its level to 1 in exchange for a permanent
   * +5% battle-stat multiplier per prestige point.
   *
   * The individual's IVs, EVs, nature, ability, moves and shininess are all
   * kept -- only the level (and therefore its XP) is reset. That is the
   * trade: you give up time-to-power for permanent strength.
   */
  const prestigePokemon = (target: string | number) => {
    const id = typeof target === 'number' ? activeTeam[target]?.id : target;
    if (!id) return { success: false, message: 'No such Pokemon.' };

    // Work out the result from the CURRENT state first. React's setState
    // updater is not guaranteed to run synchronously, so capturing the
    // outcome from inside it is unreliable -- the update would silently
    // never happen.
    const inTeam = activeTeam.find(p => p.id === id);
    const inBox = !inTeam ? box.find(p => p.id === id) : undefined;
    const source = inTeam || inBox;
    if (!source) return { success: false, message: 'No such Pokemon.' };

    if (source.level < PRESTIGE_MIN_LEVEL) {
      return {
        success: false,
        message: `Must reach Lv.${PRESTIGE_MIN_LEVEL} first (currently Lv.${source.level}).`
      };
    }

    const points = (source.prestige || 0) + 1;
    const before = { attack: source.attack, defense: source.defense, speed: source.speed };

    const next = { ...source, level: getPrestigeLevelFloor(points), xp: 0, prestige: points };
    recalculatePokemonStats(next);
    next.currentHp = next.maxHp;

    const after = { attack: next.attack, defense: next.defense, speed: next.speed };

    if (inTeam) {
      setActiveTeam(prev => prev.map(p => (p.id === id ? next : p)));
    } else {
      setBox(prev => prev.map(p => (p.id === id ? next : p)));
    }

    const label = inTeam ? source.name : 'A stored Pokemon';
    addLog(
      `✨ ${label} was PRESTIGED! ` +
      `+${Math.round(PRESTIGE_BONUS_PER_POINT * 100)}% to its stats, restarting at Lv.${getPrestigeLevelFloor(points)} (now ${points}x).`
    );
    audio.playLevelUp();

    return { success: true, points, before, after };
  };

  const evolveTeamPokemon = (target: string | number) => {
    const id = typeof target === 'number' ? activeTeam[target]?.id : target;
    if (!id) return;

    // Check if in team
    const isFighter = activeTeam.some(p => p.id === id);

    if (isFighter) {
      setActiveTeam(prev => {
        const idx = prev.findIndex(p => p.id === id);
        if (idx < 0) return prev;
        const poke = prev[idx];

        const evolInfo = (EVOLUTIONS as any)[poke.name];
        const megaInfo = MEGA_ELIGIBLE[poke.name];

        if (megaInfo && poke.level >= 100) {
          const nextForm = megaInfo.to;
          const suffix = megaInfo.suffix;

          addLog(`🧬 What's this? ${poke.name} is Mega Evolving into ${nextForm}!`);
          audio.playLevelUp();

          const boostedMaxHp = Math.round(poke.maxHp * 1.25);
          const next = [...prev];
          next[idx] = {
            ...poke,
            name: nextForm,
            image: `https://play.pokemonshowdown.com/sprites/ani${poke.isShiny ? '-shiny' : ''}/${suffix}.gif`,
            backImage: `https://play.pokemonshowdown.com/sprites/ani-back${poke.isShiny ? '-shiny' : ''}/${suffix}.gif`,
            maxHp: boostedMaxHp,
            currentHp: boostedMaxHp,
            attack: poke.attack + 40,
            defense: poke.defense + 40,
            speed: poke.speed + 40
          };

          setPokedex(p => ({
            ...p,
            [nextForm]: { caught: true, seen: true, shinyCaught: p[nextForm]?.shinyCaught || poke.isShiny }
          }));

          return next;
        }

        if (!evolInfo || poke.level < Number(evolInfo.level)) return prev;
        const nextForm = evolInfo.to;
        const nextModel = POKEDEX.find(p => p.pokemon[0].Pokemon === nextForm);
        if (!nextModel) return prev;

        addLog(`✨ ${poke.name} evolved into ${nextForm}!`);
        audio.playLevelUp();

        const next = [...prev];
        const nextSprites = getPokemonSprites(nextForm, poke.isShiny);
        const evolvedPoke = {
          ...poke,
          name: nextForm,
          model: nextModel,
          types: nextModel.stats[0].types,
          image: nextSprites.image,
          backImage: nextSprites.backImage,
          animatedFront: nextSprites.animatedFront,
          animatedBack: nextSprites.animatedBack,
          learnedMoves: poke.learnedMoves || []
        };

        const learnable = getLearnableMoves(nextForm, evolvedPoke.types);
        evolvedPoke.moves = learnable
          .filter(m => m.level <= poke.level)
          .slice(-4)
          .map(m => ({
            name: m.name,
            type: m.type,
            power: m.power,
            maxPp: m.pp,
            pp: m.pp,
            cooldownMs: m.cooldownMs,
            lastUsed: 0
          }));

        recalculatePokemonStats(evolvedPoke);
        evolvedPoke.currentHp = evolvedPoke.maxHp;
        next[idx] = evolvedPoke;

        setPokedex(p => ({
          ...p,
          [nextForm]: { caught: true, seen: true, shinyCaught: p[nextForm]?.shinyCaught || poke.isShiny }
        }));

        return next;
      });
    } else {
      // Evolve in PC Box
      setBox(prev => {
        const idx = prev.findIndex(p => p.id === id);
        if (idx < 0) return prev;
        const poke = prev[idx];

        const evolInfo = (EVOLUTIONS as any)[poke.name];
        const megaInfo = MEGA_ELIGIBLE[poke.name];

        if (megaInfo && poke.level >= 100) {
          const nextForm = megaInfo.to;
          const suffix = megaInfo.suffix;

          addLog(`🧬 What's this? ${poke.name} is Mega Evolving into ${nextForm}!`);
          audio.playLevelUp();

          const boostedMaxHp = Math.round(poke.maxHp * 1.25);
          const next = [...prev];
          next[idx] = {
            ...poke,
            name: nextForm,
            image: `https://play.pokemonshowdown.com/sprites/ani${poke.isShiny ? '-shiny' : ''}/${suffix}.gif`,
            backImage: `https://play.pokemonshowdown.com/sprites/ani-back${poke.isShiny ? '-shiny' : ''}/${suffix}.gif`,
            maxHp: boostedMaxHp,
            currentHp: boostedMaxHp,
            attack: poke.attack + 40,
            defense: poke.defense + 40,
            speed: poke.speed + 40
          };

          setPokedex(p => ({
            ...p,
            [nextForm]: { caught: true, seen: true, shinyCaught: p[nextForm]?.shinyCaught || poke.isShiny }
          }));

          return next;
        }

        if (!evolInfo || poke.level < Number(evolInfo.level)) return prev;
        const nextForm = evolInfo.to;
        const nextModel = POKEDEX.find(p => p.pokemon[0].Pokemon === nextForm);
        if (!nextModel) return prev;

        addLog(`✨ ${poke.name} evolved into ${nextForm}!`);
        audio.playLevelUp();

        const next = [...prev];
        const nextSprites = getPokemonSprites(nextForm, poke.isShiny);
        const evolvedPoke = {
          ...poke,
          name: nextForm,
          model: nextModel,
          types: nextModel.stats[0].types,
          image: nextSprites.image,
          backImage: nextSprites.backImage,
          animatedFront: nextSprites.animatedFront,
          animatedBack: nextSprites.animatedBack,
          learnedMoves: poke.learnedMoves || []
        };

        const learnable = getLearnableMoves(nextForm, evolvedPoke.types);
        evolvedPoke.moves = learnable
          .filter(m => m.level <= poke.level)
          .slice(-4)
          .map(m => ({
            name: m.name,
            type: m.type,
            power: m.power,
            maxPp: m.pp,
            pp: m.pp,
            cooldownMs: m.cooldownMs,
            lastUsed: 0
          }));

        recalculatePokemonStats(evolvedPoke);
        evolvedPoke.currentHp = evolvedPoke.maxHp;
        next[idx] = evolvedPoke;

        setPokedex(p => ({
          ...p,
          [nextForm]: { caught: true, seen: true, shinyCaught: p[nextForm]?.shinyCaught || poke.isShiny }
        }));

        return next;
      });
    }
  };

  // Box swap
  const swapWithBox = (teamIndex: number, boxId: string) => {
    setActiveTeam(prevTeam => {
      const teamPoke = prevTeam[teamIndex];
      const boxPoke = box.find(p => p.id === boxId);
      if (!boxPoke) return prevTeam;

      const newTeam = [...prevTeam];
      newTeam[teamIndex] = boxPoke;

      setBox(prevBox => {
        const filtered = prevBox.filter(p => p.id !== boxId);
        if (teamPoke) filtered.push(teamPoke);
        return filtered;
      });

      return newTeam;
    });
  };

  // Release Pokemon
  const releasePokemon = (boxId: string) => {
    const poke = box.find(p => p.id === boxId);
    if (!poke) return;
    setBox(prev => prev.filter(p => p.id !== boxId));
    // refund some money as recycle logic
    addMoney(poke.level * 10);
    addLog(`🍃 Released ${poke.name} back into the wild. Earned ¤${poke.level * 10}.`);
  };

  // Active click-based move execution
  const clickMove = (moveIndex: number) => {
    if (!activeProfile || activeTeam.length === 0 || !wildPoke || healingCooldown > 0) return;

    const activeFighter = activeTeam[0];
    if (activeFighter.currentHp <= 0) return;

    const activeMoves = activeFighter.moves || [];
    const move = activeMoves[moveIndex];
    if (!move) return;

    if (move.pp <= 0) {
      addLog(`❌ ${move.name} has no PP left!`);
      return;
    }

    const now = Date.now();
    if (now - move.lastUsed < move.cooldownMs) {
      return; // Still on cooldown
    }

    // Deduct PP & Update cooldown
    setActiveTeam(prev => {
      const next = [...prev];
      const fighter = { ...next[0] };
      const nextMoves = (fighter.moves || []).map((m, idx) => {
        if (idx === moveIndex) {
          return { ...m, pp: m.pp - 1, lastUsed: now };
        }
        return m;
      });
      fighter.moves = nextMoves;
      next[0] = fighter;
      return next;
    });

    const isSpecial = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Dragon', 'Dark', 'Fairy'].includes(move.type);
    const attackerAtk = isSpecial ? (activeFighter.spAtk || activeFighter.attack) : activeFighter.attack;
    const defenderDef = isSpecial ? (wildPoke.spDef || wildPoke.defense) : wildPoke.defense;

    const mult = getDamageMultiplier([move.type], wildPoke.types);
    const itemMultiplier = getHeldItemMultiplier(activeFighter, move.type);
    const isCrit = Math.random() < 0.08;
    const critBonus = isCrit ? 1.5 : 1.0;
    const baseDmg = Math.max(1, attackerAtk - Math.floor(defenderDef / 4));
    const moveFactor = move.power / 40;
    const dmg = Math.round(baseDmg * mult * itemMultiplier * critBonus * moveFactor * (0.85 + Math.random() * 0.15));

    audio.playHit();
    spawnMovePopup(move.name, move.type, true);
    setTimeout(() => {
      spawnDamageNumber(dmg, false);
    }, 150);

    setWildPoke(enemy => {
      if (!enemy) return null;
      const nextHp = Math.max(0, enemy.currentHp - dmg);

      if (isCrit) addLog(`💥 Critical Hit!`);
      addLog(`⚡ Active Click: ${activeFighter.name} used ${move.name.toUpperCase()} for ${dmg} HP!`);

      if (nextHp <= 0) {
        addLog(`🎉 Defeated ${enemy.name}!`);
        audio.playFaint();

        const baseExp = Number(enemy.model.exp[0]['base exp']) || 50;
        const xpYield = Math.floor(baseExp * enemy.level / 7);
        const shareBenefit = UPGRADES_CONFIG.share.getBenefit(upgrades.share);

        setActiveTeam(currentTeam => {
          return currentTeam.map((p, idx) => {
            let pXp = p.xp;
            let pLvl = p.level;
            const baseShare = idx === 0 ? xpYield : Math.floor(xpYield / 6);
            const additionalShare = (idx !== 0 && shareBenefit > 0) ? Math.floor(xpYield * shareBenefit) : 0;
            const share = baseShare + additionalShare;
            if (share <= 0) return p;

            pXp += share;

            const growthRate = p.model.stats[0]['growth rate'] || 'Medium Fast';
            const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];

            let leveledUp = false;
            while (pXp >= table[pLvl] && pLvl < 100) {
              pLvl += 1;
              leveledUp = true;
            }

            // Award EVs to battling Pokémon
            if (idx === 0) {
              awardEvs(p);
            }

            if (leveledUp) {
              addLog(`🌟 ${p.name} leveled up to Lvl ${pLvl}!`);
              audio.playLevelUp();

              const evolInfo = (EVOLUTIONS as any)[p.name];
              if (evolInfo && pLvl >= Number(evolInfo.level)) {
                const nextForm = evolInfo.to;
                const nextModel = POKEDEX.find(poke => poke.pokemon[0].Pokemon === nextForm);
                if (nextModel) {
                  addLog(`✨ What's this? ${p.name} is evolving into ${nextForm}!`);
                  const evoSprites = getPokemonSprites(nextForm, p.isShiny);
                  p.name = nextForm;
                  p.model = nextModel;
                  p.types = nextModel.stats[0].types;
                  p.image = evoSprites.image;
                  p.backImage = evoSprites.backImage;
                  p.animatedFront = evoSprites.animatedFront;
                  p.animatedBack = evoSprites.animatedBack;
                  p.learnedMoves = p.learnedMoves || [];
                  p.moves = getLearnableMoves(nextForm, p.types)
                    .filter(m => m.level <= pLvl)
                    .slice(-4)
                    .map(m => ({
                      name: m.name,
                      type: m.type,
                      power: m.power,
                      maxPp: m.pp,
                      pp: m.pp,
                      cooldownMs: m.cooldownMs,
                      lastUsed: 0
                    }));
                }
              }
              checkNewMoves(p, pLvl, addLog);
            }

            const updatedPoke = {
              ...p,
              level: pLvl,
              xp: pXp
            };

            recalculatePokemonStats(updatedPoke);
            updatedPoke.currentHp = leveledUp ? updatedPoke.maxHp : Math.min(updatedPoke.maxHp, p.currentHp);
            return updatedPoke;
          });
        });

        const coinBenefit = UPGRADES_CONFIG.coin.getBenefit(upgrades.coin);
        const coinYield = Math.floor(enemy.level * 5 * (0.8 + Math.random() * 0.4) * (1 + coinBenefit));
        addMoney(coinYield);

        let animStarted = false;
        if (!activeTrainer) {
          setStatistics(prev => ({ ...prev, wildWins: prev.wildWins + 1 }));
          animStarted = attemptCatch(enemy);
        }

        if (activeTrainer) {
          const nextPokeIdx = trainerPokeIndex + 1;
          if (nextPokeIdx >= activeTrainer.poke.length) {
            handleTrainerWin(activeTrainer);
            setActiveTrainer(null);
            return null;
          } else {
            setTrainerPokeIndex(nextPokeIdx);
            const [nextPokeName, nextLvl] = activeTrainer.poke[nextPokeIdx];
            const nextOpponent = createPokemon(nextPokeName, nextLvl) as unknown as WildPokemon;
            addLog(`⚔️ ${activeTrainer.name} sent out ${nextPokeName}!`);
            return nextOpponent;
          }
        } else {
          if (!animStarted) {
            return null;
          }
        }
      }

      return { ...enemy, currentHp: nextHp };
    });
  };

  const sortActiveTeam = (criteria: 'level' | 'iv' | 'power' | 'id') => {
    setActiveTeam(prev => {
      const sorted = [...prev];
      if (criteria === 'level') {
        sorted.sort((a, b) => b.level - a.level);
      } else if (criteria === 'iv') {
        sorted.sort((a, b) => (b.iv || 0) - (a.iv || 0));
      } else if (criteria === 'power') {
        sorted.sort((a, b) => {
          const powerA = a.attack + a.defense + a.speed;
          const powerB = b.attack + b.defense + b.speed;
          return powerB - powerA;
        });
      } else if (criteria === 'id') {
        sorted.sort((a, b) => {
          const idA = Number(a.model.pokemon[0].id) || 0;
          const idB = Number(b.model.pokemon[0].id) || 0;
          return idA - idB;
        });
      }
      return sorted;
    });
    addLog(`🔄 Sorted active roster by ${criteria.toUpperCase()}!`);
  };

  const sortBoxStorage = (criteria: 'level' | 'iv' | 'power' | 'id') => {
    setBox(prev => {
      const sorted = [...prev];
      if (criteria === 'level') {
        sorted.sort((a, b) => b.level - a.level);
      } else if (criteria === 'iv') {
        sorted.sort((a, b) => (b.iv || 0) - (a.iv || 0));
      } else if (criteria === 'power') {
        sorted.sort((a, b) => {
          const powerA = a.attack + a.defense + a.speed;
          const powerB = b.attack + b.defense + b.speed;
          return powerB - powerA;
        });
      } else if (criteria === 'id') {
        sorted.sort((a, b) => {
          const idA = Number(a.model.pokemon[0].id) || 0;
          const idB = Number(b.model.pokemon[0].id) || 0;
          return idA - idB;
        });
      }
      return sorted;
    });
    addLog(`🔄 Sorted box storage by ${criteria.toUpperCase()}!`);
  };

  // Type effectiveness modifier lookup
  const getDamageMultiplier = useCallback((attackingTypes: string[], defendingTypes: string[]) => {
    const checkEffectiveness = (atkType: string, defTypes: string[]) => {
      const mult1 = (TYPES as any)[atkType]?.[defTypes[0]] ?? 1.0;
      const mult2 = defTypes[1] ? ((TYPES as any)[atkType]?.[defTypes[1]] ?? 1.0) : 1.0;
      return mult1 * mult2;
    };

    return Math.max(
      checkEffectiveness(attackingTypes[0], defendingTypes),
      attackingTypes[1] ? checkEffectiveness(attackingTypes[1], defendingTypes) : 0
    );
  }, []);

  // Core Battle Tick
  useEffect(() => {
    if (instantHealCooldown > 0) {
      const timer = setTimeout(() => {
        setInstantHealCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [instantHealCooldown]);

  useEffect(() => {
    if (!activeProfile || activeTeam.length === 0) return;

    if (healingCooldown > 0) {
      const timer = setTimeout(() => {
        setHealingCooldown(prev => {
          if (prev <= 1) {
            healTeam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Spawn a wild Pokemon if none exists and not in town/trainer battle
    const route = (ROUTES as any)[activeRegion]?.[activeRouteKey] as RouteDetail;
    if (!route) return;
    if (!wildPoke && !activeTrainer && !route.town) {
      generateWildPokemon();
      return;
    }

    // Active battler is index 0
    const activeFighter = activeTeam.find(p => p.currentHp > 0);
    if (!activeFighter) {
      if (autoRevive && money >= 100) {
        setMoney(m => m - 100);
        healTeam();
        addLog(`💖 Auto-Revive triggered! Instant heal cost ¤100.`);
        return;
      }
      // Blacked out! Teleport to nearest respawn city or trigger center delay
      addLog(`💀 Your team fainted! Healing up at the nearest Center...`);
      setHealingCooldown(4); // 4s cooldown

      if (activeTrainer?.isPvP) {
        setPvpElo(prev => Math.max(800, prev - 15));
        addLog(`💔 PvP defeat! Your ELO rating decreased by 15!`);
        setActiveTrainer(null);
        setWildPoke(null);
      } else if (activeTrainer) {
        // Blacked out during a gym / Elite Four / champion fight: the battle is
        // lost. Previously the trainer was left active, so the leader's
        // remaining Pokemon kept fighting after the revive and the player
        // could still walk away with the badge.
        addLog(`💔 You blacked out and lost the battle against ${activeTrainer.name}!`);
        setActiveTrainer(null);
        setWildPoke(null);
        setTrainerPokeIndex(0);
      } else if (route.respawn && (ROUTES as any)[activeRegion][route.respawn]) {
        setActiveRouteKey(route.respawn);
        setActiveTrainer(null);
        setWildPoke(null);
      }
      return;
    }

    // Auto-Potion Check
    if (activeFighter && autoPotion && (activeFighter.currentHp / activeFighter.maxHp) < 0.3 && money >= 15) {
      setMoney(m => m - 15);
      setActiveTeam(prev => {
        const next = [...prev];
        const idx = next.findIndex(p => p.id === activeFighter.id);
        if (idx !== -1) {
          next[idx] = { ...next[idx], currentHp: next[idx].maxHp };
        }
        return next;
      });
      addLog(`🧪 Auto-Potion used on ${activeFighter.name}! Cost ¤15.`);
    }

    if (!wildPoke) return;

    const tickRate = battleSpeed === '1x' ? 300 : battleSpeed === '3x' ? 100 : 60;

    // Battle Progress ticker
    const timer = setTimeout(() => {
      if (catchAnim) return; // Pause during catch animation!
      // Calculate speeds to fill bars
      const fighterSpeed = activeFighter.speed;
      const enemySpeed = wildPoke.speed;

      const shoesBenefit = UPGRADES_CONFIG.shoes.getBenefit(upgrades.shoes);
      const fighterIncrement = ((fighterSpeed / 12) + 1) * (1 + shoesBenefit);

      setPlayerProgress(prev => {
        const next = prev + fighterIncrement;
        if (next >= 100) {
          // Player Attacks!
          const activeMoves = activeFighter.moves || [];
          let move = activeMoves.find(m => m.pp > 0);
          if (!move) {
            move = { name: 'Tackle', type: 'Normal', power: 40, maxPp: 35, pp: 35, cooldownMs: 1000, lastUsed: 0 };
          } else {
            setActiveTeam(prev => {
              const next = [...prev];
              const fighter = { ...next[0] };
              if (fighter.moves) {
                fighter.moves = fighter.moves.map(m => m.name === move!.name ? { ...m, pp: m.pp - 1 } : m);
              }
              next[0] = fighter;
              return next;
            });
          }
          const chosenMove = move;

          const isSpecial = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Dragon', 'Dark', 'Fairy'].includes(chosenMove.type);
          const attackerAtk = isSpecial ? (activeFighter.spAtk || activeFighter.attack) : activeFighter.attack;
          const defenderDef = isSpecial ? (wildPoke.spDef || wildPoke.defense) : wildPoke.defense;

          const mult = getDamageMultiplier([chosenMove.type], wildPoke.types);
          const itemMultiplier = getHeldItemMultiplier(activeFighter, chosenMove.type);
          const isCrit = Math.random() < 0.08;
          const critBonus = isCrit ? 1.5 : 1.0;
          const baseDmg = Math.max(1, attackerAtk - Math.floor(defenderDef / 4));
          const moveFactor = chosenMove.power / 40;
          const dmg = Math.round(baseDmg * mult * itemMultiplier * critBonus * moveFactor * (0.85 + Math.random() * 0.15));

          audio.playHit();
          spawnMovePopup(chosenMove.name, chosenMove.type, true);
          setTimeout(() => {
            spawnDamageNumber(dmg, false);
          }, 150);

          setWildPoke(enemy => {
            if (!enemy) return null;
            const nextHp = Math.max(0, enemy.currentHp - dmg);

            if (isCrit) addLog(`💥 Critical Hit!`);
            addLog(`⚔️ Your ${activeFighter.name} used ${move.name.toUpperCase()} on ${enemy.name} for ${dmg} HP!`);

            if (nextHp <= 0) {
              // Enemy Defeated!
              addLog(`🎉 Defeated ${enemy.name}!`);
              audio.playFaint();

              // 1. Give XP to active fighter and small split to bench
              const baseExp = Number(enemy.model.exp[0]['base exp']) || 50;
              const xpYield = Math.floor(baseExp * enemy.level / 7);
              const shareBenefit = UPGRADES_CONFIG.share.getBenefit(upgrades.share);

              setActiveTeam(currentTeam => {
                return currentTeam.map((p, idx) => {
                  let pXp = p.xp;
                  let pLvl = p.level;
                  const baseShare = idx === 0 ? xpYield : Math.floor(xpYield / 6);
                  const additionalShare = (idx !== 0 && shareBenefit > 0) ? Math.floor(xpYield * shareBenefit) : 0;
                  const share = baseShare + additionalShare;
                  if (share <= 0) return p;

                  pXp += share;

                  // Check Level Up
                  const growthRate = p.model.stats[0]['growth rate'] || 'Medium Fast';
                  const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];

                  let leveledUp = false;
                  while (pXp >= table[pLvl] && pLvl < 100) {
                    pLvl += 1;
                    leveledUp = true;
                  }

                  // Award EVs to battling Pokémon
                  if (idx === 0) {
                    awardEvs(p);
                  }

                  if (leveledUp) {
                    addLog(`🌟 ${p.name} leveled up to Lvl ${pLvl}!`);
                    audio.playLevelUp();

                    // Evolution check
                    const evolInfo = (EVOLUTIONS as any)[p.name];
                    if (evolInfo && pLvl >= Number(evolInfo.level)) {
                      const nextForm = evolInfo.to;
                      const nextModel = POKEDEX.find(poke => poke.pokemon[0].Pokemon === nextForm);
                      if (nextModel) {
                        addLog(`✨ What's this? ${p.name} is evolving into ${nextForm}!`);
                        const evoSprites = getPokemonSprites(nextForm, p.isShiny);
                        p.name = nextForm;
                        p.model = nextModel;
                        p.types = nextModel.stats[0].types;
                        p.image = evoSprites.image;
                        p.backImage = evoSprites.backImage;
                        p.animatedFront = evoSprites.animatedFront;
                        p.animatedBack = evoSprites.animatedBack;
                        p.learnedMoves = p.learnedMoves || [];
                        p.moves = getLearnableMoves(nextForm, p.types)
                          .filter(m => m.level <= pLvl)
                          .slice(-4)
                          .map(m => ({
                            name: m.name,
                            type: m.type,
                            power: m.power,
                            maxPp: m.pp,
                            pp: m.pp,
                            cooldownMs: m.cooldownMs,
                            lastUsed: 0
                          }));
                      }
                    }
                    checkNewMoves(p, pLvl, addLog);
                  }

                  const updatedPoke = {
                    ...p,
                    level: pLvl,
                    xp: pXp
                  };

                  recalculatePokemonStats(updatedPoke);
                  updatedPoke.currentHp = leveledUp ? updatedPoke.maxHp : Math.min(updatedPoke.maxHp, p.currentHp);
                  return updatedPoke;
                });
              });

              // 2. Award Money (10-30 based on Lvl)
              const coinBenefit = UPGRADES_CONFIG.coin.getBenefit(upgrades.coin);
              const coinYield = Math.floor(enemy.level * 5 * (0.8 + Math.random() * 0.4) * (1 + coinBenefit));
              addMoney(coinYield);

              // 3. Attempt catch if wild (not gym leader battle)
              let animStarted = false;
              if (!activeTrainer) {
                setStatistics(prev => ({ ...prev, wildWins: prev.wildWins + 1 }));
                animStarted = attemptCatch(enemy);
              }

              // 4. Handle Gym progress
              if (activeTrainer) {
                const nextPokeIdx = trainerPokeIndex + 1;
                if (nextPokeIdx >= activeTrainer.poke.length) {
                  // Beat Leader!
                  handleTrainerWin(activeTrainer);
                  setActiveTrainer(null);
                  setWildPoke(null);
                } else {
                  setTrainerPokeIndex(nextPokeIdx);
                  const [nextPokeName, nextLvl] = activeTrainer.poke[nextPokeIdx];
                  const nextOpponent = createPokemon(nextPokeName, nextLvl) as unknown as WildPokemon;
                  addLog(`⚔️ ${activeTrainer.name} sent out ${nextPokeName}!`);
                  return nextOpponent;
                }
              } else {
                if (!animStarted) {
                  setWildPoke(null); // Triggers spawn next tick
                }
              }
            }

            return { ...enemy, currentHp: nextHp };
          });

          return 0; // Reset bar
        }
        return next;
      });

      setWildProgress(prev => {
        const next = prev + (enemySpeed / 12) + 1;
        if (next >= 100) {
          // Enemy Attacks!
          const move = getPokemonMove(wildPoke.types, wildPoke.level);
          const mult = getDamageMultiplier([move.type], activeFighter.types);
          const isCrit = Math.random() < 0.05;
          const critBonus = isCrit ? 1.5 : 1.0;
          const baseDmg = Math.max(1, wildPoke.attack - Math.floor(activeFighter.defense / 4));
          const moveFactor = move.power / 40;
          const dmg = Math.round(baseDmg * mult * critBonus * moveFactor * (0.85 + Math.random() * 0.15));

          audio.playHit();
          spawnMovePopup(move.name, move.type, false);
          setTimeout(() => {
            spawnDamageNumber(dmg, true);
          }, 150);

          setActiveTeam(currentTeam => {
            const fighterIdx = currentTeam.findIndex(p => p.id === activeFighter.id);
            if (fighterIdx === -1) return currentTeam;

            const nextTeam = [...currentTeam];
            const nextHp = Math.max(0, activeFighter.currentHp - dmg);
            nextTeam[fighterIdx] = { ...activeFighter, currentHp: nextHp };

            if (nextHp <= 0) {
              addLog(`💔 Your ${activeFighter.name} fainted!`);
              audio.playFaint();
            } else {
              addLog(`💥 Wild ${wildPoke.name} used ${move.name.toUpperCase()} for ${dmg} HP!`);
            }

            return nextTeam;
          });

          return 0; // Reset bar
        }
        return next;
      });
    }, tickRate);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTeam,
    wildPoke,
    activeRegion,
    activeRouteKey,
    activeTrainer,
    trainerPokeIndex,
    healingCooldown,
    generateWildPokemon,
    catchAnim,
    autoRevive,
    money,
    autoPotion,
    getPokemonMove,
    getDamageMultiplier,
    badges,
    playerProgress,
    wildProgress,
    addLog,
    spawnMovePopup,
    spawnDamageNumber,
    battleSpeed,
    upgrades
  ]);

  // Save Game
  const saveGame = useCallback(() => {
    if (!activeProfile) return;

    // Check if another tab claimed ownership of this profile.
    // If another tab owns the profile we must NOT write, but we also must
    // not fail silently: the player would watch their progress stop
    // persisting with no explanation. Log it and tell them.
    const lockKey = `idle_poke_owner_${activeProfile}`;
    const currentOwner = localStorage.getItem(lockKey);
    const ownerId = currentOwner ? currentOwner.split(':')[0] : null;
    const ownerStamp = currentOwner ? Number(currentOwner.split(':')[1] || 0) : 0;
    const ownerIsStale = ownerStamp > 0 && (Date.now() - ownerStamp) > STALE_LOCK_MS;

    if (ownerId && ownerId !== TAB_SESSION_ID && !ownerIsStale) {
      console.warn(
        `[IdlePoke] Save skipped for "${activeProfile}": another tab owns this save. ` +
        `Close the other tab to keep saving.`
      );
      addLog('⚠️ Save blocked: another tab has this profile open. Close it to save again.');
      return;
    }

    // Take the lock, stamping it with the current time so a later tab can
    // tell whether this owner is still alive.
    localStorage.setItem(lockKey, `${TAB_SESSION_ID}:${Date.now()}`);

    const data = {
      money,
      badges,
      activeRegion,
      activeRouteKey,
      inventory,
      activeTeam: activeTeam.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        xp: p.xp,
        currentHp: p.currentHp,
        isShiny: p.isShiny,
        gender: p.gender,
        nature: p.nature,
        ability: p.ability,
        heldItem: p.heldItem,
        ivs: p.ivs,
        evs: p.evs,
        learnedMoves: p.learnedMoves,
        moves: p.moves,
        quality: p.quality,
        iv: p.iv,
        prestige: p.prestige || 0
      })),
      box: box.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        xp: p.xp,
        currentHp: p.currentHp,
        isShiny: p.isShiny,
        gender: p.gender,
        nature: p.nature,
        ability: p.ability,
        heldItem: p.heldItem,
        ivs: p.ivs,
        evs: p.evs,
        learnedMoves: p.learnedMoves,
        moves: p.moves,
        quality: p.quality,
        iv: p.iv,
        prestige: p.prestige || 0
      })),
      pokedex,
      timestamp: Date.now(),
      catchMode,
      spriteZoom,
      autoPotion,
      autoRevive,
      captureLog,
      battleSpeed,
      upgrades,
      rods,
      statistics,
      pvpElo
    };
    localStorage.setItem(`idle_poke_save_${activeProfile}`, JSON.stringify(data));

    // Update profile stats in metadata
    setProfiles(prev => {
      const next = prev.map(prof => {
        if (prof.username === activeProfile) {
          return {
            ...prof,
            badgesCount: badges.length,
            pokemonCount: activeTeam.length + box.length
          };
        }
        return prof;
      });
      localStorage.setItem('idle_poke_profiles', JSON.stringify(next));
      return next;
    });
  }, [money, badges, activeRegion, activeRouteKey, inventory, activeTeam, box, pokedex, catchMode, spriteZoom, autoPotion, autoRevive, captureLog, battleSpeed, upgrades, rods, statistics, pvpElo, activeProfile]);

  // Keep a ref to the latest saveGame so the autosave timers below do not
  // depend on the state that saveGame itself closes over. Without this, every
  // battle tick (activeTeam/captureLog/statistics change) produced a new
  // saveGame identity, which tore down and recreated the 15s interval before
  // it could ever fire — so autosave silently stopped during battles.
  const saveGameRef = useRef(saveGame);
  useEffect(() => {
    saveGameRef.current = saveGame;
  }, [saveGame]);

  const createProfile = (username: string, avatar: string, starterName: string) => {
    if (profiles.some(p => p.username.toLowerCase() === username.toLowerCase())) {
      addLog(`❌ Trainer name "${username}" is already taken!`);
      return false;
    }

    const starter = createPokemon(starterName, 5);
    starter.ivs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 };
    recalculatePokemonStats(starter);
    starter.iv = 100;
    starter.quality = 'Epic';
    starter.currentHp = starter.maxHp;

    const newProfile = {
      username,
      avatar,
      createdAt: Date.now(),
      badgesCount: 0,
      pokemonCount: 1
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('idle_poke_profiles', JSON.stringify(updatedProfiles));

    setMoney(500);
    setBadges([]);
    setActiveRegion('Kanto');
    setActiveRouteKey('route');
    setInventory({ pokeball: 50, greatball: 10, ultraball: 0, masterball: 0 });
    setActiveTeam([starter]);
    setBox([]);
    setPokedex({
      [starterName]: { caught: true, seen: true, shinyCaught: false }
    });
    setUpgrades({ shoes: 0, share: 0, coin: 0, charm: 0 });
    setStatistics({ caught: 0, throws: 0, moneyGained: 0, wildWins: 0, trainerWins: 0, eliteFourWins: 0, championWins: 0 });
    setPvpElo(1000);

    setActiveProfile(username);
    localStorage.setItem('idle_poke_active_profile', username);
    localStorage.setItem(`idle_poke_owner_${username}`, `${TAB_SESSION_ID}:${Date.now()}`);

    const initialSave = {
      money: 500,
      badges: [],
      activeRegion: 'Kanto',
      activeRouteKey: 'route',
      inventory: { pokeball: 50, greatball: 10, ultraball: 0, masterball: 0 },
      activeTeam: [{
        id: starter.id,
        name: starter.name,
        level: starter.level,
        xp: starter.xp,
        currentHp: starter.currentHp,
        isShiny: starter.isShiny,
        gender: starter.gender,
        nature: starter.nature,
        ability: starter.ability,
        heldItem: starter.heldItem,
        ivs: starter.ivs,
        evs: starter.evs,
        learnedMoves: starter.learnedMoves,
        moves: starter.moves,
        quality: starter.quality,
        iv: starter.iv
      }],
      box: [],
      pokedex: { [starterName]: { caught: true, seen: true, shinyCaught: false } },
      timestamp: Date.now(),
      catchMode: 'all',
      spriteZoom: 1,
      autoPotion: false,
      autoRevive: false,
      captureLog: [],
      battleSpeed: '1x',
      upgrades: { shoes: 0, share: 0, coin: 0, charm: 0 },
      statistics: { caught: 0, throws: 0, moneyGained: 0, wildWins: 0, trainerWins: 0, eliteFourWins: 0, championWins: 0 },
      pvpElo: 1000
    };
    localStorage.setItem(`idle_poke_save_${username}`, JSON.stringify(initialSave));

    addLog(`✨ Trainer Profile created for ${username}! Choose a starter and catch 'em all!`);
    return true;
  };

  const selectProfile = useCallback((username: string) => {
    setActiveProfile(username);
    localStorage.setItem('idle_poke_active_profile', username);

    // Claim ownership of this profile's save only if nobody else holds it.
    // Unconditionally claiming it let a second tab steal the lock from the
    // first, which silently stopped the first tab's saves.
    const ownerKey = `idle_poke_owner_${username}`;
    const currentOwner = localStorage.getItem(ownerKey);
    const ownerId = currentOwner ? currentOwner.split(':')[0] : null;
    const ownerStamp = currentOwner ? Number(currentOwner.split(':')[1] || 0) : 0;
    const ownerIsStale = ownerStamp > 0 && (Date.now() - ownerStamp) > STALE_LOCK_MS;

    if (!currentOwner || ownerId === TAB_SESSION_ID || ownerIsStale) {
      localStorage.setItem(ownerKey, `${TAB_SESSION_ID}:${Date.now()}`);
    } else {
      console.warn(
        `[IdlePoke] "${username}" is owned by another tab; this tab will not overwrite its save.`
      );
    }

    const saved = localStorage.getItem(`idle_poke_save_${username}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMoney(data.money || 0);
        setBadges(data.badges || []);
        setActiveRegion(data.activeRegion || 'Kanto');
        setActiveRouteKey(data.activeRouteKey || 'route');
        setInventory(data.inventory || { pokeball: 50, greatball: 10, ultraball: 0, masterball: 0 });
        setPokedex(data.pokedex || {});
        if (data.catchMode) setCatchMode(data.catchMode);
        if (data.spriteZoom) setSpriteZoom(data.spriteZoom);
        if (data.autoPotion !== undefined) setAutoPotion(data.autoPotion);
        if (data.autoRevive !== undefined) setAutoRevive(data.autoRevive);
        if (data.captureLog) setCaptureLog(data.captureLog);
        if (data.battleSpeed) {
          if (data.battleSpeed === 'slow') setBattleSpeed('1x');
          else if (data.battleSpeed === 'normal') setBattleSpeed('3x');
          else if (data.battleSpeed === 'fast') setBattleSpeed('5x');
          else setBattleSpeed(data.battleSpeed);
        }
        if (data.upgrades) setUpgrades(data.upgrades);
        if (data.rods) setRods(data.rods);
        else setRods({ old: false, good: false, super: false });
        if (data.statistics) {
          setStatistics({
            caught: data.statistics.caught || 0,
            throws: data.statistics.throws || 0,
            moneyGained: data.statistics.moneyGained || 0,
            wildWins: data.statistics.wildWins || 0,
            trainerWins: data.statistics.trainerWins || 0,
            eliteFourWins: data.statistics.eliteFourWins || 0,
            championWins: data.statistics.championWins || 0
          });
        } else {
          setStatistics({ caught: 0, throws: 0, moneyGained: 0, wildWins: 0, trainerWins: 0, eliteFourWins: 0, championWins: 0 });
        }
        if (data.pvpElo !== undefined) setPvpElo(data.pvpElo);
        else setPvpElo(1000);

        const loadedTeam = (data.activeTeam || []).map((p: any) => {
          const inst = createPokemon(p.name, p.level, p.isShiny, p.gender);
          inst.id = p.id || inst.id;
          inst.xp = p.xp;
          if (p.nature) inst.nature = p.nature;
          if (p.ability) inst.ability = p.ability;
          if (p.heldItem !== undefined) inst.heldItem = p.heldItem;
          if (p.ivs) inst.ivs = p.ivs;
          if (p.evs) inst.evs = p.evs;
          if (p.learnedMoves) inst.learnedMoves = p.learnedMoves;
          if (p.moves) inst.moves = p.moves;
          if (p.quality) inst.quality = p.quality;
          if (p.iv !== undefined) inst.iv = p.iv;
          if (p.prestige !== undefined) inst.prestige = p.prestige;

          recalculatePokemonStats(inst);
          inst.currentHp = p.currentHp !== undefined ? p.currentHp : inst.maxHp;
          return inst;
        });

        const loadedBox = (data.box || []).map((p: any) => {
          const inst = createPokemon(p.name, p.level, p.isShiny, p.gender);
          inst.id = p.id || inst.id;
          inst.xp = p.xp;
          if (p.nature) inst.nature = p.nature;
          if (p.ability) inst.ability = p.ability;
          if (p.heldItem !== undefined) inst.heldItem = p.heldItem;
          if (p.ivs) inst.ivs = p.ivs;
          if (p.evs) inst.evs = p.evs;
          if (p.learnedMoves) inst.learnedMoves = p.learnedMoves;
          if (p.moves) inst.moves = p.moves;
          if (p.quality) inst.quality = p.quality;
          if (p.iv !== undefined) inst.iv = p.iv;
          if (p.prestige !== undefined) inst.prestige = p.prestige;

          recalculatePokemonStats(inst);
          inst.currentHp = p.currentHp !== undefined ? p.currentHp : inst.maxHp;
          return inst;
        });

        setActiveTeam(loadedTeam);
        setBox(loadedBox);
        addLog(`💾 Loaded save game for Trainer ${username}!`);

        // Offline grinding calculator
        const savedTime = data.timestamp;
        if (savedTime && loadedTeam.length > 0) {
          const elapsedMs = Date.now() - savedTime;
          const elapsedSec = Math.floor(elapsedMs / 1000);

          if (elapsedSec >= 30) {
            const grindTime = Math.min(elapsedSec, 43200); // Max 12 hours
            const activeReg = data.activeRegion || 'Kanto';
            const activeRtKey = data.activeRouteKey || 'route';
            const route = (ROUTES as any)[activeReg]?.[activeRtKey];

            if (route && !route.town) {
              const avgLvl = Math.round(((route.minLevel || 2) + (route.maxLevel || 5)) / 2);
              const pokes = route.pokes || ['Pidgey'];
              const repPokeName = pokes[0];
              const repModel = POKEDEX.find(p => p.pokemon[0].Pokemon === repPokeName);

              if (repModel) {
                const activeFighter = loadedTeam[0];
                const savedUpgrades = data.upgrades || { shoes: 0, share: 0, coin: 0, charm: 0 };
                const baseExp = Number(repModel.exp[0]['base exp']) || 50;
                const xpYield = Math.floor(baseExp * avgLvl / 7);
                const coinBenefit = UPGRADES_CONFIG.coin.getBenefit(savedUpgrades.coin);
                const coinYield = Math.floor(avgLvl * 5 * (1 + coinBenefit));

                const playerAttackInterval = 10 / (activeFighter.speed / 12 + 1);
                const baseDmg = Math.max(1, activeFighter.attack - Math.floor(Number(repModel.stats[0].defense) / 4));
                const hitsToKill = Math.ceil((getIndividualHpValue(Number(repModel.stats[0].hp), avgLvl, 50, 0) * 3) / baseDmg) || 1;

                const battleDuration = Math.min(10, Math.max(1.5, (hitsToKill * playerAttackInterval) + 1.5));
                const battlesFought = Math.floor(grindTime / battleDuration);
                const moneyEarned = battlesFought * coinYield;
                const xpEarned = battlesFought * xpYield;

                if (battlesFought > 0) {
                  addMoney(moneyEarned);

                  const shareBenefit = UPGRADES_CONFIG.share.getBenefit(savedUpgrades.share);
                  const updatedTeam = loadedTeam.map((p: any, idx: number) => {
                    let pXp = p.xp;
                    let pLvl = p.level;
                    const baseShare = idx === 0 ? xpEarned : Math.floor(xpEarned / 6);
                    const additionalShare = (idx !== 0 && shareBenefit > 0) ? Math.floor(xpEarned * shareBenefit) : 0;
                    const share = baseShare + additionalShare;
                    if (share <= 0) return p;
                    pXp += share;

                    const growthRate = p.model.stats[0]['growth rate'] || 'Medium Fast';
                    const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];

                    let leveledUp = false;
                    while (pXp >= table[pLvl] && pLvl < 100) {
                      pLvl += 1;
                      leveledUp = true;
                    }

                    if (leveledUp) {
                      let pName = p.name;
                      let pModel = p.model;
                      let pTypes = p.types;
                      let pImage = p.image;

                      const evolInfo = (EVOLUTIONS as any)[pName];
                      if (evolInfo && pLvl >= Number(evolInfo.level)) {
                        const nextForm = evolInfo.to;
                        const nextModel = POKEDEX.find(poke => poke.pokemon[0].Pokemon === nextForm);
                        if (nextModel) {
                          pName = nextForm;
                          pModel = nextModel;
                          pTypes = nextModel.stats[0].types;
                          pImage = p.isShiny ? nextModel.images.shiny.front : nextModel.images.normal.front;
                        }
                      }

                      const stats = pModel.stats[0];
                      // `p.iv` is a 0-100 PERCENTAGE, but the stat formula
                      // expects a single IV of 0-31. Passing the percent
                      // straight through added up to +100 to every stat --
                      // a maxed Pokemon was roughly three times too
                      // strong. The per-stat IVs are stored on the
                      // instance, so use them; fall back to a neutral 15.
                      const pIvs = (p as any).ivs;
                      const hpIv = typeof pIvs?.hp === 'number' ? pIvs.hp : 15;
                      const atkIv = typeof pIvs?.attack === 'number' ? pIvs.attack : 15;
                      const defIv = typeof pIvs?.defense === 'number' ? pIvs.defense : 15;
                      const spdIv = typeof pIvs?.speed === 'number' ? pIvs.speed : 15;
                      const newMaxHp = getIndividualHpValue(Number(stats.hp), pLvl, hpIv, 0) * 3;
                      return {
                        ...p,
                        name: pName,
                        model: pModel,
                        types: pTypes,
                        image: pImage,
                        level: pLvl,
                        xp: pXp,
                        maxHp: newMaxHp,
                        currentHp: newMaxHp,
                        attack: getIndividualStatValue(Number(stats.attack), pLvl, atkIv, 0, 1.0),
                        defense: getIndividualStatValue(Number(stats.defense), pLvl, defIv, 0, 1.0),
                        speed: getIndividualStatValue(Number(stats.speed), pLvl, spdIv, 0, 1.0)
                      };
                    }
                    return { ...p, xp: pXp };
                  });

                  let catches = 0;
                  const newBox = [...loadedBox];
                  const updatedPokedex = { ...(data.pokedex || {}) };

                  if (data.catchMode !== 'none') {
                    const catchRate = Number(repModel.stats[0]['catch rate']) || 45;
                    const catchChance = (catchRate * 1) / 765;
                    const charmMultiplier = UPGRADES_CONFIG.charm.getBenefit(savedUpgrades.charm);
                    for (let i = 0; i < battlesFought; i++) {
                      if (Math.random() < catchChance * 0.04) {
                        const isShiny = Math.random() < (SHINY_CHANCE * charmMultiplier);
                        const caughtPoke = createPokemon(repPokeName, avgLvl, isShiny, undefined, charmMultiplier);
                        newBox.push(caughtPoke);
                        updatedPokedex[repPokeName] = {
                          caught: true,
                          seen: true,
                          shinyCaught: updatedPokedex[repPokeName]?.shinyCaught || isShiny
                        };
                        catches++;
                        if (catches >= 5) break; // Cap offline catches to prevent box flood
                      }
                    }
                  }

                  setActiveTeam(updatedTeam);
                  setBox(newBox);
                  setPokedex(updatedPokedex);

                  setOfflineReport({
                    elapsedSeconds: elapsedSec,
                    battles: battlesFought,
                    money: moneyEarned,
                    xp: xpEarned,
                    caughtCount: catches
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse save', e);
      }
    }
  }, [addLog, addMoney]);

  const loadGame = useCallback(() => {
    const active = localStorage.getItem('idle_poke_active_profile');
    if (active) {
      selectProfile(active);
    }
  }, [selectProfile]);

  const logoutProfile = useCallback(() => {
    if (activeProfile) {
      localStorage.removeItem(`idle_poke_owner_${activeProfile}`);
    }
    setActiveProfile(null);
    localStorage.removeItem('idle_poke_active_profile');
    setActiveTeam([]);
    setBox([]);
    setWildPoke(null);
    setActiveTrainer(null);
  }, [activeProfile]);

  const deleteProfile = useCallback((username: string) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.username !== username);
      localStorage.setItem('idle_poke_profiles', JSON.stringify(updated));
      return updated;
    });
    localStorage.removeItem(`idle_poke_save_${username}`);
    localStorage.removeItem(`idle_poke_owner_${username}`);
    if (activeProfile === username) {
      logoutProfile();
    }
  }, [activeProfile, logoutProfile]);

  // Autosave interval (every 15s)
  useEffect(() => {
    const timer = setInterval(() => {
      saveGameRef.current();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Lock heartbeat. The owner key carries a timestamp; refreshing it while
  // the tab is alive is what lets another tab tell a live owner from a
  // stale one (a closed tab never gets to release its lock).
  useEffect(() => {
    const beat = setInterval(() => {
      const profile = activeProfileRef.current;
      if (!profile) return;
      const ownerKey = `idle_poke_owner_${profile}`;
      const owner = localStorage.getItem(ownerKey);
      if (owner && owner.split(':')[0] === TAB_SESSION_ID) {
        localStorage.setItem(ownerKey, `${TAB_SESSION_ID}:${Date.now()}`);
      }
    }, 5000);
    return () => clearInterval(beat);
  }, []);

  // Window close autosave hook.
  // Also releases the profile lock, so closing a tab does not leave the
  // profile permanently owned by a session id that no longer exists.
  useEffect(() => {
    const handleUnload = () => {
      saveGameRef.current();
      const profile = activeProfileRef.current;
      if (profile) {
        const ownerKey = `idle_poke_owner_${profile}`;
        const owner = localStorage.getItem(ownerKey);
        // Only release our own lock -- never one another tab holds.
        if (owner && owner.split(':')[0] === TAB_SESSION_ID) {
          localStorage.removeItem(ownerKey);
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    // `pagehide` is the reliable teardown event on mobile browsers, where
    // `beforeunload` is often skipped entirely.
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  // Reset route key when switching region to avoid undefined route crash
  useEffect(() => {
    const regionRoutes = (ROUTES as any)[activeRegion];
    if (regionRoutes && !regionRoutes[activeRouteKey]) {
      const defaultRoute = activeRegion === 'Johto' ? 'starter2' : 'starter';
      setActiveRouteKey(defaultRoute);
      setWildPoke(null);
      setActiveTrainer(null);
    }
  }, [activeRegion, activeRouteKey]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // BGM Loop management
  useEffect(() => {
    if (!activeProfile) {
      audio.stopBGM();
      return;
    }

    if (healingCooldown > 0) {
      audio.playBGM('walking');
      return;
    }

    if (activeTrainer) {
      audio.playBGM('gym');
    } else if (wildPoke) {
      audio.playBGM('wild');
    } else {
      audio.playBGM('walking');
    }

    return () => {
      audio.stopBGM();
    };
  }, [activeProfile, activeTrainer, wildPoke, healingCooldown]);

  const updateActiveMoves = useCallback((pokeId: string, activeMoves: ActiveMove[]) => {
    setActiveTeam(prev => prev.map(p => p.id === pokeId ? { ...p, moves: activeMoves } : p));
    setBox(prev => prev.map(p => p.id === pokeId ? { ...p, moves: activeMoves } : p));
  }, []);

  const teachMoveViaTM = useCallback((pokeId: string, tmId: string): boolean => {
    const tm = TMS_CONFIG[tmId];
    if (!tm) return false;

    if (!inventory.tms || (inventory.tms[tmId] || 0) <= 0) return false;

    // Resolve success synchronously: state updaters run later, so reading a
    // flag set inside them would always report failure.
    const target = [...activeTeam, ...box].find(p => p.id === pokeId);
    if (!target) {
      addLog(`❌ Could not find that Pokémon to teach ${tm.name}!`);
      return false;
    }

    // Type compatibility was only checked in the UI, so the move could be
    // taught to any Pokemon. The rule is the same one the modal uses: the
    // move must be in the Pokemon's learnset OR match one of its types.
    const learnable = getLearnableMoves(target.name, target.types || []);
    const inLearnset = learnable.some(m => m.name === tm.name);
    const typeMatch = (target.types || []).includes(tm.type);
    if (!inLearnset && !typeMatch) {
      addLog(`❌ ${tm.name} is not compatible with ${target.name}!`);
      return false;
    }

    const alreadyKnows = (target.learnedMoves || []).includes(tm.name);
    const success = !alreadyKnows;

    if (success) {
      const learn = (poke: PokemonInstance): PokemonInstance =>
        poke.id === pokeId && !(poke.learnedMoves || []).includes(tm.name)
          ? { ...poke, learnedMoves: [...(poke.learnedMoves || []), tm.name] }
          : poke;
      setActiveTeam(prev => prev.map(learn));
      setBox(prev => prev.map(learn));
    }

    if (success) {
      setInventory(prev => ({
        ...prev,
        tms: {
          ...prev.tms,
          [tmId]: (prev.tms?.[tmId] || 1) - 1
        }
      }));
      addLog(`💿 Taught ${tm.name} via TM to your Pokémon!`);
    } else {
      addLog(`❌ Pokémon already knows ${tm.name}!`);
    }

    return success;
  }, [inventory.tms, activeTeam, box, addLog]);

  const equipHeldItem = useCallback((pokeId: string, item: string | null) => {
    if (item) {
      if (!inventory.heldItems || (inventory.heldItems[item] || 0) <= 0) return;
    }

    const update = (p: PokemonInstance): PokemonInstance => {
      const prevItem = p.heldItem;
      if (prevItem) {
        setInventory(inv => ({
          ...inv,
          heldItems: {
            ...inv.heldItems,
            [prevItem]: (inv.heldItems?.[prevItem] || 0) + 1
          }
        }));
      }

      if (item) {
        setInventory(inv => ({
          ...inv,
          heldItems: {
            ...inv.heldItems,
            [item]: (inv.heldItems?.[item] || 1) - 1
          }
        }));
      }

      const updated = { ...p, heldItem: item };
      recalculatePokemonStats(updated);
      return updated;
    };

    setActiveTeam(prev => prev.map(p => p.id === pokeId ? update(p) : p));
    setBox(prev => prev.map(p => p.id === pokeId ? update(p) : p));
    if (item) {
      addLog(`📦 Equipped ${item} onto your Pokémon.`);
    } else {
      addLog(`📦 Took held item from your Pokémon.`);
    }
  }, [inventory.heldItems, addLog]);

  const buyTM = useCallback((tmId: string, cost: number) => {
    const tm = TMS_CONFIG[tmId];
    if (!tm) {
      addLog(`❌ Unknown TM.`);
      return;
    }

    // The badge requirement was only enforced in the UI (the button was
    // covered by a lock overlay), so calling buyTM directly bought a
    // gated TM for free.
    const badgeCount = badges.length;
    if (tm.badgeRequired && badgeCount < tm.badgeRequired) {
      addLog(`🔒 ${tm.name} requires ${tm.badgeRequired} badge(s) — you have ${badgeCount}.`);
      return;
    }

    if (money >= cost) {
      setMoney(m => m - cost);
      setInventory(prev => ({
        ...prev,
        tms: {
          ...prev.tms,
          [tmId]: (prev.tms?.[tmId] || 0) + 1
        }
      }));
      addLog(`🛒 Purchased 1x ${tm.name} TM!`);
    } else {
      addLog(`❌ Not enough money to buy TM.`);
    }
  }, [money, badges, addLog]);

  const buyHeldItem = useCallback((itemId: string, cost: number) => {
    if (money >= cost) {
      setMoney(m => m - cost);
      setInventory(prev => ({
        ...prev,
        heldItems: {
          ...prev.heldItems,
          [itemId]: (prev.heldItems?.[itemId] || 0) + 1
        }
      }));
      addLog(`🛒 Purchased 1x ${itemId} held item!`);
    } else {
      addLog(`❌ Not enough money to buy held item.`);
    }
  }, [money, addLog]);

  return {
    activeRegion,
    activeRouteKey,
    money,
    activeTeam,
    box,
    pokedex,
    inventory,
    badges,
    activeBallType,
    catchMode,
    wildPoke,
    playerProgress,
    wildProgress,
    combatLogs,
    activeTrainer,
    healingCooldown,
    setActiveRegion,
    setActiveRouteKey,
    setActiveTeam,
    setBox,
    setMoney,
    setInventory,
    setActiveBallType,
    setCatchMode,
    chooseStarter,
    selectRoute,
    buyPokeballs,
    healTeam,
    movePokeToTop,
    movePokeUp,
    movePokeDown,
    evolveTeamPokemon,
    prestigePokemon,
    swapWithBox,
    releasePokemon,
    startTrainerBattle,
    saveGame,
    loadGame,
    damageNumbers,
    movePopups,
    catchAnim,
    spriteZoom,
    setSpriteZoom,
    offlineReport,
    setOfflineReport,
    autoPotion,
    setAutoPotion,
    autoRevive,
    setAutoRevive,
    captureLog,
    setCaptureLog,
    battleSpeed,
    setBattleSpeed,
    upgrades,
    buyUpgrade,
    buyCandy,
    activeProfile,
    profiles,
    createProfile,
    selectProfile,
    logoutProfile,
    deleteProfile,
    clickMove,
    sortActiveTeam,
    sortBoxStorage,
    rods,
    buyRod,
    statistics,
    pvpElo,
    setPvpElo,
    triggerInstantHeal,
    instantHealCooldown,
    updateActiveMoves,
    teachMoveViaTM,
    defeatedBosses,
    equipHeldItem,
    buyTM,
    buyHeldItem
  };
};
