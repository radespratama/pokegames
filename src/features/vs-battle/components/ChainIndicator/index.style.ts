import styled from "@emotion/styled";
import { colors } from "@/utils";

export const Row = styled("div")({
  display: "flex",
  gap: "6px",
  justifyContent: "center",
});

export const Pip = styled("span")<{
  lit: boolean;
  next: boolean;
  broken: boolean;
}>(({ lit, next, broken }) => ({
  flex: 1,
  textAlign: "center",
  fontFamily: "'VT323', monospace",
  fontSize: "0.95rem",
  lineHeight: 1.3,
  letterSpacing: "1px",
  padding: "3px 8px",
  border: `2px solid ${colors["gray-800"]}`,
  color: lit ? colors["white-800"] : colors["gray-600"],
  backgroundColor: broken
    ? colors["red-500"]
    : lit
      ? colors["green-600"]
      : colors["gray-200"],
  animation: next
    ? "pip-hint 0.8s steps(2) infinite"
    : broken
      ? "pip-flash 0.4s steps(2) 1"
      : "none",
  "@keyframes pip-hint": {
    "0%": { borderColor: colors["gray-800"] },
    "50%": { borderColor: colors["yellow-500"] },
  },
  "@keyframes pip-flash": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.3 },
    "100%": { opacity: 1 },
  },
}));
