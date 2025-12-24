import styled from "@emotion/styled";
import { colors, skillColor } from "@/utils";

export const Container = styled("section")({
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "#202020",
  fontFamily: "'VT323', Courier, monospace",
});

export const HitEffectImage = styled("img")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(2.5)",
  zIndex: 50,
  pointerEvents: "none",
  imageRendering: "pixelated",
  width: "72px",
  height: "72px",
});

export const BattleWrapper = styled("div")({
  width: "100%",
  height: "100%",
  position: "relative",
});

export const BattleField = styled("div")({
  backgroundImage: "url('/static/battle.jpg')",
  backgroundPosition: "center bottom",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  width: "100%",
  height: "100%",
  position: "relative",

  filter: "brightness(1.1) contrast(1.1)",
  imageRendering: "pixelated",
});

export const InterfaceWrapper = styled("div")({
  position: "absolute",
  bottom: "30px",
  right: "30px",
  zIndex: 30,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "15px",
  maxWidth: "420px",
  width: "100%",
});

export const BattleLog = styled("div")({
  backgroundColor: "rgba(31, 41, 55, 0.95)",
  border: `4px solid ${colors["white-800"]}`,
  boxShadow: "4px 4px 0px rgba(0,0,0,0.5)",
  borderRadius: "0px",

  padding: "1rem",
  height: "140px",
  overflowY: "auto",

  display: "flex",
  flexDirection: "column",
  gap: "4px",

  color: colors["white-800"],
  imageRendering: "pixelated",
  scrollBehavior: "smooth",

  "&::-webkit-scrollbar": { width: "8px", background: "#333" },
  "&::-webkit-scrollbar-thumb": {
    background: colors["white-800"],
    border: "2px solid #333",
  },
});

export const LogTitle = styled("h4")({
  margin: "0 0 8px 0",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  color: colors["sky-300"],
  borderBottom: `2px dashed ${colors["gray-400"]}`,
  paddingBottom: "4px",
  letterSpacing: "1px",
});

export const LogEntry = styled("p")({
  fontSize: "1rem",
  margin: "4px 0",
  lineHeight: "1.4",
});

export const BattleMenu = styled("div")({
  width: "100%",
  backgroundColor: colors["gray-100"],

  borderRadius: "0px",
  border: `4px solid ${colors["gray-800"]}`,
  boxShadow: `6px 6px 0px ${colors["gray-800"]}`,
  padding: "1.5rem",
  imageRendering: "pixelated",
});

export const MenuTitle = styled("h3")({
  fontWeight: "800",
  marginBottom: "1rem",
  fontSize: "1.1rem",
  textAlign: "center",
  color: colors["gray-800"],
  textTransform: "uppercase",
  letterSpacing: "2px",
  borderBottom: `4px solid ${colors["gray-300"]}`,
  paddingBottom: "10px",
});

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

export const UltimateGaugeContainer = styled("div")({
  width: "100%",
  height: "20px",
  backgroundColor: "#111",
  border: `2px solid ${colors["gray-800"]}`,
  position: "relative",
  marginBottom: "4px",
  borderRadius: "4px",
  overflow: "hidden",
});

export const UltimateGaugeFill = styled("div")<{ width: number }>(
  ({ width }) => ({
    height: "100%",
    width: `${width}%`,
    background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
    backgroundSize: "200% 100%",
    animation: width >= 100 ? "shimmer 2s infinite linear" : "none",
    transition: "width 0.3s ease-out",

    "@keyframes shimmer": {
      "0%": { backgroundPosition: "100% 0" },
      "100%": { backgroundPosition: "-100% 0" },
    },
  }),
);

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

export const UltimateButton = styled("button")<{ isReady: boolean }>(
  ({ isReady }) => ({
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "16px",

    backgroundColor: isReady ? "#b91c1c" : "#374151",
    backgroundImage: isReady
      ? "linear-gradient(45deg, #b91c1c 25%, #ef4444 50%, #b91c1c 75%)"
      : "none",
    backgroundSize: "200% 200%",
    animation: isReady ? "pulse-red 1.5s infinite" : "none",

    border: `3px solid ${isReady ? "#fbbf24" : "#1f2937"}`,
    cursor: isReady ? "pointer" : "not-allowed",
    color: isReady ? "#fff" : "#9ca3af",
    opacity: isReady ? 1 : 0.7,

    transform: isReady ? "scale(1)" : "scale(0.98)",
    transition: "all 0.2s ease",

    "&:hover": {
      transform: isReady ? "scale(1.02) translateY(-2px)" : "scale(0.98)",
      boxShadow: isReady ? "0 4px 12px rgba(239, 68, 68, 0.5)" : "none",
    },

    "@keyframes pulse-red": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  }),
);

export const ResetButton = styled(StyledButton)({
  width: "100%",
  background: colors["green-500"],
  color: colors["white-800"],
  "&::after": {
    boxShadow: `inset -4px -4px ${colors["green-700"]}`,
  },
  "&:hover": {
    background: "#4ade80",
  },
  "&:active::after": {
    boxShadow: `inset 4px 4px ${colors["green-700"]}`,
  },
});

export const BasicAttackButton = styled(StyledButton)({
  width: "100%",
  background: colors["red-500"],
  color: colors["white-800"],
  "&::after": {
    boxShadow: `inset -4px -4px ${colors["red-700"]}`,
  },
  "&:hover": {
    background: "#ef4444",
  },
  "&:disabled": {
    background: colors["gray-300"],
    color: colors["gray-500"],
    cursor: "not-allowed",
  },
  "&:active::after": {
    boxShadow: `inset 4px 4px ${colors["red-700"]}`,
  },
});

export const EnemySection = styled("div")({
  position: "absolute",
  top: "20%",
  right: "30%",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
});

export const EnemyInfo = styled("div")({
  backgroundColor: colors["white-800"],
  border: `4px solid ${colors["gray-800"]}`,
  boxShadow: `-4px 4px 0px ${colors["gray-800"]}`,
  borderRadius: "0px",
  padding: "8px 12px",
  marginBottom: "15px",
});

export const EnemySpriteWrapper = styled("div")({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  width: "170px",
  height: "170px",
});

export const PlayerSection = styled("div")({
  position: "absolute",
  bottom: "10%",
  left: "25%",
  zIndex: 20,
  display: "flex",
  flexDirection: "column-reverse",
  alignItems: "flex-start",
});

export const PlayerInfo = styled("div")({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: "20px",
});

export const PlayerInfoBox = styled("div")({
  backgroundColor: colors["white-800"],
  border: `4px solid ${colors["gray-800"]}`,
  boxShadow: `4px 4px 0px ${colors["gray-800"]}`,
  borderRadius: "0px",
  padding: "8px 12px",
  textAlign: "left",
});

export const PlayerSpriteWrapper = styled("div")({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  width: "190px",
  height: "190px",
});

export const PokemonSprite = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  imageRendering: "pixelated",
  position: "relative",
  zIndex: 2,
  transform: "scaleX(1)",
});

export const Shadow = styled("div")({
  width: "90%",
  height: "30px",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
  borderRadius: "50%",
  position: "absolute",
  bottom: "10px",
  left: "45%",
  transform: "translateX(-50%)",
  zIndex: 1,
  filter: "blur(4px)",
});

export const ShadowEnemy = styled("div")({
  width: "90%",
  height: "30px",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
  borderRadius: "50%",
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  filter: "blur(4px)",
});

export const InfoBox = styled("div")({ textAlign: "right" });

export const CharacterName = styled("p")({
  fontWeight: "800",
  fontSize: "1rem",
  marginBottom: "6px",
  color: colors["gray-800"],
  textTransform: "uppercase",
  letterSpacing: "1px",
});

export const HPBarContainer = styled("div")({
  width: "180px",
  height: "14px",
  backgroundColor: colors["gray-300"],
  border: `2px solid ${colors["gray-800"]}`,
  borderRadius: "0px",
  marginBottom: "4px",
  position: "relative",
});

export const HPBar = styled("div")<{ width: number; color: string }>(
  ({ width, color }) => ({
    height: "100%",
    width: `${width}%`,
    backgroundColor: color,
    borderRight: `2px solid ${colors["gray-800"]}`,
    transition: "width 0.4s steps(5)",
  }),
);

export const HPText = styled("p")({
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: colors["gray-800"],
  fontFamily: "monospace",
});

export const DamageWrapper = styled("div")({
  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  pointerEvents: "none",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 60,
});

export const DamageText = styled("span")<{
  isCritical: boolean;
  effectiveness: number;
}>(({ isCritical, effectiveness }) => {
  let color = "#ffffff";
  let fontSize = "3rem";

  if (isCritical) {
    color = "#ef4444";
    fontSize = "4rem";
  } else if (effectiveness >= 2) {
    color = "#fbbf24";
    fontSize = "3.5rem";
  } else if (effectiveness < 1 && effectiveness > 0) {
    color = "#9ca3af";
    fontSize = "2.5rem";
  }

  return {
    fontFamily: "'VT323', monospace",
    fontSize: fontSize,
    fontWeight: "bold",
    color: color,
    textShadow: "2px 2px 0px #000, -1px -1px 0 #000",
    position: "absolute",
    whiteSpace: "nowrap",
    zIndex: 61,
  };
});
