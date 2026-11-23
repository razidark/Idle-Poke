import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, ShieldAlert, FileText, ClipboardList } from 'lucide-react';
import type { PokeballInventory, PokemonInstance } from '../types/pokemon';

interface MoveButtonProps {
  move: any;
  index: number;
  onClick: (index: number) => void;
}

const MoveButton: React.FC<MoveButtonProps> = ({ move, index, onClick }) => {
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

  return (
    <button
      disabled={move.pp <= 0 || cooldownLeft > 0}
      onClick={() => onClick(index)}
      className={`relative overflow-hidden rounded-xl border p-2 flex flex-col justify-between text-left transition-all active:scale-95 ${
        move.pp <= 0 
          ? 'bg-red-950/10 border-red-900/20 text-red-500/40 cursor-not-allowed'
          : cooldownLeft > 0
          ? 'bg-slate-900/50 border-slate-800 text-white/30 cursor-not-allowed'
          : `type-card type-${move.type.toLowerCase()} hover:brightness-110 cursor-pointer`
      }`}
      style={{
        minHeight: '52px'
      }}
    >
      {cooldownLeft > 0 && (
        <div 
          className="absolute inset-0 bg-black/60 pointer-events-none transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
      )}

      <div className="flex justify-between items-center w-full z-10">
        <span className="text-[10px] font-black uppercase tracking-wider">{move.name}</span>
        <span className={`text-[6px] font-bold uppercase px-1 rounded bg-black/30 border border-white/15`}>
          {move.type}
        </span>
      </div>

      <div className="flex justify-between items-end w-full mt-1.5 z-10 text-[8px] font-mono opacity-80">
        <span>Pwr: {move.power}</span>
        <span>{move.pp}/{move.maxPp} PP</span>
      </div>
    </button>
  );
};

interface BattleScreenProps {
  combatLogs: { id: string; text: string }[];
  activeBallType: keyof PokeballInventory;
  catchMode: 'none' | 'all' | 'new';
  inventory: PokeballInventory;
  healingCooldown: number;
  setActiveBallType: (type: keyof PokeballInventory) => void;
  setCatchMode: (mode: 'none' | 'all' | 'new') => void;
  activeTrainer: any | null;
  activeRouteName: string;
  autoPotion: boolean;
  setAutoPotion: (val: boolean) => void;
  autoRevive: boolean;
  setAutoRevive: (val: boolean) => void;
  captureLog: {
    id: string;
    name: string;
    level: number;
    iv: number;
    quality: 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Weak';
    ballType: string;
    isShiny: boolean;
    timestamp: number;
  }[];
  battleSpeed: '1x' | '3x' | '5x';
  setBattleSpeed: (speed: '1x' | '3x' | '5x') => void;
  activeFighter: PokemonInstance | null;
  clickMove: (idx: number) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  combatLogs,
  activeBallType,
  catchMode,
  inventory,
  healingCooldown,
  setActiveBallType,
  setCatchMode,
  activeTrainer,
  activeRouteName,
  autoPotion,
  setAutoPotion,
  autoRevive,
  setAutoRevive,
  captureLog,
  battleSpeed,
  setBattleSpeed,
  activeFighter,
  clickMove
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showCaptureLog, setShowCaptureLog] = useState(false);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLogs]);

  return (
    <div className="flex flex-col p-4 gap-3.5 h-full min-h-0 relative select-none">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">
            {activeTrainer ? `🏆 Championship` : '🌲 Encounter zone'}
          </span>
          <h2 className="text-xs font-black uppercase text-white leading-none mt-1">{activeRouteName}</h2>
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end">
          {/* Catch Settings Mode */}
          <div className="flex gap-0.5 items-center bg-black/40 p-1 rounded-xl border border-white/5">
            {(['none', 'all', 'new'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCatchMode(mode)}
                className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase transition-all duration-200 ${
                  catchMode === mode
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode === 'none' ? 'Off' : mode}
              </button>
            ))}
          </div>

          {/* Speed Settings Mode */}
          <div className="flex gap-0.5 items-center bg-black/40 p-1 rounded-xl border border-white/5">
            {(['1x', '3x', '5x'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setBattleSpeed(speed)}
                className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase transition-all duration-200 ${
                  battleSpeed === speed
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Gym Leader Card */}
      {activeTrainer && (
        <div className="bg-gradient-to-r from-red-950/40 to-indigo-950/40 rounded-2xl p-3 border border-red-500/20 shadow-lg flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06),transparent_60%)] pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center text-2xl shadow-inner select-none">
              {activeTrainer.name === 'Brock' ? '🪨' :
               activeTrainer.name === 'Misty' ? '💧' :
               activeTrainer.name === 'Lt. Surge' ? '⚡' :
               activeTrainer.name === 'Erika' ? '🌹' :
               activeTrainer.name === 'Koga' ? '🐍' :
               activeTrainer.name === 'Sabrina' ? '🔮' :
               activeTrainer.name === 'Blaine' ? '🔥' :
               activeTrainer.name === 'Giovanni' ? '👑' : '👤'}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Active Gym Battle</div>
              <div className="text-xs font-black uppercase text-white mt-0.5">{activeTrainer.name}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[8px] text-white/40 uppercase font-black">Prize Reward</div>
            <div className="text-[9px] font-bold text-yellow-400 mt-0.5">
              {activeTrainer.badge ? `🏅 ${activeTrainer.badge}` : '🏆 Champion'}
            </div>
          </div>
        </div>
      )}

      {/* Active Fighter Moves Board */}
      {activeFighter && activeFighter.moves && (
        <div className="bg-black/30 rounded-2xl p-2.5 border border-white/5 flex flex-col gap-2">
          <span className="text-[9px] text-indigo-400 font-pixel font-bold uppercase tracking-wider px-1">
            Active Moves Clicker:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {activeFighter.moves.map((move, idx) => (
              <MoveButton key={idx} move={move} index={idx} onClick={clickMove} />
            ))}
          </div>
        </div>
      )}

      {/* Auto-Helper Panel Overlay Card */}
      <div className="grid grid-cols-2 gap-2 bg-black/30 border border-white/5 rounded-2xl p-2.5">
        <button
          onClick={() => setAutoPotion(!autoPotion)}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 text-left ${
            autoPotion
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <HeartPulse className="w-4 h-4 flex-shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-black uppercase leading-none">Auto-Potion</div>
              <div className="text-[8px] opacity-60 mt-0.5 truncate">Heal &lt; 30% (¤15)</div>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${autoPotion ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/20'}`}>
            {autoPotion && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
          </div>
        </button>

        <button
          onClick={() => setAutoRevive(!autoRevive)}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 text-left ${
            autoRevive
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-black uppercase leading-none">Auto-Revive</div>
              <div className="text-[8px] opacity-60 mt-0.5 truncate">Revive (¤100)</div>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${autoRevive ? 'border-purple-400 bg-purple-400/20' : 'border-white/20'}`}>
            {autoRevive && <div className="w-1 h-1 rounded-full bg-purple-400" />}
          </div>
        </button>
      </div>

      {/* Catch Control Bar */}
      {!activeTrainer && !healingCooldown && (
        <div className="bg-black/30 rounded-2xl p-2.5 border border-white/5 flex flex-col gap-2">
          <span className="text-[9px] text-white/40 font-black uppercase tracking-wider px-1">
            Capture Ball Preference:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['pokeball', 'greatball', 'ultraball', 'masterball'] as const).map(ball => {
              const count = inventory[ball];
              const isSelected = activeBallType === ball;
              return (
                <button
                  key={ball}
                  disabled={count === 0 && !isSelected}
                  onClick={() => setActiveBallType(ball)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 border ${
                    isSelected
                      ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                      : count > 0
                      ? 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                      : 'bg-white/[0.01] border-transparent text-white/15 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[8px] uppercase font-black leading-none">{ball.replace('ball', '')}</span>
                  <span className="text-[10px] font-black mt-1">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Logs and Capture Logs tab header */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <div className="flex gap-1.5 border-b border-white/5 pb-1">
          <button
            onClick={() => setShowCaptureLog(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
              !showCaptureLog ? 'bg-indigo-500/10 text-indigo-400' : 'text-white/40 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Combat Log</span>
          </button>
          <button
            onClick={() => setShowCaptureLog(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
              showCaptureLog ? 'bg-indigo-500/10 text-indigo-400' : 'text-white/40 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Captures Log</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {showCaptureLog ? (
              <motion.div
                key="captures"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute inset-0 bg-black/40 rounded-2xl p-3 overflow-y-auto border border-white/5 flex flex-col gap-1.5 text-[10px] font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {captureLog.length === 0 ? (
                  <div className="text-white/30 text-center py-6">No captures logged yet.</div>
                ) : (
                  captureLog.slice(0, 20).map((log) => {
                    const ballEmoji = log.ballType === 'pokeball' ? '🔴' : log.ballType === 'greatball' ? '🔵' : log.ballType === 'ultraball' ? '🟡' : '🟣';
                    return (
                      <div key={log.id} className="flex justify-between items-center text-white/70">
                        <span className="truncate max-w-[50%]">
                          {ballEmoji} <span className="font-bold text-white">{log.name}</span> (Lv.{log.level})
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                          log.quality === 'Epic' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          log.quality === 'Rare' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          log.quality === 'Uncommon' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          log.quality === 'Weak' ? 'bg-white/[0.02] text-white/35' :
                          'bg-white/5 text-white/70'
                        }`}>
                          {log.quality} (IV {log.iv}%)
                        </span>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div
                key="combat"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute inset-0 bg-black/40 rounded-2xl p-3 overflow-y-auto border border-white/5 flex flex-col gap-1 text-[10px] font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {combatLogs.map((log) => (
                  <div key={log.id} className="text-white/60 leading-relaxed truncate">
                    {log.text}
                  </div>
                ))}
                <div ref={logEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
