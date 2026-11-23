import React, { useState, useEffect } from 'react';
import type { PokemonInstance, ActiveMove } from '../types/pokemon';
import { getLearnableMoves, TMS_CONFIG } from '../data/learnsets';

interface ManageMovesModalProps {
  poke: PokemonInstance;
  tms?: { [tmId: string]: number };
  onTeachTM?: (tmId: string) => boolean;
  onClose: () => void;
  onSave: (activeMoves: ActiveMove[]) => void;
}

export const ManageMovesModal: React.FC<ManageMovesModalProps> = ({
  poke,
  tms,
  onTeachTM,
  onClose,
  onSave
}) => {
  // Load learnable database to get exact details like power, type, pp, cooldown
  const learnableDatabase = getLearnableMoves(poke.name, poke.types);
  
  // Set of moves this specific Pokemon instance actually has unlocked (level-up learned + TMs)
  const learnedList = poke.learnedMoves || [];

  // Moves learned from a TM are not part of the level-up learnset, so merge
  // their real metadata in - otherwise they could be taught but never equipped.
  const tmDatabase = Object.values(TMS_CONFIG)
    .filter(tm => learnedList.includes(tm.name) && !learnableDatabase.some(m => m.name === tm.name))
    .map(tm => ({
      name: tm.name,
      type: tm.type,
      power: tm.power,
      accuracy: tm.accuracy,
      level: 0,
      pp: tm.pp,
      cooldownMs: tm.cooldownMs
    }));
  const moveDatabase = [...learnableDatabase, ...tmDatabase];

  const [activeMoves, setActiveMoves] = useState<ActiveMove[]>([]);
  const [tmMessage, setTmMessage] = useState<string | null>(null);

  // Only offer a TM when it can actually be taught: the Pokémon must be able
  // to learn the move (it is in the learnset or the TM type matches one of the
  // Pokémon's types) and the move must have full metadata to be equipped.
  const tmOptions = Object.values(TMS_CONFIG)
    .filter(tm => (tms?.[tm.id] || 0) > 0)
    .map(tm => {
      const inLearnset = learnableDatabase.some(m => m.name === tm.name);
      const typeMatch = poke.types?.includes(tm.type) || false;
      const compatible = (inLearnset || typeMatch) && tm.power > 0 && tm.pp > 0;
      return { tm, inLearnset, typeMatch, compatible, known: learnedList.includes(tm.name) };
    });

  useEffect(() => {
    if (poke.moves) {
      setActiveMoves([...poke.moves]);
    }
  }, [poke]);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextList = [...activeMoves];
    const temp = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = temp;
    setActiveMoves(nextList);
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeMoves.length - 1) return;
    const nextList = [...activeMoves];
    const temp = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = temp;
    setActiveMoves(nextList);
  };

  const handleRemoveMove = (index: number) => {
    const nextList = [...activeMoves];
    nextList.splice(index, 1);
    setActiveMoves(nextList);
  };

  const handleAddMove = (moveName: string) => {
    if (activeMoves.length >= 4) return;
    if (activeMoves.some(m => m.name === moveName)) return;

    // Find move details in the learnset + taught-TM database
    const dbMove = moveDatabase.find(m => m.name === moveName);
    if (!dbMove) return;

    const newMove: ActiveMove = {
      name: dbMove.name,
      type: dbMove.type,
      power: dbMove.power,
      maxPp: dbMove.pp,
      pp: dbMove.pp,
      cooldownMs: dbMove.cooldownMs,
      lastUsed: 0
    };

    setActiveMoves([...activeMoves, newMove]);
  };

  const handleOptimize = () => {
    // Select top 4 highest power moves from learned list
    const sortedLearned = [...learnedList]
      .map(name => moveDatabase.find(m => m.name === name))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .sort((a, b) => b.power - a.power);

    const optimized = sortedLearned.slice(0, 4).map(m => ({
      name: m.name,
      type: m.type,
      power: m.power,
      maxPp: m.pp,
      pp: m.pp,
      cooldownMs: m.cooldownMs,
      lastUsed: 0
    }));

    setActiveMoves(optimized);
  };

  const handleTeachTM = (tmId: string) => {
    if (!onTeachTM) return;
    const tm = TMS_CONFIG[tmId];
    const ok = onTeachTM(tmId);
    setTmMessage(
      ok
        ? `\u2705 ${tm?.name || 'Move'} taught to ${poke.name}!`
        : `\u274c ${poke.name} already knows ${tm?.name || 'that move'}.`
    );
    setTimeout(() => setTmMessage(null), 2500);
  };

  const handleReset = () => {
    if (poke.moves) {
      setActiveMoves([...poke.moves]);
    }
  };

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
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Manage Moves</h3>
            <p className="text-xs text-zinc-400">Configure combat moves for {poke.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Active Moves Set (Max 4) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-300">Active Moves ({activeMoves.length}/4)</span>
              {activeMoves.length === 0 && (
                <span className="text-xs text-red-400">Add at least one move!</span>
              )}
            </div>

            <div className="space-y-2">
              {activeMoves.map((move, index) => (
                <div
                  key={move.name + '-' + index}
                  className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-zinc-500 w-4">#{index + 1}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getTypeColor(move.type)}`}>
                      {move.type}
                    </span>
                    <span className="text-sm font-semibold text-white">{move.name}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-xs">
                      <span className="text-zinc-400">Pwr: </span>
                      <span className="text-white font-mono font-semibold">{move.power}</span>
                      <span className="text-zinc-500 ml-2">PP: </span>
                      <span className="text-white font-mono font-semibold">{move.pp}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === activeMoves.length - 1}
                        className="p-1 text-zinc-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleRemoveMove(index)}
                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Remove Move"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {activeMoves.length === 0 && (
                <div className="text-center py-6 text-sm text-zinc-500 italic bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                  No moves equipped. Click '+' below to assign.
                </div>
              )}
            </div>
          </div>

          {/* Available / Learned Bank */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-zinc-300">Available Moves ({learnedList.length})</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {moveDatabase.map(dbMove => {
                const isUnlocked = learnedList.includes(dbMove.name);
                const isActive = activeMoves.some(m => m.name === dbMove.name);

                return (
                  <div
                    key={dbMove.name}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isUnlocked
                        ? 'bg-slate-950/30 border-white/5 hover:bg-slate-950/50'
                        : 'bg-black/40 border-dashed border-white/5 opacity-40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${getTypeColor(dbMove.type)}`}>
                          {dbMove.type}
                        </span>
                        <span className="text-xs font-semibold text-white">{dbMove.name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {isUnlocked ? (
                          <span>Pwr: <strong className="text-zinc-200">{dbMove.power}</strong> | PP: <strong className="text-zinc-200">{dbMove.pp}</strong></span>
                        ) : dbMove.level === 0 ? (
                          <span className="text-indigo-400 font-medium">Learnable via TM</span>
                        ) : (
                          <span className="text-indigo-400 font-medium">Unlocks at Level {dbMove.level}</span>
                        )}
                      </div>
                    </div>

                    {isUnlocked && (
                      isActive ? (
                        <span className="text-emerald-400 text-xs font-bold px-2 py-1">✓ Equipped</span>
                      ) : (
                        <button
                          onClick={() => handleAddMove(dbMove.name)}
                          disabled={activeMoves.length >= 4}
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 disabled:opacity-40 disabled:hover:bg-indigo-600/20 disabled:hover:border-indigo-500/20 transition-all"
                        >
                          + Equip
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

          {/* TM MACHINES */}
          {tmOptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-300">TM Machines</h4>
              {tmMessage && (
                <div className="text-xs font-semibold text-white/80 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
                  {tmMessage}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tmOptions.map(({ tm, compatible, known }) => (
                  <div
                    key={tm.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                      compatible
                        ? 'bg-slate-950/30 border-white/5'
                        : 'bg-black/40 border-dashed border-white/5 opacity-40'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${getTypeColor(tm.type)}`}>
                          {tm.type}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{tm.name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {known ? (
                          <span className="text-emerald-400 font-medium">Already known</span>
                        ) : compatible ? (
                          <span>Pwr: <strong className="text-zinc-200">{tm.power}</strong> | PP: <strong className="text-zinc-200">{tm.pp}</strong></span>
                        ) : (
                          <span className="text-zinc-500">Not compatible with {poke.name}</span>
                        )}
                      </div>
                    </div>
                    {compatible && !known && (
                      <button
                        onClick={() => handleTeachTM(tm.id)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all whitespace-nowrap"
                      >
                        Teach
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Footer controls */}
        <div className="p-4 bg-slate-950/40 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleOptimize}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
            >
              ⚡ Optimize
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white font-semibold text-xs px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (activeMoves.length === 0) return;
                onSave(activeMoves);
                onClose();
              }}
              disabled={activeMoves.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors"
            >
              Save Setup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
