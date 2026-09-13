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
import { statsAtLevel } from "@/utils/leveling";
import {
  baseStatTotal,
  buildMovePool,
  buildSkills,
  catchChance,
  getBaseStat,
  toV2BattleMove,
} from "@/utils/pokemon-utils";

/** Highest base stat in the games (Blissey HP) - the meter's full scale. */
const MAX_BASE_STAT = 255;

interface DetailPokemonProps {
  pokemonName: string;
}

const DetailPokemon = ({ pokemonName }: DetailPokemonProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const nicknameRef = useRef<string>("");

  const { data: pokemonDetail, isFetching: isLoading } = usePokemonDetail({
    pokemonName,
  });
  const { pokemons, addPokemon } = usePokemonStore();

  const chance = pokemonDetail
    ? catchChance(baseStatTotal(pokemonDetail.stats))
    : 0.5;

  const {
    isCatching,
    isCaught,
    isEndPhase,
    shake,
    totalShakes,
    throwPokeball,
  } = useCatchPokemon(() => setNicknameModal(true), chance);

  const [sprite, setSprite] = useState<string>("");
  const [backSprite, setBackSprite] = useState<string>("");

  const [types, setTypes] = useState<Array<string>>([]);
  const [moves, setMoves] = useState<Array<string>>([]);

  const [baseExperience, setBaseExperience] = useState<number>(0);
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

    if (!pokemonDetail) return;

    const base_stats = {
      hp: getBaseStat(pokemonDetail, "hp"),
      attack: getBaseStat(pokemonDetail, "attack"),
      defense: getBaseStat(pokemonDetail, "defense"),
      special_attack: getBaseStat(pokemonDetail, "special-attack"),
      special_defense: getBaseStat(pokemonDetail, "special-defense"),
      speed: getBaseStat(pokemonDetail, "speed"),
    };

    const LEVEL_1 = 1;
    const scaledStats = statsAtLevel(base_stats, LEVEL_1);

    const typesBuild = pokemonDetail.types.map((t) => t.type.name || "");
    const movePool = buildMovePool(pokemonDetail.moves, 10);

    movePool.sort((a, b) => b.power - a.power);

    const numberOfUltimates = typesBuild.length > 0 ? typesBuild.length : 1;

    const selectedUltimates = movePool
      .slice(0, numberOfUltimates)
      .map((move, index) => {
        return toV2BattleMove(move, typesBuild[index] || "normal");
      });

    const skillPool = movePool.slice(numberOfUltimates, numberOfUltimates + 2);
    const skills = buildSkills(skillPool, typesBuild);

    const newPokemons = {
      name: pokemonName.toUpperCase(),
      nickname: nicknameRef.current,
      sprite,
      sprite_back: backSprite,
      base_experience: baseExperience,
      moveDataVersion: 2 as const,
      stats: scaledStats,
      types: typesBuild,
      moves: selectedUltimates,
      skills,
      battle_state: {
        level: LEVEL_1,
        experience: 0,
      },
      base_stats,
    };

    addPokemon(newPokemons);
    setIsSaved(true);
  }

  function setValuePokemon(result: IPokemonDetailResponse) {
    const spritedFront =
      result.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;

    const spritedBack =
      result.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.back_default;

    setBaseExperience(result.base_experience);
    setTypes(result.types.map((type) => type.type.name || ""));
    setMoves(result.moves.map((move) => move.move?.name || ""));
    setSprite(spritedFront || result.sprites.front_default);
    setBackSprite(spritedBack || result.sprites.back_default);
    setStats(result.stats);
    setAbilities(result.abilities);
  }

  useEffect(() => {
    if (pokemonDetail) {
      setValuePokemon(pokemonDetail);
    }
  }, [pokemonDetail]);

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
              Shake {shake} of {totalShakes}...
            </Text>
            <T.ShakeTrack aria-hidden="true">
              {Array.from({ length: totalShakes }, (_, index) => (
                <T.ShakePip key={index} on={index < shake} />
              ))}
            </T.ShakeTrack>
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
              <T.RevealStage type={types[0]}>
                <T.SparkleField aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </T.SparkleField>
                <T.PokemonAvatar
                  src={sprite}
                  alt={pokemonName}
                  width={320}
                  height={320}
                  effect="blur"
                  loading="lazy"
                  className="pokemon-dt"
                />
              </T.RevealStage>
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

        <T.CharacterCard className="pxl-border" type={types[0]}>
          <T.CardHeader type={types[0]}>
            <Text as="h1" variant="outlined" size="xl">
              {pokemonName}
            </Text>
            <T.DexNo>
              No. {String(pokemonDetail?.id ?? 0).padStart(3, "0")}
            </T.DexNo>
          </T.CardHeader>

          <T.CardBody>
            <T.SpritePanel type={types[0]}>
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
            </T.SpritePanel>

            <T.StatBlock>
              <Text as="h4" variant="darker" size="lg">
                Base stats
              </Text>
              {stats.map((stat) => (
                <T.StatRow key={stat.stat.name}>
                  <span>{stat.stat.name}</span>
                  <T.StatBar
                    type={types[0]}
                    pct={Math.min(
                      100,
                      Math.round(((stat.base_stat || 0) / MAX_BASE_STAT) * 100),
                    )}
                    role="meter"
                    aria-label={stat.stat.name}
                    aria-valuenow={stat.base_stat || 0}
                    aria-valuemin={0}
                    aria-valuemax={MAX_BASE_STAT}
                  />
                  <b>{stat.base_stat || 0}</b>
                </T.StatRow>
              ))}
              <T.BaseExp>Base exp {baseExperience}</T.BaseExp>
              {!isLoading && (
                <T.CatchRate type={types[0]}>
                  Catch rate {Math.round(chance * 100)}%
                </T.CatchRate>
              )}
            </T.StatBlock>
          </T.CardBody>

          <T.TypeStrip>
            {!isLoading ? (
              types.map((type) => <TypeCard key={type} hasIcon type={type} />)
            ) : (
              <T.DescriptionLoadingWrapper>
                <Loading label="Loading types..." />
              </T.DescriptionLoadingWrapper>
            )}
          </T.TypeStrip>
        </T.CharacterCard>

        <T.Content>
          <div>
            <Text as="h3" size="lg" variant="outlined">
              Abilities
            </Text>
            {!isLoading ? (
              abilities.map((ability) => (
                <TypeCard
                  key={ability.ability.name}
                  type={ability.ability.name}
                />
              ))
            ) : (
              <T.DescriptionLoadingWrapper>
                <Loading label="Loading abilities..." />
              </T.DescriptionLoadingWrapper>
            )}
          </div>

          <div>
            <Text as="h3" size="lg" variant="outlined">
              Moves
            </Text>
            {!isLoading ? (
              <T.Grid>
                {moves.map((move) => (
                  <div
                    key={move}
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
