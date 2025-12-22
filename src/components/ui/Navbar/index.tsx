import React from "react";

import { GradientBakcdrop, InnerNav, OuterNav } from "./index.style";
import { NavItem } from "@/components/ui/";

interface INavbar {
  children?: React.ReactNode;
  fadeHeight?: number;
}

const Navbar = React.forwardRef<HTMLDivElement, INavbar>(
  ({ fadeHeight = 124, children }, ref) => {
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
  },
);

export default Navbar;
