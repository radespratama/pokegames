import React, { createRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button, Navbar, Text, Modal, PokeCard, DeleteButton } from "../../components";
import { useGlobalContext } from "../../libs/context";
import { generatePokeSummary } from "../../libs/helpers";
import { IMyPokemon } from "../../libs/types/pokemon";

import * as T from "./index.style";

const MyPokemon: React.FC = () => {
  const [pokemons, setPokemons] = useState<IMyPokemon[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string>("");
  const [navHeight, setNavHeight] = useState<number>(0);
  const { setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  async function loadMyPokemon() {
    const rawPokemons = localStorage.getItem("pokegames@myPokemon");
    const parsed = JSON.parse(rawPokemons!) || [];
    setPokemons(parsed);
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight!);
    loadMyPokemon();
  }, []);

  async function releasePokemon(nickname: string) {
    const newCollection = pokemons.filter((pokemon: IMyPokemon) => pokemon.nickname !== nickname);
    localStorage.setItem("pokegames@myPokemon", JSON.stringify(newCollection));
    loadMyPokemon();
    setState({ pokeSummary: generatePokeSummary(newCollection) });
  }

  return (
    <>
      <Modal open={deleteConfirmation} overlay="light">
        <T.DeleteConfirmationModal>
          <div className="pxl-border" style={{ textAlign: "left" }}>
            <Text>Are you sure you want to release {selectedPokemon}?</Text>
            <br />
            <Text>You'll have to catch another one and cannot undo this action</Text>
          </div>

          <div>
            <Button
              variant="light"
              onClick={() => {
                releasePokemon(selectedPokemon);
                setDeleteConfirmation(false);
              }}>
              Release
            </Button>
            <Button onClick={() => setDeleteConfirmation(false)}>Back</Button>
          </div>
        </T.DeleteConfirmationModal>
      </Modal>

      <T.Page style={{ marginBottom: navHeight }}>
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
            {pokemons.length &&
              [...pokemons].reverse().map((pokemon: IMyPokemon) => (
                <T.WrapperCardList key={pokemon.nickname}>
                  <PokeCard name={pokemon.name} nickname={pokemon.nickname} sprite={pokemon.sprite}>
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
            <Text>You haven't caught any pokemon</Text>
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

export default MyPokemon;
