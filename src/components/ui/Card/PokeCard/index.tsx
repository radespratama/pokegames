import { LazyLoadImage } from "react-lazy-load-image-component";
import { PixelatedPokemonCard, PokemonAvatar } from "./index.style";
import type { HTMLAttributes } from "react";

import { POKEMON_IMAGE } from "@/configs/api";
import Text from "@/components/ui/Text";

import "react-lazy-load-image-component/src/effects/blur.css";

export interface PokeCardProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  nickname?: string;
  captured?: number;
  sprite?: string;
  pokemonId?: number | string;
}

const PokeCard = ({
  name,
  nickname,
  captured,
  sprite,
  pokemonId,
  children,
}: PokeCardProps) => {
  return (
    <PixelatedPokemonCard nickname={nickname} className="pxl-border">
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
