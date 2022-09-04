import React, { useState, createRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { Text, Button, Loading, Navbar, PokeCard } from "../../components";
import { IPokemon, IAllPokemonResponse } from "../../libs/types/pokemon";
import { useGlobalContext } from "../../libs/context";

import * as T from "./index.style";

const Explore: React.FC = () => {
  const [pokemon, setPokemon] = useState<IPokemon[]>([]);
  const [pokeUrl, setPokeURL] = useState<string>(
    `${import.meta.env.VITE_POKEMON_API}?limit=60&offset=0`
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);
  const { state, setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  async function loadPokemons() {
    if (pokeUrl) {
      try {
        setIsLoading(true);
        const { data } = await axios.get<IAllPokemonResponse>(pokeUrl);

        const mapped = data.results?.map((result) => {
          const summaryIdx = state.pokeSummary!.findIndex(
            (el) => el.name === result.name.toUpperCase()
          );
          return {
            name: result.name,
            url: result.url,
            captured: state.pokeSummary![summaryIdx]?.captured || 0,
          };
        });

        setPokemon((prevState) => [...prevState, ...mapped]);
        setPokeURL(data.next || "");
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
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
          {pokemon.length &&
            pokemon.map((pokemon: IPokemon) => (
              <Link
                key={`${pokemon.name}-${Math.random()}`}
                to={"/pokemon/" + pokemon.name}
                style={{ display: "flex" }}
              >
                <PokeCard name={pokemon.name} captured={pokemon.captured} />
              </Link>
            ))}
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
