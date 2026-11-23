import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown, Star, RefreshCw, Zap, Settings } from 'lucide-react';
import type { PokemonInstance } from '../types/pokemon';
import { EXP_TABLE } from '../data/expTable';
import { EVOLUTIONS } from '../data/evolutions.js';
import { MEGA_ELIGIBLE } from '../hooks/usePokeState';

interface TeamPanelProps {
  activeTeam: PokemonInstance[];
  movePokeToTop: (index: number) => void;
  movePokeUp: (index: number) => void;
  movePokeDown: (index: number) => void;
  /** Accepts a team index or a Pokemon id -- the hook resolves both. */
  evolveTeamPokemon: (target: number | string) => void;
  onOpenBoxSelect: (teamIndex: number) => void;
  sortActiveTeam: (criteria: 'level' | 'iv' | 'power' | 'id') => void;
  /**
   * Manage mode is owned by the app, because the app also passes it to
   * the PartyDrawer. The panel used to keep its OWN copy, so the app's
   * toggle and the panel's toggle were two different flags: turning
   * manage mode on in the app did nothing to the panel, and the panel's
   * button did nothing to the drawer.
   */
  manageMode?: boolean;
  onToggleManageMode?: () => void;
  prestigePokemon?: (id: string) => void;
  canPrestige?: (index: number) => boolean;
  /** Swaps a team slot with a boxed Pokémon. */
  swapWithBox?: (teamIndex: number, boxId: string) => void;
  releasePokemon?: (id: string) => void;
  onSelectDetail?: (poke: PokemonInstance) => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  activeTeam,
  movePokeToTop,
  movePokeUp,
  movePokeDown,
  evolveTeamPokemon,
  onOpenBoxSelect,
  sortActiveTeam,
  manageMode: manageModeProp,
  onToggleManageMode,
  prestigePokemon,
  canPrestige,
  swapWithBox,
  releasePokemon,
  onSelectDetail
}) => {
  // Manage mode is shared with the rest of the app (the PartyDrawer uses
  // it too), so the app owns it. The panel keeps a local fallback only
  // when the app does NOT pass the prop at all -- otherwise the panel's
  // own Manage button would toggle a flag nothing renders.
  const [localManageMode, setLocalManageMode] = useState(false);
  const isControlled = manageModeProp !== undefined;
  const manageMode = isControlled ? manageModeProp : localManageMode;
  const toggleManageMode = onToggleManageMode
    ?? (isControlled ? () => {} : () => setLocalManageMode(v => !v));

  const getHpColor = (pct: number) => {
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="team-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none">Roster</h2>
          <p className="text-[10px] text-white/40 mt-0.5">{activeTeam.length}/6 slots</p>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            onChange={(e) => {
              sortActiveTeam(e.target.value as any);
              e.target.value = ""; // Reset value for future select triggers
            }}
            defaultValue=""
            className="text-[9px] bg-black/45 border border-white/10 rounded-xl px-2 py-1.5 text-white/70 font-bold focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="" disabled>Sort...</option>
            <option value="level">Level</option>
            <option value="iv">IV %</option>
            <option value="power">Power</option>
            <option value="id">Pokedex</option>
          </select>
          <button
            onClick={toggleManageMode}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all duration-200 ${
              manageMode
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings className="w-3 h-3" />
            {manageMode ? 'Done' : 'Manage'}
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {activeTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
            <span className="text-xs font-semibold">Choose your starter to begin!</span>
          </div>
        ) : (
          activeTeam.map((poke, index) => {
            const stats = poke.model.stats[0];
            const growthRate = stats['growth rate'] || 'Medium Fast';
            const table = EXP_TABLE[growthRate] || EXP_TABLE['Medium Fast'];
            
            const nextLvlXp = table[poke.level] || 9999999;
            const prevLvlXp = table[poke.level - 1] || 0;
            const requiredXp = nextLvlXp - prevLvlXp;
            const currentProgressXp = poke.xp - prevLvlXp;
            const xpPct = Math.min(100, Math.max(0, (currentProgressXp / requiredXp) * 100));
            const hpPct = Math.round((poke.currentHp / poke.maxHp) * 100);

            // Evolution check
            const evolInfo = EVOLUTIONS[poke.name];
            const canNormalEvolve = evolInfo && poke.level >= Number(evolInfo.level);
            const canMegaEvolve = !!MEGA_ELIGIBLE[poke.name] && poke.level >= 100;
            const canEvolve = canNormalEvolve || canMegaEvolve;

            return (
              <motion.div
                key={poke.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-2.5 rounded-2xl relative border transition-all duration-300 ${
                  index === 0
                    ? 'bg-indigo-600/10 border-indigo-500/25 shadow-sm shadow-indigo-500/5'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                }`}
              >
                {/* Lead badge */}
                {index === 0 && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-indigo-600 text-[8px] font-black text-white uppercase tracking-wider">
                    Lead
                  </div>
                )}

                <div className="flex gap-2.5 items-center">
                  {/* Sprite */}
                  <div className="relative w-11 h-11 bg-black/30 rounded-xl flex items-center justify-center border border-white/5 flex-shrink-0">
                    <img src={poke.image} alt={poke.name} className="w-9 h-9 object-contain pixelated" />
                    {poke.isShiny && (
                      <span className="absolute -top-1 -right-1 text-yellow-400">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Info -- clicking opens the Pokémon detail modal */}
                  <div
                    className="flex-1 min-w-0 text-left"
                    onClick={() => onSelectDetail?.(poke)}
                    role={onSelectDetail ? 'button' : undefined}
                    tabIndex={onSelectDetail ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onSelectDetail && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onSelectDetail(poke);
                      }
                    }}
                    style={onSelectDetail ? { cursor: 'pointer' } : undefined}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 min-w-0 flex-wrap">
                        <span className="text-xs font-black text-white">{poke.name}</span>
                        {poke.quality && (
                          <span className={`text-[6px] font-extrabold uppercase px-1 py-0.5 rounded border leading-none scale-90 ${
                            poke.quality === 'Epic' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                            poke.quality === 'Rare' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            poke.quality === 'Uncommon' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            poke.quality === 'Weak' ? 'bg-white/[0.02] border-white/5 text-white/35' :
                            'bg-white/5 border-white/10 text-white/70'
                          }`}>
                            {poke.quality}
                          </span>
                        )}
                        <div className="flex gap-0.5 flex-shrink-0">
                          {poke.types.map(t => (
                            <span key={t} className={`type-badge type-${t.toLowerCase()}`} style={{ fontSize: '7px', padding: '1px 3px' }}>
                              {t.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-black flex-shrink-0">Lv.{poke.level}</span>
                    </div>

                    {/* HP Bar */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] text-white/30 font-bold w-5">HP</span>
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getHpColor(hpPct)}`}
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-white/30 font-mono w-12 text-right">{poke.currentHp}/{poke.maxHp}</span>
                    </div>

                    {/* XP Bar */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] text-white/30 font-bold w-5">XP</span>
                      <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500/80 transition-all duration-500"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-white/30 font-mono w-12 text-right">{Math.round(xpPct)}%</span>
                    </div>

                    {/* Compact Stats Row */}
                    <div className="text-[9px] text-white/40 flex gap-2 mt-1 items-center">
                      <span>⚔{poke.attack}</span>
                      <span>🛡{poke.defense}</span>
                      <span>⚡{poke.speed}</span>
                      {poke.iv !== undefined && (
                        <span className="text-indigo-400 font-bold ml-auto text-[8px] bg-indigo-500/10 px-1 rounded">
                          IV {poke.iv}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Management Controls */}
                {manageMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/5"
                  >
                    {index > 0 && (
                      <>
                        <button
                          onClick={() => movePokeToTop(index)}
                          className="text-[9px] flex items-center gap-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-1 rounded-lg text-indigo-400 font-bold transition"
                          title="Set as Lead"
                        >
                          <Star className="w-3 h-3" /> First
                        </button>
                        <button
                          onClick={() => movePokeUp(index)}
                          className="text-[9px] flex items-center gap-0.5 bg-white/5 hover:bg-white/10 px-1.5 py-1 rounded-lg text-white/70 font-bold transition"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    {index < activeTeam.length - 1 && (
                      <button
                        onClick={() => movePokeDown(index)}
                        className="text-[9px] flex items-center gap-0.5 bg-white/5 hover:bg-white/10 px-1.5 py-1 rounded-lg text-white/70 font-bold transition"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onOpenBoxSelect(index)}
                      className="text-[9px] flex items-center gap-0.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-white/70 font-bold transition"
                    >
                      <RefreshCw className="w-3 h-3" /> Swap
                    </button>
                    {canEvolve && (
                      <button
                        onClick={() => evolveTeamPokemon(index)}
                        className="text-[9px] flex items-center gap-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-1 rounded-lg text-emerald-400 font-bold transition animate-pulse"
                      >
                        <Zap className="w-3 h-3" /> {canMegaEvolve ? `Mega Evolve → ${MEGA_ELIGIBLE[poke.name].to}` : `Evolve → ${evolInfo.to}`}
                      </button>
                    )}
                    {canPrestige?.(index) && (
                      <button
                        onClick={() => prestigePokemon?.(poke.id)}
                        className="text-[9px] flex items-center gap-0.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-2 py-1 rounded-lg text-purple-300 font-bold transition"
                      >
                        <Sparkles className="w-3 h-3" /> Prestige
                      </button>
                    )}
                    {swapWithBox && (
                      <button
                        onClick={() => onOpenBoxSelect(index)}
                        className="text-[9px] flex items-center gap-0.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-white/60 font-bold transition"
                        title="Swap with a Pokémon in the Box"
                      >
                        <RefreshCw className="w-3 h-3" /> Box
                      </button>
                    )}
                    {releasePokemon && (
                      <button
                        onClick={() => releasePokemon(poke.id)}
                        className="text-[9px] flex items-center gap-0.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2 py-1 rounded-lg text-red-400 font-bold transition"
                      >
                        Release
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Evolve indicator when NOT in manage mode */}
                {!manageMode && canEvolve && (
                  <div className="absolute bottom-1.5 right-1.5">
                    <div 
                      className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" 
                      title={canMegaEvolve ? `Can Mega Evolve to ${MEGA_ELIGIBLE[poke.name].to}` : `Can evolve to ${evolInfo.to}`} 
                    />
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
