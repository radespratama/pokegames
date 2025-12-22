import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import * as T from "./index.style";
import type { IMyPokemon } from "@/services/api/pokemons";
import { usePokemonStore } from "@/store/app/pokemonStore";
import {
  Button,
  DeleteButton,
  Modal,
  Navbar,
  PokeCard,
  Text,
} from "@/components/ui";

const MyPokemonModule = () => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  const { pokemons, removePokemon } = usePokemonStore();

  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string>("");

  function releasePokemon(nickname: string) {
    removePokemon(nickname);
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
                  sprite={pokemon.sprite}
                  level={pokemon.battle_state.level}
                  exp={pokemon.battle_state.experience}
                  selectedPokemon={selectedPokemon}
                  setSelectedPokemon={() =>
                    selectedPokemon !== ""
                      ? setSelectedPokemon("")
                      : setSelectedPokemon(
                          pokemon.nickname.toLowerCase().replace(" ", "-") ||
                            "",
                        )
                  }>
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
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

      <Navbar ref={navRef}>
        <Button
          type="button"
          variant="dark"
          disabled={!selectedPokemon}
          size="lg"
          onClick={() =>
            navigate({
              to: "/vs-battle",
              search: {
                pokemon: selectedPokemon,
              },
            })
          }>
          WILD BATTLE
        </Button>
      </Navbar>
    </>
  );
};

export default MyPokemonModule;
