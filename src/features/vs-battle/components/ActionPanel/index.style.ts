import styled from "@emotion/styled";
import type { MoveDamageClass } from "@/services/api/pokemons";
import { colors, typeShade } from "@/utils";

const PIXEL_OUTLINE =
  "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000";

export const AttackGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
});

export const StyledButton = styled("button")<{
  disabled?: boolean;
  pokemonType?: string;
}>(({ disabled, pokemonType }) => {
  const bg = typeShade(pokemonType, disabled ? 300 : 200);
  const deep = typeShade(pokemonType, 300);

  return {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2px",
    cursor: disabled ? "not-allowed" : "pointer",

    border: `3px solid ${colors["gray-800"]}`,
    borderRadius: "0px",
    background: bg,
    padding: "10px 8px 22px",
    minHeight: "58px",
    boxShadow: disabled ? "none" : `0 4px 0 ${colors["gray-800"]}`,

    fontFamily: "'VT323', monospace",
    fontSize: "1.15rem",
    lineHeight: 1,
    letterSpacing: "0.5px",
    color: colors["white-800"],
    textShadow: PIXEL_OUTLINE,
    textTransform: "uppercase",
    opacity: disabled ? 0.65 : 1,
    outline: "none",
    transition: "transform 0.08s steps(2), box-shadow 0.08s steps(2)",

    // type-matched bevel: highlight top-left, own dark shade bottom-right
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      boxShadow: `inset 3px 3px 0 rgba(255,255,255,0.35), inset -4px -4px 0 ${deep}`,
      pointerEvents: "none",
    },

    "&:hover": {
      transform: disabled ? "none" : "translateY(-2px)",
      boxShadow: disabled ? "none" : `0 6px 0 ${colors["gray-800"]}`,
    },

    "&:active": {
      transform: "translateY(4px)",
      boxShadow: "none",
      "&::after": {
        boxShadow: `inset -3px -3px 0 rgba(255,255,255,0.2), inset 4px 4px 0 ${deep}`,
      },
    },
  };
});

export const CooldownBadge = styled("span")({
  position: "absolute",
  top: "-10px",
  right: "-10px",
  minWidth: "24px",
  height: "24px",
  padding: "0 4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'VT323', monospace",
  fontSize: "1.1rem",
  lineHeight: 1,
  color: colors["white-800"],
  backgroundColor: colors["gray-800"],
  border: `3px solid ${colors["white-800"]}`,
  zIndex: 3,
});

export const MoveMeta = styled("span")({
  position: "absolute",
  left: 6,
  bottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.7rem",
  lineHeight: 1,
  letterSpacing: "1px",
  color: colors["white-800"],
  textShadow: "1px 1px 0 #000",
  zIndex: 2,
});

export const ClassBadge = styled("span")<{
  damageClass: MoveDamageClass;
}>(({ damageClass }) => ({
  padding: "1px 3px",
  color: colors["white-800"],
  backgroundColor:
    damageClass === "physical" ? colors["red-700"] : colors["sky-700"],
  border: `1px solid ${colors["gray-900"]}`,
}));

export const UltimateText = styled("span")({
  fontFamily: "'VT323', monospace",
  fontSize: "1.25rem",
  lineHeight: 1,
  letterSpacing: "1px",
  color: "#fff",
  textShadow: PIXEL_OUTLINE,
  textTransform: "uppercase",
  zIndex: 2,
});

export const UltimateButton = styled("button")<{
  state: "locked" | "ready" | "overcharge";
}>(({ state }) => {
  const ready = state !== "locked";
  return {
    gridColumn: "span 2",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px 24px",
    minHeight: "64px",
    backgroundColor:
      state === "overcharge"
        ? "#b91c1c"
        : state === "ready"
          ? "#b45309"
          : "#374151",
    backgroundImage:
      state === "overcharge"
        ? "linear-gradient(45deg, #b91c1c 25%, #ef4444 50%, #b91c1c 75%)"
        : state === "ready"
          ? "linear-gradient(45deg, #b45309 25%, #fbbf24 50%, #b45309 75%)"
          : "none",
    backgroundSize: "200% 200%",
    animation: ready ? "pulse-ult 1.5s infinite" : "none",
    border: `3px solid ${ready ? "#fbbf24" : colors["gray-800"]}`,
    boxShadow: ready ? "0 4px 0 #78350f" : "none",
    cursor: ready ? "pointer" : "not-allowed",
    color: ready ? "#fff" : "#9ca3af",
    opacity: ready ? 1 : 0.7,
    transition: "transform 0.08s steps(2), box-shadow 0.08s steps(2)",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      boxShadow: "inset 3px 3px 0 rgba(255,255,255,0.25)",
      pointerEvents: "none",
    },
    "&:hover": { transform: ready ? "translateY(-2px)" : "none" },
    "&:active": ready
      ? { transform: "translateY(4px)", boxShadow: "none" }
      : {},
    "@keyframes pulse-ult": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };
});

export const SwitchButton = styled("button")({
  gridColumn: "span 2",
  position: "relative",
  padding: "12px",
  fontFamily: "'VT323', monospace",
  fontSize: "1.2rem",
  lineHeight: 1,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors["white-800"],
  textShadow: PIXEL_OUTLINE,
  backgroundColor: colors["sky-500"],
  border: `3px solid ${colors["gray-800"]}`,
  boxShadow: `0 4px 0 ${colors["gray-800"]}`,
  cursor: "pointer",
  transition: "transform 0.08s steps(2), box-shadow 0.08s steps(2)",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    boxShadow: `inset 3px 3px 0 rgba(255,255,255,0.3), inset -4px -4px 0 ${colors["sky-700"]}`,
    pointerEvents: "none",
  },
  "&:hover:not(:disabled)": {
    transform: "translateY(-2px)",
    boxShadow: `0 6px 0 ${colors["gray-800"]}`,
  },
  "&:active:not(:disabled)": {
    transform: "translateY(4px)",
    boxShadow: "none",
  },
  "&:disabled": { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
});
