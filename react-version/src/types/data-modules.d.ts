declare module '*/db.js' {
  export const POKEDEX: any[];
}
declare module '*/evolutions.js' {
  export const EVOLUTIONS: { [pokeName: string]: { level: string; to: string } };
}
declare module '*/routes.js' {
  export const ROUTES: {
    [regionName: string]: {
      _global: { pokes: string[]; rarePokes: string[]; superRare: string[] };
      _unlock?: { dex?: { caughtCount: number } };
      [routeKey: string]: any;
    };
  };
}
declare module '*/typeModifiers.js' {
  export const TYPES: { [type: string]: { [type: string]: number } };
}
