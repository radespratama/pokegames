import { IMyPokemon, IPokeSummary } from "../types/pokemon";

export const generatePokeSummary = (pokemons: IMyPokemon[]): IPokeSummary[] => {
  const results: { name: string; captured: number }[] = [];

  pokemons.forEach((pokemon, idx) => {
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

export const loadMyPokemonFromLocalStorage = (): IMyPokemon[] => {
  const rawPokemons = localStorage.getItem("pokegames@myPokemon");
  const parsed = JSON.parse(rawPokemons!) || [];

  return parsed;
};
