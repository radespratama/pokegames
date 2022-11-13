import React, { HTMLAttributes } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import styled from "@emotion/styled";
import { Text } from ".";
import { colors } from "../libs/utils";

interface IPokeCard extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  nickname?: string;
  captured?: number;
  sprite?: string;
}

const getStyle = ({ nickname }: IPokeCard) => {
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

const PixelatedPokemonCard = styled("div")((props: IPokeCard) => getStyle(props));

const PokeCard: React.FC<IPokeCard> = ({ name, nickname, captured, sprite, children }) => {
  return (
    <PixelatedPokemonCard nickname={nickname} className="pxl-border">
      {nickname && (
        <>
          <LazyLoadImage src={sprite} alt={name} width={96} height={96} />
          <Text variant="darker" size="lg">
            {nickname}
          </Text>
        </>
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
