import styled from "@emotion/styled";
import { colors } from "@/utils";

export const Strip = styled("div")<{ side: "player" | "enemy" }>(
  ({ side }) => ({
    position: "absolute",
    zIndex: 25,
    display: "flex",
    gap: "8px",
    ...(side === "player"
      ? { left: "24px", bottom: "24px" }
      : { right: "24px", top: "24px" }),
  }),
);

export const Slot = styled("div")<{ fainted: boolean }>(({ fainted }) => ({
  width: "96px",
  padding: "6px",
  backgroundColor: colors["white-800"],
  border: `3px solid ${colors["gray-800"]}`,
  boxShadow: `3px 3px 0 ${colors["gray-800"]}`,
  textAlign: "center",
  fontFamily: "monospace",
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: colors["gray-800"],
  opacity: fainted ? 0.5 : 1,
  img: {
    width: "56px",
    height: "56px",
    margin: "0 auto",
    imageRendering: "pixelated",
    filter: fainted ? "grayscale(1)" : "none",
  },
}));

export const MiniHp = styled("div")<{ pct: number }>(({ pct }) => ({
  height: "6px",
  border: `2px solid ${colors["gray-800"]}`,
  backgroundColor: colors["gray-300"],
  "&::after": {
    content: '""',
    display: "block",
    height: "100%",
    width: `${pct}%`,
    backgroundColor: pct > 50 ? "#10b981" : pct > 20 ? "#fbbf24" : "#ef4444",
    transition: "width 0.4s steps(5)",
  },
}));
