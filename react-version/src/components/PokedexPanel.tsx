import React, { useState, useMemo } from 'react';
import { POKEDEX } from '../data/db.js';
import { Search, Sparkles, Check } from 'lucide-react';
import { PokedexDetailModal } from './PokedexDetailModal';
import { getDexNumber } from '../data/dexNumbers';

type FilterMode = 'all' | 'caught' | 'uncaught' | 'seen' | 'shiny';

interface PokedexPanelProps {
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
}

export const PokedexPanel: React.FC<PokedexPanelProps> = ({ pokedex }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(null);

  const stats = useMemo(() => {
    const entries = Object.values(pokedex);
    const caught = entries.filter(e => e.caught).length;
    const seen = entries.filter(e => e.seen).length;
    const shinyCaught = entries.filter(e => e.shinyCaught).length;
    return { caught, seen, shinyCaught, total: POKEDEX.length };
  }, [pokedex]);

  const filteredList = useMemo(() => {
    return POKEDEX.filter((model) => {
      const name = model.pokemon[0].Pokemon;
      const dexNum = getDexNumber(name);
      const entry = pokedex[name] || { caught: false, seen: false, shinyCaught: false };
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(dexNum).includes(searchTerm) ||
                            String(dexNum).padStart(3, '0').includes(searchTerm);

      switch (filterMode) {
        case 'caught': return matchesSearch && entry.caught;
        case 'uncaught': return matchesSearch && entry.seen && !entry.caught;
        case 'seen': return matchesSearch && entry.seen;
        case 'shiny': return matchesSearch && entry.shinyCaught;
        default: return matchesSearch;
      }
    });
  }, [searchTerm, filterMode, pokedex]);

  const filters: { id: FilterMode; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: POKEDEX.length },
    { id: 'caught', label: 'Caught', count: stats.caught },
    { id: 'seen', label: 'Seen', count: stats.seen },
    { id: 'uncaught', label: 'Missing', count: stats.seen - stats.caught },
    { id: 'shiny', label: '✨ Shiny', count: stats.shinyCaught },
  ];

  return (
    <div className="pokedex-panel glass-card p-4 rounded-3xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest leading-none">Pokédex</h2>
        
        {/* Completion Stats Bar */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-1.5 text-center">
            <div className="text-[8px] text-emerald-400/60 font-bold uppercase">Caught</div>
            <div className="text-xs font-black text-emerald-400">{stats.caught}<span className="text-[8px] text-emerald-400/40">/{stats.total}</span></div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/15 rounded-xl p-1.5 text-center">
            <div className="text-[8px] text-blue-400/60 font-bold uppercase">Seen</div>
            <div className="text-xs font-black text-blue-400">{stats.seen}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/15 rounded-xl p-1.5 text-center">
            <div className="text-[8px] text-yellow-400/60 font-bold uppercase">Shiny</div>
            <div className="text-xs font-black text-yellow-400">{stats.shinyCaught}</div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[8px] text-white/30 font-bold mb-0.5">
            <span>Completion</span>
            <span>{Math.round((stats.caught / stats.total) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${(stats.caught / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            placeholder="Search by name or #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/30 border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-white/20 focus:border-indigo-500/30"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-2 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                filterMode === f.id
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
                  : 'bg-white/5 border border-transparent text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label} <span className="text-[8px] opacity-60">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pokédex Grid */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
          {filteredList.map((model) => {
            const name = model.pokemon[0].Pokemon;
            const dexNum = getDexNumber(name);
            const entry = pokedex[name] || { caught: false, seen: false, shinyCaught: false };
            const types = model.stats[0].types || [];
            const imgUrl = (entry.shinyCaught && model.images?.shiny?.front)
              ? model.images.shiny.front
              : model.images?.normal?.front || '';

            return (
              <div
                key={name}
                onClick={() => entry.seen && setSelectedPokemonName(name)}
                className={`relative rounded-xl p-1 border text-center transition-all duration-200 group ${
                  entry.seen ? 'cursor-pointer' : ''
                } ${
                  entry.caught
                    ? 'bg-emerald-500/[0.06] border-emerald-500/15 hover:border-emerald-500/30'
                    : entry.seen
                    ? 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    : 'bg-black/20 border-white/[0.03] opacity-40'
                }`}
                title={entry.caught ? `${name} — Caught${entry.shinyCaught ? ' (Shiny ✨)' : ''}` : entry.seen ? `${name} — Seen` : name}
              >
                {/* Dex Number */}
                <div className="text-[7px] text-white/20 font-mono font-bold">#{String(dexNum).padStart(3, '0')}</div>
                
                {/* Sprite */}
                <div className="w-full flex justify-center">
                  {entry.seen ? (
                    <img
                      src={imgUrl}
                      alt={name}
                      className={`w-8 h-8 object-contain pixelated ${!entry.caught ? 'opacity-40 grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-white/10 text-lg font-bold">?</div>
                  )}
                </div>

                {/* Name */}
                <div className={`text-[7px] font-bold truncate ${entry.caught ? 'text-white/80' : entry.seen ? 'text-white/40' : 'text-white/15'}`}>
                  {entry.seen ? name : '???'}
                </div>

                {/* Type dots */}
                {entry.seen && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {types.map((t: string) => (
                      <div key={t} className={`w-1.5 h-1.5 rounded-full type-${t.toLowerCase()}`} title={t} />
                    ))}
                  </div>
                )}

                {/* Status indicators */}
                {entry.caught && (
                  <div className="absolute top-0.5 right-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                )}
                {entry.shinyCaught && (
                  <div className="absolute top-0.5 left-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/30">
            <span className="text-xs font-semibold">No Pokémon match your filters.</span>
          </div>
        )}
      </div>

      {selectedPokemonName && (
        <PokedexDetailModal
          pokemonName={selectedPokemonName}
          pokedex={pokedex}
          onClose={() => setSelectedPokemonName(null)}
          onSelectPokemon={(name) => setSelectedPokemonName(name)}
        />
      )}
    </div>
  );
};
