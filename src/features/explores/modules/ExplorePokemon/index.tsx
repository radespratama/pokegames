import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";

import * as T from "./index.style";
import {
  useAllPokemonNames,
  usePokemonTypeIndex,
  usePokemons,
} from "@/hooks/queries/pokemon";
import { useDebounce } from "@/hooks/common/useDebounce";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { Input, Loading, Navbar, Text } from "@/components/ui";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";
import { POKEMON_IMAGE, POKEMON_SPRITE_ANIMATED } from "@/configs/api";
import { getPokemonId } from "@/utils";
import "react-lazy-load-image-component/src/effects/blur.css";

const ExplorePokemonsModule = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  /** Only the hovered card mounts its animated sprite - one GIF at a time. */
  const [activeId, setActiveId] = useState<string | null>(null);

  const keyword = useDebounce(query.trim().toLowerCase(), 300);
  const isSearching = keyword.length > 0;

  const pokemons = usePokemonStore((state) => state.pokemons);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePokemons({ isEnabled: true, limit: 50 });
  const { data: allNames, isLoading: isSearchLoading } =
    useAllPokemonNames(isSearching);
  const { data: typeIndex } = usePokemonTypeIndex();

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearching]);

  const pokeSummary: Record<string, number> = {};
  pokemons.forEach((p) => {
    const upperName = p.name.toUpperCase();
    pokeSummary[upperName] = (pokeSummary[upperName] || 0) + 1;
  });

  const source = isSearching
    ? (allNames?.results ?? [])
    : (data?.pages.flatMap((page) => page?.results ?? []) ?? []);

  const visiblePokemons = source
    .filter((pokemon) => !isSearching || pokemon.name.includes(keyword))
    .map((pokemon) => ({
      ...pokemon,
      captured: pokeSummary[pokemon.name.toUpperCase()] || 0,
      types: typeIndex?.[pokemon.name] ?? [],
    }));

  const speciesCaught = Object.keys(pokeSummary).length;
  const speciesTotal = data?.pages[0]?.count ?? 0;
  const showLoading = isLoading || (isSearching && isSearchLoading);

  return (
    <>
      <T.Screen style={{ paddingBottom: navRef.current?.clientHeight || 0 }}>
        <T.Shell>
          <T.Chassis className="pxl-border">
            <T.Readout>
              <Text as="h1" variant="outlined" size="lg">
                Pokemon Market
              </Text>
              <T.Counter className="pxl-border">
                {speciesCaught} caught of {speciesTotal || "???"}
              </T.Counter>
            </T.Readout>

            <T.Search>
              <Input
                type="search"
                required={false}
                aria-label="Search the Pokédex by name"
                placeholder="Search by name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </T.Search>
          </T.Chassis>

          {showLoading ? (
            <T.LoadingWrapper>
              <Loading
                label={isSearching ? "SEARCHING..." : "READING CARTRIDGE..."}
              />
            </T.LoadingWrapper>
          ) : (
            <>
              {visiblePokemons.length === 0 ? (
                <T.Notice>
                  No entry matches “{keyword}”. Try another name.
                </T.Notice>
              ) : (
                <T.Grid>
                  {visiblePokemons.map((pokemon) => {
                    const id = getPokemonId(pokemon.url ?? "");
                    const caught = pokemon.captured > 0;

                    return (
                      <Link
                        key={`${pokemon.name}-${id}`}
                        to="/pokemons/$pokemonName"
                        params={{ pokemonName: pokemon.name }}
                        onPointerEnter={() => setActiveId(id)}
                        onPointerLeave={() => setActiveId(null)}
                        onFocus={() => setActiveId(id)}
                        onBlur={() => setActiveId(null)}>
                        <T.Entry
                          className="pxl-border"
                          type={pokemon.types[0]}
                          caught={caught}>
                          <T.EntryHead>
                            <span>No. {String(id).padStart(3, "0")}</span>
                            <T.Stamp caught={caught}>
                              {caught ? (
                                <>
                                  <img
                                    src="/static/pokeball.png"
                                    alt=""
                                    width={14}
                                    height={14}
                                  />
                                  x{pokemon.captured}
                                </>
                              ) : null}
                            </T.Stamp>
                          </T.EntryHead>

                          <T.SpriteWindow data-active={activeId === id}>
                            <LazyLoadImage
                              src={`${POKEMON_IMAGE}/${id}.png`}
                              alt={pokemon.name}
                              width={120}
                              height={120}
                              effect="blur"
                            />
                            {activeId === id && (
                              <T.AnimatedSprite
                                src={`${POKEMON_SPRITE_ANIMATED}/${id}.gif`}
                                alt=""
                                aria-hidden="true"
                                onError={(event) => {
                                  // Not every species has a Gen-5 GIF; keep the still.
                                  event.currentTarget.style.display = "none";
                                  event.currentTarget
                                    .closest("[data-active]")
                                    ?.setAttribute("data-active", "false");
                                }}
                              />
                            )}
                          </T.SpriteWindow>

                          <T.TypeRow>
                            {pokemon.types.slice(0, 2).map((type) => (
                              <T.TypeChip key={type} type={type}>
                                <LazyLoadImage
                                  src={POKEMON_TYPE_ICONS[type]}
                                  alt=""
                                  width={14}
                                  height={14}
                                />
                                {type}
                              </T.TypeChip>
                            ))}
                          </T.TypeRow>

                          <T.EntryName>{pokemon.name}</T.EntryName>
                        </T.Entry>
                      </Link>
                    );
                  })}
                </T.Grid>
              )}

              {!isSearching && hasNextPage && (
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
        </T.Shell>
      </T.Screen>

      <Navbar ref={navRef} tone="dark" />
    </>
  );
};

export default ExplorePokemonsModule;
