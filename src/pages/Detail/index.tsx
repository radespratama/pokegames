import React, { FormEvent, ChangeEvent, useEffect, useState, createRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { Button, Navbar, Text, Loading, TypeCard, Input, Modal } from "../../components";
import { useGlobalContext } from "../../libs/context";
import { generatePokeSummary } from "../../libs/helpers";
import { IPokemonDetailResponse } from "../../libs/types/pokemon";

import * as T from "./index.style";

const DetailPokemon: React.FC = () => {
  const { name } = useParams();

  const [types, setTypes] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [sprite, setSprite] = useState<string>("");
  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [nicknameModal, setNicknameModal] = useState<boolean>(false);
  const [nicknameIsValid, setNicknameIsValid] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  const { setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  async function loadPokemon() {
    try {
      setIsLoading(true);
      const {
        data: { types, sprites, moves },
      } = await axios.get<IPokemonDetailResponse>(`${import.meta.env.VITE_POKEMON_API}/${name}`);
      setTypes(types.map((type: any) => type.type.name));
      setMoves(moves.map((move: any) => move.move.name));
      setSprite(sprites.front_default);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  async function catchPokemon() {
    return new Promise((resolve) => {
      setTimeout(() => {
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
    setTimeout(() => {
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
    for (let collection of parsed) {
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
    setNavHeight(navRef.current?.clientHeight!);
    loadPokemon();
  }, []);

  return (
    <>
      <Modal open={isCatching}>
        <T.CatchingModal>
          <LazyLoadImage
            style={{ margin: "0 auto" }}
            src={sprite}
            alt={name}
            width={320}
            height={320}
          />
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
              <LazyLoadImage
                style={{ margin: "0 auto" }}
                src={sprite}
                alt={name}
                width={320}
                height={320}
              />

              <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
              <Text variant="outlined" size="xl">
                Oh no, {name?.toUpperCase()} broke free
              </Text>
            </T.PostCatchModal>
          </Modal>
          <Modal open={isCaught} overlay="light">
            <T.PostCatchModal>
              <LazyLoadImage
                style={{ margin: "0 auto" }}
                src={sprite}
                alt={name}
                width={320}
                height={320}
              />

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
          <LazyLoadImage
            style={{ margin: "0 auto" }}
            src={sprite}
            alt={name}
            width={320}
            height={320}
          />

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
        {!isLoading ? (
          <LazyLoadImage
            style={{ margin: "0 auto" }}
            src={sprite}
            alt={name}
            width={256}
            height={256}
          />
        ) : (
          <T.ImageLoadingWrapper>
            <Loading />
          </T.ImageLoadingWrapper>
        )}

        <T.Content>
          <div>
            <Text as="h3">Type</Text>
            {!isLoading ? (
              types && types.map((type, index: any) => <TypeCard key={index} type={type} />)
            ) : (
              <T.DescriptionLoadingWrapper>
                <Loading label="Loading types..." />
              </T.DescriptionLoadingWrapper>
            )}
          </div>

          <div>
            <Text as="h3">Moves</Text>
            {!isLoading ? (
              <T.Grid>
                {moves &&
                  moves.map((move, index: any) => (
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
