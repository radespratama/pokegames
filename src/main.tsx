import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Global } from "@emotion/react";
import { globalStyle } from "./emotion/global.style";
import { GlobalProvider } from "./libs/context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Global styles={globalStyle} />
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </React.StrictMode>
);
