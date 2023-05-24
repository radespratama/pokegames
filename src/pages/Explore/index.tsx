/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import React, { useState, createRef, useEffect } from "react";

import { useGlobalContext } from "context";
import { IPokemon, IAllPokemonResponse } from "types/pokemon";
import { Text, Button, Loading, Navbar, PokeCard } from "components";

import { POKEMON_API } from "configs/api";

import * as T from "./index.style";
import { getPokemonId } from "utils";

const Explore: React.FC = () => {
  const { state } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();
  const [pokemons, setPokemons] = useState<IPokemon[]>([]);

  const [pokeUrl, setPokeURL] = useState<string>(`${POKEMON_API}?limit=50&offset=0`);
  const [isFetchingPokemon, setIsFetchingPokemon] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  async function loadPokemons() {
    if (pokeUrl) {
      try {
        setIsFetchingPokemon(true);
        const { data } = await axios.get<IAllPokemonResponse>(pokeUrl);

        const filteredSummary = data.results?.map((result) => {
          const summaryIdx = state?.pokeSummary!.findIndex(
            (el) => el.name === result.name.toUpperCase()
          );
          return {
            name: result.name,
            url: result.url,
            captured: state.pokeSummary![summaryIdx]?.captured || 0,
          };
        });

        setPokemons((prevState) => [...prevState, ...filteredSummary]);
        setPokeURL(data.next || "");
        setIsFetchingPokemon(false);
      } catch (error) {
        toast("Oops!. Fail get pokemons. Please try again!");
        setIsFetchingPokemon(false);
      }
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight!);
    loadPokemons();
  }, []);

  // useEffect(() => {
  //   window.scroll({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }, []);

  return (
    <>
      <T.Container style={{ marginBottom: navHeight }}>
        <Text as="h1" variant="darker" size="lg">
          Challenge &amp; catch them all
        </Text>
        <T.Grid>
          {pokemons?.length
            ? pokemons.map((pokemon: IPokemon) => (
                <Link
                  key={`${pokemon.name}-${Math.random()}`}
                  to={"/pokemon/" + pokemon.name}
                  style={{ display: "flex" }}>
                  <PokeCard
                    pokemonId={getPokemonId(pokemon?.url ?? "")}
                    name={pokemon.name}
                    captured={pokemon.captured}
                  />
                </Link>
              ))
            : null}
        </T.Grid>
        {!isFetchingPokemon ? (
          pokeUrl && (
            <T.Footer>
              <Button onClick={() => loadPokemons()}>Load More</Button>
            </T.Footer>
          )
        ) : (
          <Loading label="Please wait..." />
        )}
      </T.Container>

      <Navbar ref={navRef} />
    </>
  );
};

export default Explore;
