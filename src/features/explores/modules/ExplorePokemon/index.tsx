import { useEffect, useMemo, useRef } from "react";

import { Link } from "@tanstack/react-router";
import * as T from "./index.style";
import { usePokemons } from "@/hooks/queries/pokemon";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { Loading, Navbar, PokeCard, Text } from "@/components/ui";
import { getPokemonId } from "@/utils";

const ExplorePokemonsModule = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const pokemons = usePokemonStore((state) => state.pokemons);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePokemons({ isEnabled: true, limit: 50 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const pokeSummary = useMemo(() => {
    const summary: Record<string, number> = {};

    pokemons.forEach((p) => {
      const upperName = p.name.toUpperCase();
      summary[upperName] = (summary[upperName] || 0) + 1;
    });

    return summary;
  }, [pokemons]);

  const allPokemons = useMemo(() => {
    return (
      data?.pages.flatMap((page) =>
        page?.results.map((pokemon) => ({
          ...pokemon,
          captured: pokeSummary[pokemon.name.toUpperCase()] || 0,
        })),
      ) || []
    );
  }, [data, pokeSummary]);

  return (
    <>
      <T.Container style={{ marginBottom: navRef.current?.clientHeight || 0 }}>
        <Text as="h1" variant="darker" size="lg">
          Challenge &amp; catch them all
        </Text>

        {isLoading ? (
          <Loading label="Please wait..." />
        ) : (
          <>
            <T.Grid>
              {allPokemons.map((pokemon) => (
                <Link
                  key={`${pokemon?.name}-${getPokemonId(pokemon?.url ?? "")}`}
                  to={`/pokemons/$pokemonName`}
                  params={{
                    pokemonName: pokemon?.name ?? "",
                  }}
                  style={{ display: "flex" }}>
                  <PokeCard
                    pokemonId={getPokemonId(pokemon?.url ?? "")}
                    name={pokemon?.name}
                    captured={pokemon?.captured}
                  />
                </Link>
              ))}
            </T.Grid>

            {hasNextPage && (
              <>
                <div ref={observerTarget} style={{ height: "20px" }} />
                {isFetchingNextPage && <Loading label="Loading more..." />}
              </>
            )}
          </>
        )}
      </T.Container>

      <Navbar ref={navRef} />
    </>
  );
};

export default ExplorePokemonsModule;
