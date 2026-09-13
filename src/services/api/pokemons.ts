import axios from "@/libs/axios";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";

export interface ISkill {
  name: string;
  power: number;
  type: string;
  /** Own turns to wait after use, including the turn it was used. */
  cooldown: number;
}

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
    type?: string | null;
  }>;
  /** [Skill 1, Skill 2] */
  skills: [ISkill, ISkill];
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
  id: number;
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

/**
 * PokeAPI has no bulk "pokemon with types" endpoint. 18 type endpoints cover
 * every species, so one fan-out builds the whole index instead of 1300 detail calls.
 */
export const getPokemonTypeIndex = async (): Promise<
  Record<string, Array<string>>
> => {
  const types = Object.keys(POKEMON_TYPE_ICONS);

  const pages = await Promise.all(
    types.map(async (type) => {
      const result = await axios.get(`/type/${type}`);
      return {
        type,
        pokemon: result.data.pokemon as Array<{ pokemon: { name: string } }>,
      };
    }),
  );

  const index: Record<string, Array<string>> = {};
  pages.forEach(({ type, pokemon }) => {
    pokemon.forEach((entry) => {
      (index[entry.pokemon.name] ??= []).push(type);
    });
  });

  return index;
};
