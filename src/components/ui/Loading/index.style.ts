import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const spin = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

export const StyledLoading = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "1rem",
  gap: "1rem",
  svg: {
    display: "inline",
    animation: `${spin} 1.25s linear infinite`,
  },
});
