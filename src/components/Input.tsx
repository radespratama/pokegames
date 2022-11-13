import React, { InputHTMLAttributes } from "react";
import styled from "@emotion/styled";
import { units, colors } from "../libs/utils";

const PixelatedInput = styled("div")({
  input: {
    fontSize: units.fontSize.lg,
    textAlign: "center",
    width: "100%",
    textTransform: "uppercase",
    "::placeholder": {
      color: colors["gray-200"],
    },
  },
});

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ placeholder, ...props }) => {
  return (
    <PixelatedInput className="pxl-border no-inset">
      <input required placeholder={placeholder} {...props} />
    </PixelatedInput>
  );
};

export default Input;
