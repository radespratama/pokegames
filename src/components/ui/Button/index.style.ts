import styled from "@emotion/styled";

import type { IButtonProps } from ".";
import { colors, units } from "@/utils";

const getStyle = ({ variant = "sky", disabled }: IButtonProps) => {
  const style = {
    display: "flex",
    gap: units.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  };

  switch (variant) {
    case "light":
      return {
        ...style,
        background: colors["yellow-300"],
        "&:not(.no-inset)::after": {
          boxShadow: `inset -4px -4px ${colors["yellow-300"]}`,
        },
        "&:hover": {
          backgroundColor: colors["yellow-100"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["yellow-300"]}`,
        },
        ...(disabled && {
          cursor: "not-allowed",
          opacity: 0.6,
          pointerEvents: "none" as const,
        }),
      };
    case "dark":
      return {
        ...style,
        background: colors["red-700"],
        "&:not(.no-inset)::after": {
          boxShadow: `inset -4px -4px ${colors["red-600"]}`,
        },
        "&:hover": {
          backgroundColor: colors["red-500"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["red-300"]}`,
        },
        ...(disabled && {
          cursor: "not-allowed",
          opacity: 0.6,
          pointerEvents: "none" as const,
        }),
      };
    default:
      return {
        ...style,
        background: colors["sky-200"],
        "&:not(.no-inset)::after": {
          boxShadow: `inset -4px -4px ${colors["sky-300"]}`,
        },
        "&:hover": {
          backgroundColor: colors["sky-100"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["sky-300"]}`,
        },
        ...(disabled && {
          cursor: "not-allowed",
          opacity: 0.6,
          pointerEvents: "none" as const,
        }),
      };
  }
};

export const PixelatedButton = styled("button")((props: IButtonProps) =>
  getStyle(props),
);
