import React, { useState } from 'react';
import { MOVES } from '../data/moves';
import { TYPES } from '../data/typeModifiers.js';
import { EVOLUTIONS } from '../data/evolutions.js';
import { POKEDEX } from '../data/db.js';
import { HelpCircle, Sparkles, BookOpen, Layers, Flame, ArrowRight } from 'lucide-react';

export const WikiPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<'types' | 'moves' | 'evolutions' | 'mechanics'>('types');
  const [hoverType, setHoverType] = useState<string | null>(null);

  const typeList = Object.keys(TYPES);

  // Group evolutions logically
  const evolutionList = Object.entries(EVOLUTIONS).map(([from, data]: any) => ({
    from,
    to: data.to,
    level: data.level
  }));

  const getEffectivenessColor = (val: number) => {
    if (val === 2) return 'text-emerald-400 font-black bg-emerald-500/10';
    if (val === 0.5) return 'text-amber-400 font-bold bg-amber-500/10';
    if (val === 0.25 || val === 0) return 'text-red-400 font-bold bg-red-500/10';
    return 'text-white/40';
  };

  return (
    <div className="wiki-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none">PokéWiki</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Game guides, database, and mechanics</p>

        {/* Sub-tabs Selector */}
        <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 mt-2">
          {[
            { id: 'types', label: 'Types', icon: <Flame className="w-3 h-3" /> },
            { id: 'moves', label: 'Moves', icon: <Layers className="w-3 h-3" /> },
            { id: 'evolutions', label: 'Evolve', icon: <Sparkles className="w-3 h-3" /> },
            { id: 'mechanics', label: 'FAQ', icon: <HelpCircle className="w-3 h-3" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`text-[9px] py-1.5 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                subTab === tab.id
                  ? 'bg-indigo-600 text-white font-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* Sub-tab: Type Chart Matrix */}
        {subTab === 'types' && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-white/50 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5 mb-1">
              💡 Attacking types are listed on the **left**, defending types are along the **top**. Hover/select a row to check target modifiers.
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-2xl bg-black/35 scrollbar-thin">
              <table className="w-full text-center border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40">
                    <th className="p-1 text-left text-white/45 font-bold sticky left-0 bg-[#08090c] z-10 w-16">Atk \ Def</th>
                    {typeList.map(type => (
                      <th key={type} className="p-1 min-w-[32px] text-white/60 font-black">
                        <span className={`type-badge type-${type.toLowerCase()} scale-75 inline-block`}>
                          {type.slice(0, 3)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typeList.map(atkType => {
                    const isHovered = hoverType === atkType;
                    return (
                      <tr
                        key={atkType}
                        onMouseEnter={() => setHoverType(atkType)}
                        onMouseLeave={() => setHoverType(null)}
                        className={`border-b border-white/[0.03] transition-colors ${
                          isHovered ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="p-1 text-left font-black text-white sticky left-0 bg-[#111318] border-r border-white/5 z-10">
                          <span className={`type-badge type-${atkType.toLowerCase()} w-full block text-center`}>
                            {atkType}
                          </span>
                        </td>
                        {typeList.map(defType => {
                          const multiplier = TYPES[atkType]?.[defType] ?? 1.0;
                          return (
                            <td
                              key={defType}
                              className={`p-1.5 font-mono ${getEffectivenessColor(multiplier)}`}
                            >
                              {multiplier === 2 ? '2x' : multiplier === 0.5 ? '½x' : multiplier === 0.25 ? '¼x' : multiplier === 0 ? '0' : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-tab: Moves Directory */}
        {subTab === 'moves' && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-white/50 bg-black/20 p-2 rounded-xl border border-white/5 mb-1 leading-relaxed">
              💡 Moves are categorized by Type. Basic attacks trigger early game, advanced attacks trigger at higher levels.
            </div>

            <div className="flex flex-col gap-2">
              {Object.entries(MOVES).map(([typeName, moves]) => (
                <div key={typeName} className="bg-white/[0.02] border border-white/5 rounded-2xl p-2.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`type-badge type-${typeName.toLowerCase()}`}>{typeName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-black/35 p-2 rounded-xl border border-white/5">
                      <div className="text-[8px] text-white/40 uppercase font-black">Basic Attack</div>
                      <div className="font-bold text-white mt-0.5">{moves.basic.name}</div>
                      <div className="text-[9px] text-indigo-400 mt-0.5">Power: {moves.basic.power}</div>
                    </div>
                    <div className="bg-indigo-600/5 p-2 rounded-xl border border-indigo-500/10">
                      <div className="text-[8px] text-indigo-400/80 uppercase font-black">Advanced Attack</div>
                      <div className="font-bold text-white mt-0.5">{moves.advanced.name}</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">Power: {moves.advanced.power}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-tab: Evolution Guide */}
        {subTab === 'evolutions' && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-white/50 bg-black/20 p-2 rounded-xl border border-white/5 mb-1 leading-relaxed">
              💡 Once a Pokémon passes its evolutionary level, click the Evolve button in the **Manage Team** panel to trigger manual evolution.
            </div>

            <div className="flex flex-col gap-1.5">
              {evolutionList.map(evol => {
                const fromModel = POKEDEX.find(p => p.pokemon[0].Pokemon === evol.from);
                const toModel = POKEDEX.find(p => p.pokemon[0].Pokemon === evol.to);

                return (
                  <div key={evol.from} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition">
                    <div className="flex items-center gap-2">
                      {fromModel && (
                        <img src={fromModel.images.normal.front} alt={evol.from} className="w-8 h-8 object-contain pixelated" />
                      )}
                      <span className="text-xs font-bold text-white">{evol.from}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                      <span>Level {evol.level}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{evol.to}</span>
                      {toModel && (
                        <img src={toModel.images.normal.front} alt={evol.to} className="w-8 h-8 object-contain pixelated" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-tab: FAQs & Mechanics */}
        {subTab === 'mechanics' && (
          <div className="flex flex-col gap-3">
            {[
              {
                title: '✨ How do I find Shiny Pokémon?',
                content: `Shiny Pokémon spawn in the wild with a custom chance of **1 in 128 (0.78%)**. A shiny has a custom visual glowing star badge, alternative palette sprites, and will trigger a Masterball auto-catch fallback if one exists in your bag.`
              },
              {
                title: '🔴 Catch Rates & Pokéball Modifiers',
                content: `Catch calculations are checked automatically upon defeating wild Pokémon. Modified catch formulas evaluate the base catch rates of species times ball power modifiers:\n• Poké Ball: 1× modifier\n• Great Ball: 1.5× modifier\n• Ultra Ball: 2× modifier\n• Master Ball: 255× (instant success)`
              },
              {
                title: '💤 Offline Grinding / Sleep Mode',
                content: `When you close the game tab, your first roster slot Pokémon will calculate offline grinding (up to a max of 12 hours) based on your route speeds, yielding continuous EXP divides to benched teammates, custom money outputs, and capped wild catches direct to your Box.`
              },
              {
                title: '⚔️ Damage Math & Type Modifiers',
                content: `Your active combat fighter matches its speed metric against wild speed bars. Once complete, it selects basic or advanced attacks, multiplier-scales against type weaknesses (e.g. 2× super effective, ½× resistant), and rolls critical hit checks for bonus gains.`
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {faq.title}
                </h3>
                <p className="text-[10px] text-white/50 mt-1.5 leading-relaxed whitespace-pre-line">
                  {faq.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
