import { LazyLoadImage } from "react-lazy-load-image-component";
import { PixelatedButton } from "./index.style";

import type { ButtonHTMLAttributes } from "react";
import Text from "@/components/ui/Text";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "light" | "dark" | "sky";
  size?: "lg" | "xl";
  icon?: string;
}

const Button = ({ children, size = "lg", icon, ...props }: IButtonProps) => {
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
