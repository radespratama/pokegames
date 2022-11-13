import React from "react";
import styled from "@emotion/styled";

import { NavItem } from ".";
import { units } from "../libs/utils";

interface INavbar {
  children?: React.ReactNode;
  fadeHeight?: number;
  [other: string]: any;
}

const GradientBakcdrop = styled("div")({
  position: "fixed",
  zIndex: 1,
  left: 0,
  right: 0,
  bottom: 0,
});

const OuterNav = styled("nav")({
  padding: units.spacing.base,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.base,
  margin: "0 auto",
  "@media (min-width: 640px)": {
    width: "80vh",
  },
});

const InnerNav = styled("div")({
  display: "flex",
  gap: units.spacing.base,
});

const Navbar = React.forwardRef<HTMLDivElement, INavbar>(({ fadeHeight = 124, children }, ref) => {
  return (
    <GradientBakcdrop
      style={{
        height: fadeHeight,
        background:
          "linear-gradient(180deg, #FDFDFD 0%, rgba(253, 253, 253, 0) 0.01%, rgba(253, 253, 253, 0.97) 30.37%, #FDFDFD 100%)",
      }}
      ref={ref}>
      <OuterNav>
        {children}
        <InnerNav>
          <NavItem href="/pokemons" label="Explore" />
          <NavItem href="/my-pokemon" label="My Pokemon" variant="light" />
        </InnerNav>
      </OuterNav>
    </GradientBakcdrop>
  );
});

export default Navbar;
