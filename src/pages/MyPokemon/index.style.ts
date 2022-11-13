import styled from "@emotion/styled";
import { units } from "../../libs/utils";

const Page = styled("div")({
  padding: "0 16px",
  "@media (min-width: 1024px)": {
    padding: "0 128px",
  },
});

const Header = styled("header")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "16px 0",
});

const Grid = styled("div")({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  "@media (min-width: 640px)": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
  "@media (min-width: 1280px)": {
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  },
});

const EmptyState = styled("div")({
  height: "50vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: units.spacing.base,
});

const DeleteConfirmationModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 32,
  padding: "0 16px",
  "div:last-child": {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});

const WrapperCardList = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export { Page, Header, Grid, EmptyState, DeleteConfirmationModal, WrapperCardList };
