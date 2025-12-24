import styled from "@emotion/styled";
import { units } from "@/utils";

const POKE_COLORS = {
  red: "#DC0A2D",
  redShadow: "#8B0000",
  screenBezel: "#dedede",
  screenBezelShadow: "#9ba0a8",
  screenBg: "#232323",
  screenOn: "#71f57d",
};

const PokedexFrame = styled("div")({
  backgroundColor: POKE_COLORS.red,
  height: "100dvh",
  width: "100vw",
  padding: "16px",
  position: "relative",
  border: "4px solid #000",
  boxSizing: "border-box",
  overflow: "hidden",

  backgroundImage: `
    radial-gradient(${POKE_COLORS.redShadow} 15%, transparent 16%),
    radial-gradient(${POKE_COLORS.redShadow} 15%, transparent 16%)
  `,
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 4px 4px",

  boxShadow: `inset -8px -8px ${POKE_COLORS.redShadow}, inset 8px 8px #ff5e5e`,

  display: "flex",
  flexDirection: "column",
  gap: "12px",

  "@media (min-width: 1024px)": {
    padding: "32px",
    maxWidth: "70rem",
    margin: "0 auto",
    height: "100vh",
    maxHeight: "100vh",
    borderRadius: "24px",
  },
});

const PokedexHeaderDeco = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  paddingBottom: "12px",
  borderBottom: `4px solid ${POKE_COLORS.redShadow}`,
  marginBottom: "4px",
  flexShrink: 0,
});

const BigBlueLight = styled("div")({
  width: "50px",
  height: "50px",
  backgroundColor: "#3B4CCA",
  border: "4px solid #fff",
  borderRadius: "50%",
  boxShadow: "inset -6px -6px #1c2c88, 4px 4px 0px #000",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "12px",
    height: "12px",
    backgroundColor: "#a1afff",
    borderRadius: "50%",
  },
});

const SmallLightsContainer = styled("div")({
  display: "flex",
  gap: "8px",
  marginTop: "8px",
});

const SmallLight = styled("div")<{ color: string }>(({ color }) => ({
  width: "16px",
  height: "16px",
  backgroundColor: color,
  borderRadius: "50%",
  border: "2px solid #000",
  boxShadow: "inset -2px -2px rgba(0,0,0,0.5)",
}));

const ScreenBezel = styled("div")({
  backgroundColor: POKE_COLORS.screenBezel,
  padding: "16px 24px 24px 24px",
  border: "4px solid #000",
  boxShadow: `inset -4px -4px ${POKE_COLORS.screenBezelShadow}, inset 4px 4px #fff`,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,

  gap: "12px",
  position: "relative",
  borderRadius: "0 0 0 32px",
});

const ScreenContainer = styled("div")({
  backgroundColor: POKE_COLORS.screenBg,
  border: "4px solid #444",
  boxShadow: "inset 4px 4px 10px #000",
  borderRadius: "4px",
  position: "relative",
  overflow: "hidden",
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",

  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
    backgroundSize: "100% 4px, 6px 100%",
    pointerEvents: "none",
    zIndex: 10,
  },
});

const ScreenContent = styled("div")({
  width: "100%",
  flex: 1,
  overflowY: "auto",
  padding: "16px",

  position: "relative",
  zIndex: 1,

  "&::-webkit-scrollbar": {
    width: "16px",
    backgroundColor: "#000",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: POKE_COLORS.red,
    border: "2px solid #fff",
    boxShadow: "inset -2px -2px #8B0000",
  },
});

const ScreenHeader = styled("header")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "4px",
  padding: "0 8px",
  flexShrink: 0,
});

const ControlPanel = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginTop: "auto",
  padding: "4px 8px 0 8px",
  flexShrink: 0,
});

const RoundButton = styled("button")({
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  backgroundColor: "#333",
  border: "2px solid #000",
  boxShadow: "inset -2px -2px #000, 2px 2px #555",
  color: "#fff",
  fontSize: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:active": {
    boxShadow: "inset 2px 2px #000",
    transform: "translateY(2px)",
  },
});

const SpeakerVents = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  div: {
    width: "48px",
    height: "6px",
    backgroundColor: "#555",
    borderRadius: "4px",
    boxShadow: "inset 1px 1px 2px #000",
    borderBottom: "1px solid #fff",
  },
});

const Grid = styled("div")({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
  "@media (min-width: 640px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
});

const WrapperCardList = styled("div")({
  position: "relative",
  zIndex: 5,
});

const EmptyState = styled("div")({
  height: "100%",
  minHeight: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: units.spacing.base,
  color: "#fff",
  zIndex: 5,
});

const ScreenGrid = styled("div")({
  flex: 1,
  overflow: "hidden",
});

const DeleteConfirmationModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 32,
  padding: "0 16px",
  textAlign: "center",
  "div:last-child": {
    display: "flex",
    gap: 16,
    marginTop: 16,
  },
});

const InfoModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 24,
  padding: "16px",
  maxWidth: "400px",

  ul: {
    listStyleType: "square",
    color: "#000",
  },

  strong: {
    fontWeight: "800",
    textDecoration: "underline",
  },
});

export {
  PokedexFrame,
  PokedexHeaderDeco,
  BigBlueLight,
  SmallLightsContainer,
  SmallLight,
  ScreenBezel,
  ScreenHeader,
  ScreenGrid,
  ControlPanel,
  RoundButton,
  SpeakerVents,
  Grid,
  EmptyState,
  DeleteConfirmationModal,
  InfoModal,
  WrapperCardList,
  ScreenContent,
  ScreenContainer,
};
