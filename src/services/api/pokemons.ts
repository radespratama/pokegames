import axios from "@/libs/axios";

export interface IMyPokemon {
  name: string;
  nickname: string;
  sprite?: string;
  sprite_back?: string;
  base_experience?: number;
  battle_state: {
    level: number;
    experience: number;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  base_stats?: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  types: Array<string>;
  moves: Array<{
    name: string;
    power: number;
  }>;
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

export interface IAllPokemonResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Array<IPokemon>;
}

interface IPokemonStats {
  base_stat: number;
  effort?: number;
  stat: {
    name?: string;
    url: string;
  };
}

interface IPokemonTypes {
  slot: number;
  type: {
    name?: string;
    url: string;
  };
}

export interface IPokemonDetailResponse {
  name: string;
  base_experience: number;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  moves: Array<{
    move?: {
      name?: string;
      [other: string]: unknown;
    };
    [other: string]: unknown;
  }>;
  types: Array<IPokemonTypes>;
  sprites: {
    front_default: string;
    back_default: string;
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string;
            back_default: string;
          };
          [other: string]: unknown;
        };
      };
      [other: string]: unknown;
    };
    [other: string]: unknown;
  };
  stats: Array<IPokemonStats>;
  [other: string]: unknown;
}

interface IGetAllPokemonParams {
  limit?: number;
  offset?: number;
}

export const getAllPokemon = async ({
  limit = 20,
  offset = 0,
}: IGetAllPokemonParams): Promise<IAllPokemonResponse | undefined> => {
  const result = await axios.get("/pokemon", {
    params: {
      limit,
      offset,
    },
  });

  return result.data;
};

export const getDetailPokemon = async (
  name: string | number,
): Promise<IPokemonDetailResponse | undefined> => {
  const result = await axios.get(`/pokemon/${name}`);

  return result.data;
};
