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
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
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
        {/* Header Pixelated */}
        <T.Header>
          <Text variant="outlined" size="lg">
            Pokémon Market
          </Text>
          <Text as="p" variant="darker">
            Explore and collect your favorite companions.
          </Text>
        </T.Header>

        {isLoading ? (
          <T.LoadingWrapper>
            <Loading label="LOADING CARTRIDGE..." />
          </T.LoadingWrapper>
        ) : (
          <>
            <T.Grid>
              {allPokemons.map((pokemon) => {
                return (
                  <Link
                    key={`${pokemon?.name}-${getPokemonId(pokemon?.url ?? "")}`}
                    to={`/pokemons/$pokemonName`}
                    params={{ pokemonName: pokemon?.name ?? "" }}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <T.PixelCard>
                      <T.PixelBadge count={pokemon?.captured ?? 0}>
                        {(pokemon?.captured ?? 0) > 0
                          ? `OWNED x${pokemon?.captured}`
                          : "NEW"}
                      </T.PixelBadge>

                      <div style={{ padding: "24px 16px 16px" }}>
                        <PokeCard
                          pokemonId={getPokemonId(pokemon?.url ?? "")}
                          name={pokemon?.name}
                        />
                      </div>

                      <T.CardFooter className="footer-action">
                        INFO &gt;
                      </T.CardFooter>
                    </T.PixelCard>
                  </Link>
                );
              })}
            </T.Grid>

            {hasNextPage && (
              <>
                <div ref={observerTarget} style={{ height: "20px" }} />
                {isFetchingNextPage && (
                  <T.LoadingWrapper>
                    <Loading label="LOADING DATA..." />
                  </T.LoadingWrapper>
                )}
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
