import styled from "@emotion/styled";
import { units } from "../../utils";

export const Container = styled.section`
  max-width: ${units.screenSize["xl"]};
  margin: 0 auto;
  padding: 10px 16px;
  text-align: center;

  @media screen and (min-width: ${units.screenSize["xl"]}) {
    padding: 10px 0;
  }
`;

export const Grid = styled("div")({
  display: "grid",
  gap: "16px",
  margin: "16px 0",
  "@media (min-width: 640px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
  "@media (min-width: 1280px)": {
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  },
});

export const Footer = styled("footer")({
  display: "flex",
  paddingTop: 24,
});
