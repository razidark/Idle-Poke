import React, { useState, useEffect } from 'react';
import { Shield, Trophy } from 'lucide-react';

interface BattleHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  pvpElo: number;
  activeTeam: any[];
  startTrainerBattle: (trainer: any) => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  elo: number;
  avatar: string;
  /** True for the current player's own row, which is highlighted. */
  isUser?: boolean;
}

const LEADERBOARD_SEED: LeaderboardEntry[] = [
  { rank: 1, name: 'Red', elo: 1850, avatar: '🧑‍🚀' },
  { rank: 2, name: 'Blue', elo: 1720, avatar: '🧑‍🎤' },
  { rank: 3, name: 'Green', elo: 1640, avatar: '🧑‍🌾' },
  { rank: 4, name: 'Mod Oak', elo: 1510, avatar: '👴' },
  { rank: 5, name: 'Capoeirinha', elo: 1390, avatar: '🥷' }
];

const MOCK_OPPONENTS = [
  { name: 'Scientist Beau', elo: 1040, pokes: ['Weezing', 'Magneton', 'Muk'] },
  { name: 'Super Nerd Zack', elo: 980, pokes: ['Grimer', 'Koffing', 'Voltorb'] },
  { name: 'Rival Blue', elo: 1200, pokes: ['Pidgeot', 'Alakazam', 'Arcanine'] },
  { name: 'Leader Brock', elo: 1010, pokes: ['Geodude', 'Onix', 'Kabutops'] },
  { name: 'Trainer Red', elo: 1450, pokes: ['Pikachu', 'Snorlax', 'Charizard'] },
  { name: 'Beauty Lily', elo: 920, pokes: ['Vileplume', 'Bellsprout', 'Oddish'] },
  { name: 'Burglar Simon', elo: 1080, pokes: ['Magmar', 'Koffing', 'Ninetales'] }
];

export const BattleHubModal: React.FC<BattleHubModalProps> = ({
  isOpen,
  onClose,
  username,
  pvpElo,
  activeTeam,
  startTrainerBattle
}) => {
  const [activeTab, setActiveTab] = useState<'ranked' | 'casual' | 'tournament'>('ranked');
  const [queueState, setQueueState] = useState<'idle' | 'searching' | 'found'>('idle');
  const [searchTimer, setSearchTimer] = useState(0);
  const [opponent, setOpponent] = useState<any | null>(null);

  // Tick matchmaking timer
  useEffect(() => {
    if (queueState !== 'searching') return;

    const timer = setInterval(() => {
      setSearchTimer(prev => {
        const next = prev + 1;
        if (next === 3) {
          // Find opponent
          const matchedOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
          setOpponent(matchedOpponent);
          setQueueState('found');
          return 0;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [queueState]);

  // The timer readout only matters while searching; otherwise it is derived as 0.
  const displaySearchTimer = queueState === 'searching' ? searchTimer : 0;

  // Start battle once opponent is found
  useEffect(() => {
    if (queueState === 'found' && opponent) {
      const timer = setTimeout(() => {
        // Trigger battle logic
        const pokeList = opponent.pokes.map((pName: string) => [pName, 50]); // scale to level 50 for PvP standard
        startTrainerBattle({
          name: opponent.name,
          poke: pokeList,
          isPvP: true,
          badge: null
        });
        // reset queue state and close
        setQueueState('idle');
        setOpponent(null);
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [queueState, opponent, startTrainerBattle, onClose]);

  if (!isOpen) return null;

  const handleQueueToggle = () => {
    if (queueState === 'idle') {
      setSearchTimer(0);
      setQueueState('searching');
    } else {
      setQueueState('idle');
      setOpponent(null);
    }
  };

  // Build temporary leaderboard including current user
  const leaderboard: LeaderboardEntry[] = [...LEADERBOARD_SEED];
  const userRankIdx = leaderboard.findIndex(l => pvpElo > l.elo);
  const userRankItem: LeaderboardEntry = { rank: 0, name: username, elo: pvpElo, avatar: '👤', isUser: true };
  if (userRankIdx === -1) {
    leaderboard.push({ ...userRankItem, rank: leaderboard.length + 1 });
  } else {
    leaderboard.splice(userRankIdx, 0, userRankItem);
    // recalculate ranks
    leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="glass-card max-w-2xl w-full p-6 flex flex-col border border-white/10 rounded-3xl relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              ⚔️ Battle Hub Arena
            </h2>
            <p className="text-[9px] text-white/40 font-bold uppercase mt-0.5">Queue up to fight rival trainers in real-time simulations</p>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-xl text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
          {/* LEFT: Queue Interface */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl gap-1">
              {[
                { id: 'ranked', label: 'Ranked Match' },
                { id: 'casual', label: 'Casual Friendly' },
                { id: 'tournament', label: 'Tournament' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => queueState === 'idle' && setActiveTab(tab.id as any)}
                  disabled={queueState !== 'idle'}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-white/40 hover:text-white/70 disabled:opacity-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Matchmaker Dashboard Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[160px] text-center relative overflow-hidden">
              {queueState === 'idle' && (
                <>
                  <Shield className="w-12 h-12 text-indigo-400/20 mb-3" />
                  <p className="text-[10px] text-white/50 font-bold uppercase max-w-xs mb-4">
                    Ready to queue? You will be matched with trainers near ELO {pvpElo}
                  </p>
                  <button
                    onClick={handleQueueToggle}
                    disabled={activeTeam.length === 0}
                    className={`px-8 py-3 bg-yellow-500 hover:bg-yellow-400 font-extrabold text-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/10 transition-transform active:scale-95 ${
                      activeTeam.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    Ready Up
                  </button>
                  {activeTeam.length === 0 && (
                    <span className="text-[8px] text-red-400 mt-2 font-bold uppercase">Must choose a starter first!</span>
                  )}
                </>
              )}

              {queueState === 'searching' && (
                <>
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mb-4" />
                  <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider animate-pulse">
                    Searching for Opponent...
                  </h4>
                  <p className="text-[8px] text-white/40 font-mono mt-1">
                    Matching parameters: {pvpElo} ELO ± {100 + displaySearchTimer * 100}
                  </p>
                  <button
                    onClick={handleQueueToggle}
                    className="mt-5 px-6 py-2 bg-red-600/20 hover:bg-red-600/35 border border-red-500/35 font-extrabold text-red-400 text-[10px] uppercase tracking-wider rounded-xl transition"
                  >
                    Cancel Matchmaking
                  </button>
                </>
              )}

              {queueState === 'found' && opponent && (
                <div className="animate-bounce-slow flex flex-col items-center">
                  <span className="text-3xl mb-2">⚡</span>
                  <h4 className="text-sm font-black uppercase text-emerald-400 tracking-wider">
                    Opponent Found!
                  </h4>
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col items-center">
                    <span className="text-[10px] font-black text-white">{opponent.name}</span>
                    <span className="text-[8px] text-white/50 font-bold mt-0.5">Rating: {opponent.elo} ELO</span>
                  </div>
                  <span className="text-[7px] text-white/30 font-semibold uppercase mt-3 tracking-widest">
                    Starting battle standard level 50...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Stats Summary & Active Squad preview */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Quick Profile stats */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-wider mb-2">
                  My PVP Status
                </h4>
                <div className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-1 mb-1.5">
                  <span className="text-white/60">Rating ELO</span>
                  <span className="text-indigo-400 font-black">{pvpElo} ELO</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-1 mb-1.5">
                  <span className="text-white/60">Tier Bracket</span>
                  <span className="text-white font-black uppercase tracking-wider">
                    {pvpElo >= 1500 ? '⭐ Elite Master' : pvpElo >= 1200 ? '🏅 Diamond Challenger' : '🧑‍🌾 Bronze Novice'}
                  </span>
                </div>
              </div>

              {/* Roster sprites */}
              <div className="mt-2">
                <span className="text-[8px] font-extrabold uppercase text-white/30 tracking-wider block mb-1">Active Squad</span>
                <div className="flex gap-1.5">
                  {activeTeam.slice(0, 6).map((poke, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-black/35 border border-white/5 flex items-center justify-center relative shadow-inner">
                      <img src={poke.image} alt={poke.name} className="w-7 h-7 object-contain pixelated" />
                    </div>
                  ))}
                  {activeTeam.length === 0 && (
                    <span className="text-[8px] text-white/20 italic">No squad selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard panel preview */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex-1 min-h-[160px] flex flex-col">
              <h4 className="text-[9px] uppercase font-black text-white/40 tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> ELO Leaderboard
              </h4>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/5">
                {leaderboard.slice(0, 6).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl flex items-center justify-between border text-[10px] font-bold transition ${
                      item.isUser
                        ? 'bg-indigo-600/10 border-indigo-500/25 text-white'
                        : 'bg-black/10 border-white/5 text-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-white/30">#{item.rank}</span>
                      <span>{item.avatar}</span>
                      <span className={item.isUser ? 'text-indigo-400 font-black' : 'text-white/80'}>{item.name}</span>
                    </div>
                    <span>{item.elo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer close */}
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
