import React, { HTMLAttributes } from "react";
import styled from "@emotion/styled";

import { colors } from "../libs/utils";

interface IModal extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  overlay?: "dark" | "light" | "error";
  solid?: boolean;
}

const Overlay = styled("div")(({ overlay = "dark", open = false, solid = false }: IModal) => ({
  position: "fixed",
  inset: 0,
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
}));

const Content = styled("div")(({ open = false }: IModal) => ({
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  zIndex: open ? 50 : 0,
  "> div": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
}));

const Modal: React.FC<IModal> = ({ children, open, overlay = "dark", solid }) => {
  return open ? (
    <>
      <Overlay open={open} overlay={overlay} solid={solid} />
      <Content open={open}>
        <div>{children}</div>
      </Content>
    </>
  ) : null;
};

export default Modal;
