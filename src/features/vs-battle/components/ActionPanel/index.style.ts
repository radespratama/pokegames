import styled from "@emotion/styled";
import { colors, skillColor } from "@/utils";

export const AttackGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
});

export const StyledButton = styled("button")<{
  disabled?: boolean;
  pokemonType?: string;
}>(({ disabled, pokemonType }) => {
  const bg = disabled
    ? skillColor[pokemonType + "-300"]
    : skillColor[pokemonType + "-200"];
  const shadowColor = disabled ? colors["gray-400"] : colors["sky-600"];
  const hoverBg = disabled
    ? skillColor[pokemonType + "-400"]
    : skillColor[pokemonType + "-300"];

  return {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: disabled ? "not-allowed" : "pointer",

    border: `2px solid ${colors["gray-800"]}`,
    borderRadius: "0px",
    background: bg,
    padding: "14px 8px",

    fontSize: "0.9rem",
    fontWeight: "bold",
    color: colors["gray-800"],
    textTransform: "uppercase",
    outline: "none",
    transition: "transform 0.1s, background 0.1s",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxShadow: `inset -4px -4px ${shadowColor}`,
      pointerEvents: "none",
    },

    "&:hover": {
      backgroundColor: disabled ? bg : hoverBg,
      transform: disabled ? "none" : "translateY(-2px)",
      boxShadow: disabled ? "none" : `0 4px 0 ${colors["gray-800"]}`,
    },

    "&:active": {
      transform: "translateY(0)",
      boxShadow: "none",
      "&::after": {
        boxShadow: `inset 4px 4px ${shadowColor}`,
      },
    },
  };
});

export const CooldownBadge = styled("span")({
  position: "absolute",
  top: "-8px",
  right: "-8px",
  minWidth: "22px",
  height: "22px",
  padding: "0 4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: colors["white-800"],
  backgroundColor: colors["gray-800"],
  border: `2px solid ${colors["white-800"]}`,
  zIndex: 3,
});

export const UltimateText = styled("span")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: "#fff",
  textShadow: "1px 1px 0 #000",
  zIndex: 2,
  fontFamily: "monospace",
});

/** state drives colour: locked (grey), ready (gold blink), overcharge (red blaze). */
export const UltimateButton = styled("button")<{
  state: "locked" | "ready" | "overcharge";
}>(({ state }) => {
  const ready = state !== "locked";
  return {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
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
    border: `3px solid ${ready ? "#fbbf24" : "#1f2937"}`,
    cursor: ready ? "pointer" : "not-allowed",
    color: ready ? "#fff" : "#9ca3af",
    opacity: ready ? 1 : 0.7,
    transition: "all 0.2s ease",
    "&:hover": { transform: ready ? "scale(1.02) translateY(-2px)" : "none" },
    "@keyframes pulse-ult": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };
});

export const SwitchButton = styled("button")({
  gridColumn: "span 2",
  padding: "12px",
  fontFamily: "monospace",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: colors["gray-800"],
  backgroundColor: colors["sky-200"],
  border: `2px solid ${colors["gray-800"]}`,
  cursor: "pointer",
  "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
});
