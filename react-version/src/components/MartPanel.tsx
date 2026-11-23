import React, { useState } from 'react';
import { Coins, ShoppingCart, Sparkles, Lock } from 'lucide-react';
import type { PokeballInventory } from '../types/pokemon';
import { Upgrades, UPGRADES_CONFIG } from '../data/upgrades';
import { TMS_CONFIG } from '../data/learnsets';

interface MartPanelProps {
  money: number;
  inventory: PokeballInventory;
  buyPokeballs: (type: 'pokeball' | 'greatball' | 'ultraball' | 'masterball', cost: number, count: number) => void;
  upgrades: Upgrades;
  buyUpgrade: (key: keyof Upgrades) => void;
  badges: string[];
  buyCandy: (cost: number, xpAmount: number) => void;
  rods: { old: boolean; good: boolean; super: boolean };
  buyRod: (rodType: 'old' | 'good' | 'super', cost: number) => void;
  buyTM: (tmId: string, cost: number) => void;
  buyHeldItem: (itemId: string, cost: number) => void;
}

const HELD_ITEMS = [
  { id: 'charcoal', name: 'Charcoal', unitPrice: 2500, emoji: '🔥', description: 'Boosts Fire moves by 20%', requiredBadges: 1 },
  { id: 'mystic water', name: 'Mystic Water', unitPrice: 2500, emoji: '💧', description: 'Boosts Water moves by 20%', requiredBadges: 1 },
  { id: 'miracle seed', name: 'Miracle Seed', unitPrice: 2500, emoji: '🌱', description: 'Boosts Grass moves by 20%', requiredBadges: 1 },
  { id: 'magnet', name: 'Magnet', unitPrice: 2500, emoji: '⚡', description: 'Boosts Electric moves by 20%', requiredBadges: 2 },
  { id: 'soft sand', name: 'Soft Sand', unitPrice: 2500, emoji: '🏜️', description: 'Boosts Ground moves by 20%', requiredBadges: 2 },
  { id: 'sharp beak', name: 'Sharp Beak', unitPrice: 2500, emoji: '🦅', description: 'Boosts Flying moves by 20%', requiredBadges: 2 },
  { id: 'black belt', name: 'Black Belt', unitPrice: 2500, emoji: '🥋', description: 'Boosts Fighting moves by 20%', requiredBadges: 3 },
  { id: 'dragon fang', name: 'Dragon Fang', unitPrice: 2500, emoji: '🦷', description: 'Boosts Dragon moves by 20%', requiredBadges: 3 }
];


const BALL_ITEMS: {
  type: 'pokeball' | 'greatball' | 'ultraball' | 'masterball';
  name: string;
  unitPrice: number;
  color: string;
  borderColor: string;
  emoji: string;
  description: string;
  requiredBadges: number;
}[] = [
  { type: 'pokeball', name: 'Poké Ball', unitPrice: 20, color: 'bg-red-500/10', borderColor: 'border-red-500/20', emoji: '🔴', description: '1× catch rate', requiredBadges: 0 },
  { type: 'greatball', name: 'Great Ball', unitPrice: 60, color: 'bg-blue-500/10', borderColor: 'border-blue-500/20', emoji: '🔵', description: '1.5× catch rate', requiredBadges: 1 },
  { type: 'ultraball', name: 'Ultra Ball', unitPrice: 120, color: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', emoji: '🟡', description: '2× catch rate', requiredBadges: 3 },
  { type: 'masterball', name: 'Master Ball', unitPrice: 5000, color: 'bg-purple-500/10', borderColor: 'border-purple-500/20', emoji: '🟣', description: 'Never fails!', requiredBadges: 5 },
];

const CANDY_ITEMS: {
  id: string;
  name: string;
  unitPrice: number;
  xpAmount: number;
  color: string;
  borderColor: string;
  emoji: string;
  description: string;
  requiredBadges: number;
}[] = [
  { id: 'small_candy', name: 'Small EXP Candy', unitPrice: 150, xpAmount: 500, color: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', emoji: '🍬', description: '+500 XP to fighter', requiredBadges: 1 },
  { id: 'medium_candy', name: 'Medium EXP Candy', unitPrice: 1200, xpAmount: 5000, color: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', emoji: '🍭', description: '+5,000 XP to fighter', requiredBadges: 2 },
  { id: 'large_candy', name: 'Large EXP Candy', unitPrice: 8000, xpAmount: 50000, color: 'bg-pink-500/10', borderColor: 'border-pink-500/20', emoji: '🧁', description: '+50,000 XP to fighter', requiredBadges: 4 },
];

const ROD_ITEMS = [
  { id: 'old', name: 'Old Rod', unitPrice: 200, emoji: '🎣', color: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', description: 'Unlocks Route 12, 13, and Seafoam cave fishing', requiredBadges: 0 },
  { id: 'good', name: 'Good Rod', unitPrice: 1500, emoji: '🎋', color: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', description: 'Unlocks intermediate water routes', requiredBadges: 2 },
  { id: 'super', name: 'Super Rod', unitPrice: 5000, emoji: '🔱', color: 'bg-pink-500/10', borderColor: 'border-pink-500/20', description: 'Unlocks high-level deep sea fishing', requiredBadges: 4 }
] as const;

const UPGRADES_LIST: {
  key: keyof Upgrades;
  emoji: string;
  color: string;
  borderColor: string;
  requiredBadges: number;
}[] = [
  { key: 'shoes', emoji: '👟', color: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', requiredBadges: 0 },
  { key: 'share', emoji: '📡', color: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', requiredBadges: 1 },
  { key: 'coin', emoji: '🪙', color: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', requiredBadges: 2 },
  { key: 'charm', emoji: '✨', color: 'bg-purple-500/10', borderColor: 'border-purple-500/20', requiredBadges: 4 }
];

export const MartPanel: React.FC<MartPanelProps> = ({
  money,
  inventory,
  buyPokeballs,
  upgrades,
  buyUpgrade,
  badges,
  buyCandy,
  rods,
  buyRod,
  buyTM,
  buyHeldItem
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'upgrades' | 'tms' | 'items'>('shop');
  const buyAmounts = [1, 10, 100];
  const badgeCount = badges.length;

  const getMaxBuy = (unitPrice: number) => {
    return Math.floor(money / unitPrice);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Normal: 'bg-zinc-400 text-black',
      Fire: 'bg-orange-500 text-white',
      Water: 'bg-blue-500 text-white',
      Grass: 'bg-emerald-500 text-white',
      Electric: 'bg-yellow-400 text-black',
      Ice: 'bg-cyan-400 text-black',
      Fighting: 'bg-red-600 text-white',
      Poison: 'bg-purple-500 text-white',
      Ground: 'bg-amber-600 text-white',
      Flying: 'bg-indigo-400 text-white',
      Psychic: 'bg-pink-500 text-white',
      Bug: 'bg-lime-600 text-white',
      Rock: 'bg-yellow-700 text-white',
      Ghost: 'bg-violet-700 text-white',
      Dragon: 'bg-violet-800 text-white',
      Steel: 'bg-slate-400 text-black'
    };
    return colors[type] || 'bg-zinc-500 text-white';
  };

  return (
    <div className="mart-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none">Poké Mart</h2>
            <p className="text-[10px] text-white/40 mt-0.5">Stock up and purchase upgrades</p>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-black text-yellow-400">¤{money.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-0.5 bg-black/35 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-[8px] py-1.5 rounded-lg font-bold transition-all duration-300 flex flex-col items-center justify-center ${
              activeTab === 'shop'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Balls & Candy</span>
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`text-[8px] py-1.5 rounded-lg font-bold transition-all duration-300 flex flex-col items-center justify-center ${
              activeTab === 'upgrades'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Upgrades</span>
          </button>
          <button
            onClick={() => setActiveTab('tms')}
            className={`text-[8px] py-1.5 rounded-lg font-bold transition-all duration-300 flex flex-col items-center justify-center ${
              activeTab === 'tms'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>TMs</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`text-[8px] py-1.5 rounded-lg font-bold transition-all duration-300 flex flex-col items-center justify-center ${
              activeTab === 'items'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Held Items</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {activeTab === 'shop' && (
          <>
            {/* Poké Balls Section */}
            <div>
              <div className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-2 px-1">
                🔴 Poké Balls
              </div>
              <div className="flex flex-col gap-2.5">
                {BALL_ITEMS.map(item => {
                  const isLocked = badgeCount < item.requiredBadges;
                  const stock = inventory[item.type];
                  const maxBuy = getMaxBuy(item.unitPrice);

                  return (
                    <div
                      key={item.type}
                      className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isLocked 
                          ? 'bg-white/[0.02] border-white/5 opacity-55' 
                          : `${item.color} ${item.borderColor}`
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                            Unlocks at {item.requiredBadges} Badges
                          </span>
                        </div>
                      )}

                      {/* Item Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[9px] text-white/40">{item.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50 font-bold">¤{item.unitPrice}/ea</div>
                          <div className="text-[10px] text-white/30">Owned: <span className="text-white font-bold">{stock}</span></div>
                        </div>
                      </div>

                      {/* Buy Buttons */}
                      <div className="flex gap-1.5">
                        {buyAmounts.map(amount => {
                          const totalCost = item.unitPrice * amount;
                          const canAfford = money >= totalCost;
                          return (
                            <button
                              key={amount}
                              disabled={!canAfford || isLocked}
                              onClick={() => buyPokeballs(item.type, totalCost, amount)}
                              className={`flex-1 flex flex-col items-center py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                                canAfford
                                  ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white btn-premium'
                                  : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                              }`}
                            >
                              <span className="font-black">×{amount}</span>
                              <span className={`text-[8px] ${canAfford ? 'text-yellow-400/80' : 'text-white/15'}`}>¤{totalCost.toLocaleString()}</span>
                            </button>
                          );
                        })}
                        {/* Max Buy Button */}
                        <button
                          disabled={maxBuy <= 0 || isLocked}
                          onClick={() => {
                            if (maxBuy > 0) {
                              buyPokeballs(item.type, item.unitPrice * maxBuy, maxBuy);
                            }
                          }}
                          className={`flex-1 flex flex-col items-center py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                            maxBuy > 0
                              ? 'bg-indigo-600/10 hover:bg-indigo-600/20 border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 btn-premium'
                              : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-black">MAX</span>
                          <span className={`text-[8px] ${maxBuy > 0 ? 'text-indigo-400/60' : 'text-white/15'}`}>×{maxBuy}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXP Candies Section */}
            <div>
              <div className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-2 px-1">
                🍬 EXP Candies
              </div>
              <div className="flex flex-col gap-2.5">
                {CANDY_ITEMS.map(item => {
                  const isLocked = badgeCount < item.requiredBadges;
                  const maxBuy = getMaxBuy(item.unitPrice);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isLocked 
                          ? 'bg-white/[0.02] border-white/5 opacity-55' 
                          : `${item.color} ${item.borderColor}`
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                            Unlocks at {item.requiredBadges} Badges
                          </span>
                        </div>
                      )}

                      {/* Item Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[9px] text-white/40">{item.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50 font-bold">¤{item.unitPrice}/ea</div>
                          <div className="text-[9px] text-emerald-400 font-bold">Instantly Eat</div>
                        </div>
                      </div>

                      {/* Buy Buttons */}
                      <div className="flex gap-1.5">
                        {buyAmounts.map(amount => {
                          const totalCost = item.unitPrice * amount;
                          const canAfford = money >= totalCost;
                          return (
                            <button
                              key={amount}
                              disabled={!canAfford || isLocked}
                              onClick={() => {
                                for (let i = 0; i < amount; i++) {
                                  buyCandy(item.unitPrice, item.xpAmount);
                                }
                              }}
                              className={`flex-1 flex flex-col items-center py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                                canAfford
                                  ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white btn-premium'
                                  : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                              }`}
                            >
                              <span className="font-black">Eat ×{amount}</span>
                              <span className={`text-[8px] ${canAfford ? 'text-yellow-400/80' : 'text-white/15'}`}>¤{totalCost.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fishing Rods Section */}
            <div>
              <div className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-2 px-1">
                🎣 Fishing Rods
              </div>
              <div className="flex flex-col gap-2.5">
                {ROD_ITEMS.map(item => {
                  const isLocked = badgeCount < item.requiredBadges;
                  const isOwned = rods[item.id];
                  const canAfford = money >= item.unitPrice;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isLocked 
                          ? 'bg-white/[0.02] border-white/5 opacity-55' 
                          : `${item.color} ${item.borderColor}`
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                            Unlocks at {item.requiredBadges} Badges
                          </span>
                        </div>
                      )}

                      {/* Item Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[9px] text-white/40">{item.description}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {isOwned ? (
                            <span className="text-[8px] font-black uppercase bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-xl">
                              Owned
                            </span>
                          ) : (
                            <button
                              disabled={!canAfford || isLocked}
                              onClick={() => buyRod(item.id, item.unitPrice)}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all duration-200 border ${
                                canAfford
                                  ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 text-yellow-400 cursor-pointer'
                                  : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                              }`}
                            >
                              Buy: ¤{item.unitPrice}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 mt-1 flex-shrink-0">
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                <ShoppingCart className="w-3 h-3 inline mr-1" />
                Inventory Summary
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BALL_ITEMS.map(item => (
                  <div key={item.type} className="flex items-center gap-1.5 text-[10px]">
                    <span>{item.emoji}</span>
                    <span className="text-white/60">{item.name}:</span>
                    <span className="font-bold text-white">{inventory[item.type]}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 mt-2 pt-2 grid grid-cols-3 gap-1">
                {(['old', 'good', 'super'] as const).map(rod => (
                  <div key={rod} className="flex flex-col items-center p-1 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-[7px] uppercase text-white/40">{rod} Rod</span>
                    <span className="text-[9px] mt-0.5">{rods[rod] ? '🎣' : '🔒'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'upgrades' && (
          <>
            {UPGRADES_LIST.map(item => {
              const isLocked = badgeCount < item.requiredBadges;
              const currentLvl = upgrades[item.key] || 0;
              const config = UPGRADES_CONFIG[item.key];
              const isMax = currentLvl >= config.maxLevel;
              const cost = isMax ? 0 : Math.floor(config.getCost(currentLvl));
              const canAfford = money >= cost && !isMax;

              // Format Current Benefit Text
              let benefitText = '';
              if (item.key === 'shoes') {
                benefitText = `Current: +${Math.round(currentLvl * 8)}% tick speed`;
              } else if (item.key === 'share') {
                benefitText = `Current: +${Math.round(currentLvl * 12)}% shared EXP`;
              } else if (item.key === 'coin') {
                benefitText = `Current: +${Math.round(currentLvl * 25)}% coins`;
              } else if (item.key === 'charm') {
                benefitText = currentLvl > 0 ? 'Current: Shiny rate doubled!' : 'Current: Standard rate';
              }

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isLocked 
                      ? 'bg-white/[0.02] border-white/5 opacity-55' 
                      : `${item.color} ${item.borderColor}`
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                        Unlocks at {item.requiredBadges} Badges
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {config.name} <span className="text-[10px] text-white/50">({currentLvl}/{config.maxLevel})</span>
                        </div>
                        <div className="text-[9px] text-white/40">{config.description}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
                    <div className="text-[9px] text-indigo-400 font-medium">{benefitText}</div>
                    
                    <button
                      disabled={!canAfford || isMax || isLocked}
                      onClick={() => buyUpgrade(item.key)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                        isMax
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                          : canAfford && !isLocked
                          ? 'bg-yellow-500 text-black border-transparent hover:bg-yellow-400 hover:scale-105 btn-premium'
                          : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        'MAXED'
                      ) : (
                        <span className="flex items-center gap-1">
                          Upgrade <span className="font-extrabold text-[8px]">¤{cost.toLocaleString()}</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'tms' && (
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-black uppercase text-white/50 tracking-wider px-1 mb-1">
              💿 Technical Machines (TMs)
            </div>
            {Object.values(TMS_CONFIG).map(tm => {
              const isLocked = badgeCount < tm.badgeRequired;
              const owned = inventory.tms?.[tm.id] || 0;
              const canAfford = money >= tm.cost;
              return (
                <div
                  key={tm.id}
                  className="p-3 rounded-2xl border bg-slate-950/30 border-white/5 transition-all relative overflow-hidden"
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/85 z-10 flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest text-center px-4">
                        Requires {tm.badgeRequired} Badges
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💿</span>
                      <div>
                        <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                          {tm.name}
                          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-md ${getTypeColor(tm.type)}`}>
                            {tm.type}
                          </span>
                        </div>
                        <div className="text-[9px] text-white/40">Power: {tm.power} | PP: {tm.pp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/50 font-bold">¤{tm.cost}</div>
                      <div className="text-[10px] text-white/30">Owned: <span className="text-white font-bold">{owned}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      disabled={!canAfford || isLocked}
                      onClick={() => buyTM(tm.id, tm.cost)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                        canAfford && !isLocked
                          ? 'bg-yellow-500 text-black border-transparent hover:bg-yellow-400'
                          : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      Buy TM
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-black uppercase text-white/50 tracking-wider px-1 mb-1">
              📦 Held Items
            </div>
            {HELD_ITEMS.map(item => {
              const isLocked = badgeCount < item.requiredBadges;
              const owned = inventory.heldItems?.[item.id] || 0;
              const canAfford = money >= item.unitPrice;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border bg-slate-950/30 border-white/5 transition-all relative overflow-hidden"
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/85 z-10 flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest text-center px-4">
                        Requires {item.requiredBadges} {item.requiredBadges === 1 ? 'Badge' : 'Badges'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[9px] text-white/40">{item.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/50 font-bold">¤{item.unitPrice}</div>
                      <div className="text-[10px] text-white/30">Owned: <span className="text-white font-bold">{owned}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      disabled={!canAfford || isLocked}
                      onClick={() => buyHeldItem(item.id, item.unitPrice)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 border ${
                        canAfford && !isLocked
                          ? 'bg-yellow-500 text-black border-transparent hover:bg-yellow-400'
                          : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      Buy Item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
