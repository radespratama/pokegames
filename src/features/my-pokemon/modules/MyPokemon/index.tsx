import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as T from "./index.style";
import type { IMyPokemon } from "@/services/api/pokemons";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { Button, DeleteButton, Modal, PokeCard, Text } from "@/components/ui";

const PokedexDecorations = () => (
  <T.PokedexHeaderDeco>
    <T.BigBlueLight />
    <T.SmallLightsContainer>
      <T.SmallLight color="#990000" />
      <T.SmallLight color="#D4AF37" />
      <T.SmallLight color="#32CD32" />
    </T.SmallLightsContainer>
  </T.PokedexHeaderDeco>
);

const MyPokemonModule = () => {
  const navigate = useNavigate();

  const { pokemons, removePokemon } = usePokemonStore();
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string>("");

  function releasePokemon(nickname: string) {
    removePokemon(nickname);
    setDeleteConfirmation(false);
  }

  return (
    <>
      <Modal open={deleteConfirmation} overlay="dark">
        <T.DeleteConfirmationModal>
          <div className="pxl-border">
            <Text variant="darker" size="lg">
              RELEASE {selectedPokemon.toUpperCase()}?
            </Text>
            <br />
            <Text size="base">ACTION CANNOT BE UNDONE.</Text>
          </div>
          <div>
            <Button
              variant="dark"
              onClick={() => releasePokemon(selectedPokemon)}>
              CONFIRM
            </Button>

            <Button
              variant="light"
              onClick={() => setDeleteConfirmation(false)}>
              CANCEL
            </Button>
          </div>
        </T.DeleteConfirmationModal>
      </Modal>

      <T.PokedexFrame>
        <PokedexDecorations />

        <T.ScreenBezel>
          <T.ScreenHeader>
            <Text variant="outlined" size="lg">
              • MY POKEMON
            </Text>
            <Text variant="outlined" size="lg">
              {pokemons.length}/∞
            </Text>
          </T.ScreenHeader>

          <T.ScreenContainer>
            <T.ScreenContent>
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
                                pokemon.nickname
                                  .toLowerCase()
                                  .replace(" ", "-") || "",
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
                  <Text size="lg" variant="outlined">
                    NO DATA
                  </Text>
                  <Link to="/pokemons">
                    <Button variant="light">SEARCH WILD</Button>
                  </Link>
                </T.EmptyState>
              )}
            </T.ScreenContent>
          </T.ScreenContainer>

          <T.ControlPanel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}>
              <T.RoundButton
                onClick={() => navigate({ to: "/pokemons" })}
                aria-label="Back to Home">
                BACK
              </T.RoundButton>

              <span
                style={{
                  fontSize: "10px",
                  color: "#555",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}>
                EXIT
              </span>
            </div>

            <div style={{ flex: 1, padding: "0 16px", paddingRight: "24px" }}>
              <Button
                type="button"
                variant="dark"
                disabled={!selectedPokemon}
                size="lg"
                style={{ width: "100%", boxShadow: "4px 4px 0px #000" }}
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
            </div>

            <T.SpeakerVents>
              <div></div>
              <div></div>
              <div></div>
            </T.SpeakerVents>
          </T.ControlPanel>
        </T.ScreenBezel>
      </T.PokedexFrame>
    </>
  );
};

export default MyPokemonModule;
