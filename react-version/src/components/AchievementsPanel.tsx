import React from 'react';
import { Award, CheckCircle, Circle, TrendingUp, Sparkles } from 'lucide-react';

interface AchievementsPanelProps {
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
  statistics: { caught: number; throws: number; moneyGained: number };
  badges: string[];
}

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  type: 'stat_caught' | 'stat_throws' | 'stat_money' | 'dex_unique' | 'custom_caught';
  targetValue?: number;
  requiredPokes?: string[];
  rewardDescription: string;
}

const ACHIEVEMENTS_LIST: AchievementItem[] = [
  // Statistics Catches
  { id: 'c1', name: 'First Catch', description: 'Catch your very first wild Pokémon.', type: 'stat_caught', targetValue: 1, rewardDescription: '¤100 Bonus' },
  { id: 'c2', name: 'A Good Start', description: 'Catch 100 wild Pokémon.', type: 'stat_caught', targetValue: 100, rewardDescription: '¤500 Bonus' },
  { id: 'c3', name: 'Thousand Club', description: 'Catch 1,000 wild Pokémon.', type: 'stat_caught', targetValue: 1000, rewardDescription: '¤5,000 Bonus' },

  // Statistics Throws
  { id: 't1', name: 'Little League', description: 'Throw 100 Pokéballs.', type: 'stat_throws', targetValue: 100, rewardDescription: '¤100 Bonus' },
  { id: 't2', name: 'Big League', description: 'Throw 10,000 Pokéballs.', type: 'stat_throws', targetValue: 10000, rewardDescription: '¤2,000 Bonus' },
  { id: 't3', name: 'Perfect Aim', description: 'Throw 500,000 Pokéballs.', type: 'stat_throws', targetValue: 500000, rewardDescription: '¤10,000 Bonus' },
  { id: 't4', name: 'Arm Cannons', description: 'Throw 5,000,000 Pokéballs.', type: 'stat_throws', targetValue: 5000000, rewardDescription: '¤100,000 Bonus' },

  // Money Gained
  { id: 'm1', name: 'Money Bags', description: 'Accumulate 1,000,000 lifetime coins.', type: 'stat_money', targetValue: 1000000, rewardDescription: 'Shiny Charm Bonus' },

  // Dex Collectors
  { id: 'd1', name: 'Kanto Collector', description: 'Register 140 unique caught Kanto Pokémon.', type: 'dex_unique', targetValue: 140, rewardDescription: 'Master Ball Award' },
  { id: 'd2', name: 'Johto Collector', description: 'Register 240 unique caught Pokémon.', type: 'dex_unique', targetValue: 240, rewardDescription: 'Gold Medal Accent' },
  { id: 'd3', name: 'Hoenn Collector', description: 'Register 370 unique caught Pokémon.', type: 'dex_unique', targetValue: 370, rewardDescription: 'Ultra Booster Pack' },
  { id: 'd4', name: 'Sinnoh Collector', description: 'Register 480 unique caught Pokémon.', type: 'dex_unique', targetValue: 480, rewardDescription: 'Special Costume' },
  { id: 'd5', name: 'Ultimate Collector', description: 'Register 895 unique caught Pokémon.', type: 'dex_unique', targetValue: 895, rewardDescription: 'Elite Icon Ring' },

  // Special Groups
  { id: 'p1', name: 'Professor Oak', description: 'Catch all original Kanto Starters: Bulbasaur, Charmander, and Squirtle.', type: 'custom_caught', requiredPokes: ['Bulbasaur', 'Charmander', 'Squirtle'], rewardDescription: 'Exp. Share Upgrade' },
  { id: 'p2', name: 'Professor Elm', description: 'Catch all original Johto Starters: Chikorita, Cyndaquil, and Totodile.', type: 'custom_caught', requiredPokes: ['Chikorita', 'Cyndaquil', 'Totodile'], rewardDescription: 'Lucky Ring' },
  { id: 'p3', name: 'Professor Birch', description: 'Catch Hoenn Starters: Treecko, Torchic, and Mudkip.', type: 'custom_caught', requiredPokes: ['Treecko', 'Torchic', 'Mudkip'], rewardDescription: 'Amulet Coin Boost' },
  { id: 'p4', name: 'Team Rocket', description: 'Catch Team Rocket favorites: Ekans, Koffing, and Meowth.', type: 'custom_caught', requiredPokes: ['Ekans', 'Koffing', 'Meowth'], rewardDescription: 'Poison Fang Badge' },
  { id: 'p5', name: 'Mews', description: 'Register the ancient legendaries: Mew and Mewtwo.', type: 'custom_caught', requiredPokes: ['Mew', 'Mewtwo'], rewardDescription: 'Mythical Aura' }
];

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  pokedex,
  statistics = { caught: 0, throws: 0, moneyGained: 0 }
}) => {
  const uniqueCaughtCount = Object.values(pokedex).filter(p => p.caught).length;

  const isAchieved = (item: AchievementItem): boolean => {
    switch (item.type) {
      case 'stat_caught':
        return statistics.caught >= (item.targetValue || 1);
      case 'stat_throws':
        return statistics.throws >= (item.targetValue || 1);
      case 'stat_money':
        return statistics.moneyGained >= (item.targetValue || 1);
      case 'dex_unique':
        return uniqueCaughtCount >= (item.targetValue || 1);
      case 'custom_caught':
        if (!item.requiredPokes) return false;
        return item.requiredPokes.every(pokeName => pokedex[pokeName]?.caught);
      default:
        return false;
    }
  };

  const getProgress = (item: AchievementItem): { current: number; target: number; percentage: number } => {
    let current = 0;
    let target = item.targetValue || 1;

    switch (item.type) {
      case 'stat_caught':
        current = statistics.caught;
        break;
      case 'stat_throws':
        current = statistics.throws;
        break;
      case 'stat_money':
        current = statistics.moneyGained;
        break;
      case 'dex_unique':
        current = uniqueCaughtCount;
        break;
      case 'custom_caught':
        if (item.requiredPokes) {
          current = item.requiredPokes.filter(pokeName => pokedex[pokeName]?.caught).length;
          target = item.requiredPokes.length;
        }
        break;
    }

    const percentage = Math.min(100, Math.round((current / target) * 100)) || 0;
    return { current, target, percentage };
  };

  const achievedCount = ACHIEVEMENTS_LIST.filter(isAchieved).length;
  const progressPct = Math.round((achievedCount / ACHIEVEMENTS_LIST.length) * 100);

  return (
    <div className="achievements-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col justify-between">
      {/* Header Stats */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" /> Trainer Achievements
            </h2>
            <p className="text-[10px] text-white/40 mt-0.5">Track your milestones and special collection goals</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {achievedCount} / {ACHIEVEMENTS_LIST.length} Completed
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-black/35 rounded-full h-2 border border-white/5 overflow-hidden p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {ACHIEVEMENTS_LIST.map(item => {
          const completed = isAchieved(item);
          const prog = getProgress(item);

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col ${
                completed
                  ? 'bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.03)]'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              {/* Overlay glow if complete */}
              {completed && (
                <div className="absolute right-2 top-2 text-yellow-400/20 pointer-events-none">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
              )}

              {/* Title & Icon Header */}
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2">
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/20 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider leading-none ${completed ? 'text-yellow-400' : 'text-white'}`}>
                      {item.name}
                    </h3>
                    <p className="text-[9px] text-white/50 font-semibold mt-0.5 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="flex items-center justify-between mt-1 text-[8px] text-white/40 font-bold border-t border-white/5 pt-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-white/30" />
                  <span>
                    Progress: <span className={completed ? 'text-yellow-400' : 'text-white/60'}>
                      {prog.current.toLocaleString()}
                    </span> / {prog.target.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-white/30 uppercase mr-1">Reward:</span>
                  <span className="text-white/60 font-black">{item.rewardDescription}</span>
                </div>
              </div>

              {/* Individual micro progress meter */}
              {!completed && (
                <div className="w-full bg-white/5 rounded-full h-1 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white/25 rounded-full transition-all duration-300"
                    style={{ width: `${prog.percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
