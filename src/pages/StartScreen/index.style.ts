import styled from "@emotion/styled";

export const Container = styled("section")({
  backgroundImage: "url('/static/poke-group.gif')",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minWidth: "100vw",
  backgroundSize: "cover",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  position: "relative",
});

export const Centering = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "10px",
});

export const A = styled("a")({
  textDecoration: "underline",
});
