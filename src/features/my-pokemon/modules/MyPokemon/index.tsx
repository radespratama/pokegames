import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import * as T from "./index.style";
import type { IMyPokemon } from "@/services/api/pokemons";
import { POKEMON_STORE_KEY, usePokemonStore } from "@/store/app/pokemonStore";
import { generatePokeSummary } from "@/utils";
import {
  Button,
  DeleteButton,
  Modal,
  Navbar,
  PokeCard,
  Text,
} from "@/components/ui";

const MyPokemonModule = () => {
  const navRef = useRef<HTMLDivElement>(null);

  const { pokemons, setState } = usePokemonStore();

  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string>("");

  function releasePokemon(nickname: string) {
    const newCollection = pokemons.filter(
      (pokemon: IMyPokemon) => pokemon.nickname !== nickname,
    );

    localStorage.setItem(POKEMON_STORE_KEY, JSON.stringify(newCollection));

    setState({
      pokemons: newCollection,
      pokeSummary: generatePokeSummary(newCollection),
    });

    setDeleteConfirmation(false);
  }

  return (
    <>
      <Modal open={deleteConfirmation} overlay="light">
        <T.DeleteConfirmationModal>
          <div className="pxl-border" style={{ textAlign: "left" }}>
            <Text>Are you sure you want to release {selectedPokemon}?</Text>
            <br />
            <Text>
              You'll have to catch another one and cannot undo this action
            </Text>
          </div>

          <div>
            <Button
              variant="light"
              onClick={() => releasePokemon(selectedPokemon)}>
              Release
            </Button>
            <Button onClick={() => setDeleteConfirmation(false)}>Back</Button>
          </div>
        </T.DeleteConfirmationModal>
      </Modal>

      <T.Page style={{ marginBottom: navRef.current?.clientHeight || 0 }}>
        <T.Header>
          <Text as="h1" variant="darker" size="lg">
            My Pokemon
          </Text>
          <Text as="span" variant="darker" size="lg">
            Total: {pokemons.length}
          </Text>
        </T.Header>

        {pokemons.length ? (
          <T.Grid>
            {[...pokemons].reverse().map((pokemon: IMyPokemon) => (
              <T.WrapperCardList key={pokemon.nickname}>
                <PokeCard
                  name={pokemon.name}
                  nickname={pokemon.nickname}
                  sprite={pokemon.sprite}>
                  <DeleteButton
                    onClick={() => {
                      setSelectedPokemon(pokemon.nickname);
                      setDeleteConfirmation(true);
                    }}
                  />
                </PokeCard>
              </T.WrapperCardList>
            ))}
          </T.Grid>
        ) : (
          <T.EmptyState>
            <Text size="lg">You haven't caught any pokemon</Text>
            <Link to="/pokemons">
              <Button>Explore</Button>
            </Link>
          </T.EmptyState>
        )}
      </T.Page>

      <Navbar ref={navRef} />
    </>
  );
};

export default MyPokemonModule;
