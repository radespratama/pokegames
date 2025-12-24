import styled from "@emotion/styled";
import { colors, units } from "@/utils";

const theme = {
  bg: "#e0e0e0",
  cardBg: "#ffffff",
  border: "#000000",
  accent: "#ffcc00",
  secondary: "#3b4cca",
  font: "'Courier New', Courier, monospace",
};

export const Container = styled.section`
  max-width: ${units.screenSize["2xl"]};
  margin: 0 auto;
  padding: 24px;
  background-size: 4px 4px;
  min-height: 100vh;
  font-family: ${theme.font};

  @media screen and (min-width: ${units.screenSize["xl"]}) {
    padding: 40px 24px;
  }
`;

export const Header = styled.div`
  margin-bottom: 40px;
  background: ${theme.cardBg};
  border: 4px solid ${theme.border};
  box-shadow: 8px 8px 0px 0px ${theme.border};
  padding: 20px;
  text-transform: uppercase;

  h1 {
    font-size: 1.5rem;
    font-weight: 900;
    color: ${theme.border};
    margin: 0;
    letter-spacing: -1px;
  }

  span {
    font-size: 0.9rem;
    color: #555;
    margin-top: 8px;
    display: block;
    font-weight: bold;
  }
`;

export const Grid = styled("div")({
  display: "grid",
  gap: "32px",
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

export const PixelCard = styled.div`
  background: ${theme.cardBg};
  border: 4px solid ${theme.border};
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.1s linear;
  box-shadow: 8px 8px 0px 0px ${theme.border};

  &:hover {
    transform: translate(4px, 4px);
    box-shadow: 4px 4px 0px 0px ${theme.border};
    cursor: pointer;
    border-color: ${colors["sky-500"]};
    box-shadow: 4px 4px 0px 0px ${theme.secondary};
  }

  &:hover .footer-action {
    background: ${colors["sky-300"]};
    color: white;
    border-color: ${colors["sky-500"]};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-bottom: 10px solid ${theme.border};
  }
`;

export const PixelBadge = styled.div<{ count: number }>`
  position: absolute;
  top: -4px;
  left: -4px;
  background-color: ${(props) => (props.count > 0 ? theme.accent : "#ccc")};
  color: #000;
  padding: 4px 8px;
  border: 4px solid ${theme.border};
  font-size: 0.875rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 10;
`;

export const CardFooter = styled.div`
  border-top: 4px solid ${theme.border};
  background: #f0f0f0;
  padding: 8px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.1s linear;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  font-family: ${theme.font};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
`;
