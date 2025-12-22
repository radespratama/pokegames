import { LazyLoadImage } from "react-lazy-load-image-component";
import styled from "@emotion/styled";

import type { PokeCardProps } from ".";
import { colors } from "@/utils";

const getStyle = ({ nickname, ...props }: PokeCardProps) => {
  const isSelected =
    props.selectedPokemon &&
    props.selectedPokemon === nickname?.toLowerCase().replace(" ", "-");

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
    background-color: ${isSelected ? `${colors["red-300"]}` : colors["white-950"]}; 
    cursor: ${nickname ? "default" : "pointer"};
    &:hover {
      background-color: ${
        isSelected
          ? `${colors["red-400"]}`
          : nickname
            ? colors["gray-100"]
            : colors["gray-100"]
      };
    }
    &:active::after {
      box-shadow: inset ${nickname ? "-4px -4px" : "4px 4px"} ${colors["gray-300"]};
    }
    ${isSelected ? `&::after { box-shadow: inset 0 0 0 4px ${colors["red-700"]}; }` : ""}
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

export const PixelatedPokemonCard = styled("div")(
  (props: Omit<PokeCardProps, "setSelectedPokemon">) => getStyle(props),
);
