import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, ShieldAlert, Award } from 'lucide-react';
import { getLearnableMoves } from '../data/learnsets';
import { EVOLUTIONS } from '../data/evolutions.js';
import { POKEDEX } from '../data/db.js';
import { getDexNumber } from '../data/dexNumbers';

interface PokedexDetailModalProps {
  pokemonName: string;
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
  onClose: () => void;
  onSelectPokemon: (name: string) => void;
}

export const PokedexDetailModal: React.FC<PokedexDetailModalProps> = ({
  pokemonName,
  pokedex,
  onClose,
  onSelectPokemon
}) => {
  const [spriteTab, setSpriteTab] = useState<'normal' | 'shiny'>('normal');

  const model = POKEDEX.find(p => p.pokemon[0].Pokemon === pokemonName);
  if (!model) return null;

  const entry = pokedex[pokemonName] || { caught: false, seen: false, shinyCaught: false };
  const stats = model.stats[0];
  const types = stats.types || [];
  const dexNum = getDexNumber(pokemonName);
  const caught = entry.caught;
  const seen = entry.seen;

  // Base Stats
  const baseStats = [
    { label: 'HP', val: Number(stats.hp) || 10, max: 255, color: 'bg-red-500' },
    { label: 'Attack', val: Number(stats.attack) || 10, max: 190, color: 'bg-orange-500' },
    { label: 'Defense', val: Number(stats.defense) || 10, max: 230, color: 'bg-yellow-500' },
    { label: 'Sp. Atk', val: Number(stats['sp atk']) || 10, max: 194, color: 'bg-blue-500' },
    { label: 'Sp. Def', val: Number(stats['sp def']) || 10, max: 230, color: 'bg-teal-500' },
    { label: 'Speed', val: Number(stats.speed) || 10, max: 180, color: 'bg-pink-500' }
  ];

  // Learnset
  const learnset = getLearnableMoves(pokemonName, types);

  // Evolutions
  const evolution = EVOLUTIONS[pokemonName];
  const evolvesToModel = evolution ? POKEDEX.find(p => p.pokemon[0].Pokemon === evolution.to) : null;
  const evolvesFromKey = Object.keys(EVOLUTIONS).find(key => EVOLUTIONS[key]?.to === pokemonName);
  const evolvesFromModel = evolvesFromKey ? POKEDEX.find(p => p.pokemon[0].Pokemon === evolvesFromKey) : null;

  const normalFront = model.images?.normal?.front || '';
  const normalBack = model.images?.normal?.back || '';
  const shinyFront = model.images?.shiny?.front || '';
  const shinyBack = model.images?.shiny?.back || '';

  const activeFront = spriteTab === 'shiny' ? shinyFront : normalFront;
  const activeBack = spriteTab === 'shiny' ? shinyBack : normalBack;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] backdrop-blur-md" onClick={onClose}>
      <div 
        className="glass-card max-w-lg w-full max-h-[85vh] p-6 flex flex-col border border-white/10 rounded-3xl text-left overflow-hidden relative shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header summary */}
        <div className="flex justify-between items-start border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/30 font-mono">#{String(dexNum).padStart(3, '0')}</span>
              {caught ? (
                <span className="text-[7.5px] font-extrabold uppercase px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 leading-none">
                  Caught
                </span>
              ) : seen ? (
                <span className="text-[7.5px] font-extrabold uppercase px-1 py-0.5 rounded bg-white/5 text-white/50 border border-white/10 leading-none">
                  Seen
                </span>
              ) : (
                <span className="text-[7.5px] font-extrabold uppercase px-1 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 leading-none">
                  Undiscovered
                </span>
              )}
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white mt-1">
              {seen ? pokemonName : '???'}
            </h2>
            {seen && (
              <div className="flex gap-1 mt-1.5">
                {types.map(t => (
                  <span key={t} className={`type-badge type-${t.toLowerCase()}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 text-sm">✕</button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {!seen ? (
            <div className="text-center py-12 text-white/35 text-xs font-semibold">
              ⚠️ You have not encountered this species yet. Keep exploring routes!
            </div>
          ) : (
            <>
              {/* Sprite Visuals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                <div className="bg-black/35 rounded-2xl border border-white/5 p-3 flex flex-col items-center justify-center relative min-h-[120px]">
                  {/* Sprite switcher tabs */}
                  <div className="absolute top-2 left-2 flex gap-1 z-10">
                    <button
                      onClick={() => setSpriteTab('normal')}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition ${
                        spriteTab === 'normal' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      disabled={!entry.shinyCaught}
                      onClick={() => setSpriteTab('shiny')}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition flex items-center gap-0.5 ${
                        !entry.shinyCaught 
                          ? 'opacity-20 cursor-not-allowed text-white/20'
                          : spriteTab === 'shiny'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                      title={!entry.shinyCaught ? 'Catch a Shiny version first!' : 'Toggle Shiny palette'}
                    >
                      <Sparkles className="w-2.5 h-2.5 text-yellow-400" /> Shiny
                    </button>
                  </div>

                  <div className="flex gap-4 items-center mt-3">
                    {activeFront && (
                      <div className="flex flex-col items-center">
                        <img src={activeFront} alt="Front View" className="w-16 h-16 object-contain pixelated" />
                        <span className="text-[6.5px] text-white/30 uppercase mt-1">Front</span>
                      </div>
                    )}
                    {activeBack && (
                      <div className="flex flex-col items-center">
                        <img src={activeBack} alt="Back View" className="w-16 h-16 object-contain pixelated" />
                        <span className="text-[6.5px] text-white/30 uppercase mt-1">Back</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Base Stats list */}
                <div className="bg-black/35 rounded-2xl border border-white/5 p-3 flex flex-col justify-between">
                  <span className="text-[8.5px] text-indigo-400 font-bold uppercase tracking-wider mb-2 block">Base Stats:</span>
                  <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                    {baseStats.map(bs => (
                      <div key={bs.label} className="flex items-center gap-2 text-[9.5px]">
                        <span className="text-white/45 w-12 font-bold">{bs.label}</span>
                        <span className="text-white font-mono w-7 text-right font-black">{bs.val}</span>
                        <div className="flex-1 h-1.5 bg-black/45 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className={`h-full rounded-full ${bs.color}`} style={{ width: `${Math.min(100, (bs.val / bs.max) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evolutionary Line */}
              {(evolvesFromModel || evolvesToModel) && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
                  <span className="text-[8.5px] text-indigo-400 font-bold uppercase tracking-wider mb-2.5 block">Evolution Line:</span>
                  <div className="flex flex-wrap items-center gap-3 justify-center text-xs">
                    {evolvesFromModel && (
                      <button 
                        onClick={() => onSelectPokemon(evolvesFromModel.pokemon[0].Pokemon)}
                        className="flex items-center gap-2 bg-black/35 hover:bg-black/50 border border-white/5 p-1.5 pr-3 rounded-xl transition text-left cursor-pointer group"
                      >
                        <img src={evolvesFromModel.images?.normal?.front} alt={evolvesFromKey} className="w-8 h-8 object-contain pixelated group-hover:scale-105 transition" />
                        <div>
                          <div className="text-[7px] text-white/30 font-bold uppercase">Pre-evolution</div>
                          <div className="text-[10px] font-black text-white">{evolvesFromKey}</div>
                        </div>
                      </button>
                    )}

                    {evolvesFromModel && <ArrowRight className="w-4 h-4 text-white/20" />}

                    <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/25 p-1.5 pr-3 rounded-xl">
                      <img src={normalFront} alt={pokemonName} className="w-8 h-8 object-contain pixelated" />
                      <div>
                        <div className="text-[7px] text-indigo-400 font-bold uppercase">Current</div>
                        <div className="text-[10px] font-black text-white">{pokemonName}</div>
                      </div>
                    </div>

                    {evolvesToModel && <ArrowRight className="w-4 h-4 text-white/20" />}

                    {evolvesToModel && (
                      <button 
                        onClick={() => onSelectPokemon(evolution.to)}
                        className="flex items-center gap-2 bg-black/35 hover:bg-black/50 border border-white/5 p-1.5 pr-3 rounded-xl transition text-left cursor-pointer group"
                      >
                        <img src={evolvesToModel.images?.normal?.front} alt={evolution.to} className="w-8 h-8 object-contain pixelated group-hover:scale-105 transition" />
                        <div>
                          <div className="text-[7px] text-white/30 font-bold uppercase">Evolves at Lvl {evolution.level}</div>
                          <div className="text-[10px] font-black text-white">{evolution.to}</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Moves Learnset List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
                <span className="text-[8.5px] text-indigo-400 font-bold uppercase tracking-wider mb-2 block">Level Up Learnset:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {learnset.map(move => (
                    <div 
                      key={move.name} 
                      className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/[0.03] text-[10px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                          Lv.{move.level}
                        </span>
                        <span className="font-bold text-white">{move.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] opacity-60">Power: {move.power}</span>
                        <span className={`type-badge type-${move.type.toLowerCase()} scale-75`}>
                          {move.type.slice(0, 3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
