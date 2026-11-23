import React from 'react';
import { Activity, Coins, Swords, Trophy, Target, Timer, Layers, Star, TrendingUp, Users, Award } from 'lucide-react';
import type { PokeballInventory } from '../types/pokemon';

/**
 * View Stats — a dedicated read-only screen for the run so far.
 *
 * The game already collects these numbers (`statistics` in usePokeState);
 * before this panel they were only used to unlock achievements, so the
 * player could not see their own progress. The official game has the same
 * screen ("View Stats" in its bottom nav).
 */

interface StatsPanelProps {
  statistics: {
    caught: number;
    throws: number;
    moneyGained: number;
    wildWins: number;
    trainerWins: number;
    eliteFourWins: number;
    championWins: number;
  };
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
  totalKnown: number;
  badges: string[];
  activeTeam: any[];
  box: any[];
  money: number;
  inventory: PokeballInventory;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, hint, accent = 'indigo' }) => {
  const accentRing: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${accentRing[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{label}</p>
        <p className="text-lg font-black text-white leading-tight tabular-nums">{value}</p>
        {hint && <p className="text-[10px] text-white/35 truncate">{hint}</p>}
      </div>
    </div>
  );
};

export const StatsPanel: React.FC<StatsPanelProps> = ({
  statistics,
  pokedex,
  totalKnown,
  badges,
  activeTeam,
  box,
  money,
  inventory,
}) => {
  const seen = Object.values(pokedex).filter(p => p.seen).length;
  const caught = Object.values(pokedex).filter(p => p.caught).length;
  const shinies = Object.values(pokedex).filter(p => p.shinyCaught).length;
  const catchRate = statistics.throws > 0
    ? ((statistics.caught / statistics.throws) * 100).toFixed(1)
    : '0.0';
  const totalPokemon = activeTeam.length + box.length;
  const ballTotal = Object.values(inventory).reduce((a, b) => a + (b || 0), 0);
  const playtime = statistics.caught > 0 ? Math.max(1, Math.round(statistics.caught / 12)) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* HEADLINE */}
      <div className="bg-gradient-to-br from-indigo-600/25 via-violet-600/15 to-transparent border border-indigo-400/20 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={15} className="text-indigo-300" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Run Statistics</p>
        </div>
        <p className="text-2xl font-black text-white leading-tight">
          {caught} <span className="text-white/30 text-base">/ {totalKnown}</span>
        </p>
        <p className="text-[11px] text-white/50 font-bold">
          Pokémon caught · {seen} seen · {shinies} shiny
        </p>
        <div className="mt-3 h-2 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
            style={{ width: `${totalKnown > 0 ? Math.min(100, (caught / totalKnown) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* CATCHING */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
          <Target size={12} /> Catching
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard icon={<Target size={16} />} label="Caught" value={statistics.caught} accent="emerald" />
          <StatCard icon={<Timer size={16} />} label="Throws" value={statistics.throws} accent="sky" />
          <StatCard
            icon={<TrendingUp size={16} />}
            label="Catch Rate"
            value={`${catchRate}%`}
            hint={statistics.throws > 0 ? 'of all throws' : 'no throws yet'}
            accent="violet"
          />
          <StatCard
            icon={<Star size={16} />}
            label="Shinies"
            value={shinies}
            hint="variants found"
            accent="amber"
          />
        </div>
      </section>

      {/* BATTLES */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
          <Swords size={12} /> Battles
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard icon={<Swords size={16} />} label="Wild Wins" value={statistics.wildWins} accent="rose" />
          <StatCard icon={<Users size={16} />} label="Trainer Wins" value={statistics.trainerWins} accent="indigo" />
          <StatCard icon={<Trophy size={16} />} label="Elite Four" value={statistics.eliteFourWins} accent="amber" />
          <StatCard
            icon={<Trophy size={16} />}
            label="Champion"
            value={statistics.championWins}
            hint={statistics.championWins > 0 ? 'hall of fame' : 'not yet'}
            accent="emerald"
          />
        </div>
      </section>

      {/* ECONOMY & COLLECTION */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
          <Layers size={12} /> Collection
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            icon={<Coins size={16} />}
            label="Money"
            value={`$${money.toLocaleString()}`}
            hint={`${statistics.moneyGained.toLocaleString()} earned`}
            accent="amber"
          />
          <StatCard
            icon={<Layers size={16} />}
            label="Owned"
            value={totalPokemon}
            hint={`${activeTeam.length} in team · ${box.length} in storage`}
            accent="sky"
          />
          <StatCard
            icon={<Award size={16} />}
            label="Badges"
            value={`${badges.length}/8`}
            hint="gym badges earned"
            accent="violet"
          />
          <StatCard
            icon={<Target size={16} />}
            label="Balls"
            value={ballTotal}
            hint="in inventory"
            accent="rose"
          />
        </div>
      </section>
    </div>
  );
};

export default StatsPanel;
