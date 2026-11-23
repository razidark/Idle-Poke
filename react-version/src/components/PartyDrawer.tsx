import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Settings, ChevronUp, ChevronDown, RefreshCw, Zap } from 'lucide-react';
import type { PokemonInstance } from '../types/pokemon';

interface PartyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeam: PokemonInstance[];
  manageMode: boolean;
  setManageMode: (manage: boolean) => void;
  movePokeToTop: (index: number) => void;
  movePokeUp: (index: number) => void;
  movePokeDown: (index: number) => void;
  /** Accepts a team index or a Pokemon id -- the hook resolves both. */
  evolveTeamPokemon: (target: number | string) => void;
  prestigePokemon: (index: number) => void;
  canPrestige?: (index: number) => boolean;
  onOpenBoxSelect: () => void;
  onSelectDetail: (poke: PokemonInstance) => void;
  sortActiveTeam: (criteria: 'level' | 'iv' | 'power' | 'id') => void;
}

export const PartyDrawer: React.FC<PartyDrawerProps> = ({
  isOpen,
  onClose,
  activeTeam,
  manageMode,
  setManageMode,
  movePokeToTop,
  movePokeUp,
  movePokeDown,
  evolveTeamPokemon,
  prestigePokemon,
  canPrestige,
  onOpenBoxSelect,
  onSelectDetail,
  sortActiveTeam
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9990]"
          />

          {/* Slide-out Left Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-[380px] max-w-[90vw] bg-[#0b0f19]/95 border-r border-white/10 backdrop-blur-2xl p-5 z-[9995] flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest leading-none">Roster Party Squad</h2>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">{activeTeam.length} / 6 Active</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-3 bg-black/40 p-2 rounded-xl border border-white/5">
              <select
                onChange={(e) => {
                  sortActiveTeam(e.target.value as any);
                  e.target.value = "";
                }}
                defaultValue=""
                className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/80 font-bold cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Sort...</option>
                <option value="level">Level</option>
                <option value="iv">IV %</option>
                <option value="power">Power</option>
                <option value="id">Dex #</option>
              </select>

              <button
                onClick={() => setManageMode(!manageMode)}
                className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition border ${
                  manageMode
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Settings className="w-3 h-3 inline mr-1" />
                {manageMode ? 'Done' : 'Manage'}
              </button>
            </div>

            {/* Party Cards List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {Array.from({ length: 6 }).map((_, slotIndex) => {
                const poke = activeTeam[slotIndex];
                if (!poke) {
                  return (
                    <button
                      key={slotIndex}
                      onClick={onOpenBoxSelect}
                      className="p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/30 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/60 text-xs font-black uppercase transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5 opacity-60" />
                      Empty Slot - Add from PC
                    </button>
                  );
                }

                const hpPct = Math.round((poke.currentHp / poke.maxHp) * 100);

                return (
                  <div
                    key={poke.id}
                    onClick={() => {
                      if (!manageMode) onSelectDetail(poke);
                    }}
                    className={`p-3 rounded-2xl border transition-all duration-200 relative ${
                      !manageMode ? 'cursor-pointer hover:bg-white/[0.04]' : ''
                    } ${
                      slotIndex === 0
                        ? 'bg-indigo-600/10 border-indigo-500/30 shadow-md shadow-indigo-500/5'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    {/* Lead Badge */}
                    {slotIndex === 0 && (
                      <span className="absolute top-2 right-2 text-[8px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                        Lead
                      </span>
                    )}

                    <div className="flex gap-3 items-center">
                      {/* Sprite thumbnail */}
                      <div className="relative w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                        <img src={poke.image} alt={poke.name} className="w-10 h-10 object-contain pixelated" />
                        {poke.isShiny && (
                          <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">✨</span>
                        )}
                      </div>

                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center pr-8">
                          <span className="text-xs font-black text-white uppercase">{poke.name}</span>
                          <span className="text-[10px] text-indigo-400 font-black">Lv.{poke.level}</span>
                        </div>

                        {/* HP progress */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] text-white/40 font-black uppercase w-4">HP</span>
                          <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                hpPct > 50 ? 'bg-emerald-500' : hpPct > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${hpPct}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-white/40 font-mono w-14 text-right">
                            {poke.currentHp}/{poke.maxHp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Manage overlay if manageMode */}
                    {manageMode && (
                      <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center gap-2 p-1 z-20 animate-fade-in">
                        <button
                          onClick={() => movePokeToTop(slotIndex)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition"
                        >
                          Lead
                        </button>
                        <button
                          onClick={() => movePokeUp(slotIndex)}
                          disabled={slotIndex === 0}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => movePokeDown(slotIndex)}
                          disabled={slotIndex === activeTeam.length - 1}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => evolveTeamPokemon(slotIndex)}
                          className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition"
                        >
                          Evolve
                        </button>
                        <button
                          onClick={() => prestigePokemon(slotIndex)}
                          disabled={canPrestige ? !canPrestige(slotIndex) : false}
                          title="Reset to Lv.1 for a permanent +5% to this Pokemon's battle stats"
                          className="px-2.5 py-1 bg-violet-500 hover:bg-violet-400 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Prestige
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
