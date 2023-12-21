import React, { HTMLAttributes } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import styled from "@emotion/styled";

import { Text } from "..";
import { colors } from "../../utils";
import { POKEMON_IMAGE } from "../../configs/api";

import "react-lazy-load-image-component/src/effects/blur.css";

interface Props extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  nickname?: string;
  captured?: number;
  sprite?: string;
  pokemonId?: number | string;
}

const getStyle = ({ nickname }: Props) => {
  return `
  .capture-qty,
  button {
    position: absolute;
    top: 4px;
    right: 8px;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  cursor: ${nickname ? "default" : "pointer"};
  &:hover {
    background-color: ${nickname ? colors["gray-100"] : colors["gray-200"]};
  }
  &:active::after {
    box-shadow: inset ${nickname ? "-4px -4px" : "4px 4px"} ${colors["gray-300"]};
  }
  img {
    margin: 0 auto;
  }
  `;
};

const PokemonAvatar = styled(LazyLoadImage)`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const PixelatedPokemonCard = styled("div")((props: Props) => getStyle(props));

const PokeCard: React.FC<Props> = ({ name, nickname, captured, sprite, pokemonId, children }) => {
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
          <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={16} height={16} />
          <Text>x{captured}</Text>
        </div>
      ) : null}
    </PixelatedPokemonCard>
  );
};

export default PokeCard;
