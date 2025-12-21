import { LazyLoadImage } from "react-lazy-load-image-component";
import { PixelatedPokemonCard, PokemonAvatar } from "./index.style";
import type { HTMLAttributes } from "react";

import { POKEMON_IMAGE } from "@/configs/api";
import Text from "@/components/ui/Text";
import { usePokemonExperience } from "@/hooks/common/battle/usePokemonExperience";

import "react-lazy-load-image-component/src/effects/blur.css";

export interface PokeCardProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  nickname?: string;
  captured?: number;
  sprite?: string;
  pokemonId?: number | string;
  level?: number;
  exp?: number;
  selectedPokemon?: string;
  setSelectedPokemon?: () => void;
}

const PokeCard = ({
  name,
  nickname,
  captured,
  sprite,
  pokemonId,
  level,
  exp,
  children,
  selectedPokemon,
  setSelectedPokemon,
}: PokeCardProps) => {
  const { getExpProgress } = usePokemonExperience();

  const expData = nickname ? getExpProgress(nickname) : null;

  return (
    <PixelatedPokemonCard
      nickname={nickname}
      className="pxl-border"
      style={{
        cursor: "pointer",
      }}
      selectedPokemon={selectedPokemon}
      onClick={setSelectedPokemon}>
      {nickname ? (
        <>
          <PokemonAvatar
            src={sprite}
            alt={`pokemon ${name}`}
            width={96}
            height={96}
            loading="lazy"
          />

          <Text variant="darker" size="lg">
            {nickname}
          </Text>

          {level !== undefined && (
            <div style={{ width: "100%", marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}>
                <Text as="span">Lv. {level}</Text>
                <Text as="span">
                  {expData?.current || exp || 0}/{expData?.needed || 100} EXP
                </Text>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#ddd",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                <div
                  style={{
                    width: `${expData?.percentage || 0}%`,
                    height: "100%",
                    backgroundColor: "#000",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <LazyLoadImage
          src={`${POKEMON_IMAGE}/${pokemonId}.png`}
          alt={`pokemon ${name}`}
          width={96}
          height={96}
          loading="lazy"
          effect="blur"
        />
      )}

      <Text>{name}</Text>

      {children}

      {captured ? (
        <div className="capture-qty">
          <LazyLoadImage
            src="/static/pokeball.png"
            alt="pokeball"
            width={16}
            height={16}
          />
          <Text>x{captured}</Text>
        </div>
      ) : null}
    </PixelatedPokemonCard>
  );
};

export default PokeCard;
