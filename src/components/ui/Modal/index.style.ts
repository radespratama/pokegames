import styled from "@emotion/styled";

import { colors } from "@/utils";

interface IModal {
  overlay?: "dark" | "light" | string;
  open?: boolean;
  solid?: boolean;
}

export const Overlay = styled("div")(
  ({ overlay = "dark", open = false, solid = false }: IModal) => ({
    position: "fixed" as const,
    inset: "0",
    width: "100vw",
    height: "100vh",
    background:
      overlay === "dark"
        ? colors["gray-800"]
        : overlay === "light"
          ? colors["gray-100"]
          : colors["red-500"],
    opacity: solid ? 1 : 0.9,
    zIndex: open ? 50 : 0,
  }),
);

export const Content = styled("div")(({ open = false }: IModal) => ({
  position: "fixed" as const,
  inset: "0",
  width: "100vw",
  height: "100vh",
  zIndex: open ? 50 : 0,
  "& > div": {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
}));
