import React, { useState } from 'react';
import type { PokemonInstance, ActiveMove, PokeballInventory } from '../types/pokemon';
import { EVOLUTIONS } from '../data/evolutions';
import { NATURES } from '../data/learnsets';

interface PokemonDetailsModalProps {
  poke: PokemonInstance;
  inventory: PokeballInventory;
  onClose: () => void;
  onEvolve: () => void;
  onRelease: () => void;
  onSwapBox: () => void;
  onEquipItem: (item: string | null) => void;
  onManageMoves: () => void;
  isInParty: boolean;
}

export const PokemonDetailsModal: React.FC<PokemonDetailsModalProps> = ({
  poke,
  inventory,
  onClose,
  onEvolve,
  onRelease,
  onSwapBox,
  onEquipItem,
  onManageMoves,
  isInParty
}) => {
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  // Defaults
  const ivs = poke.ivs || { hp: 15, attack: 15, defense: 15, spAtk: 15, spDef: 15, speed: 15 };
  const evs = poke.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
  const nature = poke.nature || 'Hardy';
  const ability = poke.ability || 'None';
  const heldItem = poke.heldItem || null;

  const totalIvs = ivs.hp + ivs.attack + ivs.defense + ivs.spAtk + ivs.spDef + ivs.speed;
  const totalEvs = evs.hp + evs.attack + evs.defense + evs.spAtk + evs.spDef + evs.speed;

  // Nature color styling
  const natureInfo = NATURES.find(n => n.name === nature) || { name: 'Hardy', increased: null, decreased: null };
  const getStatStyle = (statName: string) => {
    if (natureInfo.increased === statName) return 'text-emerald-400 font-bold'; // green indicator
    if (natureInfo.decreased === statName) return 'text-red-400 font-bold'; // red indicator
    return 'text-zinc-300';
  };

  // Evolution info
  const evolInfo = EVOLUTIONS[poke.name];

  // SVG Radar calculations
  // Angle order: HP (0), ATK (60), DEF (120), SPE (180), SPD (240), SPA (300)
  const statsOrder: (keyof typeof evs)[] = ['hp', 'attack', 'defense', 'speed', 'spDef', 'spAtk'];
  const center = 100;
  const maxRadius = 75;

  const getCoordinates = (index: number, value: number, max: number) => {
    const angle = (index * Math.PI) / 3 - Math.PI / 2; // Subtract PI/2 to point HP straight up
    const r = (value / max) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Grid background lines for 25%, 50%, 75%, 100%
  const gridLines = [0.25, 0.5, 0.75, 1.0].map((scale, gridIdx) => {
    const points = statsOrder.map((_, i) => {
      const { x, y } = getCoordinates(i, scale * 252, 252);
      return `${x},${y}`;
    }).join(' ');
    return (
      <polygon
        key={`grid-${gridIdx}`}
        points={points}
        fill="none"
        stroke="white"
        strokeOpacity="0.05"
        strokeWidth="1"
      />
    );
  });

  // Main EV polygon points
  const evPoints = statsOrder.map((key, i) => {
    const val = evs[key];
    const { x, y } = getCoordinates(i, val, 252);
    return `${x},${y}`;
  }).join(' ');

  // Labels coordinates
  const labelPositions = statsOrder.map((key, i) => {
    const { x, y } = getCoordinates(i, 252, 252);
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const dx = Math.cos(angle) * 16;
    const dy = Math.sin(angle) * 10;
    return {
      name: key.substring(0, 3).toUpperCase(),
      x: x + dx,
      y: y + dy
    };
  });

  // Held items list
  const availableItems = Object.entries(inventory.heldItems || {}).filter(([_, qty]) => qty > 0);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Normal: 'bg-zinc-400 text-black',
      Fire: 'bg-orange-500 text-white',
      Water: 'bg-blue-500 text-white',
      Grass: 'bg-emerald-500 text-white',
      Electric: 'bg-yellow-400 text-black',
      Ice: 'bg-cyan-400 text-black',
      Fighting: 'bg-red-600 text-white',
      Poison: 'bg-purple-500 text-white',
      Ground: 'bg-amber-600 text-white',
      Flying: 'bg-indigo-400 text-white',
      Psychic: 'bg-pink-500 text-white',
      Bug: 'bg-lime-600 text-white',
      Rock: 'bg-yellow-700 text-white',
      Ghost: 'bg-violet-700 text-white',
      Dragon: 'bg-violet-800 text-white',
      Steel: 'bg-slate-400 text-black'
    };
    return colors[type] || 'bg-zinc-500 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="p-6 border-b border-white/5 bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
              <img
                src={poke.image}
                alt={poke.name}
                className="w-16 h-16 object-contain pixelated"
              />
              {poke.isShiny && (
                <span className="absolute top-1 right-1 text-yellow-400 text-xs">✨</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-wide">{poke.name}</h3>
                <span className="text-xs text-zinc-500 font-medium">Lv. {poke.level}</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono">
                  {poke.quality || 'Common'}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {poke.types.map(t => (
                  <span
                    key={t}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getTypeColor(t)}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Inner Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          
          {/* Column 1: Info Card, Nature, Ability, Held Items */}
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pokémon Details</h4>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Nature:</span>
                  <span className="text-white font-semibold flex items-center space-x-1">
                    <span>{nature}</span>
                    {natureInfo.increased && (
                      <span className="text-[10px] text-emerald-400">({natureInfo.increased.substring(0,3)}▲)</span>
                    )}
                    {natureInfo.decreased && (
                      <span className="text-[10px] text-red-400">({natureInfo.decreased.substring(0,3)}▼)</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Ability:</span>
                  <span className="text-white font-semibold">{ability}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Gender:</span>
                  <span className={`font-bold ${poke.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                    {poke.gender === 'male' ? '♂ Male' : '♀ Female'}
                  </span>
                </div>

                {/* Held Item Slot */}
                <div className="py-2">
                  <span className="text-zinc-400 block text-xs mb-1.5">Held Item:</span>
                  <div className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-xs font-semibold text-white">
                      {heldItem ? `📦 ${heldItem.toUpperCase()}` : 'None Equipped'}
                    </span>
                    <div className="flex space-x-1.5">
                      {heldItem && (
                        <button
                          onClick={() => onEquipItem(null)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Take
                        </button>
                      )}
                      <button
                        onClick={() => setShowItemDropdown(!showItemDropdown)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                      >
                        {heldItem ? 'Change' : 'Give item...'}
                      </button>
                    </div>
                  </div>

                  {/* Dropdown for item selection */}
                  {showItemDropdown && (
                    <div className="mt-2 p-2 bg-slate-950 border border-white/10 rounded-xl space-y-1 max-h-40 overflow-y-auto">
                      <div className="text-[10px] text-zinc-500 font-bold px-1.5 py-1">YOUR INVENTORY</div>
                      {availableItems.length === 0 ? (
                        <div className="text-[10px] text-zinc-400 italic px-1.5 py-1">No held items in bag. Purchase them in the Shop.</div>
                      ) : (
                        availableItems.map(([item, qty]) => (
                          <button
                            key={item}
                            onClick={() => {
                              onEquipItem(item);
                              setShowItemDropdown(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-white/5 text-xs text-zinc-300 rounded-lg flex justify-between items-center"
                          >
                            <span className="capitalize">{item}</span>
                            <span className="text-zinc-500 text-[10px]">x{qty}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Evolution Card */}
            {evolInfo ? (
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Evolution Line</h4>
                <div className="flex items-center justify-between p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl">
                  <div className="text-xs">
                    <span className="text-zinc-400">To </span>
                    <strong className="text-white">{evolInfo.to}</strong>
                    <span className="text-zinc-400"> at </span>
                    <strong className="text-indigo-400 font-mono">Lv. {evolInfo.level}</strong>
                  </div>
                  <button
                    onClick={onEvolve}
                    disabled={poke.level < Number(evolInfo.level)}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    Evolve
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center text-xs text-zinc-500 italic">
                This Pokémon has reached its final evolution state.
              </div>
            )}
          </div>

          {/* Column 2: Stats display & EV Progress Bars */}
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Combat Stats</h4>
              
              <div className="space-y-3">
                {/* HP */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-zinc-400">HP:</span>
                    <span className="text-white font-mono font-semibold">{poke.currentHp} / {poke.maxHp}</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(poke.currentHp / poke.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Attack */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className={getStatStyle('attack')}>Attack:</span>
                  <span className="text-white font-mono font-semibold">{poke.attack}</span>
                </div>

                {/* Defense */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className={getStatStyle('defense')}>Defense:</span>
                  <span className="text-white font-mono font-semibold">{poke.defense}</span>
                </div>

                {/* Sp Atk */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className={getStatStyle('spAtk')}>Sp. Atk:</span>
                  <span className="text-white font-mono font-semibold">{poke.spAtk || poke.attack}</span>
                </div>

                {/* Sp Def */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className={getStatStyle('spDef')}>Sp. Def:</span>
                  <span className="text-white font-mono font-semibold">{poke.spDef || poke.defense}</span>
                </div>

                {/* Speed */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className={getStatStyle('speed')}>Speed:</span>
                  <span className="text-white font-mono font-semibold">{poke.speed}</span>
                </div>
              </div>
            </div>

            {/* Active Moves board */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Moves</h4>
                <button
                  onClick={onManageMoves}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  Manage moves
                </button>
              </div>

              <div className="space-y-1.5">
                {(poke.moves || []).map(m => (
                  <div
                    key={m.name}
                    className="p-2 bg-black/30 border border-white/5 rounded-xl flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-md ${getTypeColor(m.type)}`}>
                        {m.type}
                      </span>
                      <span className="font-semibold text-white">{m.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      <span>Pwr: {m.power}</span>
                      <span className="ml-2">PP: {m.pp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: EV training polygon & EV/IV totals */}
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-4 flex flex-col items-center">
            <div className="w-full">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left">EV Training Radar</h4>
            </div>

            {/* SVG Radar Chart */}
            <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center my-2">
              <svg width="200" height="200" className="overflow-visible">
                {/* Outer bounding lines */}
                {gridLines}

                {/* Stat label text */}
                {labelPositions.map((lbl, idx) => (
                  <text
                    key={lbl.name}
                    x={lbl.x}
                    y={lbl.y}
                    fill="#a1a1aa"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {lbl.name}
                  </text>
                ))}

                {/* EV Polygon Area */}
                {evPoints.trim() && (
                  <polygon
                    points={evPoints}
                    fill="#6366f1"
                    fillOpacity="0.4"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>

            {/* EV & IV Bars */}
            <div className="w-full space-y-3 pt-2 border-t border-white/5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-400 font-medium">EV Total:</span>
                  <span className="text-white font-mono font-bold">{totalEvs} / 510</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(totalEvs / 510) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-400 font-medium">IV Sum:</span>
                  <span className="text-white font-mono font-bold">{totalIvs} / 186</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${(totalIvs / 186) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500 italic mt-1 text-center">
                  Average IV: {Math.round((totalIvs / 186) * 100)}%
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions Card Footer */}
        <div className="p-4 bg-slate-950/40 border-t border-white/5 flex justify-between items-center flex-wrap gap-2">
          <div className="flex space-x-2">
            {evolInfo && (
              <button
                onClick={onEvolve}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                ⚡ Evolve ({evolInfo.to})
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to release ${poke.name}? This action cannot be undone.`)) {
                  onRelease();
                }
              }}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Release
            </button>
            <button
              onClick={onSwapBox}
              className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              {isInParty ? '← Box' : '← Party'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
          >
            Close Card
          </button>
        </div>

      </div>
    </div>
  );
};
