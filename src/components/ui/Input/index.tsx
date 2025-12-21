import { PixelatedInput } from "./index.style";

interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ placeholder, ...props }: IInput) => {
  return (
    <PixelatedInput className="pxl-border no-inset">
      <input required placeholder={placeholder} {...props} />
    </PixelatedInput>
  );
};

export default Input;
