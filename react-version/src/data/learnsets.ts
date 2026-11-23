import { MOVES } from './moves';

export interface LearnsetMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  level: number;
  pp: number;
  cooldownMs: number;
}

export interface TMMove {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  cooldownMs: number;
  cost: number;
  badgeRequired: number;
}

export const TMS_CONFIG: { [id: string]: TMMove } = {
  'tm-fire-blast': { id: 'tm-fire-blast', name: 'Fire Blast', type: 'Fire', power: 110, accuracy: 85, pp: 5, cooldownMs: 4500, cost: 5000, badgeRequired: 3 },
  'tm-solar-beam': { id: 'tm-solar-beam', name: 'Solar Beam', type: 'Grass', power: 120, accuracy: 100, pp: 10, cooldownMs: 4000, cost: 5000, badgeRequired: 3 },
  'tm-thunderbolt': { id: 'tm-thunderbolt', name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, pp: 15, cooldownMs: 3000, cost: 5000, badgeRequired: 3 },
  'tm-ice-beam': { id: 'tm-ice-beam', name: 'Ice Beam', type: 'Ice', power: 90, accuracy: 100, pp: 15, cooldownMs: 3000, cost: 5000, badgeRequired: 3 },
  'tm-earthquake': { id: 'tm-earthquake', name: 'Earthquake', type: 'Ground', power: 100, accuracy: 100, pp: 10, cooldownMs: 3200, cost: 5000, badgeRequired: 3 },
  'tm-hyper-beam': { id: 'tm-hyper-beam', name: 'Hyper Beam', type: 'Normal', power: 150, accuracy: 90, pp: 5, cooldownMs: 5000, cost: 7500, badgeRequired: 4 }
};

const CUSTOM_LEARNSETS: { [pokeName: string]: LearnsetMove[] } = {
  Bulbasaur: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Growl', type: 'Normal', power: 0, accuracy: 100, level: 1, pp: 40, cooldownMs: 800 },
    { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, level: 5, pp: 25, cooldownMs: 1500 },
    { name: 'Poison Powder', type: 'Poison', power: 20, accuracy: 75, level: 12, pp: 35, cooldownMs: 2000 },
    { name: 'Razor Leaf', type: 'Grass', power: 55, accuracy: 95, level: 18, pp: 25, cooldownMs: 1800 },
    { name: 'Take Down', type: 'Normal', power: 90, accuracy: 85, level: 28, pp: 20, cooldownMs: 2500 }
  ],
  Ivysaur: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Razor Leaf', type: 'Grass', power: 55, accuracy: 95, level: 1, pp: 25, cooldownMs: 1800 },
    { name: 'Take Down', type: 'Normal', power: 90, accuracy: 85, level: 28, pp: 20, cooldownMs: 2500 },
    { name: 'Giga Drain', type: 'Grass', power: 75, accuracy: 100, level: 36, pp: 15, cooldownMs: 3000 }
  ],
  Venusaur: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Razor Leaf', type: 'Grass', power: 55, accuracy: 95, level: 1, pp: 25, cooldownMs: 1800 },
    { name: 'Giga Drain', type: 'Grass', power: 75, accuracy: 100, level: 1, pp: 15, cooldownMs: 3000 },
    { name: 'Solar Beam', type: 'Grass', power: 120, accuracy: 100, level: 48, pp: 10, cooldownMs: 4000 },
    { name: 'Double-Edge', type: 'Normal', power: 120, accuracy: 100, level: 56, pp: 15, cooldownMs: 3500 }
  ],
  Charmander: [
    { name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Growl', type: 'Normal', power: 0, accuracy: 100, level: 1, pp: 40, cooldownMs: 800 },
    { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, level: 5, pp: 25, cooldownMs: 1500 },
    { name: 'Metal Claw', type: 'Steel', power: 50, accuracy: 95, level: 12, pp: 35, cooldownMs: 1200 },
    { name: 'Dragon Rage', type: 'Dragon', power: 40, accuracy: 100, level: 19, pp: 10, cooldownMs: 1800 },
    { name: 'Fire Spin', type: 'Fire', power: 35, accuracy: 85, level: 25, pp: 15, cooldownMs: 2200 }
  ],
  Charmeleon: [
    { name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Metal Claw', type: 'Steel', power: 50, accuracy: 95, level: 1, pp: 35, cooldownMs: 1200 },
    { name: 'Dragon Rage', type: 'Dragon', power: 40, accuracy: 100, level: 19, pp: 10, cooldownMs: 1800 },
    { name: 'Fire Spin', type: 'Fire', power: 35, accuracy: 85, level: 25, pp: 15, cooldownMs: 2200 },
    { name: 'Flamethrower', type: 'Fire', power: 90, accuracy: 100, level: 40, pp: 15, cooldownMs: 3000 }
  ],
  Charizard: [
    { name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Metal Claw', type: 'Steel', power: 50, accuracy: 95, level: 1, pp: 35, cooldownMs: 1200 },
    { name: 'Dragon Rage', type: 'Dragon', power: 40, accuracy: 100, level: 1, pp: 10, cooldownMs: 1800 },
    { name: 'Wing Attack', type: 'Flying', power: 60, accuracy: 100, level: 32, pp: 35, cooldownMs: 1600 },
    { name: 'Flamethrower', type: 'Fire', power: 90, accuracy: 100, level: 40, pp: 15, cooldownMs: 3000 },
    { name: 'Slash', type: 'Normal', power: 70, accuracy: 100, level: 48, pp: 20, cooldownMs: 2000 },
    { name: 'Fire Blast', type: 'Fire', power: 110, accuracy: 85, level: 56, pp: 5, cooldownMs: 4500 }
  ],
  Squirtle: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Tail Whip', type: 'Normal', power: 0, accuracy: 100, level: 1, pp: 40, cooldownMs: 800 },
    { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, level: 5, pp: 25, cooldownMs: 1500 },
    { name: 'Water Pulse', type: 'Water', power: 60, accuracy: 100, level: 15, pp: 20, cooldownMs: 1800 },
    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, level: 22, pp: 25, cooldownMs: 1400 }
  ],
  Wartortle: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Water Pulse', type: 'Water', power: 60, accuracy: 100, level: 15, pp: 20, cooldownMs: 1800 },
    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, level: 22, pp: 25, cooldownMs: 1400 },
    { name: 'Surf', type: 'Water', power: 90, accuracy: 100, level: 30, pp: 15, cooldownMs: 3000 }
  ],
  Blastoise: [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, level: 1, pp: 25, cooldownMs: 1500 },
    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, level: 1, pp: 25, cooldownMs: 1400 },
    { name: 'Surf', type: 'Water', power: 90, accuracy: 100, level: 1, pp: 15, cooldownMs: 3000 },
    { name: 'Body Slam', type: 'Normal', power: 85, accuracy: 100, level: 38, pp: 15, cooldownMs: 2000 },
    { name: 'Hydro Pump', type: 'Water', power: 110, accuracy: 80, level: 46, pp: 5, cooldownMs: 4000 },
    { name: 'Skull Bash', type: 'Normal', power: 130, accuracy: 100, level: 55, pp: 10, cooldownMs: 4500 }
  ],
  Aerodactyl: [
    { name: 'Wing Attack', type: 'Flying', power: 60, accuracy: 100, level: 1, pp: 35, cooldownMs: 1600 },
    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, level: 1, pp: 25, cooldownMs: 1400 },
    { name: 'Ancient Power', type: 'Rock', power: 60, accuracy: 100, level: 8, pp: 5, cooldownMs: 2500 },
    { name: 'Rock Slide', type: 'Rock', power: 75, accuracy: 90, level: 15, pp: 10, cooldownMs: 3000 },
    { name: 'Crunch', type: 'Dark', power: 80, accuracy: 100, level: 22, pp: 15, cooldownMs: 3200 },
    { name: 'Sky Attack', type: 'Flying', power: 140, accuracy: 90, level: 29, pp: 5, cooldownMs: 4500 },
    { name: 'Hyper Beam', type: 'Normal', power: 150, accuracy: 90, level: 36, pp: 5, cooldownMs: 5000 }
  ],
  Dragonair: [
    { name: 'Wrap', type: 'Normal', power: 15, accuracy: 90, level: 1, pp: 20, cooldownMs: 1000 },
    { name: 'Thunder Wave', type: 'Electric', power: 0, accuracy: 90, level: 1, pp: 20, cooldownMs: 2000 },
    { name: 'Twister', type: 'Dragon', power: 40, accuracy: 100, level: 10, pp: 20, cooldownMs: 1500 },
    { name: 'Dragon Rage', type: 'Dragon', power: 40, accuracy: 100, level: 20, pp: 10, cooldownMs: 1800 },
    { name: 'Dragon Breath', type: 'Dragon', power: 60, accuracy: 100, level: 35, pp: 20, cooldownMs: 2200 },
    { name: 'Slam', type: 'Normal', power: 80, accuracy: 75, level: 45, pp: 20, cooldownMs: 2800 },
    { name: 'Dragon Claw', type: 'Dragon', power: 80, accuracy: 100, level: 50, pp: 15, cooldownMs: 3000 }
  ],
  Dragonite: [
    { name: 'Wrap', type: 'Normal', power: 15, accuracy: 90, level: 1, pp: 20, cooldownMs: 1000 },
    { name: 'Twister', type: 'Dragon', power: 40, accuracy: 100, level: 1, pp: 20, cooldownMs: 1500 },
    { name: 'Dragon Breath', type: 'Dragon', power: 60, accuracy: 100, level: 1, pp: 20, cooldownMs: 2200 },
    { name: 'Slam', type: 'Normal', power: 80, accuracy: 75, level: 1, pp: 20, cooldownMs: 2800 },
    { name: 'Dragon Claw', type: 'Dragon', power: 80, accuracy: 100, level: 50, pp: 15, cooldownMs: 3000 },
    { name: 'Outrage', type: 'Dragon', power: 120, accuracy: 100, level: 55, pp: 10, cooldownMs: 4000 },
    { name: 'Hyper Beam', type: 'Normal', power: 150, accuracy: 90, level: 65, pp: 5, cooldownMs: 5000 }
  ]
};

export const getLearnableMoves = (name: string, types: string[]): LearnsetMove[] => {
  if (CUSTOM_LEARNSETS[name]) {
    return CUSTOM_LEARNSETS[name];
  }

  const primaryType = types[0] || 'Normal';
  const secondaryType = types[1] || null;

  const list: LearnsetMove[] = [
    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, level: 1, pp: 35, cooldownMs: 1000 },
    { name: 'Growl', type: 'Normal', power: 0, accuracy: 100, level: 1, pp: 40, cooldownMs: 800 }
  ];

  // Basic primary type move
  const primaryMoves = MOVES[primaryType] || MOVES['Normal'];
  list.push({
    name: primaryMoves.basic.name,
    type: primaryMoves.basic.type,
    power: primaryMoves.basic.power,
    accuracy: 100,
    level: 5,
    pp: 25,
    cooldownMs: 1500
  });

  // Medium type move
  list.push({
    name: `${primaryType} Punch`,
    type: primaryType,
    power: 55,
    accuracy: 95,
    level: 15,
    pp: 20,
    cooldownMs: 2000
  });

  // Secondary type move or advanced normal
  if (secondaryType) {
    const secMoves = MOVES[secondaryType] || MOVES['Normal'];
    list.push({
      name: secMoves.basic.name,
      type: secMoves.basic.type,
      power: secMoves.basic.power,
      accuracy: 100,
      level: 22,
      pp: 25,
      cooldownMs: 1800
    });
    list.push({
      name: secMoves.advanced.name,
      type: secMoves.advanced.type,
      power: secMoves.advanced.power,
      accuracy: 90,
      level: 42,
      pp: 10,
      cooldownMs: 3800
    });
  } else {
    list.push({
      name: 'Body Slam',
      type: 'Normal',
      power: 85,
      accuracy: 100,
      level: 22,
      pp: 15,
      cooldownMs: 2200
    });
    list.push({
      name: 'Double-Edge',
      type: 'Normal',
      power: 120,
      accuracy: 100,
      level: 42,
      pp: 15,
      cooldownMs: 3500
    });
  }

  // Advanced primary type move
  list.push({
    name: primaryMoves.advanced.name,
    type: primaryMoves.advanced.type,
    power: primaryMoves.advanced.power,
    accuracy: 90,
    level: 30,
    pp: 10,
    cooldownMs: 3500
  });

  // Elite move
  list.push({
    name: 'Hyper Beam',
    type: 'Normal',
    power: 150,
    accuracy: 90,
    level: 52,
    pp: 5,
    cooldownMs: 5000
  });

  return list.sort((a, b) => a.level - b.level);
};

export interface Nature {
  name: string;
  increased: 'attack' | 'defense' | 'spAtk' | 'spDef' | 'speed' | null;
  decreased: 'attack' | 'defense' | 'spAtk' | 'spDef' | 'speed' | null;
}

export const NATURES: Nature[] = [
  { name: 'Adamant', increased: 'attack', decreased: 'spAtk' },
  { name: 'Bashful', increased: null, decreased: null },
  { name: 'Bold', increased: 'defense', decreased: 'attack' },
  { name: 'Brave', increased: 'attack', decreased: 'speed' },
  { name: 'Calm', increased: 'spDef', decreased: 'attack' },
  { name: 'Careful', increased: 'spDef', decreased: 'spAtk' },
  { name: 'Docile', increased: null, decreased: null },
  { name: 'Gentle', increased: 'spDef', decreased: 'defense' },
  { name: 'Hardy', increased: null, decreased: null },
  { name: 'Hasty', increased: 'speed', decreased: 'defense' },
  { name: 'Impish', increased: 'defense', decreased: 'spAtk' },
  { name: 'Jolly', increased: 'speed', decreased: 'spAtk' },
  { name: 'Lax', increased: 'defense', decreased: 'spDef' },
  { name: 'Lonely', increased: 'attack', decreased: 'defense' },
  { name: 'Mild', increased: 'spAtk', decreased: 'defense' },
  { name: 'Modest', increased: 'spAtk', decreased: 'attack' },
  { name: 'Naive', increased: 'speed', decreased: 'spDef' },
  { name: 'Naughty', increased: 'attack', decreased: 'spDef' },
  { name: 'Quiet', increased: 'spAtk', decreased: 'speed' },
  { name: 'Quirky', increased: null, decreased: null },
  { name: 'Rash', increased: 'spAtk', decreased: 'spDef' },
  { name: 'Relaxed', increased: 'defense', decreased: 'speed' },
  { name: 'Sassy', increased: 'spDef', decreased: 'speed' },
  { name: 'Serious', increased: null, decreased: null },
  { name: 'Timid', increased: 'speed', decreased: 'attack' }
];
