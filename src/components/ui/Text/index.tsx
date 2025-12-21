import { PixelatedText } from "./index.style";

export interface ITextProps {
  children: React.ReactNode;
  variant?: "default" | "darker" | "outlined" | "error";
  size?: "base" | "lg" | "xl";
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
}

const Text = ({ children, ...props }: ITextProps) => {
  return <PixelatedText {...props}>{children}</PixelatedText>;
};

export default Text;
