import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { IMyPokemon, IPokeSummary } from "@/services/api/pokemons";
import { generatePokeSummary, loadMyPokemonFromLocalStorage } from "@/utils";

interface IPokemonStore {
  pokeSummary: Array<IPokeSummary>;
  pokemons: Array<IMyPokemon>;

  setState: (state: Partial<IPokemonStore>) => void;
}

export const POKEMON_STORE_KEY = "pokegames@pokemonStore";

const initialState = {
  pokeSummary: generatePokeSummary(loadMyPokemonFromLocalStorage()),
  pokemons: loadMyPokemonFromLocalStorage(),
};

export const usePokemonStore = create<IPokemonStore>()(
  persist(
    (set) => ({
      ...initialState,

      setState: (newState) => set((state) => ({ ...state, ...newState })),
    }),
    {
      name: POKEMON_STORE_KEY,
    },
  ),
);
