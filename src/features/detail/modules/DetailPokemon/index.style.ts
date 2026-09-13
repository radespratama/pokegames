import { LazyLoadImage } from "react-lazy-load-image-component";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, typeShade, units } from "@/utils";

const Page = styled("div")({
  "#pokeball-bg": {
    position: "fixed",

    right: "-64vw",
    top: 0,
    zIndex: -1,
    "@media (min-width: 640px)": {
      right: "-32vw",
    },
    "@media (min-width: 1024px)": {
      right: "-16vw",
    },
  },
});

const PokemonAvatar = styled(LazyLoadImage)`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

/**
 * One card holds name, sprite and stats so the page reads as a single
 * collectible instead of loose blocks. .pxl-border supplies the jagged frame.
 */
const CharacterCard = styled("div")<{ type?: string }>`
  display: block;
  padding: 0;
  margin: ${units.spacing.xl} auto ${units.spacing.lg};
  max-width: 900px;
  width: calc(100% - 32px);
  text-align: left;
  text-transform: none;
  background: ${colors["gray-100"]};

  &:not(.no-inset)::after {
    box-shadow:
      inset -4px -4px ${(props) => typeShade(props.type, 300)},
      inset 4px 4px #ffffff;
  }
`;

const CardHeader = styled("div")<{ type?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${units.spacing.base};
  padding: ${units.spacing.sm} ${units.spacing.base};
  background: ${(props) => typeShade(props.type, 300)};

  h1 {
    text-transform: uppercase;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }
`;

const DexNo = styled("span")`
  color: ${colors["gray-100"]};
  font-size: ${units.fontSize.lg};
  white-space: nowrap;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.45);
`;

const CardBody = styled("div")`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${units.spacing.base};
  padding: ${units.spacing.base};

  @media (min-width: ${units.screenSize.md}) {
    grid-template-columns: minmax(220px, 40%) 1fr;
    align-items: start;
  }
`;

/** Sprite gets its own tinted window, same recipe as the Explore cards. */
const SpritePanel = styled("div")<{ type?: string }>`
  display: grid;
  place-items: center;
  min-height: 256px;
  padding: ${units.spacing.sm};
  background: ${(props) => typeShade(props.type, 200)};
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.32) 0 4px,
    rgba(255, 255, 255, 0.12) 4px 8px
  );
  box-shadow:
    inset -4px -4px rgba(0, 0, 0, 0.2),
    inset 4px 4px rgba(255, 255, 255, 0.45);

  img {
    filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.25));
  }
`;

const StatBlock = styled("div")`
  display: flex;
  flex-direction: column;
  gap: ${units.spacing.sm};
`;

const StatRow = styled("div")`
  display: grid;
  grid-template-columns: 7.5rem 1fr 2.5rem;
  align-items: center;
  gap: ${units.spacing.sm};

  span {
    text-transform: uppercase;
    color: ${colors["gray-800"]};
    font-size: ${units.fontSize.base};
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  b {
    text-align: right;
    font-weight: normal;
    color: ${colors["gray-800"]};
    font-size: ${units.fontSize.base};
  }
`;

/** Meter is SEGMENTS blocks wide; a value only ever fills whole blocks. */
const SEGMENTS = 20;
const BLOCK = `${100 / SEGMENTS}%`;

/**
 * Pixel meter: ::before is the fill snapped to whole blocks, ::after stamps the
 * gaps and the notched corners on top, so it reads as stacked pixels.
 */
const StatBar = styled("div")<{ type?: string; pct: number }>`
  position: relative;
  height: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.16);
  box-shadow:
    inset -4px -4px rgba(0, 0, 0, 0.2),
    inset 4px 4px rgba(255, 255, 255, 0.55);
  clip-path: polygon(
    4px 0,
    calc(100% - 4px) 0,
    calc(100% - 4px) 4px,
    100% 4px,
    100% calc(100% - 4px),
    calc(100% - 4px) calc(100% - 4px),
    calc(100% - 4px) 100%,
    4px 100%,
    4px calc(100% - 4px),
    0 calc(100% - 4px),
    0 4px,
    4px 4px
  );

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: ${(props) => (Math.round((props.pct / 100) * SEGMENTS) / SEGMENTS) * 100}%;
    background: ${(props) => typeShade(props.type, 200)};
    box-shadow:
      inset 0 4px ${(props) => typeShade(props.type, 100)},
      inset 0 -4px ${(props) => typeShade(props.type, 300)};
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0 calc(${BLOCK} - 3px),
      rgba(0, 0, 0, 0.32) calc(${BLOCK} - 3px) ${BLOCK}
    );
  }
`;

const BaseExp = styled("div")`
  margin-top: ${units.spacing.xs};
  text-transform: uppercase;
  color: ${colors["gray-700"]};
  font-size: ${units.fontSize.base};
`;

const TypeStrip = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${units.spacing.xs};
  padding: 0 ${units.spacing.sm} ${units.spacing.sm};
`;

const Content = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.xl,
  padding: "0 16px",
  maxWidth: "900px",
  margin: "0 auto",
  h3: {
    marginBottom: units.spacing.base,
  },
});

const ImageContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: "15px",

  "@media (min-width: 768px)": {
    marginBottom: "20px",
  },
});

const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(-10px, 0) rotate(-20deg); }
  30% { transform: translate(10px, 0) rotate(20deg); }
  50% { transform: translate(-10px, 0) rotate(-10deg); }
  60% { transform: translate(10px, 0) rotate(10deg); }
  100% { transform: translate(0, 0) rotate(0); }
`;

const CatchingModal = styled("div")`
  .pokeball {
    animation: ${shake} 0.9s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
  }
`;

/** One pip per wobble, filling as the ball rocks. */
const ShakeTrack = styled("div")({
  display: "flex",
  justifyContent: "center",
  gap: units.spacing.sm,
  marginTop: units.spacing.base,
});

const ShakePip = styled("span")<{ on: boolean }>(({ on }) => ({
  width: 16,
  height: 16,
  backgroundColor: on ? "#F2B01E" : "rgba(255, 255, 255, 0.25)",
  boxShadow: on
    ? "inset -4px -4px #9c6f0d, inset 4px 4px #ffd97a"
    : "inset -4px -4px rgba(0, 0, 0, 0.3)",
}));

/** Burst of light behind the sprite the instant the ball clicks shut. */
const flare = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  20% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0.55; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/** Shockwave ring that races past the sprite and fades. */
const ring = keyframes`
  0% { transform: scale(0.2); opacity: 0.9; border-width: 10px; }
  100% { transform: scale(1.9); opacity: 0; border-width: 1px; }
`;

const popIn = keyframes`
  0% { transform: translateY(28px) scale(0.5); opacity: 0; }
  55% { transform: translateY(-6px) scale(1.14); opacity: 1; }
  75% { transform: translateY(0) scale(0.97); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`;

const twinkle = keyframes`
  0% { transform: scale(0.4) rotate(0deg); opacity: 0; }
  35% { opacity: 1; }
  100% { transform: scale(1.5) rotate(50deg); opacity: 0; }
`;

/**
 * Rare-drop reveal: rays turn behind a soft radial mask (no square edge), a
 * shockwave ring expands past them, sparkles twinkle, the sprite pops in.
 * Everything animates transform/opacity only, so it stays on the compositor.
 */
const RevealStage = styled("div")<{ type?: string }>`
  position: relative;
  display: grid;
  place-items: center;
  padding: ${units.spacing.lg};
  isolation: isolate;

  /* Rays. The radial mask fades them to nothing well before the box edge. */
  &::before {
    content: "";
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: repeating-conic-gradient(
      from 0deg,
      ${(props) => typeShade(props.type, 100)} 0deg 7deg,
      transparent 7deg 18deg
    );
    -webkit-mask-image: radial-gradient(
      closest-side,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.95) 38%,
      transparent 72%
    );
    mask-image: radial-gradient(
      closest-side,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.95) 38%,
      transparent 72%
    );
    animation:
      ${flare} 0.9s cubic-bezier(0.15, 0.9, 0.3, 1) both,
      ${spin} 9s linear infinite;
    will-change: transform, opacity;
  }

  /* Shockwave. */
  &::after {
    content: "";
    position: absolute;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    border: 10px solid ${(props) => typeShade(props.type, 100)};
    animation: ${ring} 0.85s cubic-bezier(0.1, 0.8, 0.2, 1) both;
    will-change: transform, opacity;
  }

  img {
    position: relative;
    z-index: 1;
    animation: ${popIn} 0.6s cubic-bezier(0.22, 1.3, 0.4, 1) both;
    animation-delay: 0.12s;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    img {
      animation: none;
    }

    &::after {
      opacity: 0;
    }
  }
`;

/** Four-point stars scattered around the reveal; one element, many dots. */
const SparkleField = styled("div")`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;

  span {
    position: absolute;
    width: 18px;
    height: 18px;
    background: #fff;
    /* Four-point star, so sparkles never read as squares. */
    clip-path: polygon(
      50% 0%,
      58% 42%,
      100% 50%,
      58% 58%,
      50% 100%,
      42% 58%,
      0% 50%,
      42% 42%
    );
    animation: ${twinkle} 1.1s ease-out infinite;
  }

  span:nth-of-type(1) {
    top: 14%;
    left: 18%;
    animation-delay: 0.05s;
  }
  span:nth-of-type(2) {
    top: 26%;
    right: 14%;
    animation-delay: 0.3s;
  }
  span:nth-of-type(3) {
    bottom: 20%;
    left: 12%;
    animation-delay: 0.55s;
  }
  span:nth-of-type(4) {
    bottom: 14%;
    right: 20%;
    animation-delay: 0.18s;
  }
  span:nth-of-type(5) {
    top: 46%;
    left: 4%;
    animation-delay: 0.72s;
  }
  span:nth-of-type(6) {
    top: 52%;
    right: 6%;
    animation-delay: 0.44s;
  }

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const CatchRate = styled("div")<{ type?: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${units.spacing.sm};
  margin-top: ${units.spacing.sm};
  padding: 2px ${units.spacing.sm};
  text-transform: uppercase;
  font-size: ${units.fontSize.base};
  color: ${colors["gray-100"]};
  background: ${(props) => typeShade(props.type, 300)};
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.45);
`;

const PostCatchModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  p: {
    textAlign: "center",
  },
});

const NicknamingModal = styled("div")({
  width: "100vw",
  padding: "0 16px",
  "@media (min-width: 1024px)": {
    width: "32vw",
  },
});

const NicknamingForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.base,
});

const DescriptionLoadingWrapper = styled("div")({
  div: {
    justifyContent: "flex-start",
  },
});

const ImageLoadingWrapper = styled("div")({
  width: 256,
  height: 256,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
});

const Grid = styled("div")(
  {
    display: "grid",
    columnGap: 8,
    rowGap: 0,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  `
  @media (min-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  `,
);

const AnotherWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: 16,
});

export {
  Content,
  ShakeTrack,
  ShakePip,
  RevealStage,
  SparkleField,
  CatchRate,
  Page,
  CharacterCard,
  CardHeader,
  CardBody,
  DexNo,
  SpritePanel,
  StatBlock,
  StatRow,
  StatBar,
  BaseExp,
  TypeStrip,
  CatchingModal,
  PokemonAvatar,
  PostCatchModal,
  NicknamingForm,
  NicknamingModal,
  DescriptionLoadingWrapper,
  ImageLoadingWrapper,
  Grid,
  ImageContainer,
  AnotherWrapper,
};
