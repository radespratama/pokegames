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
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
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
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string;
          };
          [other: string]: unknown;
        };
      };
      [other: string]: unknown;
    };
    [other: string]: unknown;
  };
  stats: Array<{
    base_stat: number;
    effort?: number;
    stat: {
      name?: string;
      url: string;
    };
  }>;
  [other: string]: unknown;
}
