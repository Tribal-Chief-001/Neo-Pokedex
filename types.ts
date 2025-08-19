export interface PokemonStat {
  name: 'HP' | 'Attack' | 'Defense' | 'Sp. Atk' | 'Sp. Def' | 'Speed';
  value: number;
}

export interface PokemonMove {
    name: string;
    type: string; // The move's elemental type, e.g., 'Fire', 'Normal'
    category: 'Physical' | 'Special' | 'Status';
    power?: number | string;
    accuracy?: number | string;
    pp?: number;
    learnMethod: string; // e.g., "Lvl 1", "TM01"
}


export interface PokemonForm {
    name: string;
    sprite: string;
    types: string[];
}

export interface PokemonEvolution {
    name:string;
    sprite: string;
    condition: string; // e.g., "Level 16", "Use Water Stone"
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStat[];
  abilities: string[];
  hiddenAbility?: string;
  description: string;
  generation: number;
  eggGroups: string[];
  evYield: string;
  bst?: number; // Base Stat Total

  // Defensive properties
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
  
  // Evolution
  evolutions?: PokemonEvolution[];
  preevolution?: { name: string; sprite: string };
  
  // Other forms
  forms?: PokemonForm[];
  
  // Moves
  moves: PokemonMove[];
}