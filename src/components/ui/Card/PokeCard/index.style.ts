import { LazyLoadImage } from "react-lazy-load-image-component";
import styled from "@emotion/styled";

import type { PokeCardProps } from ".";
import { colors } from "@/utils";

const getStyle = ({ nickname }: PokeCardProps) => {
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

export const PokemonAvatar = styled(LazyLoadImage)`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

export const PixelatedPokemonCard = styled("div")((props: PokeCardProps) =>
  getStyle(props),
);
