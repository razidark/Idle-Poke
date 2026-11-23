import React from 'react';
import { Compass, CheckCircle2, Circle } from 'lucide-react';

interface NextGoalTrackerProps {
  badges: string[];
  statistics: {
    caught: number;
    throws: number;
    moneyGained: number;
    wildWins: number;
    trainerWins: number;
    eliteFourWins: number;
    championWins: number;
  };
}

export const NextGoalTracker: React.FC<NextGoalTrackerProps> = ({ badges, statistics }) => {
  const badgeCount = badges.length;
  const championDefeated = statistics.championWins > 0;
  const e4Wins = statistics.eliteFourWins || 0;

  // Determine current active goal based on badge progression
  let goalTitle = 'Pewter Gym';
  let afterTitle = 'Cerulean Gym';
  let tasks: { label: string; current: number; target: number }[] = [];

  if (badgeCount < 1) {
    goalTitle = 'Pewter Gym';
    afterTitle = 'Cerulean Gym';
    tasks = [
      { label: 'Defeat Brock (Pewter Gym)', current: badgeCount, target: 1 },
      { label: 'Train Squad (Wild Wins)', current: Math.min(15, statistics.wildWins), target: 15 }
    ];
  } else if (badgeCount < 4) {
    goalTitle = 'Celadon Gym';
    afterTitle = 'Fuchsia Gym';
    tasks = [
      { label: 'Earn 4 Gym Badges', current: badgeCount, target: 4 },
      { label: 'Trainer Victories', current: Math.min(10, statistics.trainerWins), target: 10 }
    ];
  } else if (badgeCount < 8) {
    goalTitle = 'Indigo Plateau';
    afterTitle = 'Victory Road';
    tasks = [
      { label: 'Earn All 8 Gym Badges', current: badgeCount, target: 8 },
      { label: 'Defeat Gym Trainers', current: Math.min(25, statistics.trainerWins), target: 25 }
    ];
  } else if (!championDefeated) {
    goalTitle = 'Indigo Plateau';
    afterTitle = 'Cerulean Cave';
    tasks = [
      { label: 'Victory Road Triumphs', current: Math.min(30, statistics.wildWins >= 30 ? 30 : statistics.wildWins), target: 30 },
      { label: 'Defeat Elite Four', current: Math.min(4, e4Wins), target: 4 },
      { label: 'Defeat the Champion', current: statistics.championWins, target: 1 }
    ];
  } else {
    goalTitle = 'Cerulean Cave';
    afterTitle = 'Raid Island';
    tasks = [
      { label: 'Battles in Cerulean Cave', current: Math.min(50, statistics.wildWins >= 50 ? 50 : statistics.wildWins), target: 50 },
      { label: 'Legendary Mewtwo Caught', current: statistics.caught >= 150 ? 1 : 0, target: 1 }
    ];
  }

  return (
    <div className="next-goal-tracker bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left shadow-lg">
      {/* Title */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-black uppercase text-white/80 tracking-widest">Next Goal:</span>
        </div>
        <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {goalTitle}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {tasks.map((t, idx) => {
          const pct = Math.min(100, Math.round((t.current / t.target) * 100)) || 0;
          const complete = t.current >= t.target;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                <span className={complete ? 'text-white/40 line-through' : 'text-white/70'}>{t.label}</span>
                <span className={complete ? 'text-emerald-400' : 'text-amber-400'}>
                  {t.current} / {t.target}
                </span>
              </div>
              <div className="w-full bg-black/45 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    complete ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tail hint */}
      <div className="mt-3.5 pt-2 border-t border-white/5 flex justify-between items-center text-[8px] text-white/30 font-bold uppercase tracking-wider">
        <span>After this:</span>
        <span className="text-white/60 font-black">{afterTitle}</span>
      </div>
    </div>
  );
};
