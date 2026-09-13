import * as T from "./index.style";
import type { ReactNode } from "react";

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  bg?: string;
  children: ReactNode;
}

const RoundControl = ({ label, onClick, disabled, bg, children }: Props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
    <T.RoundButton
      style={bg ? { backgroundColor: bg } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}>
      {children}
    </T.RoundButton>
    <span
      style={{
        fontSize: "10px",
        color: "#555",
        fontWeight: "bold",
        fontFamily: "monospace",
      }}>
      {label}
    </span>
  </div>
);

export default RoundControl;
