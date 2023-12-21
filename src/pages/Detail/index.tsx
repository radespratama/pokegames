/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import styled from "@emotion/styled";
import { useParams, Link } from "react-router-dom";
import { clearTimeout, setTimeout } from "worker-timers";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FormEvent, ChangeEvent, useEffect, useState, createRef, useRef } from "react";

import { useGlobalContext } from "../../context";
import { generatePokeSummary } from "../../helpers";
import { IPokemonDetailResponse } from "../../types/pokemon";
import { Button, Navbar, Text, Loading, TypeCard, Input, Modal } from "../../components";

import "react-lazy-load-image-component/src/effects/blur.css";
import * as T from "./index.style";
import { getDetailPokemon } from "../../services/pokemon";

type TypesPokemon = { type: { name: string } };
type MovesPokemon = { move: { name: string } };

const PokemonAvatar = styled(LazyLoadImage)`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const DetailPokemon = () => {
  const { name = "" } = useParams();

  const catchPokemonTimeout = useRef<NodeJS.Timeout | number>(0);
  const throwBallTimeout = useRef<NodeJS.Timeout | number>(0);

  const [sprite, setSprite] = useState<string>("");
  const [types, setTypes] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [nickname, setNickname] = useState<string>("");
  const [navHeight, setNavHeight] = useState<number>(0);
  const [stats, setStats] = useState<IPokemonDetailResponse["stats"]>([]);
  const [abilities, setAbilities] = useState<IPokemonDetailResponse["abilities"]>([]);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);

  const [nicknameModal, setNicknameModal] = useState<boolean>(false);
  const [nicknameIsValid, setNicknameIsValid] = useState<boolean>(true);

  const { setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  async function loadPokemon() {
    try {
      setIsLoading(true);

      const response = await getDetailPokemon(name);

      setTypes(response?.types.map((type: TypesPokemon) => type.type?.name));
      setMoves(response?.moves.map((move: MovesPokemon) => move.move?.name));
      setSprite(
        response?.sprites.versions?.["generation-v"]?.["black-white"].animated.front_default ||
          response?.sprites.front_default,
      );

      setStats(response?.stats);
      setAbilities(response?.abilities);
      setIsLoading(false);
    } catch (error) {
      toast("Oops!. Fail get pokemons. Please try again!");
      setIsLoading(false);
      console.error({ error });
    }
  }

  async function catchPokemon() {
    if (catchPokemonTimeout.current) clearTimeout(catchPokemonTimeout.current as number);

    return new Promise((resolve) => {
      catchPokemonTimeout.current = setTimeout(() => {
        resolve(Math.random() < 0.5 ? false : true);
      }, 2000);
    });
  }

  async function throwPokeball() {
    setIsCatching(true);
    const isCaught = await catchPokemon();
    setIsCatching(false);
    setIsEndPhase(true);

    if (isCaught) {
      setIsCaught(true);
    } else {
      setIsCaught(false);
    }

    if (throwBallTimeout.current) clearTimeout(throwBallTimeout.current as number);

    throwBallTimeout.current = setTimeout(() => {
      setIsEndPhase(false);
      isCaught && setNicknameModal(true);
    }, 1200);
  }

  async function onNicknameSave(e: FormEvent) {
    e.preventDefault();

    const currentCollection = localStorage.getItem("pokegames@myPokemon");
    const parsed: { name: string; nickname: string; sprite: string }[] =
      JSON.parse(currentCollection!) || [];

    let isUnique = true;
    for (const collection of parsed) {
      if (collection.nickname === nickname) {
        setNicknameIsValid(false);
        isUnique = false;
        return;
      } else {
        !nicknameIsValid && setNicknameIsValid(true);
        isUnique = true;
      }
    }

    if (isUnique) {
      parsed.push({
        name: name!.toUpperCase(),
        nickname,
        sprite,
      });
      localStorage.setItem("pokegames@myPokemon", JSON.stringify(parsed));
      setState({ pokeSummary: generatePokeSummary(parsed) });
      setIsSaved(true);
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight as number);
    loadPokemon();

    return () => {
      setTypes([]);
      setMoves([]);
      setStats([]);
      setSprite("");
      setAbilities([]);
    };
  }, []);

  useEffect(() => {
    document.title = `Pokegames - ${name?.toUpperCase()}`;

    return () => {
      document.title = "Pokegames";
    };
  }, []);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <Modal open={isCatching}>
        <T.CatchingModal>
          <T.ImageContainer>
            <PokemonAvatar
              src={sprite}
              alt={name}
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
                  alt={name}
                  width={320}
                  height={320}
                  effect="blur"
                  loading="lazy"
                  className="pokemon-dt"
                />
              </T.ImageContainer>

              <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
              <Text variant="outlined" size="xl">
                Oh no, {name?.toUpperCase()} broke free
              </Text>
            </T.PostCatchModal>
          </Modal>
          <Modal open={isCaught} overlay="light">
            <T.PostCatchModal>
              <T.ImageContainer>
                <PokemonAvatar
                  src={sprite}
                  alt={name}
                  width={320}
                  height={320}
                  effect="blur"
                  loading="lazy"
                  className="pokemon-dt"
                />
              </T.ImageContainer>

              <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
              <Text variant="outlined" size="xl">
                Gotcha! {name?.toUpperCase()} was caught!
              </Text>
            </T.PostCatchModal>
          </Modal>
        </>
      )}

      <Modal open={nicknameModal} overlay="light" solid>
        <T.NicknamingModal>
          <T.ImageContainer>
            <PokemonAvatar
              src={sprite}
              alt={name}
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
                  <Text>You just caught a {name?.toUpperCase()}</Text>
                  <br />
                  <Text>Now please give {name?.toUpperCase()} a nickname...</Text>
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
                  setNickname(e.target.value.toUpperCase())
                }
              />

              <Button type="submit">Save</Button>
            </T.NicknamingForm>
          ) : (
            <T.AnotherWrapper>
              <div className="pxl-border" style={{ textAlign: "left" }}>
                <Text>Whoosh! {nickname} is now in your Pokemon list</Text>
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

      <T.Page style={{ marginBottom: navHeight }}>
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
            {name}
          </Text>
        </T.PokeName>
        <T.PokemonContainer>
          <div className="pxl-border card-pxl">
            <Text as="h4" variant="outlined" size="lg">
              Pokemon Stats:
            </Text>
            <T.PokemonStatsWrapper>
              {stats?.map((stat, index) => {
                const pokemonBaseStat = stat?.base_stat ?? 0;
                const pokemonStatName = stat?.stat;

                return (
                  <Text as="h4" key={index} variant="outlined" size="base">
                    {pokemonStatName?.name} : {pokemonBaseStat}
                  </Text>
                );
              })}
            </T.PokemonStatsWrapper>
          </div>
          <div className="img-pokemon" style={{ display: "flex", justifyContent: "center" }}>
            {!isLoading ? (
              <PokemonAvatar
                src={sprite}
                alt={name}
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
                types &&
                types.map((type: string, index: number) => <TypeCard key={index} type={type} />)
              ) : (
                <T.DescriptionLoadingWrapper>
                  <Loading label="Loading types..." />
                </T.DescriptionLoadingWrapper>
              )}
            </div>

            <div className="pxl-abilities">
              <Text as="h3">Abilities</Text>
              {!isLoading ? (
                abilities &&
                abilities.map((ability, index) => (
                  <TypeCard key={index} type={ability.ability?.name} />
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
                {moves &&
                  moves.map((move: string, index: number) => (
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
            onClick={() => throwPokeball()}
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
