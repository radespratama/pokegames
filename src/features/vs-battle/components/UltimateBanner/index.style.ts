import styled from "@emotion/styled";

export const Layer = styled("div")({
  position: "absolute",
  inset: 0,
  zIndex: 70,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  overflow: "hidden",
});

export const Streaks = styled("div")<{ side: "player" | "enemy" }>(
  ({ side }) => ({
    position: "absolute",
    inset: "-20%",
    backgroundImage:
      "repeating-linear-gradient(-70deg, rgba(255,255,255,0.85) 0 6px, transparent 6px 34px)",
    opacity: 0.35,
    mixBlendMode: "overlay",
    transform: side === "player" ? "scaleY(1)" : "scaleY(-1)",
  }),
);

export const Band = styled("div")({
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.88) 82%, rgba(0,0,0,0) 100%)",
  borderTop: "4px solid #fbbf24",
  borderBottom: "4px solid #fbbf24",
  zIndex: 0,
});

export const Content = styled("div")({
  position: "relative",
  padding: "18px 40px",
});

export const Word = styled("h2")({
  position: "relative",
  margin: 0,
  fontFamily: "'VT323', monospace",
  fontSize: "clamp(3rem, 8vw, 6rem)",
  lineHeight: 0.9,
  letterSpacing: "10px",
  textTransform: "uppercase",
  color: "#fde047",
  WebkitTextStroke: "3px #7c2d12",
  textShadow: "0 6px 0 #b91c1c, 0 10px 0 #000",
  whiteSpace: "nowrap",
});

export const MoveName = styled("p")({
  position: "relative",
  margin: "6px 0 0",
  fontFamily: "'VT323', monospace",
  fontSize: "clamp(1.1rem, 3vw, 1.9rem)",
  letterSpacing: "5px",
  textTransform: "uppercase",
  color: "#ffffff",
  textShadow: "2px 2px 0 #000, -2px 2px 0 #000",
  whiteSpace: "nowrap",
});

export const Flash = styled("div")({
  position: "absolute",
  inset: 0,
  backgroundColor: "#ffffff",
});
