export interface Upgrades {
  shoes: number;
  share: number;
  coin: number;
  charm: number;
}

export const UPGRADES_CONFIG = {
  shoes: {
    name: "Running Shoes",
    description: "Speed up combat ticks by 8% per level.",
    baseCost: 200,
    maxLevel: 5,
    getCost: (lvl: number) => 200 * Math.pow(2.5, lvl),
    getBenefit: (lvl: number) => lvl * 0.08
  },
  share: {
    name: "Exp. Share",
    description: "Bench Pokemon gain 12% of combat EXP per level.",
    baseCost: 500,
    maxLevel: 5,
    getCost: (lvl: number) => 500 * Math.pow(3.0, lvl),
    getBenefit: (lvl: number) => lvl * 0.12
  },
  coin: {
    name: "Amulet Coin",
    description: "Increases coin drops by +25% per level.",
    baseCost: 300,
    maxLevel: 5,
    getCost: (lvl: number) => 300 * Math.pow(2.8, lvl),
    getBenefit: (lvl: number) => lvl * 0.25
  },
  charm: {
    name: "Shiny Charm",
    description: "Doubles the chance of finding Shiny Pokemon.",
    baseCost: 50000,
    maxLevel: 1,
    getCost: (lvl: number) => 50000,
    getBenefit: (lvl: number) => (lvl > 0 ? 2 : 1)
  }
} as const;
