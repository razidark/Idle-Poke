export interface Move {
  name: string;
  type: string;
  power: number;
}

export const MOVES: { [type: string]: { basic: Move; advanced: Move } } = {
  Normal: {
    basic: { name: 'Tackle', type: 'Normal', power: 40 },
    advanced: { name: 'Hyper Beam', type: 'Normal', power: 150 }
  },
  Fire: {
    basic: { name: 'Ember', type: 'Fire', power: 40 },
    advanced: { name: 'Flamethrower', type: 'Fire', power: 90 }
  },
  Water: {
    basic: { name: 'Water Gun', type: 'Water', power: 40 },
    advanced: { name: 'Hydro Pump', type: 'Water', power: 110 }
  },
  Electric: {
    basic: { name: 'Thunder Shock', type: 'Electric', power: 40 },
    advanced: { name: 'Thunderbolt', type: 'Electric', power: 90 }
  },
  Grass: {
    basic: { name: 'Vine Whip', type: 'Grass', power: 45 },
    advanced: { name: 'Solar Beam', type: 'Grass', power: 120 }
  },
  Ice: {
    basic: { name: 'Powder Snow', type: 'Ice', power: 40 },
    advanced: { name: 'Ice Beam', type: 'Ice', power: 90 }
  },
  Fighting: {
    basic: { name: 'Karate Chop', type: 'Fighting', power: 50 },
    advanced: { name: 'Close Combat', type: 'Fighting', power: 120 }
  },
  Poison: {
    basic: { name: 'Poison Sting', type: 'Poison', power: 30 },
    advanced: { name: 'Sludge Bomb', type: 'Poison', power: 90 }
  },
  Ground: {
    basic: { name: 'Mud-Slap', type: 'Ground', power: 20 },
    advanced: { name: 'Earthquake', type: 'Ground', power: 100 }
  },
  Flying: {
    basic: { name: 'Gust', type: 'Flying', power: 40 },
    advanced: { name: 'Hurricane', type: 'Flying', power: 110 }
  },
  Psychic: {
    basic: { name: 'Confusion', type: 'Psychic', power: 50 },
    advanced: { name: 'Psychic', type: 'Psychic', power: 90 }
  },
  Bug: {
    basic: { name: 'Struggle Bug', type: 'Bug', power: 50 },
    advanced: { name: 'Bug Buzz', type: 'Bug', power: 90 }
  },
  Rock: {
    basic: { name: 'Rock Throw', type: 'Rock', power: 50 },
    advanced: { name: 'Rock Slide', type: 'Rock', power: 75 }
  },
  Ghost: {
    basic: { name: 'Lick', type: 'Ghost', power: 30 },
    advanced: { name: 'Shadow Ball', type: 'Ghost', power: 80 }
  },
  Dragon: {
    basic: { name: 'Twister', type: 'Dragon', power: 40 },
    advanced: { name: 'Outrage', type: 'Dragon', power: 120 }
  },
  Dark: {
    basic: { name: 'Bite', type: 'Dark', power: 60 },
    advanced: { name: 'Dark Pulse', type: 'Dark', power: 80 }
  },
  Steel: {
    basic: { name: 'Metal Claw', type: 'Steel', power: 50 },
    advanced: { name: 'Iron Head', type: 'Steel', power: 80 }
  },
  Fairy: {
    basic: { name: 'Fairy Wind', type: 'Fairy', power: 40 },
    advanced: { name: 'Moonblast', type: 'Fairy', power: 95 }
  }
};
