import React, { useState } from 'react';
import { ROUTES } from '../data/routes.js';
import { MapPin, Trophy, Check, Compass, Lock } from 'lucide-react';
import type { RouteDetail } from '../types/pokemon';

interface MapPanelProps {
  activeRegion: string;
  activeRouteKey: string;
  selectRoute: (routeKey: string) => void;
  startTrainerBattle: (trainer: any) => void;
  setActiveRegion: (region: string) => void;
  badges: string[];
  pokedex: { [name: string]: { caught: boolean; seen: boolean; shinyCaught: boolean } };
  statistics: {
    caught: number;
    throws: number;
    moneyGained: number;
    wildWins: number;
    trainerWins: number;
    eliteFourWins: number;
    championWins: number;
  };
}

const MAP_COORDINATES: { [key: string]: { [route: string]: { x: number; y: number } } } = {
  Kanto: {
    starter: { x: 26, y: 83 },
    route: { x: 26, y: 70 },
    viridianCity: { x: 26, y: 57 },
    route21: { x: 17, y: 58 },
    route22: { x: 10, y: 44 },
    special13: { x: 10, y: 28 },
    route1: { x: 26, y: 43 },
    special: { x: 26, y: 33 },
    special1: { x: 26, y: 20 },
    route2: { x: 38, y: 20 },
    special2: { x: 50, y: 20 },
    route3: { x: 63, y: 20 },
    ceruleanCity: { x: 76, y: 20 },
    route23: { x: 76, y: 11 },
    route24: { x: 87, y: 11 },
    special14: { x: 70, y: 15 },
    route4: { x: 76, y: 33 },
    special8: { x: 76, y: 46 },
    route5: { x: 76, y: 58 },
    vermilionCity: { x: 76, y: 71 },
    route10: { x: 88, y: 71 },
    special3: { x: 52, y: 57 },
    route6: { x: 63, y: 46 },
    special7: { x: 50, y: 46 },
    route15: { x: 37, y: 46 },
    route16: { x: 37, y: 67 },
    route17: { x: 47, y: 83 },
    fuchsiaCity: { x: 61, y: 83 },
    special9: { x: 61, y: 72 },
    route7: { x: 87, y: 46 },
    lavenderTown: { x: 95, y: 46 },
    special6: { x: 95, y: 39 },
    route9: { x: 95, y: 29 },
    special4: { x: 95, y: 20 },
    route8: { x: 86, y: 20 },
    special5: { x: 97, y: 29 },
    route11: { x: 95, y: 58 },
    route12: { x: 88, y: 68 },
    route13: { x: 80, y: 78 },
    route14: { x: 70, y: 83 },
    route18: { x: 61, y: 94 },
    route19: { x: 43, y: 94 },
    special11: { x: 43, y: 88 },
    cinnabarIsland: { x: 26, y: 94 },
    special12: { x: 20, y: 90 },
    route20: { x: 26, y: 88 }
  }
};

const REGION_START_KEYS: { [key: string]: string } = {
  Kanto: 'route',
  Johto: 'route25',
  Hoenn: 'route43',
  Sinnoh: 'route76',
  Unova: 'route105',
  Kalos: 'custom1',
  Alola: 'custom16'
};

export const MapPanel: React.FC<MapPanelProps> = ({
  activeRegion,
  activeRouteKey,
  selectRoute,
  startTrainerBattle,
  setActiveRegion,
  badges,
  pokedex,
  statistics
}) => {
  const [activeCategory, setActiveCategory] = useState<'routes' | 'cities' | 'dungeons'>('routes');

  const regionData = (ROUTES as any)[activeRegion];
  if (!regionData) return null;

  const routeKeys = Object.keys(regionData).filter(key => !key.startsWith('_'));

  const cities = routeKeys.filter(key => {
    const r = regionData[key] as RouteDetail;
    return r.town || r.trainer;
  });

  const dungeons = routeKeys.filter(key => {
    const k = key.toLowerCase();
    return (
      k.includes('forest') ||
      k.includes('cave') ||
      k.includes('tunnel') ||
      k.includes('moon') ||
      k.includes('island') ||
      k.includes('tower') ||
      k.includes('mansion') ||
      k.includes('plant') ||
      k.includes('victory') ||
      k.includes('ruin') ||
      k.includes('temple') ||
      k.includes('wormhole')
    );
  });

  const standardRoutes = routeKeys.filter(key => {
    return !cities.includes(key) && !dungeons.includes(key);
  });

  const displayedKeys = routeKeys;

  const getRouteCaughtStatus = (route: RouteDetail) => {
    if (!route || !route.pokes) return { allCaught: false, caughtCount: 0, totalCount: 0 };

    let pokesList: string[] = [];
    if (Array.isArray(route.pokes)) {
      pokesList = route.pokes;
    } else if (typeof route.pokes === 'object') {
      pokesList = Object.values(route.pokes).flat() as string[];
    }

    if (pokesList.length === 0) return { allCaught: false, caughtCount: 0, totalCount: 0 };
    const total = pokesList.length;
    const caught = pokesList.filter(name => pokedex[name]?.caught).length;
    return {
      allCaught: caught === total,
      caughtCount: caught,
      totalCount: total
    };
  };

  const checkRegionLocked = (region: string): { locked: boolean; reason: string } => {
    if (region === 'Kanto') return { locked: false, reason: '' };
    const rData = (ROUTES as any)[region];
    if (!rData || !rData._unlock) return { locked: false, reason: '' };

    const unlock = rData._unlock;
    const uniqueCaught = Object.values(pokedex).filter(p => p.caught).length;
    const totalWins = (statistics.wildWins || 0) + (statistics.trainerWins || 0);

    if (unlock.dex?.caughtCount && uniqueCaught < unlock.dex.caughtCount) {
      return { locked: true, reason: `Need ${unlock.dex.caughtCount} caught` };
    }
    if (unlock.statistics?.beaten && totalWins < unlock.statistics.beaten) {
      return { locked: true, reason: `Need ${unlock.statistics.beaten} wins` };
    }
    return { locked: false, reason: '' };
  };

  const handleRegionTravel = (region: string) => {
    const check = checkRegionLocked(region);
    if (check.locked) return;
    setActiveRegion(region);
    const startKey = REGION_START_KEYS[region] || 'route';
    selectRoute(startKey);
  };

  const coordsMap = MAP_COORDINATES[activeRegion] || {};

  const regionLock = checkRegionLocked(activeRegion);

  return (
    <div className="map-panel flex flex-col h-full gap-4">
      {/* 1. VISUAL COORDINATE MAP AREA (KANTO/JOHTO) OR REGION HEADER */}
      {Object.keys(coordsMap).length > 0 ? (
        <div className="relative bg-gradient-to-b from-[#09152b] via-[#0d233a] to-[#081220] border border-white/10 rounded-2xl overflow-hidden h-[240px] md:h-[280px] flex-shrink-0 shadow-2xl">
          {/* Guaranteed Vector Kanto Map Terrain Graphic */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
              {/* Ocean & Landmass Shapes */}
              <rect x="0" y="0" width="100" height="100" fill="#0369a1" fillOpacity="0.25" />
              {/* Main Kanto Landmass */}
              <path
                d="M 12 15 L 85 15 L 85 75 L 68 75 L 68 88 L 50 88 L 50 95 L 30 95 L 30 75 L 12 75 Z"
                fill="#15803d"
                fillOpacity="0.35"
                stroke="#22c55e"
                strokeWidth="0.5"
              />
              {/* Route Connector Lines */}
              <polyline points="26,83 26,57 26,20 76,20 76,71 88,71 95,46 95,20" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1.5,1.5" opacity="0.8" />
              {/* Cinnabar Water Route */}
              <polyline points="26,57 17,58 26,94 43,94 61,83" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1.5,1.5" opacity="0.8" />
            </svg>
          </div>

          <img
            src={activeRegion === 'Johto' ? '/assets/johto_neon_map.png' : '/assets/kanto_realistic_map.png'}
            alt={`${activeRegion} Map`}
            className="absolute inset-0 w-full h-full object-contain opacity-70 select-none pointer-events-none z-1"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-2" />

          {/* Render pins */}
          {Object.entries(coordsMap).map(([key, coords]) => {
            const route = regionData[key] as RouteDetail;
            if (!route) return null;

            const isActive = activeRouteKey === key;
            let isLocked = false;
            if (route._unlock?.badges) {
              const required = Object.keys(route._unlock.badges);
              isLocked = !required.every(b => badges.includes(b));
            }

            return (
              <button
                key={key}
                onClick={() => !isLocked && selectRoute(key)}
                className={`absolute group transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                  isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  width: isActive ? '32px' : '12px',
                  height: isActive ? '32px' : '12px'
                }}
              >
                {isActive ? (
                  <div className="relative w-8 h-8 -top-3 flex flex-col items-center justify-center animate-bounce">
                    <img src="/assets/other/trainer.png" className="w-5 h-5 object-contain pixelated animate-pulse" alt="Trainer" />
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 absolute -bottom-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  </div>
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full border border-white/60 shadow-[0_1px_2.5px_rgba(0,0,0,0.8)] transition-transform duration-200 ${
                    isLocked ? 'bg-gray-600' : route.town ? 'bg-emerald-500' : 'bg-indigo-500 hover:bg-indigo-400 hover:scale-125'
                  }`} />
                )}

                {/* Styled Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                  <div className="bg-black/95 text-white text-[8px] font-black uppercase tracking-widest py-1.5 px-2.5 rounded-xl border border-white/10 shadow-2xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
                    {isLocked && <Lock className="w-2.5 h-2.5 text-red-400" />}
                    <span>{route.name}</span>
                    <span className="text-white/20">|</span>
                    <span className={route.town ? 'text-emerald-400' : 'text-indigo-400'}>
                      {isLocked ? 'LOCKED' : route.town ? 'TOWN' : `LV.${route.minLevel}-${route.maxLevel}`}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-black border-r border-b border-white/10 rotate-45 -mt-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-950/20 to-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center h-[100px] flex-shrink-0 text-center relative overflow-hidden">
          <Compass className="w-12 h-12 text-indigo-500/10 absolute -right-3 -bottom-3 rotate-12" />
          <h3 className="text-sm font-black uppercase text-indigo-400 tracking-widest">{activeRegion} Province</h3>
          <p className="text-[9px] text-white/40 mt-1 uppercase tracking-wider font-semibold">
            Travel, train and conquer routes across the region map
          </p>
        </div>
      )}

      {/* 2. REGION TRAVEL BAR */}
      <div className="flex-shrink-0 flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/5">
        {['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola'].map(reg => {
          const check = checkRegionLocked(reg);
          const active = activeRegion === reg;
          return (
            <button
              key={reg}
              onClick={() => handleRegionTravel(reg)}
              className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider border flex items-center gap-1 transition ${
                active
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : check.locked
                  ? 'bg-black/40 border-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'
              }`}
              title={check.locked ? `Locked: ${check.reason}` : `Travel to ${reg}`}
            >
              {check.locked && <Lock className="w-2.5 h-2.5" />}
              <span>{reg}</span>
            </button>
          );
        })}
      </div>



      {/* 4. DESTINATIONS LIST GRID */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {displayedKeys.length === 0 ? (
          <div className="text-center text-white/30 py-8 text-xs">
            No locations found in this category.
          </div>
        ) : (
          displayedKeys.map(key => {
            const route = regionData[key] as RouteDetail;
            const isSelected = activeRouteKey === key;

            let isLocked = false;
            let unlockReason = '';
            if (route._unlock?.badges) {
              const required = Object.keys(route._unlock.badges);
              const hasAll = required.every(b => badges.includes(b));
              if (!hasAll) {
                isLocked = true;
                unlockReason = `Badge: ${required.map(b => b.replace(' Badge', '')).join(', ')}`;
              }
            }

            const { caughtCount, totalCount, allCaught } = getRouteCaughtStatus(route);

             const catchPct = totalCount > 0 ? Math.round((caughtCount / totalCount) * 100) : 0;

             return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/15 border-indigo-500/25 border-l-4 border-l-indigo-500 shadow-sm'
                    : 'bg-white/[0.02] border-white/5 border-l-2 border-l-transparent hover:bg-white/[0.04]'
                } ${isLocked ? 'opacity-40' : ''}`}
              >
                {/* Info and stats */}
                <div className="text-left flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white truncate uppercase tracking-wider flex items-center gap-1.5">
                    {route.name}
                    {allCaught && totalCount > 0 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                  <span className="text-[8px] text-white/35 font-bold uppercase mt-0.5 inline-block">
                    {route.town ? 'Safe Town' : `Lv ${route.minLevel}~${route.maxLevel}`}
                  </span>

                  {/* Completion Progress Bar */}
                  {totalCount > 0 && (
                    <div className="mt-1.5 flex items-center gap-2 max-w-[150px]">
                      <div className="flex-1 h-1 bg-black/45 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${catchPct}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">
                        {caughtCount}/{totalCount}
                      </span>
                    </div>
                  )}

                  {/* Wild Pokémon Encounter Badges */}
                  {route.pokes && Array.isArray(route.pokes) && route.pokes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {route.pokes.slice(0, 5).map((pokeName: string) => {
                        const isCaught = pokedex[pokeName]?.caught;
                        return (
                          <span
                            key={pokeName}
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              isCaught
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-white/50'
                            }`}
                          >
                            {isCaught ? '✓ ' : ''}{pokeName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {route.trainer && !isLocked && (
                    <button
                      onClick={() => startTrainerBattle(route.trainer)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition shadow-md shadow-red-600/10"
                    >
                      Gym Leader
                    </button>
                  )}
                  <button
                    onClick={() => !isLocked && selectRoute(key)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                        : isLocked
                        ? 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'
                        : 'bg-white/5 border border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {isLocked ? unlockReason : isSelected ? 'Active' : 'Travel'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
