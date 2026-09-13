import styled from "@emotion/styled";
import { colors, typeShade } from "@/utils";

export const Panel = styled("div")({
  width: "min(92vw, 760px)",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "20px",
  backgroundColor: colors["gray-800"],
  border: `4px solid ${colors["white-800"]}`,
  boxShadow: `8px 8px 0 rgba(0,0,0,0.6)`,
  fontFamily: "'VT323', monospace",
  imageRendering: "pixelated",
});

export const Header = styled("div")({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "16px",
  paddingBottom: "10px",
  borderBottom: `4px dashed ${colors["gray-600"]}`,
});

export const Title = styled("h2")({
  margin: 0,
  fontSize: "1.9rem",
  lineHeight: 1,
  letterSpacing: "3px",
  textTransform: "uppercase",
  color: colors["yellow-400"],
  textShadow: "3px 3px 0 #000",
});

export const Hint = styled("span")({
  fontSize: "1.05rem",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors["gray-400"],
});

export const Grid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
});

export const Card = styled("button")<{
  tint: string;
  deep: string;
  state: "ready" | "active" | "fainted";
}>(({ tint, deep, state }) => {
  const pickable = state === "ready";
  return {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "14px 10px 12px",
    backgroundColor: pickable ? tint : colors["gray-700"],
    border: `4px solid ${pickable ? colors["gray-900"] : colors["gray-600"]}`,
    boxShadow: pickable ? `0 6px 0 ${colors["gray-900"]}` : "none",
    cursor: pickable ? "pointer" : "not-allowed",
    fontFamily: "'VT323', monospace",
    transition: "transform 0.08s steps(2), box-shadow 0.08s steps(2)",
    filter: state === "fainted" ? "grayscale(1)" : "none",
    opacity: pickable ? 1 : 0.6,

    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      boxShadow: pickable
        ? `inset 3px 3px 0 rgba(255,255,255,0.32), inset -4px -4px 0 ${deep}`
        : "none",
      pointerEvents: "none",
    },

    "&:hover:not(:disabled)": {
      transform: "translateY(-4px)",
      boxShadow: `0 10px 0 ${colors["gray-900"]}`,
    },
    "&:active:not(:disabled)": {
      transform: "translateY(4px)",
      boxShadow: "none",
    },
  };
});

export const Badge = styled("span")<{ tone: "active" | "fainted" }>(
  ({ tone }) => ({
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "1px 10px",
    fontSize: "0.95rem",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: colors["white-800"],
    backgroundColor: tone === "fainted" ? colors["red-600"] : colors["sky-600"],
    border: `3px solid ${colors["gray-900"]}`,
    whiteSpace: "nowrap",
  }),
);

export const Sprite = styled("img")({
  width: "88px",
  height: "88px",
  objectFit: "contain",
  imageRendering: "pixelated",
  filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.45))",
});

export const Name = styled("p")({
  margin: 0,
  fontSize: "1.35rem",
  lineHeight: 1,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors["white-800"],
  textShadow: "2px 2px 0 #000",
});

export const Level = styled("p")({
  margin: 0,
  fontSize: "1.05rem",
  letterSpacing: "1px",
  color: colors["gray-900"],
});

export const Types = styled("div")({
  display: "flex",
  gap: "4px",
  img: { width: "20px", height: "20px", imageRendering: "pixelated" },
});

export const HpRow = styled("div")({
  width: "100%",
  marginTop: "4px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.95rem",
  color: colors["gray-900"],
});

export const HpTrack = styled("div")<{ pct: number }>(({ pct }) => ({
  flex: 1,
  height: "10px",
  backgroundColor: colors["gray-800"],
  border: `3px solid ${colors["gray-900"]}`,
  "&::after": {
    content: '""',
    display: "block",
    height: "100%",
    width: `${pct}%`,
    backgroundColor: pct > 50 ? "#10b981" : pct > 20 ? "#fbbf24" : "#ef4444",
    transition: "width 0.4s steps(5)",
  },
}));

export const Footer = styled("div")({
  marginTop: "16px",
  display: "flex",
  justifyContent: "flex-end",
});

export const CancelButton = styled("button")({
  padding: "8px 18px",
  fontFamily: "'VT323', monospace",
  fontSize: "1.2rem",
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: colors["white-800"],
  backgroundColor: colors["gray-600"],
  border: `3px solid ${colors["white-800"]}`,
  boxShadow: `0 4px 0 ${colors["gray-900"]}`,
  cursor: "pointer",
  "&:hover": { backgroundColor: colors["gray-500"] },
  "&:active": { transform: "translateY(4px)", boxShadow: "none" },
});

export const typeTint = (types: Array<string>) => ({
  tint: typeShade(types[0], 200),
  deep: typeShade(types[0], 300),
});
