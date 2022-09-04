import { css } from "@emotion/react";
import { colors } from "../libs/utils";

export const globalStyle = css`
  * {
    font-family: "VT323", monospace;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    user-select: "none";
  }

  html,
  body {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  *,
  ::before,
  ::after {
    border-width: 0;
    border-style: solid;
  }

  img,
  svg {
    display: flex;
    vertical-align: middle;
  }

  a {
    text-decoration: none;
    color: ${colors["gray-300"]};
  }

  .pxl-border {
    border-width: 4px;
    border-image-slice: 2;
    border-image-width: 2;
    border-image-repeat: stretch;
    border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="rgb(33,37,41)" /></svg>');
    border-image-outset: 2;
    position: relative;
    display: inline-block;
    padding: 6px 8px;
    margin: 4px;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: ${colors["gray-100"]};
    text-transform: uppercase;
    flex-grow: 1;

    &:not(.no-inset)::after {
      position: absolute;
      top: -4px;
      right: -4px;
      bottom: -4px;
      left: -4px;
      content: "";
      box-shadow: inset -4px -4px ${colors["gray-700"]};
    }
  }
`;
