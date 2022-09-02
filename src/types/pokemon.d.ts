export interface IMyPokemon {
  name: string;
  nickname: string;
  sprite?: string;
}

export interface IPokemon {
  name: string;
  captured?: number;
  url?: string;
  sprite?: string;
}

export interface IPokeSummary {
  name: string;
  captured: number;
}

/* Poke API response */

export interface IAllPokemonResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IPokemon[];
}

export interface IPokemonDetailResponse {
  name: string;
  moves: {
    move?: {
      name?: string;
      [other: string]: unknown;
    };
    [other: string]: unknown;
  }[];
  types: {
    type?: {
      name?: string;
      [other: string]: unknown;
    };
    [other: string]: unknown;
  }[];
  sprites: {
    front_default: string;
    [other: string]: unknown;
  };
  [other: string]: unknown;
}
