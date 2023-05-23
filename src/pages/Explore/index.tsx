/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import React, { useState, createRef, useEffect, useRef } from "react";

import { useGlobalContext } from "context";
import { IPokemon, IAllPokemonResponse } from "types/pokemon";
import { Text, Button, Loading, Navbar, PokeCard } from "components";

import { POKEMON_API } from "configs/api";

import * as T from "./index.style";

const Explore: React.FC = () => {
  const { state } = useGlobalContext();
  const isCanceled = useRef<boolean>(false);
  const navRef = createRef<HTMLDivElement>();
  const [pokemons, setPokemons] = useState<IPokemon[]>([]);

  const [pokeUrl, setPokeURL] = useState<string>(`${POKEMON_API}?limit=60&offset=0`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  async function loadPokemons() {
    if (pokeUrl) {
      try {
        setIsLoading(true);
        const { data } = await axios.get<IAllPokemonResponse>(pokeUrl);

        const mapped = data.results?.map((result) => {
          const summaryIdx = state?.pokeSummary!.findIndex(
            (el) => el.name === result.name.toUpperCase()
          );
          return {
            name: result.name,
            url: result.url,
            captured: state.pokeSummary![summaryIdx]?.captured || 0,
          };
        });

        setPokemons((prevState) => [...prevState, ...mapped]);
        setPokeURL(data.next || "");
        setIsLoading(false);
      } catch (error) {
        if (!isCanceled.current) {
          toast("Oops!. Fail get pokemons. Please try again!");
          setIsLoading(false);
        }
      }
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight!);
    loadPokemons();
  }, []);

  return (
    <>
      <T.Container style={{ marginBottom: navHeight }}>
        <Text as="h1" variant="darker" size="lg">
          Challenge &amp; catch them all
        </Text>
        <T.Grid>
          {pokemons.length
            ? pokemons.map((pokemon: IPokemon) => (
                <Link
                  key={`${pokemon.name}-${Math.random()}`}
                  to={"/pokemon/" + pokemon.name}
                  style={{ display: "flex" }}>
                  <PokeCard name={pokemon.name} captured={pokemon.captured} />
                </Link>
              ))
            : null}
        </T.Grid>
        {!isLoading ? (
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
