import React, { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { Text } from ".";
import { units, colors } from "../libs/utils";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "light" | "dark" | "sky";
  size?: "lg" | "xl";
  icon?: string;
}

const getStyle = ({ variant = "sky" }: IButtonProps) => {
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
      };
    case "dark":
      return {
        ...style,
        background: colors["gray-300"],
        "&:not(.no-inset)::after": {
          boxShadow: `inset -4px -4px ${colors["gray-200"]}`,
        },
        "&:hover": {
          backgroundColor: colors["gray-200"],
        },
        "&:active::after": {
          boxShadow: `inset 4px 4px ${colors["gray-300"]}`,
        },
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
      };
  }
};

const PixelatedButton = styled("button")((props: IButtonProps) =>
  getStyle(props)
);

const Button: React.FC<IButtonProps> = ({
  children,
  size = "lg",
  icon,
  ...props
}) => {
  return (
    <PixelatedButton className="pxl-border" {...props}>
      {icon && (
        <LazyLoadImage
          src={icon}
          alt="button icon"
          width={size === "xl" ? 40 : 20}
          height={size === "xl" ? 40 : 20}
        />
      )}
      <Text variant="outlined" size={size}>
        {children}
      </Text>
    </PixelatedButton>
  );
};

export default Button;
