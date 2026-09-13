import React from "react";

import { GradientBakcdrop, InnerNav, OuterNav } from "./index.style";
import { NavItem } from "@/components/ui/";

interface INavbar {
  children?: React.ReactNode;
  fadeHeight?: number;
  /** Match the page behind the bar; "dark" suits the Explore cabinet. */
  tone?: "light" | "dark";
}

const FADE = {
  light: "253, 253, 253",
  dark: "42, 31, 29",
};

const Navbar = React.forwardRef<HTMLDivElement, INavbar>(
  ({ fadeHeight = 124, tone = "light", children }, ref) => {
    const rgb = FADE[tone];

    return (
      <GradientBakcdrop
        style={{
          height: fadeHeight,
          background: `linear-gradient(180deg, rgba(${rgb}, 0) 0%, rgba(${rgb}, 0.97) 30.37%, rgb(${rgb}) 100%)`,
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
