import React, { ButtonHTMLAttributes } from "react";
import { useNavigate, useResolvedPath, useMatch } from "react-router-dom";
import styled from "@emotion/styled";

import { Text } from ".";
import { units, colors } from "../libs/utils";

interface INavItem extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "light" | "dark" | "sky";
  href: string;
  label: string;
}

interface IStyleProps {
  variant?: "light" | "dark" | "sky";
  matched: boolean;
}

const getStyle = ({ variant = "sky", matched }: IStyleProps) => {
  let style = {
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

const ALink = styled("a")({
  flexBasis: "50%",
  display: "flex",
});

const PixelatedNavItem = styled("button")((props: IStyleProps) => getStyle(props));

const NavItem: React.FC<INavItem> = ({ variant = "sky", label, href }) => {
  let resolved = useResolvedPath(href);
  let matched = useMatch({ path: resolved.pathname });
  const navigate = useNavigate();

  return (
    <ALink onClick={() => navigate(href)}>
      <PixelatedNavItem className="pxl-border" variant={variant} matched={matched ? true : false}>
        <Text variant="outlined" size="lg">
          {label}
        </Text>
      </PixelatedNavItem>
    </ALink>
  );
};

export default NavItem;
