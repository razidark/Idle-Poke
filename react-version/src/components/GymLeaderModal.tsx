import React from 'react';
import { Trophy, Shield, Zap, Flame, Award, Skull, Crown, X } from 'lucide-react';

export interface BossChallenge {
  id: string;
  name: string;
  title: string;
  badgeName: string;
  badgeIcon: string;
  level: number;
  type: string;
  avatar: string;
  pokemon: {
    speciesId: number;
    name: string;
    level: number;
  }[];
  rewardCash: number;
}

export const KANTO_GYMS: BossChallenge[] = [
  {
    id: 'brock',
    name: 'Brock',
    title: 'Pewter City Gym Leader',
    badgeName: 'Boulder Badge',
    badgeIcon: '🪨',
    level: 14,
    type: 'Rock',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/brock.png',
    pokemon: [
      { speciesId: 74, name: 'Geodude', level: 12 },
      { speciesId: 95, name: 'Onix', level: 14 }
    ],
    rewardCash: 1500
  },
  {
    id: 'misty',
    name: 'Misty',
    title: 'Cerulean City Gym Leader',
    badgeName: 'Cascade Badge',
    badgeIcon: '💧',
    level: 21,
    type: 'Water',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/misty.png',
    pokemon: [
      { speciesId: 120, name: 'Staryu', level: 18 },
      { speciesId: 121, name: 'Starmie', level: 21 }
    ],
    rewardCash: 2500
  },
  {
    id: 'lt_surge',
    name: 'Lt. Surge',
    title: 'Vermilion City Gym Leader',
    badgeName: 'Thunder Badge',
    badgeIcon: '⚡',
    level: 24,
    type: 'Electric',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/surge.png',
    pokemon: [
      { speciesId: 100, name: 'Voltorb', level: 21 },
      { speciesId: 25, name: 'Pikachu', level: 18 },
      { speciesId: 26, name: 'Raichu', level: 24 }
    ],
    rewardCash: 3500
  },
  {
    id: 'erika',
    name: 'Erika',
    title: 'Celadon City Gym Leader',
    badgeName: 'Rainbow Badge',
    badgeIcon: '🌈',
    level: 29,
    type: 'Grass',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/erika.png',
    pokemon: [
      { speciesId: 71, name: 'Victreebel', level: 29 },
      { speciesId: 114, name: 'Tangela', level: 24 },
      { speciesId: 45, name: 'Vileplume', level: 29 }
    ],
    rewardCash: 5000
  },
  {
    id: 'koga',
    name: 'Koga',
    title: 'Fuchsia City Gym Leader',
    badgeName: 'Soul Badge',
    badgeIcon: '☣️',
    level: 43,
    type: 'Poison',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/koga.png',
    pokemon: [
      { speciesId: 109, name: 'Koffing', level: 37 },
      { speciesId: 89, name: 'Muk', level: 39 },
      { speciesId: 110, name: 'Weezing', level: 43 }
    ],
    rewardCash: 7500
  },
  {
    id: 'sabrina',
    name: 'Sabrina',
    title: 'Saffron City Gym Leader',
    badgeName: 'Marsh Badge',
    badgeIcon: '🔮',
    level: 43,
    type: 'Psychic',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/sabrina.png',
    pokemon: [
      { speciesId: 64, name: 'Kadabra', level: 38 },
      { speciesId: 122, name: 'Mr. Mime', level: 37 },
      { speciesId: 65, name: 'Alakazam', level: 43 }
    ],
    rewardCash: 10000
  },
  {
    id: 'blaine',
    name: 'Blaine',
    title: 'Cinnabar Island Gym Leader',
    badgeName: 'Volcano Badge',
    badgeIcon: '🔥',
    level: 47,
    type: 'Fire',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/blaine.png',
    pokemon: [
      { speciesId: 58, name: 'Growlithe', level: 42 },
      { speciesId: 77, name: 'Ponyta', level: 40 },
      { speciesId: 78, name: 'Rapidash', level: 42 },
      { speciesId: 59, name: 'Arcanine', level: 47 }
    ],
    rewardCash: 12500
  },
  {
    id: 'giovanni',
    name: 'Giovanni',
    title: 'Viridian City Gym Leader',
    badgeName: 'Earth Badge',
    badgeIcon: '🌍',
    level: 50,
    type: 'Ground',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/giovanni.png',
    pokemon: [
      { speciesId: 111, name: 'Rhyhorn', level: 45 },
      { speciesId: 51, name: 'Dugtrio', level: 42 },
      { speciesId: 31, name: 'Nidoqueen', level: 44 },
      { speciesId: 34, name: 'Nidoking', level: 45 },
      { speciesId: 112, name: 'Rhydon', level: 50 }
    ],
    rewardCash: 15000
  }
];

export const ELITE_FOUR: BossChallenge[] = [
  {
    id: 'lorelei',
    name: 'Lorelei',
    title: 'Elite Four Master of Ice',
    badgeName: 'Ice Trophy',
    badgeIcon: '❄️',
    level: 56,
    type: 'Ice',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lorelei.png',
    pokemon: [
      { speciesId: 87, name: 'Dewgong', level: 54 },
      { speciesId: 91, name: 'Cloyster', level: 53 },
      { speciesId: 80, name: 'Slowbro', level: 54 },
      { speciesId: 124, name: 'Jynx', level: 56 },
      { speciesId: 131, name: 'Lapras', level: 56 }
    ],
    rewardCash: 25000
  },
  {
    id: 'bruno',
    name: 'Bruno',
    title: 'Elite Four Master of Fighting',
    badgeName: 'Fighting Trophy',
    badgeIcon: '🥊',
    level: 58,
    type: 'Fighting',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/bruno.png',
    pokemon: [
      { speciesId: 95, name: 'Onix', level: 53 },
      { speciesId: 107, name: 'Hitmonchan', level: 55 },
      { speciesId: 106, name: 'Hitmonlee', level: 55 },
      { speciesId: 68, name: 'Machamp', level: 58 }
    ],
    rewardCash: 30000
  },
  {
    id: 'agatha',
    name: 'Agatha',
    title: 'Elite Four Master of Ghosts',
    badgeName: 'Ghost Trophy',
    badgeIcon: '👻',
    level: 60,
    type: 'Ghost',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/agatha.png',
    pokemon: [
      { speciesId: 93, name: 'Haunter', level: 55 },
      { speciesId: 24, name: 'Arbok', level: 56 },
      { speciesId: 42, name: 'Golbat', level: 56 },
      { speciesId: 94, name: 'Gengar', level: 60 }
    ],
    rewardCash: 35000
  },
  {
    id: 'lance',
    name: 'Lance',
    title: 'Dragon Tamer Champion',
    badgeName: 'Dragon Trophy',
    badgeIcon: '🐉',
    level: 62,
    type: 'Dragon',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lance.png',
    pokemon: [
      { speciesId: 130, name: 'Gyarados', level: 58 },
      { speciesId: 148, name: 'Dragonair', level: 56 },
      { speciesId: 142, name: 'Aerodactyl', level: 60 },
      { speciesId: 149, name: 'Dragonite', level: 62 }
    ],
    rewardCash: 50000
  },
  {
    id: 'blue',
    name: 'Champion Blue',
    title: 'Pokemon League Champion',
    badgeName: 'Champion Crown',
    badgeIcon: '👑',
    level: 65,
    type: 'Balanced',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/blue.png',
    pokemon: [
      { speciesId: 18, name: 'Pidgeot', level: 61 },
      { speciesId: 65, name: 'Alakazam', level: 59 },
      { speciesId: 112, name: 'Rhydon', level: 61 },
      { speciesId: 103, name: 'Exeggutor', level: 63 },
      { speciesId: 130, name: 'Gyarados', level: 63 },
      { speciesId: 6, name: 'Charizard', level: 65 }
    ],
    rewardCash: 100000
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defeatedBosses: string[];
  onChallengeBoss: (boss: BossChallenge) => void;
}

export const GymLeaderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defeatedBosses,
  onChallengeBoss
}) => {
  const [tab, setTab] = React.useState<'gyms' | 'elite'>('gyms');

  if (!isOpen) return null;

  const currentList = tab === 'gyms' ? KANTO_GYMS : ELITE_FOUR;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wider">
                Kanto League Tournament
              </h2>
              <p className="text-xs text-amber-300">
                Challenge Gym Leaders & Elite Four to earn Badges & Trophies!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 p-2 gap-2">
          <button
            onClick={() => setTab('gyms')}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === 'gyms'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" /> Kanto Gym Leaders (8 Badges)
          </button>
          <button
            onClick={() => setTab('elite')}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === 'elite'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" /> Indigo Plateau Elite Four & Champion
          </button>
        </div>

        {/* Grid List */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {currentList.map((boss) => {
            const isDefeated = defeatedBosses.includes(boss.id);

            return (
              <div
                key={boss.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDefeated
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{boss.badgeIcon}</span>
                      <div>
                        <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
                          {boss.name}
                          {isDefeated && (
                            <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
                              DEFEATED
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">{boss.title}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1 bg-white/10 rounded-lg text-amber-300">
                      Lvl {boss.level}
                    </span>
                  </div>

                  {/* Boss Pokemon Team Preview */}
                  <div className="bg-black/30 rounded-xl p-3 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Signature Team ({boss.pokemon.length} Pokémon)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {boss.pokemon.map((pk) => (
                        <div
                          key={pk.name}
                          className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-slate-200"
                        >
                          <span className="font-bold">{pk.name}</span>
                          <span className="text-[10px] text-slate-400">Lv.{pk.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Challenge Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-emerald-400 font-black">
                    Reward: +${boss.rewardCash.toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      onChallengeBoss(boss);
                      onClose();
                    }}
                    className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                      isDefeated
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        : tab === 'elite'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30'
                    }`}
                  >
                    {isDefeated ? 'Re-Challenge' : 'Challenge Boss'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
