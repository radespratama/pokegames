import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { colors, units } from "@/utils";

interface IStyleProps {
  variant?: "light" | "dark" | "sky";
  matched: boolean;
}

const getStyle = ({ variant = "sky", matched }: IStyleProps) => {
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
        background: matched ? colors["yellow-100"] : colors["yellow-200"],
        "&:not(.no-inset)::after": {
          boxShadow: matched
            ? `inset 4px 4px ${colors["yellow-300"]}`
            : `inset -4px -4px ${colors["yellow-300"]}`,
        },
        "&:hover": {
          backgroundColor: colors["yellow-100"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["yellow-300"]}`,
        },
      };
    case "dark":
      return {
        ...style,
        background: matched ? colors["gray-100"] : colors["gray-200"],
        "&:not(.no-inset)::after": {
          boxShadow: matched
            ? `inset 4px 4px ${colors["gray-300"]}`
            : `inset -4px -4px ${colors["gray-300"]}`,
        },
        "&:hover": {
          backgroundColor: colors["gray-100"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["gray-300"]}`,
        },
      };
    default:
      return {
        ...style,
        background: matched ? colors["sky-100"] : colors["sky-200"],
        "&:not(.no-inset)::after": {
          boxShadow: matched
            ? `inset 4px 4px ${colors["sky-300"]}`
            : `inset -4px -4px ${colors["sky-300"]}`,
        },
        "&:hover": {
          backgroundColor: colors["sky-100"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["sky-300"]}`,
        },
      };
  }
};

export const ALink = styled(Link)({
  flexBasis: "50%",
  display: "flex",
});

export const PixelatedNavItem = styled("button")((props: IStyleProps) =>
  getStyle(props),
);
