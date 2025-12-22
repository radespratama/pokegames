import styled from "@emotion/styled";
import { colors } from "@/utils";

export const Container = styled("section")({
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "#202020",
  fontFamily: "'VT323', Courier, monospace",
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
  maxHeight: "140px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column-reverse",
  color: colors["white-800"],
  imageRendering: "pixelated",

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
  fontSize: "0.85rem",
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

export const StyledButton = styled("button")<{ disabled?: boolean }>(({
  disabled,
}) => {
  const bg = disabled ? colors["gray-300"] : colors["sky-300"];
  const shadowColor = disabled ? colors["gray-400"] : colors["sky-600"];
  const hoverBg = disabled ? colors["gray-300"] : colors["sky-200"];

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
      backgroundColor: hoverBg,
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
  width: "250px",
  height: "250px",
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
  width: "250px",
  height: "250px",
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
  width: "70%",
  height: "20px",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
  borderRadius: "50%",
  position: "absolute",
  bottom: "0px",
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
  bottom: "15px",
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
