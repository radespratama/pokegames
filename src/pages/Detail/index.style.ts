import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, units } from "../../libs/utils";

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

const PokeName = styled("div")(
  {
    position: "relative",
    height: "40px",
    width: "65vw",
    "@media (min-width: 1024px)": {
      width: "32vw",
    },
    marginTop: units.spacing.xl,
    h1: {
      textTransform: "uppercase",
      position: "absolute",
      top: -20,
      left: 24,
      "@media (min-width: 1024px)": {
        left: 128,
      },
    },
    div: {
      position: "absolute",
      width: "100%",
      background: colors["gray-700"],
      bottom: 0,
    },
  },
  `
    div:nth-of-type(1) {
      height: 1.75rem;
      right: 20px;
    }
    div:nth-of-type(2) {
      height: 1.25rem;
      right: 10px;
    }
    div:nth-of-type(3) {
      height: 0.75rem;
      right: 0;
    }
  `
);

const Content = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.xl,
  padding: "0 16px",
  "@media (min-width: 1024px)": {
    padding: "0 128px",
  },
  h3: {
    marginBottom: units.spacing.base,
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
    animation: ${shake} 1.25s cubic-bezier(0.36, 0.07, 0.19, 0.97) 2;
  }
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
  `
);

const AnotherWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: 16,
});

export {
  Content,
  Page,
  PokeName,
  CatchingModal,
  PostCatchModal,
  NicknamingForm,
  NicknamingModal,
  DescriptionLoadingWrapper,
  ImageLoadingWrapper,
  Grid,
  AnotherWrapper,
};
