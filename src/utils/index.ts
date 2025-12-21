import type { IMyPokemon, IPokeSummary } from "@/services/api/pokemons";

export * from "./colors";
export * from "./units";
export * from "./shadow";

export const getPokemonId = (url: string) => {
  const urlSplit = url.split("/");
  if (urlSplit.length) return urlSplit[urlSplit.length - 2];

  return "";
};

export const generatePokeSummary = (
  pokemons?: Array<IMyPokemon>,
): Array<IPokeSummary> => {
  const results: Array<{ name: string; captured: number }> = [];

  pokemons?.forEach((pokemon, idx) => {
    let pokemonExists = false;

    if (idx === 0) {
      results.push({ name: pokemon.name, captured: 1 });
    } else {
      for (const result of results) {
        if (result.name === pokemon.name) {
          pokemonExists = true;
        }
      }

      if (pokemonExists) {
        const pokemonIdx = results.findIndex((el) => el.name === pokemon.name);
        results[pokemonIdx].captured++;
      } else {
        results.push({ name: pokemon.name, captured: 1 });
      }
    }
  });

  return results;
};

export const loadMyPokemonFromLocalStorage = (): Array<IMyPokemon> => {
  try {
    const rawPokemons = localStorage.getItem("pokegames@myPokemon");
    if (!rawPokemons) return [];

    const parsed = JSON.parse(rawPokemons);

    if (parsed?.state?.pokemons && Array.isArray(parsed.state.pokemons)) {
      return parsed.state.pokemons;
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
};
