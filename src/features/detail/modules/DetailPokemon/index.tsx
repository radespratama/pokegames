import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";

import * as T from "./index.style";
import type { IPokemonDetailResponse } from "@/services/api/pokemons";
import type { ChangeEvent, FormEvent } from "react";
import { usePokemonDetail } from "@/hooks/queries/pokemon";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { useCatchPokemon } from "@/hooks/common/useCatchPokemon";
import {
  Button,
  Input,
  Loading,
  Modal,
  Navbar,
  Text,
  TypeCard,
} from "@/components/ui";

import "react-lazy-load-image-component/src/effects/blur.css";

interface DetailPokemonProps {
  pokemonName: string;
}

const DetailPokemon = ({ pokemonName }: DetailPokemonProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const nicknameRef = useRef<string>("");

  const { data, isFetching: isLoading } = usePokemonDetail({ pokemonName });
  const { pokeSummary, pokemons, setState } = usePokemonStore();

  const { isCatching, isCaught, isEndPhase, throwPokeball } = useCatchPokemon(
    () => setNicknameModal(true),
  );

  const [sprite, setSprite] = useState<string>("");
  const [types, setTypes] = useState<Array<string>>([]);
  const [moves, setMoves] = useState<Array<string>>([]);
  const [stats, setStats] = useState<IPokemonDetailResponse["stats"]>([]);
  const [abilities, setAbilities] = useState<
    IPokemonDetailResponse["abilities"]
  >([]);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [nicknameModal, setNicknameModal] = useState<boolean>(false);
  const [nicknameIsValid, setNicknameIsValid] = useState<boolean>(true);

  function onNicknameSave(e: FormEvent) {
    e.preventDefault();

    const isUnique = !pokemons.some(
      (collection) => collection.nickname === nicknameRef.current,
    );

    if (!isUnique) {
      setNicknameIsValid(false);
      return;
    }

    setNicknameIsValid(true);

    const newPokemons = [
      ...pokemons,
      {
        name: pokemonName.toUpperCase(),
        nickname: nicknameRef.current,
        sprite,
      },
    ];

    setState({
      pokemons: newPokemons,
      pokeSummary: newPokemons.reduce(
        (acc, poke) => {
          const existing = acc.find((p) => p.name === poke.name);

          if (existing) {
            existing.captured++;
          } else {
            acc.push({ name: poke.name, captured: 1 });
          }

          return acc;
        },
        [] as typeof pokeSummary,
      ),
    });

    setIsSaved(true);
  }

  useEffect(() => {
    if (data) {
      const response = data as IPokemonDetailResponse;

      setTypes(response.types.map((type) => type.type?.name || ""));
      setMoves(response.moves.map((move) => move.move?.name || ""));
      setSprite(
        response.sprites.versions?.["generation-v"]?.["black-white"]?.animated
          ?.front_default || response.sprites.front_default,
      );

      setStats(response.stats);
      setAbilities(response.abilities);
    }
  }, [data]);

  useEffect(() => {
    document.title = `Pokegames - ${pokemonName.toUpperCase()}`;
    window.scroll({ top: 0, behavior: "smooth" });

    return () => {
      document.title = "Pokegames";
    };
  }, [pokemonName]);

  return (
    <>
      <Modal open={isCatching}>
        <T.CatchingModal>
          <T.ImageContainer>
            <T.PokemonAvatar
              src={sprite}
              alt={pokemonName}
              width={320}
              height={320}
              effect="blur"
              loading="lazy"
              className="pokemon-dt"
            />
          </T.ImageContainer>
          <div style={{ display: "grid", placeItems: "center" }}>
            <LazyLoadImage
              className="pokeball"
              src="/static/pokeball.png"
              alt="pokeball"
              width={128}
              height={128}
            />
            <Text variant="outlined" size="xl">
              Catching...
            </Text>
          </div>
        </T.CatchingModal>
      </Modal>

      {isEndPhase && (
        <>
          <Modal open={!isCaught} overlay="error">
            <T.PostCatchModal>
              <T.ImageContainer>
                <LazyLoadImage
                  src={sprite}
                  alt={pokemonName}
                  width={320}
                  height={320}
                  effect="blur"
                  loading="lazy"
                  className="pokemon-dt"
                />
              </T.ImageContainer>
              <LazyLoadImage
                src="/static/pokeball.png"
                alt="pokeball"
                width={128}
                height={128}
              />
              <Text variant="outlined" size="xl">
                Oh no, {pokemonName.toUpperCase()} broke free
              </Text>
            </T.PostCatchModal>
          </Modal>

          <Modal open={isCaught} overlay="light">
            <T.PostCatchModal>
              <T.ImageContainer>
                <T.PokemonAvatar
                  src={sprite}
                  alt={pokemonName}
                  width={320}
                  height={320}
                  effect="blur"
                  loading="lazy"
                  className="pokemon-dt"
                />
              </T.ImageContainer>
              <LazyLoadImage
                src="/static/pokeball.png"
                alt="pokeball"
                width={128}
                height={128}
              />
              <Text variant="outlined" size="xl">
                Gotcha! {pokemonName.toUpperCase()} was caught!
              </Text>
            </T.PostCatchModal>
          </Modal>
        </>
      )}

      <Modal open={nicknameModal} overlay="light" solid>
        <T.NicknamingModal>
          <T.ImageContainer>
            <T.PokemonAvatar
              src={sprite}
              alt={pokemonName}
              width={320}
              height={320}
              effect="blur"
              loading="lazy"
              className="pokemon-dt"
            />
          </T.ImageContainer>

          {!isSaved ? (
            <T.NicknamingForm onSubmit={onNicknameSave}>
              {nicknameIsValid ? (
                <div className="pxl-border" style={{ textAlign: "left" }}>
                  <Text>Congratulations!</Text>
                  <Text>You just caught a {pokemonName.toUpperCase()}</Text>
                  <br />
                  <Text>
                    Now please give {pokemonName.toUpperCase()} a nickname...
                  </Text>
                </div>
              ) : (
                <div className="pxl-border" style={{ textAlign: "left" }}>
                  <Text variant="error">Nickname is taken</Text>
                  <Text>Please pick another nickname...</Text>
                </div>
              )}

              <Input
                required
                placeholder="enter a nickname"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  (nicknameRef.current = e.target.value.toUpperCase())
                }
              />

              <Button type="submit">Save</Button>
            </T.NicknamingForm>
          ) : (
            <T.AnotherWrapper>
              <div className="pxl-border" style={{ textAlign: "left" }}>
                <Text>
                  Whoosh! {nicknameRef.current} is now in your Pokemon list
                </Text>
              </div>

              <Link to="/my-pokemon">
                <Button variant="light">See My Pokemon</Button>
              </Link>

              <Link to="/pokemons">
                <Button>Catch Another</Button>
              </Link>
            </T.AnotherWrapper>
          )}
        </T.NicknamingModal>
      </Modal>

      <T.Page style={{ marginBottom: navRef.current?.clientHeight || 0 }}>
        <LazyLoadImage
          id="pokeball-bg"
          src="/static/pokeball-transparent.png"
          alt="pokeball background"
          width={512}
          height={512}
        />
        <T.PokeName>
          <div />
          <div />
          <div />
          <Text as="h1" variant="outlined" size="xl">
            {pokemonName}
          </Text>
        </T.PokeName>

        <T.PokemonContainer>
          <div className="pxl-border card-pxl">
            <Text as="h4" variant="outlined" size="lg">
              Pokemon Stats:
            </Text>
            <T.PokemonStatsWrapper>
              {stats.map((stat, index) => (
                <Text as="h4" key={index} variant="outlined" size="base">
                  {stat.stat.name} : {stat.base_stat || 0}
                </Text>
              ))}
            </T.PokemonStatsWrapper>
          </div>

          <div
            className="img-pokemon"
            style={{ display: "flex", justifyContent: "center" }}>
            {!isLoading ? (
              <T.PokemonAvatar
                src={sprite}
                alt={pokemonName}
                width={256}
                height={256}
                effect="blur"
                loading="lazy"
                className="pokemon-dt"
              />
            ) : (
              <T.ImageLoadingWrapper>
                <Loading />
              </T.ImageLoadingWrapper>
            )}
          </div>
        </T.PokemonContainer>

        <T.Content style={{ marginTop: "30px" }}>
          <T.AbilitiesWrapper>
            <div className="pxl-type">
              <Text as="h3">Type</Text>
              {!isLoading ? (
                types.map((type, index) => <TypeCard key={index} type={type} />)
              ) : (
                <T.DescriptionLoadingWrapper>
                  <Loading label="Loading types..." />
                </T.DescriptionLoadingWrapper>
              )}
            </div>

            <div className="pxl-abilities">
              <Text as="h3">Abilities</Text>
              {!isLoading ? (
                abilities.map((ability, index) => (
                  <TypeCard key={index} type={ability.ability.name} />
                ))
              ) : (
                <T.DescriptionLoadingWrapper>
                  <Loading label="Loading abilities..." />
                </T.DescriptionLoadingWrapper>
              )}
            </div>
          </T.AbilitiesWrapper>

          <div>
            <Text as="h3">Moves</Text>
            {!isLoading ? (
              <T.Grid>
                {moves.map((move, index) => (
                  <div
                    key={index}
                    className="pxl-border"
                    style={{ marginBottom: 16, marginRight: 16 }}>
                    <Text>{move}</Text>
                  </div>
                ))}
              </T.Grid>
            ) : (
              <T.DescriptionLoadingWrapper>
                <Loading label="Loading moves..." />
              </T.DescriptionLoadingWrapper>
            )}
          </div>
        </T.Content>
      </T.Page>

      <Navbar ref={navRef} fadeHeight={224}>
        {!isLoading && (
          <Button
            variant="dark"
            onClick={throwPokeball}
            size="xl"
            icon="/static/pokeball.png">
            Catch
          </Button>
        )}
      </Navbar>
    </>
  );
};

export default DetailPokemon;
