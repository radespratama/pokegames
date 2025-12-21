import { useMatchRoute } from "@tanstack/react-router";

import { ALink, PixelatedNavItem } from "./index.style";
import Text from "@/components/ui/Text";

interface INavItem {
  children?: React.ReactNode;
  variant?: "light" | "dark" | "sky";
  href: string;
  label: string;
}

const NavItem: React.FC<INavItem> = ({ variant = "sky", label, href }) => {
  const matchRoute = useMatchRoute();
  const matched = matchRoute({ to: href });

  return (
    <ALink to={href}>
      <PixelatedNavItem
        className="pxl-border"
        variant={variant}
        matched={matched ? true : false}>
        <Text variant="outlined" size="lg">
          {label}
        </Text>
      </PixelatedNavItem>
    </ALink>
  );
};

export default NavItem;
