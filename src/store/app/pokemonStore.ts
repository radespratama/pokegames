import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IMyPokemon } from "@/services/api/pokemons";

interface IPokemonStore {
  pokemons: Array<IMyPokemon>;
  addPokemon: (pokemon: IMyPokemon) => boolean;
  removePokemon: (nickname: string) => void;
  updatePokemon: (nickname: string, updates: Partial<IMyPokemon>) => void;
  getPokemonByNickname: (nickname: string) => IMyPokemon | undefined;
}

export const POKEMON_STORE_KEY = "pokegames@pokemonStore";

export const usePokemonStore = create<IPokemonStore>()(
  persist(
    (set, get) => ({
      pokemons: [],

      addPokemon: (pokemon) => {
        const exists = get().pokemons.some(
          (p) => p.nickname === pokemon.nickname,
        );

        if (exists) return false;

        set((state) => ({
          pokemons: [...state.pokemons, pokemon],
        }));

        return true;
      },

      removePokemon: (nickname) => {
        set((state) => ({
          pokemons: state.pokemons.filter((p) => p.nickname !== nickname),
        }));
      },

      updatePokemon: (nickname, updates) => {
        set((state) => ({
          pokemons: state.pokemons.map((p) =>
            p.nickname === nickname ? { ...p, ...updates } : p,
          ),
        }));
      },

      getPokemonByNickname: (nickname) => {
        return get().pokemons.find((p) => p.nickname === nickname);
      },
    }),
    {
      name: POKEMON_STORE_KEY,
    },
  ),
);
