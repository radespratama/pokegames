import styled from "@emotion/styled";

import type { ITextProps } from ".";
import { colors, textShadow, units } from "@/utils";

const getStyle = ({
  variant = "default",
  size = "base",
  as = "p",
}: ITextProps) => {
  switch (variant) {
    case "outlined":
      return {
        as,
        color: colors["gray-100"],
        textShadow: textShadow[`bold-${size}`],
        fontSize: units.fontSize[size],
      };
    case "darker":
      return {
        as,
        color: colors["gray-900"],
        textShadow: textShadow[`light-${size}`],
        fontSize: units.fontSize[size],
      };
    case "error":
      return {
        as,
        color: colors["red-200"],
        textShadow: textShadow[`light-${size}`],
        fontSize: units.fontSize[size],
      };
    default:
      return {
        as,
        color: colors["gray-800"],
        textShadow: textShadow[`light-${size}`],
        fontSize: units.fontSize[size],
      };
  }
};

export const PixelatedText = styled("p")((props: ITextProps) =>
  getStyle(props),
);
