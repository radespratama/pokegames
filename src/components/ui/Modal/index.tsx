import { Content, Overlay } from "./index.style";

interface IModal {
  children: React.ReactNode;
  open: boolean;
  overlay?: "dark" | "light" | "error";
  solid?: boolean;
}

const Modal: React.FC<IModal> = ({
  children,
  open,
  overlay = "dark",
  solid,
}) => {
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
