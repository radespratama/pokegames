import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getAllPokemon,
  getDetailPokemon,
  getPokemonTypeIndex,
} from "@/services/api/pokemons";

const usePokemons = ({
  isEnabled,
  limit = 20,
}: {
  isEnabled?: boolean;
  limit?: number;
}) => {
  const QUERY_KEY = ["pokemons", isEnabled, limit];

  const staleOneDay = 1000 * 60 * 60 * 24;

  return useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: async ({ pageParam = 0 }) =>
      await getAllPokemon({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.results.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    staleTime: staleOneDay,
    enabled: isEnabled,
    retry: false,
  });
};

const usePokemonDetail = ({
  pokemonName,
  isEnabled,
}: {
  pokemonName: string | number;
  isEnabled?: boolean;
}) => {
  const QUERY_KEY = ["pokemon-detail", pokemonName];

  const staleOneDay = 1000 * 60 * 60 * 24;

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => await getDetailPokemon(pokemonName),
    staleTime: staleOneDay,
    enabled: !!pokemonName && isEnabled,
    retry: false,
  });
};

const usePokemonTypeIndex = () =>
  useQuery({
    queryKey: ["pokemon-type-index"],
    queryFn: getPokemonTypeIndex,
    staleTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

/**
 * PokeAPI returns the whole list in one call when asked (1351 names, ~12 kB gzipped).
 * Only fetched once a search starts; infinite scroll keeps using the paged query.
 */
const useAllPokemonNames = (isEnabled: boolean) =>
  useQuery({
    queryKey: ["pokemons", "all"],
    queryFn: async () => await getAllPokemon({ limit: 100000, offset: 0 }),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: isEnabled,
    retry: false,
  });

export {
  usePokemons,
  usePokemonDetail,
  usePokemonTypeIndex,
  useAllPokemonNames,
};
