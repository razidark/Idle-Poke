import React from 'react';
import { motion } from 'framer-motion';
import type { PokemonInstance, WildPokemon } from '../types/pokemon';

const RenderAttackVFX: React.FC<{ movePopups: any[] }> = ({ movePopups }) => {
  return (
    <>
      {movePopups.map((popup) => {
        const isPlayerSource = popup.isPlayer;
        const type = (popup.type || 'Normal').toLowerCase();
        const targetStyle: React.CSSProperties = isPlayerSource
          ? { top: '15%', right: '15%' }
          : { bottom: '20%', left: '15%' };

        return (
          <div
            key={popup.id}
            className="absolute pointer-events-none z-40 w-32 h-32 flex items-center justify-center"
            style={targetStyle}
          >
            {type === 'fire' && (
              <div className="relative w-full h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-orange-500 rounded-full animate-ping"
                    style={{
                      width: '12px',
                      height: '12px',
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                      animationDuration: '0.6s',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {type === 'water' && (
              <div className="relative w-full h-full">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-blue-400 bg-blue-300/30 rounded-full animate-bounce"
                    style={{
                      width: '10px',
                      height: '10px',
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDuration: '0.8s',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {type === 'grass' && (
              <div className="relative w-full h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-emerald-400 text-xs font-bold animate-spin"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                      animationDuration: '0.5s',
                    }}
                  >
                    🍃
                  </div>
                ))}
              </div>
            )}
            {type === 'electric' && (
              <div className="absolute inset-0 bg-yellow-400/20 animate-pulse border-2 border-yellow-400 rounded-2xl flex items-center justify-center">
                <span className="text-yellow-300 font-black text-xl animate-bounce">⚡</span>
              </div>
            )}
            {(type !== 'fire' && type !== 'water' && type !== 'grass' && type !== 'electric') && (
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  className="w-16 h-1 bg-white rotate-45 animate-pulse rounded shadow-[0_0_8px_white]"
                  style={{ transform: 'rotate(-45deg)' }}
                />
                <div
                  className="w-16 h-1 bg-white -rotate-45 absolute animate-pulse rounded shadow-[0_0_8px_white]"
                  style={{ transform: 'rotate(45deg)' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const TOWN_DESCRIPTIONS: { [key: string]: string } = {
  'Pallet Town': 'A cozy, peaceful hamlet where your journey began. A quiet starting line.',
  'Viridian City': "A beautiful green city wrapped in nature's embrace, featuring the final gym.",
  'Pewter City': 'A solid, gray stone city nestled between high rocky mountains, home to Brock.',
  'Cerulean City': 'A mysterious floral city surrounded by cascading blue water, home to Misty.',
  'Vermilion City': "A bustling, sun-drenched southern harbor town. Watch the S.S. Anne set sail.",
  'Lavender Town': 'A quiet, somber village home to the legendary Pokémon Tower and spirits.',
  'Celadon City': 'A massive, vibrant shopping capital filled with neon lights, malls, and gyms.',
  'Saffron City': 'A high-tech golden metropolis hosting the Silph Co. headquarters.',
  'Fuchsia City': 'A tropical, wildlife-rich sanctuary that serves as entry to the Safari Zone.',
  'Cinnabar Island': 'A volcanic, rocky island built on top of a dormant geothermal pocket.',
  'New Bark Town': 'A fresh Johto harbor town where winds of new adventure blow.',
  'Cherrygrove City': 'A scenic coastal city with the sweet scent of cherry blossoms.',
  'Violet City': 'An ancient, historic town featuring pagodas, Sprout Tower, and Falkner.',
  'Azalea Town': 'A cozy charcoal-crafting village situated near the Slowpoke Well.',
  'Goldenrod City': "A mega metropolis with Johto's largest department store, train, and Whitney.",
  'Ecruteak City': "A traditional town rich with historic lore, pagodas, and Morty's ghosts.",
  'Olivine City': 'A coastal seaport town known for its lighthouse guiding sailors.',
  'Cianwood City': 'A remote, wind-swept beach city far out in the west sea.',
  'Mahogany Town': 'A mysterious village known for its hidden rocket labs and red lake.',
  'Blackthorn City': 'A rugged, high-mountain fortress where dragon tamers gather.'
};

const TOWN_THEMES: { [key: string]: { grad: string; icon: string } } = {
  'Pallet Town': { grad: 'from-emerald-800 to-green-600', icon: '🏡' },
  'Viridian City': { grad: 'from-teal-800 to-emerald-600', icon: '🌲' },
  'Pewter City': { grad: 'from-slate-700 to-gray-600', icon: '🪨' },
  'Cerulean City': { grad: 'from-blue-800 to-sky-600', icon: '💧' },
  'Vermilion City': { grad: 'from-sky-700 to-cyan-600', icon: '🚢' },
  'Lavender Town': { grad: 'from-purple-900 to-violet-700', icon: '🪦' },
  'Celadon City': { grad: 'from-fuchsia-900 to-pink-700', icon: '🏬' },
  'Saffron City': { grad: 'from-slate-900 to-slate-700', icon: '🏙️' },
  'Fuchsia City': { grad: 'from-amber-800 to-yellow-600', icon: '🦁' },
  'Cinnabar Island': { grad: 'from-orange-800 to-red-600', icon: '🌋' },
  'New Bark Town': { grad: 'from-teal-700 to-cyan-600', icon: '🏡' },
  'Cherrygrove City': { grad: 'from-pink-800 to-rose-600', icon: '🌸' },
  'Violet City': { grad: 'from-fuchsia-800 to-purple-600', icon: '🏯' },
  'Azalea Town': { grad: 'from-amber-700 to-orange-600', icon: '🪵' },
  'Goldenrod City': { grad: 'from-indigo-900 to-blue-800', icon: '🪙' },
  'Ecruteak City': { grad: 'from-orange-950 to-amber-900', icon: '🍁' },
  'Olivine City': { grad: 'from-sky-800 to-blue-600', icon: '🚨' },
  'Cianwood City': { grad: 'from-blue-700 to-sky-600', icon: '🌊' },
  'Mahogany Town': { grad: 'from-red-800 to-rose-600', icon: '❄️' },
  'Blackthorn City': { grad: 'from-indigo-950 to-indigo-800', icon: '🐉' }
};

interface BattleBackgroundProps {
  wildPoke: WildPokemon | null;
  activeFighter: PokemonInstance | null;
  playerProgress: number;
  wildProgress: number;
  activeRouteName: string;
  damageNumbers: { id: string; text: string; isPlayerTarget: boolean }[];
  movePopups: { id: string; name: string; type: string; isPlayer: boolean }[];
  catchAnim: { isSuccess: boolean; ballType: string } | null;
  spriteZoom: number;
  activeTrainer: any;
  healingCooldown: number;
  isTown?: boolean;
  townTrainer?: any;
  onChallengeTrainer?: (trainer: any) => void;
  onEnterTown?: () => void;
}

export const BattleBackground: React.FC<BattleBackgroundProps> = ({
  wildPoke,
  activeFighter,
  activeRouteName,
  damageNumbers,
  movePopups,
  catchAnim,
  spriteZoom,
  activeTrainer,
  healingCooldown,
  isTown = false,
  townTrainer = null,
  onChallengeTrainer,
  onEnterTown
}) => {
  const getBackgroundClass = () => {
    if (activeTrainer) {
      const leaderName = activeTrainer.name.toLowerCase();
      if (leaderName.includes('brock')) return 'bg-gym-pewter';
      if (leaderName.includes('misty')) return 'bg-gym-cerulean';
      if (leaderName.includes('surge')) return 'bg-gym-vermilion';
      if (leaderName.includes('erika')) return 'bg-gym-celadon';
      if (leaderName.includes('koga')) return 'bg-gym-fuchsia';
      if (leaderName.includes('sabrina')) return 'bg-gym-saffron';
      if (leaderName.includes('blaine')) return 'bg-gym-cinnabar';
      if (leaderName.includes('giovanni')) return 'bg-gym-viridian';
      return 'bg-route-gym';
    }
    const name = activeRouteName.toLowerCase();
    if (name.includes('victory road')) return 'bg-route-victory-road';
    if (name.includes('forest')) return 'bg-route-forest';
    if (
      name.includes('cave') ||
      name.includes('tunnel') ||
      name.includes('mt. moon') ||
      name.includes('rock') ||
      name.includes('dungeon')
    ) {
      return 'bg-route-cave';
    }
    if (
      name.includes('route 19') ||
      name.includes('route 20') ||
      name.includes('route 21') ||
      name.includes('seafoam') ||
      name.includes('island') ||
      name.includes('beach') ||
      name.includes('ocean') ||
      name.includes('sea') ||
      name.includes('lake')
    ) {
      return 'bg-route-beach';
    }
    return 'bg-route-plain';
  };

  const isPlayerAttacking = movePopups.some(m => m.isPlayer);
  const isWildAttacking = movePopups.some(m => !m.isPlayer);

  const getPedestalStyle = () => {
    const bgClass = getBackgroundClass();
    if (bgClass.includes('forest')) {
      return {
        backgroundColor: '#7da874',
        border: '3px solid #1a3318',
        boxShadow: '0 4px 0 #122411, inset 0 -2px 0 rgba(0,0,0,0.15)'
      };
    }
    if (bgClass.includes('cave') || bgClass.includes('victory-road')) {
      return {
        backgroundColor: '#8c847e',
        border: '3px solid #332d29',
        boxShadow: '0 4px 0 #241f1c, inset 0 -2px 0 rgba(0,0,0,0.15)'
      };
    }
    if (bgClass.includes('beach')) {
      return {
        backgroundColor: '#ebd09e',
        border: '3px solid #6b5735',
        boxShadow: '0 4px 0 #473a23, inset 0 -2px 0 rgba(0,0,0,0.15)'
      };
    }
    if (bgClass.includes('gym')) {
      return {
        backgroundColor: '#a3a5a8',
        border: '3px solid #3d3e40',
        boxShadow: '0 4px 0 #292a2b, inset 0 -2px 0 rgba(0,0,0,0.15)'
      };
    }
    return {
      backgroundColor: '#7e8c75',
      border: '3px solid #1c1c1f',
      boxShadow: '0 3px 0 #1c1c1f, inset 0 -2px 0 rgba(0,0,0,0.2)'
    };
  };

  const showTownBox = isTown && !wildPoke && !activeTrainer;
  const desc = TOWN_DESCRIPTIONS[activeRouteName] || 'A welcoming settlement in the region. Rest up and train your Pokémon.';
  const theme = TOWN_THEMES[activeRouteName] || { grad: 'from-slate-800 to-slate-600', icon: '🏘️' };

  const bgClass = getBackgroundClass();

  return (
    <div className={`absolute inset-0 z-0 transition-all duration-500 overflow-hidden ${bgClass}`}>
      {/* Guaranteed Vector / Gradient Stage Environments */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {bgClass.includes('cave') ? (
          <div className="w-full h-full bg-gradient-to-b from-[#0b0f19] via-[#1c2438] to-[#070a12] relative">
            <div className="absolute top-0 inset-x-0 h-16 bg-slate-900/80 border-b border-white/5 flex justify-around opacity-60">
              <span className="text-2xl">⛰️</span>
              <span className="text-xl">🪨</span>
              <span className="text-2xl">⛰️</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-28 bg-slate-950/80 border-t border-slate-700/30" />
          </div>
        ) : bgClass.includes('gym') ? (
          <div className="w-full h-full bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#0f172a] relative">
            <div className="absolute top-0 inset-x-0 h-10 bg-indigo-500/20 border-b border-indigo-500/30 flex justify-between px-8 items-center">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">🏟️ Kanto League Official Gym Arena</span>
              <span className="text-xs font-black text-amber-400">⚡</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-28 bg-slate-900/90 border-t-2 border-amber-500/40" />
          </div>
        ) : bgClass.includes('beach') ? (
          <div className="w-full h-full bg-gradient-to-b from-[#0284c7] via-[#0284c7] to-[#eab308] relative">
            <div className="absolute top-0 inset-x-0 h-24 bg-sky-300/30" />
            <div className="absolute bottom-0 inset-x-0 h-28 bg-amber-600/40 border-t-2 border-cyan-400/50" />
          </div>
        ) : (
          /* Default Forest / Route Plains Stage */
          <div className="w-full h-full bg-gradient-to-b from-[#0284c7] via-[#166534] to-[#052e16] relative">
            <div className="absolute top-0 inset-x-0 h-20 bg-sky-400/30" />
            <div className="absolute bottom-0 inset-x-0 h-28 bg-emerald-950/80 border-t border-emerald-500/30" />
          </div>
        )}
      </div>
      {/* Soft overlay to blend wallpaper grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-transparent opacity-95 pointer-events-none" />

      {/* Main Battle Field */}
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-black/10">

        {/* --- ENEMY SIDE (Top-Right) --- */}
        {!showTownBox && (
          <div
            className="absolute flex flex-col items-center"
            style={{ top: '28%', right: '12%' }}
          >
            {/* Enemy Platform (Retro Pedestal) */}
            <div
              className="w-36 h-10 rounded-[50%]"
              style={getPedestalStyle()}
            />

            {/* Enemy Sprite & Popups Wrapper */}
            <div className="absolute -top-12 flex flex-col items-center justify-center h-24 w-24">
              {healingCooldown > 0 ? (
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">RESTING</span>
                  <span className="text-xl font-black text-white">{healingCooldown}s</span>
                </div>
              ) : wildPoke ? (
                <>
                  {/* Sprite */}
                  <div style={{ transform: `scale(${spriteZoom * 0.8})`, transformOrigin: 'center', imageRendering: 'pixelated' }} className="flex items-center justify-center">
                    <motion.img
                      src={wildPoke.animatedFront || wildPoke.image}
                      alt={wildPoke.name}
                      className="battle-sprite drop-shadow-md pixelated"
                      animate={{
                        y: catchAnim
                          ? 20
                          : (isWildAttacking
                            ? 10
                            : [0, -3, 0]),
                        x: isWildAttacking ? -15 : 0,
                        scale: catchAnim ? 0 : (wildPoke.currentHp <= 0 ? 0 : 1),
                        opacity: catchAnim ? 0 : 1
                      }}
                      transition={{
                        y: catchAnim
                          ? { duration: 0.15 }
                          : (isWildAttacking
                            ? { duration: 0.2 }
                            : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }),
                        scale: catchAnim ? { delay: 0.5, duration: 0.25 } : { duration: 0.2 },
                        opacity: catchAnim ? { delay: 0.5, duration: 0.25 } : { duration: 0.2 }
                      }}
                    />
                  </div>

                  {/* Move Popup */}
                  <div className="absolute -top-6 pointer-events-none flex flex-col items-center z-30">
                    {movePopups
                      .filter(m => !m.isPlayer)
                      .map(m => (
                        <div
                          key={m.id}
                          className={`type-badge type-${m.type.toLowerCase()} move-popup-float font-black text-[8px] tracking-wider px-1.5 py-0.5 rounded shadow`}
                        >
                          {m.name}
                        </div>
                      ))}
                  </div>

                  {/* Damage numbers */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    {damageNumbers
                      .filter(n => !n.isPlayerTarget)
                      .map(n => (
                        <div key={n.id} className="damage-number absolute text-red-500 font-extrabold text-sm">
                          {n.text}
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-4 text-white/20">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1" />
                  <span className="text-[10px] uppercase tracking-wider">Searching...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PLAYER SIDE (Bottom-Left) --- */}
        {!showTownBox && (
          <div
            className="absolute flex flex-col items-center"
            style={{ bottom: '12%', left: '12%' }}
          >
            {/* Player Platform (Retro Pedestal) */}
            <div
              className="w-40 h-11 rounded-[50%]"
              style={getPedestalStyle()}
            />

            {/* Player Sprite & Popups Wrapper */}
            <div className="absolute -top-16 flex flex-col items-center justify-center h-28 w-28">
              {activeFighter && (() => {
                const useBack = !!activeFighter.backImage && activeFighter.backImage !== activeFighter.image;
                const playerSpriteUrl = useBack
                  ? (activeFighter.animatedBack || activeFighter.backImage)
                  : (activeFighter.animatedFront || activeFighter.image);

                return (
                  <>
                    {/* Sprite */}
                    <div
                      style={{
                        transform: `scale(${spriteZoom * (useBack ? 1.1 : 0.8)}) scaleX(-1)`,
                        transformOrigin: 'center',
                        imageRendering: 'pixelated'
                      }}
                      className="flex items-center justify-center"
                    >
                      <motion.img
                        src={playerSpriteUrl}
                        alt={activeFighter.name}
                        className="battle-sprite drop-shadow-md pixelated"
                        animate={{
                          scale: activeFighter.currentHp <= 0 ? 0 : 1,
                          rotate: activeFighter.currentHp <= 0 ? -45 : 0,
                          opacity: activeFighter.currentHp <= 0 ? 0 : 1,
                          x: isPlayerAttacking ? 20 : 0,
                          y: isPlayerAttacking
                            ? -15
                            : [0, -2.5, 0]
                        }}
                        transition={{
                          scale: { duration: 0.2 },
                          rotate: { duration: 0.2 },
                          opacity: { duration: 0.2 },
                          x: { duration: 0.2 },
                          y: isPlayerAttacking
                            ? { duration: 0.2 }
                            : { repeat: Infinity, duration: 2.0, ease: "easeInOut" }
                        }}
                      />
                    </div>

                    {/* Move Popup */}
                    <div className="absolute -top-6 pointer-events-none flex flex-col items-center z-30">
                      {movePopups
                        .filter(m => m.isPlayer)
                        .map(m => (
                          <div
                            key={m.id}
                            className={`type-badge type-${m.type.toLowerCase()} move-popup-float font-black text-[8px] tracking-wider px-1.5 py-0.5 rounded shadow`}
                          >
                            {m.name}
                          </div>
                        ))}
                    </div>

                    {/* Damage numbers */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                      {damageNumbers
                        .filter(n => n.isPlayerTarget)
                        .map(n => (
                          <div key={n.id} className="damage-number absolute text-red-500 font-extrabold text-sm">
                            {n.text}
                          </div>
                        ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* --- ENEMY POKEIDLE HP CARD (Top-Left) --- */}
        {!showTownBox && (
          <div className="absolute top-4 left-4 z-20 bg-black/90 border border-white/10 rounded-2xl p-3.5 w-64 shadow-2xl backdrop-blur-md">
            {!wildPoke && healingCooldown === 0 ? (
              <div className="text-[10px] font-mono text-white/40 uppercase animate-pulse text-center">Searching...</div>
            ) : wildPoke ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black uppercase text-white font-pixel">{wildPoke.name}</span>
                  <span className="text-[10px] font-black text-amber-300 font-pixel">Lv. {wildPoke.level}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {wildPoke.types?.map((t: string) => (
                    <span key={t} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black font-mono text-white/50">
                    <span>HP</span>
                    <span>{Math.max(0, Math.floor(wildPoke.currentHp))} / {wildPoke.maxHp}</span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, (wildPoke.currentHp / wildPoke.maxHp) * 100)}%`,
                        backgroundColor: (wildPoke.currentHp / wildPoke.maxHp) > 0.5 ? '#10b981' : (wildPoke.currentHp / wildPoke.maxHp) > 0.2 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* --- PLAYER POKEIDLE HP CARD (Bottom-Right) --- */}
        {!showTownBox && (
          <div className="absolute bottom-12 right-4 z-20 bg-black/90 border border-white/10 rounded-2xl p-3.5 w-64 shadow-2xl backdrop-blur-md">
            {activeFighter ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black uppercase text-white font-pixel">{activeFighter.name}</span>
                  <span className="text-[10px] font-black text-indigo-300 font-pixel">Lv. {activeFighter.level}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {activeFighter.types?.map((t: string) => (
                    <span key={t} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black font-mono text-white/50">
                    <span>HP</span>
                    <span>{Math.max(0, Math.floor(activeFighter.currentHp))} / {activeFighter.maxHp}</span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, (activeFighter.currentHp / activeFighter.maxHp) * 100)}%`,
                        backgroundColor: (activeFighter.currentHp / activeFighter.maxHp) > 0.5 ? '#10b981' : (activeFighter.currentHp / activeFighter.maxHp) > 0.2 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* --- POKEIDLE BATTLE DIALOGUE BANNER (Bottom of Stage) --- */}
        <div className="absolute bottom-0 inset-x-0 bg-black/90 border-t border-white/10 px-4 py-2.5 text-left z-20 flex items-center justify-between">
          <span className="text-xs font-black font-pixel text-white tracking-wider">
            {wildPoke
              ? activeTrainer
                ? `${activeTrainer.name} sent out ${wildPoke.name}!`
                : `Wild ${wildPoke.name} appeared!`
              : 'Exploring wild area...'}
          </span>
        </div>

        {/* Enemy & Player stat plates are now rendered inline inside their fighter cards above. */}

        {/* Render Attack VFX overlays */}
        <RenderAttackVFX movePopups={movePopups} />

        {/* Catch animation ball overlay */}
        {catchAnim && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            {/* Spinning Arc Throw & Wobble Container */}
            <div className="anim-pokeball-throw absolute right-[25%] top-[25%]">
              <div className="anim-pokeball-wobble relative w-12 h-12 flex items-center justify-center">
                {/* Poké Ball SVG Textures */}
                <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#000" strokeWidth="4" />
                  {/* Top Shell */}
                  <path
                    d="M 4 50 A 46 46 0 0 1 96 50 Z"
                    fill={
                      catchAnim.ballType === 'masterball' ? '#9333ea' :
                      catchAnim.ballType === 'ultraball' ? '#18181b' :
                      catchAnim.ballType === 'greatball' ? '#2563eb' : '#ef4444'
                    }
                    stroke="#000"
                    strokeWidth="4"
                  />
                  {/* Special Ball Markings */}
                  {catchAnim.ballType === 'ultraball' && (
                    <path d="M 20 20 L 35 45 M 80 20 L 65 45" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                  )}
                  {catchAnim.ballType === 'masterball' && (
                    <circle cx="35" cy="30" r="8" fill="#ec4899" />
                  )}
                  {/* Bottom Shell */}
                  <path d="M 4 50 A 46 46 0 0 0 96 50 Z" fill="#f8fafc" stroke="#000" strokeWidth="4" />
                  {/* Middle Line */}
                  <line x1="4" y1="50" x2="96" y2="50" stroke="#000" strokeWidth="6" />
                  {/* Center Button */}
                  <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#000" strokeWidth="5" />
                  <circle cx="50" cy="50" r="6" fill="#cbd5e1" />
                </svg>
              </div>
            </div>

            {/* Victory Sparkle Burst */}
            {catchAnim.isSuccess && (
              <div className="anim-star-burst absolute right-[25%] top-[25%] flex items-center justify-center">
                <div className="text-amber-300 text-4xl animate-spin">⭐</div>
              </div>
            )}
          </div>
        )}

        {/* Weather Effect Rain / Fog Particle Overlays */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {(activeRouteName || '').toLowerCase().includes('route 12') || (activeRouteName || '').toLowerCase().includes('route 13') ? (
            <div className="w-full h-full bg-blue-500/10 animate-pulse opacity-40" />
          ) : (activeRouteName || '').toLowerCase().includes('route 9') || (activeRouteName || '').toLowerCase().includes('route 10') ? (
            <div className="w-full h-full bg-amber-600/10 opacity-50" />
          ) : (activeRouteName || '').toLowerCase().includes('route 23') || (activeRouteName || '').toLowerCase().includes('victory road') ? (
            <div className="w-full h-full bg-slate-300/15 backdrop-blur-[1px]" />
          ) : null}
        </div>

      </div>

      {/* Town Box Overlay */}
      {showTownBox && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-30 select-none pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-black/80 border border-white/10 rounded-2xl p-3 shadow-2xl relative overflow-hidden backdrop-blur-md"
          >
            {/* Header Town Banner */}
            <div className={`w-full py-1.5 px-3 rounded-xl bg-gradient-to-r ${theme.grad} flex items-center justify-center gap-1.5 shadow-inner border border-white/10`}>
              <span className="text-sm animate-bounce">{theme.icon}</span>
              <h3 className="text-[10px] font-black uppercase text-white tracking-widest font-mono select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {activeRouteName}
              </h3>
            </div>

            {/* Description text */}
            <p className="text-[9px] text-white/70 mt-2 leading-relaxed max-w-sm px-1 font-semibold uppercase tracking-wide">
              {desc}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 justify-center mt-3 w-full px-1">
              <button
                onClick={onEnterTown}
                className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-[8px] uppercase tracking-widest rounded-xl transition duration-150 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-500/30"
              >
                <span>🏢 Enter Town</span>
              </button>
              {townTrainer && (
                <button
                  onClick={() => onChallengeTrainer?.(townTrainer)}
                  className="flex-1 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-[8px] uppercase tracking-widest rounded-xl transition duration-150 shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/30"
                >
                  <span>⚔️ {townTrainer.name}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
