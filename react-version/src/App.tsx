import { useState, useEffect } from 'react';
import { usePokeState } from './hooks/usePokeState';
import { TeamPanel } from './components/TeamPanel';
import { PartyDrawer } from './components/PartyDrawer';
import { BoxPanel } from './components/BoxPanel';
import { MapPanel } from './components/MapPanel';
import { MartPanel } from './components/MartPanel';
import { PokedexPanel } from './components/PokedexPanel';
import { WikiPanel } from './components/WikiPanel';
import { BattleBackground } from './components/BattleBackground';
import { SettingsPanel } from './components/SettingsPanel';
import { PokemonDetailsModal } from './components/PokemonDetailsModal';
import { ManageMovesModal } from './components/ManageMovesModal';
import type { PokemonInstance } from './types/pokemon';
import { AchievementsPanel } from './components/AchievementsPanel';
import { TrainerCardModal } from './components/TrainerCardModal';
import { BattleHubModal } from './components/BattleHubModal';
import { NextGoalTracker } from './components/NextGoalTracker';
import { LogPanel } from './components/LogPanel';
import { StatsPanel } from './components/StatsPanel';
import {
  Sparkles,
  Coins,
  Save,
  ShoppingBag,
  Database,
  BookOpen,
  HelpCircle,
  Award,
  Volume2,
  VolumeX,
  ShieldAlert,
  LogOut,
  Settings,
  Play,
  Users,
  Heart,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Plus,
  Compass,
  ScrollText
, Map as MapIcon, Monitor, Swords, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, X , Activity } from 'lucide-react';
import { ROUTES } from './data/routes.js';
import { audio } from './utils/audio';
import { audioEngine } from './utils/audioEngine';
import { getWeatherForRoute, WEATHER_EFFECTS } from './utils/weatherEngine';
import { GymLeaderModal, BossChallenge } from './components/GymLeaderModal';
import { POKEDEX } from './data/db.js';
import { TMS_CONFIG } from './data/learnsets';

const GYM_LEADERS_BY_BADGE: { [badgesCount: number]: { name: string; badge: string; avatar: string; poke: [string, number][] } } = {
  0: { name: 'Brock', badge: 'Boulder Badge', avatar: '🪨', poke: [['Geodude', 12], ['Onix', 14]] },
  1: { name: 'Misty', badge: 'Cascade Badge', avatar: '💧', poke: [['Staryu', 18], ['Starmie', 21]] },
  2: { name: 'Lt. Surge', badge: 'Thunder Badge', avatar: '⚡', poke: [['Voltorb', 22], ['Pikachu', 24], ['Raichu', 26]] },
  3: { name: 'Erika', badge: 'Rainbow Badge', avatar: '🌹', poke: [['Victreebel', 32], ['Tangela', 32], ['Vileplume', 35]] },
  4: { name: 'Koga', badge: 'Soul Badge', avatar: '🥷', poke: [['Koffing', 38], ['Muk', 40], ['Weezing', 43]] },
  5: { name: 'Sabrina', badge: 'Marsh Badge', avatar: '🔮', poke: [['Kadabra', 44], ['Mr. Mime', 44], ['Alakazam', 48]] },
  6: { name: 'Blaine', badge: 'Volcano Badge', avatar: '🌋', poke: [['Growlithe', 50], ['Ponyta', 50], ['Rapidash', 52], ['Arcanine', 54]] },
  7: { name: 'Giovanni', badge: 'Earth Badge', avatar: '💼', poke: [['Rhyhorn', 55], ['Dugtrio', 56], ['Nidoqueen', 58], ['Nidoking', 60]] }
};

const ELITE_FOUR_LEADERS: { [idx: number]: { name: string; avatar: string; isE4?: boolean; isChamp?: boolean; poke: [string, number][] } } = {
  0: { name: 'Lorelei', avatar: '❄️', isE4: true, poke: [['Dewgong', 54], ['Cloyster', 54], ['Slowbro', 54], ['Jynx', 56], ['Lapras', 56]] },
  1: { name: 'Bruno', avatar: '🥋', isE4: true, poke: [['Onix', 56], ['Hitmonchan', 56], ['Hitmonlee', 56], ['Machamp', 58]] },
  2: { name: 'Agatha', avatar: '👻', isE4: true, poke: [['Gengar', 56], ['Golbat', 56], ['Haunter', 58], ['Arbok', 58], ['Gengar', 60]] },
  3: { name: 'Lance', avatar: '🐉', isE4: true, poke: [['Gyarados', 58], ['Dragonair', 58], ['Aerodactyl', 60], ['Dragonite', 62]] },
  4: { name: 'Champion Rival', avatar: '🏆', isChamp: true, poke: [['Pidgeot', 61], ['Alakazam', 59], ['Rhydon', 61], ['Gyarados', 63], ['Charizard', 65]] }
};

interface AppMoveButtonProps {
  move: any;
  index: number;
  disabled: boolean;
  onClick: (index: number) => void;
}

const MOVE_TYPE_STYLES: { [key: string]: { grad: string; border: string; glow: string; icon: string } } = {
  grass: { grad: 'from-emerald-600 to-green-900', border: '#22c55e', glow: 'shadow-emerald-500/30', icon: '🍃' },
  fire: { grad: 'from-red-600 to-amber-900', border: '#ef4444', glow: 'shadow-red-500/30', icon: '🔥' },
  water: { grad: 'from-blue-600 to-cyan-900', border: '#3b82f6', glow: 'shadow-blue-500/30', icon: '💧' },
  electric: { grad: 'from-amber-500 to-yellow-900', border: '#eab308', glow: 'shadow-yellow-500/30', icon: '⚡' },
  poison: { grad: 'from-purple-600 to-fuchsia-950', border: '#a855f7', glow: 'shadow-purple-500/30', icon: '☣️' },
  bug: { grad: 'from-lime-600 to-emerald-950', border: '#84cc16', glow: 'shadow-lime-500/30', icon: '🐛' },
  normal: { grad: 'from-slate-700 to-slate-900', border: '#94a3b8', glow: 'shadow-slate-500/20', icon: '💥' }
};

const AppMoveButton: React.FC<AppMoveButtonProps> = ({ move, index, disabled, onClick }) => {
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    const checkCooldown = () => {
      const remaining = Math.max(0, move.cooldownMs - (Date.now() - move.lastUsed));
      setCooldownLeft(remaining);
    };

    checkCooldown();
    if (move.lastUsed > 0) {
      const interval = setInterval(checkCooldown, 50);
      return () => clearInterval(interval);
    }
  }, [move.lastUsed, move.cooldownMs]);

  const pct = move.lastUsed > 0 ? (cooldownLeft / move.cooldownMs) * 100 : 0;
  const isOutOfPp = move.pp <= 0;
  const isOnCooldown = cooldownLeft > 0;
  const typeKey = (move.type || 'normal').toLowerCase();
  const styleConfig = MOVE_TYPE_STYLES[typeKey] || MOVE_TYPE_STYLES['normal'];

  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled || isOutOfPp || isOnCooldown}
      className={`rounded-2xl p-3.5 border-2 transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between h-[76px] bg-gradient-to-r ${styleConfig.grad} ${styleConfig.glow} shadow-lg ${
        disabled || isOutOfPp || isOnCooldown
          ? 'opacity-40 cursor-not-allowed grayscale'
          : 'active:scale-95 hover:brightness-125 cursor-pointer hover:shadow-xl hover:scale-[1.02]'
      }`}
      style={{
        borderColor: styleConfig.border
      }}
    >
      {isOnCooldown && !disabled && (
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-none transition-all duration-75 flex items-center justify-center z-20"
          style={{ height: `${pct}%` }}
        >
          <span className="text-xs font-black text-amber-300 drop-shadow-md">{(cooldownLeft / 1000).toFixed(1)}s</span>
        </div>
      )}

      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{styleConfig.icon}</span>
          <span className="text-xs font-black uppercase text-white tracking-wider drop-shadow-sm">{move.name}</span>
        </div>
        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/50 border border-white/20 text-white shadow-sm">
          {move.type}
        </span>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-white/90 z-10 mt-1">
        <span className="font-bold bg-black/30 px-2 py-0.5 rounded-md border border-white/10">POW {move.power || 40}</span>
        <span className={`font-black px-2 py-0.5 rounded-md border ${
          isOutOfPp ? 'bg-red-500/30 text-red-300 border-red-500/50' : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
        }`}>
          PP {move.pp}/{move.maxPp || 35}
        </span>
      </div>
    </button>
  );
};

function App() {
  const {
    activeRegion,
    activeRouteKey,
    money,
    activeTeam,
    box,
    pokedex,
    inventory,
    badges,
    defeatedBosses,
    activeBallType,
    catchMode,
    wildPoke,
    playerProgress,
    wildProgress,
    combatLogs,
    activeTrainer,
    healingCooldown,
    setActiveRegion,
    setActiveTeam,
    setBox,
    setActiveBallType,
    setCatchMode,
    chooseStarter,
    selectRoute,
    buyPokeballs,
    movePokeToTop,
    movePokeUp,
    movePokeDown,
    prestigePokemon,
    evolveTeamPokemon,
    swapWithBox,
    releasePokemon,
    startTrainerBattle,
    saveGame,
    sortActiveTeam,
    damageNumbers,
    movePopups,
    catchAnim,
    spriteZoom,
    autoPotion,
    setAutoPotion,
    autoRevive,
    setAutoRevive,
    captureLog,
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
    rods,
    buyRod,
    statistics,
    pvpElo,
    setPvpElo,
    triggerInstantHeal,
    instantHealCooldown,
    updateActiveMoves,
    teachMoveViaTM,
    equipHeldItem,
    buyTM,
    buyHeldItem
  } = usePokeState();

  const activeRoute = (ROUTES as any)[activeRegion]?.[activeRouteKey];
  const isTown = !!activeRoute?.town;
  const townTrainer = activeRoute?.trainer;

  const [activeCenterTab, setActiveCenterTab] = useState<'map' | 'mart' | 'pc' | 'dex' | 'achieve' | 'wiki' | 'log' | 'stats'>('map');
  const [isTrainerCardOpen, setIsTrainerCardOpen] = useState(false);
  const [isBattleHubOpen, setIsBattleHubOpen] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedDetailPokemon, setSelectedDetailPokemon] = useState<PokemonInstance | null>(null);
  const [showManageMovesModal, setShowManageMovesModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gameTheme, setGameTheme] = useState<string>(() => localStorage.getItem('idle_poke_theme') || 'glass-dark');
  const [gameFont, setGameFont] = useState<string>(() => localStorage.getItem('idle_poke_font') || 'outfit');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);

  const handleChallengeBoss = (boss: BossChallenge) => {
    audioEngine.playClick();
    // Gym leaders hand out a real badge (matches the route unlock names),
    // Elite Four members a trophy, the Champion the crown.
    const isGym = boss.badgeName.endsWith('Badge');
    const isChamp = boss.badgeName === 'Champion Crown';
    startTrainerBattle({
      id: boss.id,
      name: boss.name,
      title: boss.title,
      badge: isGym ? boss.badgeName : undefined,
      trophy: isGym ? undefined : boss.badgeName,
      cashReward: boss.rewardCash,
      isE4: !isGym && !isChamp,
      isChamp,
      team: boss.pokemon
    });
  };

  const handleTeachTM = (tmId: string): boolean => {
    if (!selectedDetailPokemon) return false;
    const ok = teachMoveViaTM(selectedDetailPokemon.id, tmId);
    if (ok) {
      const tm = TMS_CONFIG[tmId];
      // Keep the open detail modal in sync so the taught move shows as
      // unlocked and can be equipped right away.
      setSelectedDetailPokemon(prev => prev && tm
        ? { ...prev, learnedMoves: [...(prev.learnedMoves || []), tm.name] }
        : prev);
    }
    return ok;
  };

  const updateGameTheme = (newTheme: string) => {
    setGameTheme(newTheme);
    localStorage.setItem('idle_poke_theme', newTheme);
  };
  const updateGameFont = (newFont: string) => {
    setGameFont(newFont);
    localStorage.setItem('idle_poke_font', newFont);
  };

  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);

  // Auto-select first profile if activeProfile is null on startup
  useEffect(() => {
    if (!activeProfile && profiles.length > 0) {
      selectProfile(profiles[0].username);
    }
  }, [activeProfile, profiles, selectProfile]);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('🧑‍🚀');
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
  const [swappingSlot, setSwappingSlot] = useState<number | null>(null);

  const toggleTheme = () => {
    const nextTheme = gameTheme.includes('dark') ? 'glass-light' : 'glass-dark';
    updateGameTheme(nextTheme);
  };

  const toggleMute = () => {
    audio.toggleMute();
    setMuted(audio.isMuted());
  };

  const handleAddToTeam = (poke: any) => {
    if (activeTeam.length >= 6) {
      setSwappingSlot(0);
    } else {
      // Add directly
      swapWithBox(activeTeam.length, poke.id);
    }
  };

  const getBadgeStyle = (badgeName: string) => {
    const b = badgeName.toLowerCase();
    if (b.includes('boulder')) return { bg: '#8e8e93', border: '#707074', text: '#fff' };
    if (b.includes('cascade')) return { bg: '#007aff', border: '#0056b3', text: '#fff' };
    if (b.includes('thunder')) return { bg: '#ffcc00', border: '#b89200', text: '#000' };
    if (b.includes('rainbow')) return { bg: '#34c759', border: '#207d38', text: '#fff' };
    if (b.includes('soul')) return { bg: '#af52de', border: '#6c2290', text: '#fff' };
    if (b.includes('marsh')) return { bg: '#ff2d55', border: '#b31030', text: '#fff' };
    if (b.includes('volcano')) return { bg: '#ff9500', border: '#b36800', text: '#fff' };
    return { bg: '#5856d6', border: '#323094', text: '#fff' };
  };

  const activeFighter = activeTeam.find(p => p.currentHp > 0) || activeTeam[0];
  const activeRouteName = (ROUTES as any)[activeRegion]?.[activeRouteKey]?.name || 'Route 1';

  // Gym Challenge mapping
  const challengeLeader = () => {
    if (badges.length < 8) {
      const leader = GYM_LEADERS_BY_BADGE[badges.length];
      if (leader) {
        startTrainerBattle(leader);
      }
    } else {
      // E4 sequence challenge
      const e4Wins = statistics.eliteFourWins || 0;
      const champWins = statistics.championWins || 0;
      if (champWins > 0 || e4Wins >= 4) {
        startTrainerBattle({
          name: 'Champion Rival',
          poke: ELITE_FOUR_LEADERS[4].poke,
          isChamp: true,
          badge: null
        });
      } else {
        const e4Idx = Math.min(3, e4Wins);
        const e4Data = ELITE_FOUR_LEADERS[e4Idx];
        startTrainerBattle({
          name: e4Data.name,
          poke: e4Data.poke,
          isE4: true,
          badge: null
        });
      }
    }
  };

  const getChallengeLeaderDetails = () => {
    if (badges.length < 8) {
      return GYM_LEADERS_BY_BADGE[badges.length] || null;
    }
    const e4Wins = statistics.eliteFourWins || 0;
    const champWins = statistics.championWins || 0;
    if (champWins > 0 || e4Wins >= 4) {
      return { name: 'Champion Rival', avatar: '🏆', badge: 'Champion Gold' };
    }
    const e4Idx = Math.min(3, e4Wins);
    return ELITE_FOUR_LEADERS[e4Idx];
  };

  const currentLeaderDetails = getChallengeLeaderDetails();
  const partyLevelsSum = activeTeam.reduce((sum, p) => sum + p.level, 0);

  // Auto-create default profile on first launch if no profiles exist
  useEffect(() => {
    if (!activeProfile && profiles.length === 0) {
      createProfile('Trainer Red', '🧑‍🚀', 'Charmander');
    }
  }, [activeProfile, profiles.length, createProfile]);

  if (!activeProfile) {
    const handleCreateProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUsername.trim()) return;
      if (!selectedStarter) return;

      const success = createProfile(newUsername.trim(), newAvatar, selectedStarter);
      if (success) {
        setIsCreatingProfile(false);
        setNewUsername('');
        setSelectedStarter(null);
      }
    };

    return (
      <div data-theme={gameTheme} data-font={gameFont} className="h-screen w-screen bg-[var(--bg-os)] text-[var(--text-os)] flex items-center justify-center font-sans overflow-y-auto p-4 md:p-8 relative select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl w-full flex flex-col items-center relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-2">
              IdlePoke
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase text-indigo-400/80 tracking-widest">
              Standard Retro Multi-Profile Idle RPG Engine
            </p>
          </div>

          <div className="glass-card w-full max-w-lg p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center flex flex-col justify-center">
            {!isCreatingProfile ? (
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-white mb-4">Select Profile Save</h2>
                <div className="w-full flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {profiles.length === 0 ? (
                    <div className="text-center text-white/30 py-8 text-xs">No trainer profiles found. Create one below!</div>
                  ) : (
                    profiles.map(p => (
                      <div
                        key={p.username}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/35 hover:bg-white/10 transition cursor-pointer group"
                        onClick={() => selectProfile(p.username)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.avatar || '🧑‍🚀'}</span>
                          <div className="text-left">
                            <span className="text-xs font-black uppercase tracking-wide text-white">{p.username}</span>
                            <div className="text-[9px] text-white/40 mt-1 uppercase font-bold">
                              Badges: {p.badgesCount || 0} | Squad: {p.pokemonCount || 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition">
                            Load Save
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProfile(p.username);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                            title="Delete Save Profile"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setIsCreatingProfile(true)}
                  className="mt-6 w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
                >
                  Create New Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateProfileSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">New Trainer Profile</h2>
                  <button
                    type="button"
                    onClick={() => setIsCreatingProfile(false)}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Back to Saves
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider">Trainer Name</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.substring(0, 16))}
                    placeholder="Enter name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 mt-1 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider">Choose Avatar</label>
                  <div className="flex gap-2.5 mt-1">
                    {['🧑‍🚀', '🥷', '👩‍🎤', '🧑‍🌾', '👩‍⚕️', '👴'].map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setNewAvatar(av)}
                        className={`text-2xl p-2 rounded-xl transition ${newAvatar === av
                            ? 'bg-indigo-600 border border-indigo-500 scale-110 shadow-lg'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                          }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider">Choose Starter</label>
                  <div className="grid grid-cols-3 gap-2.5 mt-1">
                    {[
                      { name: 'Bulbasaur', type: 'Grass', emoji: '🍃', color: '#10b981' },
                      { name: 'Charmander', type: 'Fire', emoji: '🔥', color: '#ef4444' },
                      { name: 'Squirtle', type: 'Water', emoji: '💧', color: '#3b82f6' }
                    ].map(st => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => setSelectedStarter(st.name)}
                        className={`p-3 rounded-2xl flex flex-col items-center border transition ${selectedStarter === st.name
                            ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                          }`}
                      >
                        <span className="text-2xl mb-1">{st.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">{st.name}</span>
                        <span className="text-[8px] font-bold text-white/40 mt-0.5">{st.type}</span>
                        <span className="text-[6px] font-black uppercase mt-1 px-1 rounded bg-yellow-500/10 border border-yellow-500/25 text-yellow-400">
                          100% IV
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-3">
                  <button
                    type="submit"
                    disabled={!selectedStarter || !newUsername.trim()}
                    className={`w-2/3 py-3 font-extrabold rounded-2xl transition-all duration-200 text-xs uppercase tracking-wider ${selectedStarter && newUsername.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]'
                        : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                      }`}
                  >
                    Claim Starter & Begin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const bgImg = getBackgroundImageUrl(activeRouteName, activeTrainer);

  return (
    <div data-theme={gameTheme} data-font={gameFont} className="h-screen bg-[var(--bg-os)] text-[var(--text-os)] flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative transition-colors duration-300">
      {/* Ambient Backdrop matching location */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter blur-xl scale-110 opacity-30 pointer-events-none z-0"
        style={{ backgroundImage: `url("${bgImg}")` }}
      />
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Header bar */}
      <header className="border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-xl px-6 py-3 flex justify-between items-center sticky top-0 z-[999] flex-shrink-0 relative shadow-2xl">
        {/* Brand Logo & Studio Tag */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-black uppercase tracking-widest leading-none bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              IdlePoke Studio
            </h1>
            <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider mt-0.5 inline-block">
              Pokémon RPG Studio Engine
            </span>
          </div>
        </div>

        {/* Global route details & Weather HUD */}
        <div className="hidden md:flex flex-col items-center bg-black/40 border border-white/10 px-5 py-1.5 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-amber-300 tracking-widest">{activeRegion} Province</span>
            <span className="text-white/20">|</span>
            <span className="text-xs font-black text-white uppercase tracking-wider">{activeRouteName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
              ☀️ Clear Weather • 1.0x EXP
            </span>
          </div>
        </div>

        {/* Action Controls Key Deck */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => {
              audioEngine.playClick();
              setIsGymModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
            title="Kanto Gym Leaders & Elite Four Tournament"
          >
            <Award className="w-4 h-4" /> Kanto League
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white p-2.5 rounded-2xl border border-white/10 transition duration-200 cursor-pointer shadow-md"
            title="Settings & Customization"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            onClick={toggleMute}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white p-2.5 rounded-2xl border border-white/10 transition duration-200 cursor-pointer shadow-md"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={saveGame}
            className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-extrabold text-xs uppercase tracking-wider px-3.5 py-2 rounded-2xl transition duration-200 border border-indigo-500/30 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-indigo-400" /> Save
          </button>

          <div className="flex items-center gap-2 border-l border-white/10 pl-2">
            <button
              onClick={() => {
                saveGame();
                logoutProfile();
              }}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-2xl transition duration-200 border border-red-500/20 flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Save and Logout"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* POKEIDLE.COM AUTHENTIC 3-COLUMN MAIN LAYOUT */}
      <main className="flex-1 relative w-full h-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto">

        {/* 👈 LEFT COLUMN: PROFILE CARD + 2x4 ICON MENU GRID + CHAT (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-col gap-4 min-h-0 order-1">
          {/* PROFILE CARD HEADER */}
          <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-3">
            <div className="w-14 h-14 bg-black/50 rounded-2xl border border-white/10 flex items-center justify-center relative flex-shrink-0">
              {activeFighter ? (
                <img src={activeFighter.image} alt={activeFighter.name} className="w-12 h-12 object-contain pixelated" />
              ) : (
                <span className="text-2xl">🧑‍🚀</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-white truncate">{activeProfile || 'Razi'}</h3>
                <span className="text-[10px] font-black text-indigo-400 font-pixel">Lv.{partyLevelsSum}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-black">
                <span className="text-yellow-400 font-mono">${money.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-white/50">
                <span>Badges <strong className="text-white">{badges.length}/8</strong></span>
                <span>Dex <strong className="text-white">{Object.keys(pokedex).length}/{POKEDEX.length}</strong></span>
              </div>
            </div>
          </div>

          {/* NAVIGATION RAIL
              A vertical list, mirroring the official game's left-hand
              view switcher (Routes / Pokemon / Storage / Pokedex). The
              previous 3x3 emoji grid was cramped on narrow screens and
              mixed emoji with the lucide icons used everywhere else, so
              the visual language was inconsistent. */}
          <nav className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-2 shadow-2xl">
            {(
              [
                { id: 'map', label: 'Map', Icon: MapIcon },
                { id: 'mart', label: 'Mart', Icon: ShoppingBag },
                { id: 'pc', label: 'Storage', Icon: Monitor },
                { id: 'dex', label: 'Pokedex', Icon: BookOpen },
                { id: 'achieve', label: 'Medals', Icon: Award },
                { id: 'wiki', label: 'Wiki', Icon: HelpCircle },
                { id: 'log', label: 'Log', Icon: ScrollText },
                { id: 'stats', label: 'Stats', Icon: Activity },
                { id: 'pvp', label: 'Battle Hub', Icon: Swords },
                { id: 'settings', label: 'Settings', Icon: Settings },
              ] as const
            ).map(({ id, label, Icon }) => {
              const isActive = activeCenterTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'pvp') setIsBattleHubOpen(true);
                    else if (id === 'settings') setIsSettingsOpen(true);
                    else setActiveCenterTab(id);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.4 : 2} className="flex-shrink-0" />
                  <span className="text-[11px] font-black tracking-wide uppercase">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* GLOBAL CHAT / ACTIVITY LOG BOX */}
          <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-white/5">
              <span className="text-xs font-black uppercase text-white/70 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Global Logs
              </span>
              <span className="text-[9px] font-bold text-white/30 uppercase">Live</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-left text-[11px] font-mono scrollbar-thin scrollbar-thumb-white/10">
              {combatLogs.slice(0, 15).map((log, idx) => (
                <div key={log.id ?? idx} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-white/80">
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚔️ CENTER COLUMN: HERO BATTLE STAGE + CONTROLS + MOVE DECK OR TABS (md:col-span-6) */}
        <div className="md:col-span-6 flex flex-col gap-4 min-h-0 order-2">
          {/* HERO BATTLE ARENA CANVAS */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[340px] md:h-[420px] bg-black flex-shrink-0">
            <BattleBackground
              wildPoke={wildPoke}
              activeFighter={activeFighter}
              playerProgress={playerProgress}
              wildProgress={wildProgress}
              activeRouteName={activeRouteName}
              damageNumbers={damageNumbers}
              movePopups={movePopups}
              catchAnim={catchAnim}
              spriteZoom={spriteZoom}
              activeTrainer={activeTrainer}
              healingCooldown={healingCooldown}
              isTown={isTown}
              townTrainer={townTrainer}
              onChallengeTrainer={startTrainerBattle}
              onEnterTown={() => setActiveCenterTab('mart')}
            />
          </div>

          {/* CONTROL BUTTONS BAR */}
          <div className="bg-[#0f172a]/95 border border-white/10 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            {/* Speed selection */}
            <div className="flex bg-black/50 rounded-xl border border-white/10 p-1 gap-1">
              {(['1x', '2x', '5x'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setBattleSpeed(s as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    battleSpeed === (s === '2x' ? '3x' : s)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={triggerInstantHeal}
                disabled={instantHealCooldown > 0}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition border cursor-pointer ${
                  instantHealCooldown > 0
                    ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {instantHealCooldown > 0 ? `Heal (${instantHealCooldown}s)` : '❤️ + Heal'}
              </button>
              <button
                onClick={() => {
                  const next = catchMode === 'all' ? 'new' : catchMode === 'new' ? 'none' : 'all';
                  setCatchMode(next);
                }}
                className="px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer"
              >
                🎯 Catch: {catchMode.toUpperCase()}
              </button>
              <div className="flex items-center gap-1">
                {(['pokeball', 'greatball', 'ultraball', 'masterball'] as const).map(b => {
                  const count = inventory[b] ?? 0;
                  const emoji = { pokeball: '⚪', greatball: '🔵', ultraball: '🟣', masterball: '🟡' }[b];
                  const isActive = activeBallType === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setActiveBallType(b)}
                      disabled={count <= 0}
                      title={`${b} (${count})`}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-black transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {emoji}<span className="ml-1 font-mono">{count}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setIsGymModalOpen(true)}
                className="px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
              >
                🏅 League
              </button>
              <button
                onClick={() => setManageMode(!manageMode)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition border ${
                  manageMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                ✏️ Manage
              </button>
            </div>
          </div>

          {/* 2x2 MOVE DECK OR TAB CONTAINER */}
          {activeCenterTab === 'map' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <MapPanel
                activeRegion={activeRegion}
                pokedex={pokedex}
                setActiveRegion={setActiveRegion}
                activeRouteKey={activeRouteKey}
                selectRoute={selectRoute}
                startTrainerBattle={startTrainerBattle}
                badges={badges}
                statistics={statistics}
              />
            </div>
          ) : activeCenterTab === 'pc' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <BoxPanel
                box={box}
                activeTeam={activeTeam}
                releasePokemon={releasePokemon}
                onAddToTeam={handleAddToTeam}
                onSelectDetail={(poke) => setSelectedDetailPokemon(poke)}
              />
            </div>
          ) : activeCenterTab === 'mart' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <MartPanel
                money={money}
                inventory={inventory}
                buyPokeballs={buyPokeballs}
                upgrades={upgrades}
                buyUpgrade={buyUpgrade}
                badges={badges}
                buyCandy={buyCandy}
                rods={rods}
                buyRod={buyRod}
                buyTM={buyTM}
                buyHeldItem={buyHeldItem}
              />
            </div>
          ) : activeCenterTab === 'dex' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <PokedexPanel pokedex={pokedex} />
            </div>
          ) : activeCenterTab === 'achieve' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <AchievementsPanel
                pokedex={pokedex}
                statistics={statistics}
                badges={badges}
              />
            </div>
          ) : activeCenterTab === 'stats' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <StatsPanel
                statistics={statistics}
                pokedex={pokedex}
                totalKnown={POKEDEX.length}
                badges={badges}
                activeTeam={activeTeam}
                box={box}
                money={money}
                inventory={inventory}
              />
            </div>
          ) : activeCenterTab === 'wiki' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <WikiPanel />
            </div>
          ) : activeCenterTab === 'log' ? (
            <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 min-h-[320px] overflow-y-auto">
              <LogPanel logs={combatLogs} />
            </div>
          ) : (
            /* DEFAULT 2x2 MOVE CARDS GRID */
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {activeFighter?.moves?.slice(0, 4).map((m, idx) => (
                <AppMoveButton
                  key={idx}
                  move={m}
                  index={idx}
                  disabled={healingCooldown > 0}
                  onClick={clickMove}
                />
              ))}
              {!activeFighter && (
                <div className="col-span-2 text-center py-6 text-white/30 text-xs font-bold uppercase">No active fighter in squad</div>
              )}
            </div>
          )}
        </div>

        {/* 👉 RIGHT COLUMN: NEXT GOAL TRACKER + PARTY SQUAD (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-col gap-4 min-h-0 order-3">
          {/* NEXT GOAL TRACKER */}
          <div className="flex-shrink-0">
            <NextGoalTracker badges={badges} statistics={statistics} />
          </div>

          {/* PARTY SQUAD LIST */}
          <div className="bg-[#0f172a]/95 border border-white/10 rounded-3xl p-4 shadow-2xl flex-1 flex flex-col min-h-[380px]">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
              <h3 className="text-xs font-black uppercase text-white/80 tracking-widest">Party Squad</h3>
              <button
                onClick={() => setIsPartyDrawerOpen(true)}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider cursor-pointer"
              >
                Expand Drawer →
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              <TeamPanel
                activeTeam={activeTeam}
                manageMode={manageMode}
                movePokeToTop={movePokeToTop}
                movePokeUp={movePokeUp}
                movePokeDown={movePokeDown}
                evolveTeamPokemon={evolveTeamPokemon}
                prestigePokemon={prestigePokemon}
                canPrestige={(i) => (activeTeam[i]?.level || 0) >= 50}
                swapWithBox={swapWithBox}
                releasePokemon={releasePokemon}
                // The Sort dropdown and the Swap button were rendered by
                // TeamPanel but never wired to a handler, so they did
                // nothing.
                onOpenBoxSelect={() => setActiveCenterTab('pc')}
                sortActiveTeam={sortActiveTeam}
                onToggleManageMode={() => setManageMode(v => !v)}
                onSelectDetail={(poke) => setSelectedDetailPokemon(poke)}
              />
            </div>
          </div>
        </div>

      </main>

      {/* SLIDE-OUT PARTY DRAWER MODAL */}
      <PartyDrawer
        isOpen={isPartyDrawerOpen}
        onClose={() => setIsPartyDrawerOpen(false)}
        activeTeam={activeTeam}
        manageMode={manageMode}
        setManageMode={setManageMode}
        movePokeToTop={movePokeToTop}
        movePokeUp={movePokeUp}
        movePokeDown={movePokeDown}
        evolveTeamPokemon={evolveTeamPokemon}
        prestigePokemon={prestigePokemon}
        canPrestige={(i) => (activeTeam[i]?.level || 0) >= 50}
        onOpenBoxSelect={() => {
          setIsPartyDrawerOpen(false);
          setActiveCenterTab('pc');
        }}
        onSelectDetail={(poke) => {
          setIsPartyDrawerOpen(false);
          setSelectedDetailPokemon(poke);
        }}
        sortActiveTeam={sortActiveTeam}
      />

      {/* MODAL: Trainer Profile Card */}
      <TrainerCardModal
        isOpen={isTrainerCardOpen}
        onClose={() => setIsTrainerCardOpen(false)}
        username={activeProfile}
        avatar={profiles.find(p => p.username === activeProfile)?.avatar || '🧑‍🚀'}
        money={money}
        badges={badges}
        statistics={statistics}
        pokedex={pokedex}
        activeTeam={activeTeam}
        box={box}
        pvpElo={pvpElo}
      />

      {/* MODAL: PvP Battle Hub Queue */}
      <BattleHubModal
        isOpen={isBattleHubOpen}
        onClose={() => setIsBattleHubOpen(false)}
        username={activeProfile}
        pvpElo={pvpElo}
        activeTeam={activeTeam}
        startTrainerBattle={startTrainerBattle}
      />

      {/* MODAL: Controls Guide */}
      {isControlsOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md" onClick={() => setIsControlsOpen(false)}>
          <div className="glass-card max-w-md w-full p-6 flex flex-col border border-white/10 rounded-3xl text-left" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 pb-2 border-b border-white/5">
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Combat Engine Info</h2>
              <button onClick={() => setIsControlsOpen(false)} className="text-[10px] text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-3.5 text-[10px] text-white/70 font-semibold leading-relaxed">
              <div>
                <span className="text-white font-black uppercase tracking-wider block mb-0.5">⏱ Combat Speed</span>
                Use the speed buttons in the controls panel to switch between relaxed (1x), accelerated (3x), or ultra speed (5x) battle tickers.
              </div>
              <div>
                <span className="text-white font-black uppercase tracking-wider block mb-0.5">🏥 Instant Heal cooldown</span>
                The <span className="text-emerald-400 font-bold">+ Heal</span> action instantly restores your team's HP during fights, putting it on a 15-second timer.
              </div>
              <div>
                <span className="text-white font-black uppercase tracking-wider block mb-0.5">⚔️ ELO PvP Matchmaker</span>
                Challenge other simulated trainers in the PvP Arena. Winning fights awards rating points, promoting your tier bracket on your Trainer Card!
              </div>
              <div>
                <span className="text-white font-black uppercase tracking-wider block mb-0.5">🧭 Region Travel</span>
                Go to the Map tab, choose Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, or Alola, and travel. Gates unlock automatically as you caught more uniques and register victories.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PC Box Swap Modal list */}
      {swappingSlot !== null && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md" onClick={() => setSwappingSlot(null)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-5 max-w-sm w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Select Pokemon to Swap</h2>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {box.length === 0 ? (
                <div className="text-center text-white/30 py-6 text-[10px]">No Pokémon in PC Box</div>
              ) : (
                box.map(poke => (
                  <button
                    key={poke.id}
                    onClick={() => {
                      swapWithBox(swappingSlot, poke.id);
                      setSwappingSlot(null);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/25 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <img src={poke.image} alt={poke.name} className="w-8 h-8 object-contain pixelated" />
                      <div>
                        <div className="text-[11px] font-bold text-white leading-none">{poke.name}</div>
                        <div className="text-[9px] text-white/40 mt-1">Lv.{poke.level} | ⚔{poke.attack}</div>
                      </div>
                    </div>
                    {poke.quality && (
                      <span className="text-[8px] font-extrabold uppercase px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                        {poke.quality}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setSwappingSlot(null)}
              className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Customization Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md" onClick={() => setIsSettingsOpen(false)}>
          <div className="glass-card max-w-lg w-full p-6 flex flex-col border border-white/10 rounded-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 pb-3 border-b border-white/5">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  ⚙️ System Customization
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5 font-semibold">Tweak interface themes, typography, and speed rates</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-xl text-white/60 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Theme Settings */}
              <div>
                <label className="text-[9px] uppercase font-black text-white/50 tracking-wider">Interface Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'glass-dark', name: 'Glass Dark', emoji: '🌌' },
                    { id: 'glass-light', name: 'Glass Light', emoji: '☀️' },
                    { id: 'gameboy', name: 'Retro GameBoy', emoji: '🕹️' },
                    { id: 'cyberpunk', name: 'Cyberpunk Neon', emoji: '⚡' },
                    { id: 'emerald', name: 'Emerald Forest', emoji: '🍃' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateGameTheme(t.id)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold transition-all duration-200 flex items-center gap-2 ${gameTheme === t.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'
                        }`}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Settings */}
              <div>
                <label className="text-[9px] uppercase font-black text-white/50 tracking-wider">App Typography</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { id: 'outfit', name: 'Outfit (Sleek Clean)' },
                    { id: 'inter', name: 'Inter (Modern Sans)' },
                    { id: 'press-start', name: 'Press Start 2P (Retro Pixel)' },
                    { id: 'fira-code', name: 'Fira Code (Terminal)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => updateGameFont(f.id)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold transition-all duration-200 ${gameFont === f.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'
                        }`}
                      style={{ fontFamily: f.id === 'press-start' ? 'Press Start 2P' : f.id === 'fira-code' ? 'monospace' : 'sans-serif' }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Speed Settings */}
              <div>
                <label className="text-[9px] uppercase font-black text-white/50 tracking-wider">Tick Combat Speed</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: '1x', name: '1x (Relaxed)', desc: '300ms' },
                    { id: '3x', name: '3x (Accelerated)', desc: '100ms' },
                    { id: '5x', name: '5x (Ultra Speed)', desc: '60ms' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setBattleSpeed(s.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 ${battleSpeed === s.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'
                        }`}
                    >
                      <div className="text-[10px] font-bold">{s.name}</div>
                      <div className="text-[9px] opacity-60 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedDetailPokemon && (
        <PokemonDetailsModal
          poke={selectedDetailPokemon}
          inventory={inventory}
          isInParty={activeTeam.some(p => p.id === selectedDetailPokemon.id)}
          onClose={() => setSelectedDetailPokemon(null)}
          onEvolve={() => {
            evolveTeamPokemon(selectedDetailPokemon.id);
            setSelectedDetailPokemon(null);
          }}
          onRelease={() => {
            const idx = activeTeam.findIndex(p => p.id === selectedDetailPokemon.id);
            if (idx >= 0) {
              if (activeTeam.length === 1) {
                alert("You can't release your last Pokémon!");
                return;
              }
              setActiveTeam((prev: PokemonInstance[]) => prev.filter((p: PokemonInstance) => p.id !== selectedDetailPokemon.id));
              setSelectedDetailPokemon(null);
            } else {
              releasePokemon(selectedDetailPokemon.id);
              setSelectedDetailPokemon(null);
            }
          }}
          onSwapBox={() => {
            const idx = activeTeam.findIndex(p => p.id === selectedDetailPokemon.id);
            if (idx >= 0) {
              if (activeTeam.length === 1) {
                alert("You can't deposit your last Pokémon!");
                return;
              }
              setActiveTeam((prev: PokemonInstance[]) => prev.filter((p: PokemonInstance) => p.id !== selectedDetailPokemon.id));
              setBox((prev: PokemonInstance[]) => [...prev, selectedDetailPokemon]);
              setSelectedDetailPokemon(null);
            } else {
              if (activeTeam.length >= 6) {
                alert("Your party is full! Swap from the box layout or deposit first.");
                return;
              }
              setBox((prev: PokemonInstance[]) => prev.filter((p: PokemonInstance) => p.id !== selectedDetailPokemon.id));
              setActiveTeam((prev: PokemonInstance[]) => [...prev, selectedDetailPokemon]);
              setSelectedDetailPokemon(null);
            }
          }}
          onEquipItem={(item) => {
            equipHeldItem(selectedDetailPokemon.id, item);
            setSelectedDetailPokemon(prev => prev ? { ...prev, heldItem: item } : null);
          }}
          onManageMoves={() => {
            setShowManageMovesModal(true);
          }}
        />
      )}

      {showManageMovesModal && selectedDetailPokemon && (
        <ManageMovesModal
          poke={selectedDetailPokemon}
          tms={inventory.tms}
          onTeachTM={handleTeachTM}
          onClose={() => setShowManageMovesModal(false)}
          onSave={(activeMoves) => {
            updateActiveMoves(selectedDetailPokemon.id, activeMoves);
            setSelectedDetailPokemon(prev => prev ? { ...prev, moves: activeMoves } : null);
            setShowManageMovesModal(false);
          }}
        />
      )}

      <GymLeaderModal
        isOpen={isGymModalOpen}
        onClose={() => setIsGymModalOpen(false)}
        defeatedBosses={defeatedBosses}
        onChallengeBoss={handleChallengeBoss}
      />
    </div>
  );
}

const getBackgroundImageUrl = (routeName: string, activeTrainer: any): string => {
  if (activeTrainer) {
    const leaderName = activeTrainer.name.toLowerCase();
    if (leaderName.includes('brock')) return '/assets/backgrounds/gym_pewter.png';
    if (leaderName.includes('misty')) return '/assets/backgrounds/gym_cerulean.png';
    if (leaderName.includes('surge')) return '/assets/backgrounds/gym_vermilion.png';
    if (leaderName.includes('erika')) return '/assets/backgrounds/gym_celadon.png';
    if (leaderName.includes('koga')) return '/assets/backgrounds/gym_fuchsia.png';
    if (leaderName.includes('sabrina')) return '/assets/backgrounds/gym_saffron.png';
    if (leaderName.includes('blaine')) return '/assets/backgrounds/gym_cinnabar.png';
    if (leaderName.includes('giovanni')) return '/assets/backgrounds/gym_viridian.png';
    return '/assets/backgrounds/gym.png';
  }
  const name = routeName.toLowerCase();
  if (name.includes('victory road')) return '/assets/backgrounds/victory_road.png';
  if (name.includes('forest')) return '/assets/backgrounds/forest.png';
  if (
    name.includes('cave') ||
    name.includes('tunnel') ||
    name.includes('mt. moon') ||
    name.includes('rock') ||
    name.includes('dungeon')
  ) {
    return '/assets/backgrounds/cave.png';
  }
  if (
    name.includes('route 12') ||
    name.includes('route 13') ||
    name.includes('route 19') ||
    name.includes('route 20') ||
    name.includes('route 21') ||
    name.includes('seafoam') ||
    name.includes('island') ||
    name.includes('beach') ||
    name.includes('ocean') ||
    name.includes('sea') ||
    name.includes('lake') ||
    name.includes('water')
  ) {
    return '/assets/backgrounds/beach.png';
  }
  return '/assets/backgrounds/plain.png';
};

export default App;