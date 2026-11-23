import React from 'react';
import { Shield, Coins, Award, Users, Trophy, BookOpen, Clock } from 'lucide-react';

interface TrainerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  avatar: string;
  money: number;
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
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
  activeTeam: any[];
  box: any[];
  pvpElo: number;
}

const BADGES_CONFIG = [
  { id: 'Boulder Badge', name: 'Boulder Badge', leader: 'Brock', color: '#8e8e93', bg: 'rgba(142, 142, 147, 0.15)' },
  { id: 'Cascade Badge', name: 'Cascade Badge', leader: 'Misty', color: '#007aff', bg: 'rgba(0, 122, 255, 0.15)' },
  { id: 'Thunder Badge', name: 'Thunder Badge', leader: 'Lt. Surge', color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.15)' },
  { id: 'Rainbow Badge', name: 'Rainbow Badge', leader: 'Erika', color: '#34c759', bg: 'rgba(52, 199, 89, 0.15)' },
  { id: 'Soul Badge', name: 'Soul Badge', leader: 'Koga', color: '#af52de', bg: 'rgba(175, 82, 222, 0.15)' },
  { id: 'Marsh Badge', name: 'Marsh Badge', leader: 'Sabrina', color: '#ff2d55', bg: 'rgba(255, 45, 85, 0.15)' },
  { id: 'Volcano Badge', name: 'Volcano Badge', leader: 'Blaine', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.15)' },
  { id: 'Earth Badge', name: 'Earth Badge', leader: 'Giovanni', color: '#5856d6', bg: 'rgba(88, 86, 214, 0.15)' }
];

export const TrainerCardModal: React.FC<TrainerCardModalProps> = ({
  isOpen,
  onClose,
  username,
  avatar,
  money,
  badges,
  statistics,
  pokedex,
  activeTeam,
  box,
  pvpElo
}) => {
  if (!isOpen) return null;

  const uniqueCaught = Object.values(pokedex).filter(p => p.caught).length;
  const uniqueSeen = Object.values(pokedex).filter(p => p.seen).length;
  const shinyCount = Object.values(pokedex).filter(p => p.shinyCaught).length;

  const teamLevelsSum = activeTeam.reduce((sum, p) => sum + p.level, 0);
  const boxLevelsSum = box.reduce((sum, p) => sum + p.level, 0);
  const totalLevels = teamLevelsSum + boxLevelsSum;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="glass-card max-w-2xl w-full p-6 flex flex-col border border-white/10 rounded-3xl relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Title */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400">
              Trainer Card
            </h2>
            <p className="text-[9px] text-white/40 font-bold uppercase mt-0.5">Trainer passport & lifetime milestones</p>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-xl text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
          {/* LEFT PANEL: User Info & Battle Record */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* User Info Block */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600/35 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
                {avatar || '🧑‍🌾'}
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">{username}</h3>
                <span className="text-[8px] text-white/35 font-bold uppercase mt-1 inline-block">PvP Rating: {pvpElo}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>

            {/* Battle Record Cards */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-[9px] uppercase font-black text-white/40 tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Battle Record
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Wild Victories', value: statistics.wildWins || 0 },
                  { label: 'Trainer Victories', value: statistics.trainerWins || 0 },
                  { label: 'Elite Four Wins', value: statistics.eliteFourWins || 0 },
                  { label: 'Champion Wins', value: statistics.championWins || 0 }
                ].map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-1">
                    <span className="text-white/60">{record.label}</span>
                    <span className="text-white font-black">{record.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Collection metrics & Badges Grid */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Collection Data */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-[9px] uppercase font-black text-white/40 tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Collection Details
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'Caught', value: `${uniqueCaught} / 194` },
                  { label: 'Seen', value: `${uniqueSeen} / 194` },
                  { label: 'Shiny', value: shinyCount },
                  { label: 'Badges Earned', value: `${badges.length} / 8` },
                  { label: 'Pokémon Levels', value: totalLevels.toLocaleString() }
                ].map((col, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-1">
                    <span className="text-white/60">{col.label}</span>
                    <span className="text-indigo-400 font-black">{col.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gym Badges Grid */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-[9px] uppercase font-black text-white/40 tracking-wider mb-3">
                Gym Badges
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {BADGES_CONFIG.map(b => {
                  const hasBadge = badges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className="p-2 rounded-xl flex flex-col items-center justify-center transition border text-center"
                      style={{
                        backgroundColor: hasBadge ? b.bg : 'rgba(255,255,255,0.01)',
                        borderColor: hasBadge ? `${b.color}50` : 'rgba(255,255,255,0.03)',
                        opacity: hasBadge ? 1 : 0.25
                      }}
                      title={`${b.name} (${b.leader})`}
                    >
                      <span className="text-lg mb-0.5">🏅</span>
                      <span className="text-[8px] font-black uppercase text-white truncate max-w-full">
                        {b.name.replace(' Badge', '')}
                      </span>
                      <span className="text-[6px] text-white/40 font-bold uppercase">{b.leader}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end mt-6 pt-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs rounded-xl transition shadow-lg shadow-indigo-600/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
