import React, { useState, useMemo } from 'react';
import { Sparkles, Trash2, Plus, ArrowUpDown, Grid3X3, List } from 'lucide-react';
import type { PokemonInstance } from '../types/pokemon';
import { getDexNumber } from '../data/dexNumbers';

type SortKey = 'level' | 'dex' | 'attack' | 'newest' | 'quality';

interface BoxPanelProps {
  box: PokemonInstance[];
  activeTeam: PokemonInstance[];
  releasePokemon: (id: string) => void;
  onAddToTeam: (poke: PokemonInstance) => void;
  onSelectDetail?: (poke: PokemonInstance) => void;
}

export const BoxPanel: React.FC<BoxPanelProps> = ({
  box,
  activeTeam,
  releasePokemon,
  onAddToTeam,
  onSelectDetail
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [sortAsc, setSortAsc] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedBox = useMemo(() => {
    let filtered = [...box];
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'level': cmp = a.level - b.level; break;
        case 'dex': {
          const aDex = getDexNumber(a.model?.pokemon?.[0]?.Pokemon);
          const bDex = getDexNumber(b.model?.pokemon?.[0]?.Pokemon);
          cmp = aDex - bDex;
          break;
        }
        case 'attack': cmp = a.attack - b.attack; break;
        case 'newest': cmp = a.caughtAt - b.caughtAt; break;
        case 'quality': {
          const rank = { Epic: 5, Rare: 4, Uncommon: 3, Common: 2, Weak: 1 };
          const aVal = rank[a.quality || 'Common'] || 0;
          const bVal = rank[b.quality || 'Common'] || 0;
          cmp = aVal - bVal;
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });
    return filtered;
  }, [box, sortKey, sortAsc, searchQuery]);

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'Epic': return 'bg-purple-500';
      case 'Rare': return 'bg-blue-500';
      case 'Uncommon': return 'bg-emerald-500';
      case 'Weak': return 'bg-white/20';
      default: return 'bg-white/50';
    }
  };

  const canAddToTeam = activeTeam.length < 6;

  return (
    <div className="box-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none">PC Box</h2>
            <p className="text-[10px] text-white/40 mt-0.5">{box.length} Pokémon stored</p>
          </div>
          <button
            onClick={() => setCompactView(!compactView)}
            className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"
            title={compactView ? 'List view' : 'Grid view'}
          >
            {compactView ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mt-2 bg-black/30 border border-white/5 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-white/20 focus:border-indigo-500/30"
        />

        {/* Sort Controls */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <ArrowUpDown className="w-3 h-3 text-white/30 flex-shrink-0" />
          {(['newest', 'level', 'dex', 'attack', 'quality'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => {
                if (sortKey === key) {
                  setSortAsc(!sortAsc);
                } else {
                  setSortKey(key);
                  setSortAsc(false);
                }
              }}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all capitalize ${
                sortKey === key
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
                  : 'bg-white/5 border border-transparent text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {key === 'dex' ? 'Dex#' : key}
              {sortKey === key && (sortAsc ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Pokemon Grid/List */}
      <div className={`flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${
        compactView ? 'grid grid-cols-3 gap-1.5 auto-rows-min content-start' : 'flex flex-col gap-1.5'
      }`}>
        {sortedBox.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-8 text-white/30 border border-dashed border-white/10 rounded-2xl ${compactView ? 'col-span-3' : ''}`}>
            <span className="text-xs font-semibold">{searchQuery ? 'No matches found.' : 'Box is empty. Go catch Pokémon!'}</span>
          </div>
        ) : compactView ? (
          // Compact Grid View
          sortedBox.map(poke => (
            <div
              key={poke.id}
              onClick={() => onSelectDetail?.(poke)}
              className="relative bg-white/[0.03] border border-white/5 rounded-xl p-1.5 flex flex-col items-center hover:bg-white/[0.06] transition cursor-pointer group"
            >
              {/* Quality dot */}
              {poke.quality && (
                <div className={`absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full ${getQualityColor(poke.quality)}`} title={poke.quality} />
              )}
              <img src={poke.image} alt={poke.name} className="w-8 h-8 object-contain pixelated" />
              <span className="text-[8px] font-bold text-white/70 truncate w-full text-center">{poke.name}</span>
              <div className="flex gap-1 items-center text-[7px] text-white/30 font-bold">
                <span>Lv.{poke.level}</span>
                {poke.iv !== undefined && <span>({poke.iv}%)</span>}
              </div>
              {poke.isShiny && (
                <Sparkles className="w-2.5 h-2.5 text-yellow-400 absolute top-0.5 right-0.5" />
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {canAddToTeam && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToTeam(poke);
                    }}
                    className="text-[8px] bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-300 p-1 rounded-lg"
                    title="Add to team"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmRelease(poke.id);
                  }}
                  className="text-[8px] bg-red-500/30 hover:bg-red-500/50 text-red-300 p-1 rounded-lg"
                  title="Release"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          // List View
          sortedBox.map(poke => (
            <div
              key={poke.id}
              onClick={() => onSelectDetail?.(poke)}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 bg-black/30 rounded-lg flex items-center justify-center border border-white/5 flex-shrink-0">
                  <img src={poke.image} alt={poke.name} className="w-7 h-7 object-contain pixelated" />
                  {poke.isShiny && (
                    <Sparkles className="w-2.5 h-2.5 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] font-bold text-white truncate">{poke.name}</span>
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
                        <span key={t} className={`type-badge type-${t.toLowerCase()}`} style={{ fontSize: '6px', padding: '0px 2px' }}>
                          {t.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] text-white/40 flex gap-2 flex-wrap">
                    <span>Lv.{poke.level}</span>
                    <span>⚔{poke.attack}</span>
                    <span>🛡{poke.defense}</span>
                    {poke.iv !== undefined && <span className="text-indigo-400 font-bold">IV {poke.iv}%</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                {canAddToTeam && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToTeam(poke);
                    }}
                    className="text-[9px] flex items-center gap-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-1 rounded-lg text-indigo-400 font-bold transition"
                  >
                    <Plus className="w-3 h-3" /> Team
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmRelease(poke.id);
                  }}
                  className="text-[9px] flex items-center gap-0.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-1.5 py-1 rounded-lg text-red-400 font-bold transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Release Modal */}
      {confirmRelease && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-md" onClick={() => setConfirmRelease(null)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-5 max-w-xs w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-bold text-white mb-2">Release Pokémon?</div>
            <p className="text-[11px] text-white/50 mb-4">
              This will release <strong className="text-white">{box.find(p => p.id === confirmRelease)?.name}</strong> and earn you ¤{(box.find(p => p.id === confirmRelease)?.level || 1) * 10}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRelease(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  releasePokemon(confirmRelease);
                  setConfirmRelease(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
              >
                Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
