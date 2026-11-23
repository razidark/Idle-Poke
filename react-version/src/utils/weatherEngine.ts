// Dynamic Weather and Day/Night Cycle Engine for IdlePoke

export type TimeOfDay = 'day' | 'sunset' | 'night';
export type WeatherCondition = 'clear' | 'rain' | 'sunlight' | 'sandstorm' | 'fog';

export interface WeatherEffect {
  condition: WeatherCondition;
  name: string;
  icon: string;
  color: string;
  description: string;
  fireMultiplier: number;
  waterMultiplier: number;
  accuracyMultiplier: number;
}

export const WEATHER_EFFECTS: Record<WeatherCondition, WeatherEffect> = {
  clear: {
    condition: 'clear',
    name: 'Clear Sky',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Normal battle conditions. All moves behave standardly.',
    fireMultiplier: 1.0,
    waterMultiplier: 1.0,
    accuracyMultiplier: 1.0,
  },
  rain: {
    condition: 'rain',
    name: 'Heavy Rain',
    icon: '🌧️',
    color: '#3b82f6',
    description: 'Boosts Water moves by 1.5x, reduces Fire moves to 0.5x.',
    fireMultiplier: 0.5,
    waterMultiplier: 1.5,
    accuracyMultiplier: 1.0,
  },
  sunlight: {
    condition: 'sunlight',
    name: 'Harsh Sunlight',
    icon: '🔥',
    color: '#ef4444',
    description: 'Boosts Fire moves by 1.5x, reduces Water moves to 0.5x.',
    fireMultiplier: 1.5,
    waterMultiplier: 0.5,
    accuracyMultiplier: 1.0,
  },
  sandstorm: {
    condition: 'sandstorm',
    name: 'Sandstorm',
    icon: '🌪️',
    color: '#d97706',
    description: 'Buffs Rock/Ground/Steel Pokémon defenses; chips others.',
    fireMultiplier: 1.0,
    waterMultiplier: 1.0,
    accuracyMultiplier: 1.0,
  },
  fog: {
    condition: 'fog',
    name: 'Thick Fog',
    icon: '🌫️',
    color: '#9ca3af',
    description: 'Reduces overall move accuracy by 10%.',
    fireMultiplier: 1.0,
    waterMultiplier: 1.0,
    accuracyMultiplier: 0.9,
  },
};

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'sunset';
  return 'night';
}

export function getWeatherForRoute(routeId: number): WeatherCondition {
  // Deterministic weather per route based on route number + hour
  const hour = new Date().getHours();
  const seed = (routeId * 7 + hour) % 100;

  if (routeId === 12 || routeId === 13 || seed < 20) return 'rain';
  if (routeId === 21 || routeId === 20 || (seed >= 20 && seed < 35)) return 'sunlight';
  if (routeId === 9 || routeId === 10 || (seed >= 35 && seed < 45)) return 'sandstorm';
  if (routeId === 23 || routeId === 24 || (seed >= 45 && seed < 55)) return 'fog';
  return 'clear';
}
