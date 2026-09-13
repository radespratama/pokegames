import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, typeShade, units } from "@/utils";

const dex = {
  ink: "#212529",
  ground: "#2A1F1D",
  chassis: "#B3362F",
  chassisDark: "#7E2420",
  stamp: "#F2B01E",
};

export const Screen = styled.main`
  background-color: ${dex.ground};
  min-height: 100vh;
  position: relative;

  /* scanlines: the one device-screen signature, kept faint */
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.14) 0 2px,
      transparent 2px 4px
    );
  }
`;

export const Shell = styled.div`
  max-width: ${units.screenSize["2xl"]};
  margin: 0 auto;
  padding: ${units.spacing.lg} ${units.spacing.base} 0;

  @media (min-width: ${units.screenSize.xl}) {
    padding: ${units.spacing["2xl"]} ${units.spacing.lg} 0;
  }
`;

export const Chassis = styled.header`
  background-color: ${dex.chassis};
  margin: 0 4px ${units.spacing["2xl"]};
  padding: ${units.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${units.spacing.base};

  &:not(.no-inset)::after {
    box-shadow:
      inset -4px -4px ${dex.chassisDark},
      inset 4px 4px #d8564e;
  }

  @media (min-width: ${units.screenSize.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: ${units.spacing.base} ${units.spacing.lg};
  }
`;

export const Readout = styled.div`
  display: flex;
  align-items: center;
  gap: ${units.spacing.base};
  flex-wrap: wrap;
`;

export const Counter = styled.div`
  background-color: ${dex.chassisDark};
  padding: 2px ${units.spacing.sm};
  color: ${colors["gray-100"]};
  font-size: ${units.fontSize.base};
  white-space: nowrap;

  &:not(.no-inset)::after {
    box-shadow:
      inset -4px -4px #5c1a17,
      inset 4px 4px #9c2e29;
  }
`;

export const Search = styled.div`
  display: flex;
  min-width: 220px;

  @media (min-width: ${units.screenSize.md}) {
    max-width: 320px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: ${units.spacing.lg};
  padding-bottom: ${units.spacing.lg};

  a {
    display: block;
    color: inherit;
    outline-offset: 6px;
  }

  a:focus-visible {
    outline: 4px solid ${dex.stamp};
  }
`;

/**
 * Same pixel recipe as Button/TypeCard: .pxl-border supplies the jagged frame,
 * ::after supplies the bevel. Only the hue changes, driven by the Pokémon's type.
 */
export const Entry = styled.div<{ type?: string; caught: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  aspect-ratio: 63 / 88;
  padding: 0;
  margin: 0;
  background: ${(props) => typeShade(props.type, 200)};
  transition: transform 0.1s steps(2);

  /* Caught cards get a holo sheen so a collection reads at a glance. */
  ${(props) =>
    props.caught
      ? `background-image: repeating-linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.34) 0 6px,
            rgba(255, 255, 255, 0) 6px 14px,
            rgba(255, 255, 255, 0.16) 14px 20px,
            rgba(255, 255, 255, 0) 20px 30px
          );`
      : ""}

  &:not(.no-inset)::after {
    box-shadow:
      inset -4px -4px ${(props) => typeShade(props.type, 300)},
      inset 4px 4px ${(props) => typeShade(props.type, 100)};
  }

  a:hover &,
  a:focus-visible & {
    transform: translateY(-4px);
  }

  a:hover &:not(.no-inset)::after,
  a:focus-visible &:not(.no-inset)::after {
    box-shadow:
      inset -4px -4px ${(props) => typeShade(props.type, 100)},
      inset 4px 4px ${(props) => typeShade(props.type, 300)};
  }

  a:active & {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    a:hover &,
    a:focus-visible & {
      transform: none;
    }
  }
`;

export const EntryHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${units.spacing.xs};
  padding: 2px ${units.spacing.sm} 0;
  color: ${colors["gray-100"]};
  font-size: ${units.fontSize.base};
  line-height: 1.3;
`;

export const Stamp = styled.span<{ caught: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${(props) => (props.caught ? dex.stamp : "transparent")};
  color: ${(props) => (props.caught ? dex.ink : colors["gray-100"])};
  padding: 0 ${(props) => (props.caught ? "6px" : "0")};

  img {
    image-rendering: pixelated;
  }
`;

/**
 * One 0.8s sweep per 10s cycle - the rest of the cycle parks it off-screen and
 * transparent, so a held hover blinks rather than strobes. steps() keeps the
 * highlight reading as pixels, not glass.
 */
const shine = keyframes`
  0% {
    opacity: 1;
    transform: translateX(-160%) skewX(-20deg);
  }
  8% {
    opacity: 1;
    transform: translateX(260%) skewX(-20deg);
  }
  8.01%,
  100% {
    opacity: 0;
    transform: translateX(260%) skewX(-20deg);
  }
`;

/** Sprite sits on a lighter window so dark-typed sprites stay readable. */
export const SpriteWindow = styled.div`
  position: relative;
  overflow: hidden;
  margin: ${units.spacing.xs} ${units.spacing.sm};
  padding: ${units.spacing.sm} 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex: 1;
  min-height: 120px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.42) 0 4px,
    rgba(255, 255, 255, 0.22) 4px 8px
  );
  box-shadow:
    inset -3px -3px rgba(0, 0, 0, 0.18),
    inset 3px 3px rgba(255, 255, 255, 0.4);

  img {
    image-rendering: pixelated;
    filter: drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.22));
  }

  /* The animated sprite replaces the still one rather than stacking on it. */
  &[data-active="true"] span img {
    visibility: hidden;
  }

  /*
   * Shine only exists while hovered, so no card animates off-screen. Transform
   * alone keeps it on the compositor.
   */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: -40%;
    width: 40%;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.75) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
  }

  a:hover &::after,
  a:focus-visible &::after {
    animation: ${shine} 10s steps(14) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    a:hover &::after,
    a:focus-visible &::after {
      animation: none;
    }
  }
`;

/** Gen-5 idle animation, mounted only for the card under the cursor. */
export const AnimatedSprite = styled.img`
  position: absolute;
  bottom: ${units.spacing.sm};
  left: 50%;
  transform: translateX(-50%) scale(1.5);
  transform-origin: bottom center;
  image-rendering: pixelated;
  filter: drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.22));
`;

export const TypeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${units.spacing.xs};
  padding: 0 ${units.spacing.sm};
  min-height: 22px;
`;

export const TypeChip = styled.span<{ type: string }>`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  font-size: ${units.fontSize.base};
  line-height: 1.2;
  color: ${colors["gray-100"]};
  background: ${(props) => typeShade(props.type, 300)};
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.45);

  img {
    width: 14px;
    height: 14px;
  }
`;

export const EntryName = styled.div`
  padding: ${units.spacing.xs} ${units.spacing.sm} ${units.spacing.sm};
  text-align: center;
  color: ${colors["gray-100"]};
  font-size: ${units.fontSize.lg};
  line-height: 1.1;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
  overflow-wrap: anywhere;
`;

export const Notice = styled.div`
  border: 4px dashed ${dex.chassis};
  color: ${colors["gray-100"]};
  padding: ${units.spacing["2xl"]};
  text-align: center;
  font-size: ${units.fontSize.base};
  margin-bottom: ${units.spacing.lg};
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: ${units.spacing["2xl"]};
`;
