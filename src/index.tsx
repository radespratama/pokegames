import React from "react";
import ReactDOM from "react-dom/client";
import { Global } from "@emotion/react";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { GlobalProvider } from "context";
import { globalStyle } from "emotion/global.style";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Global styles={globalStyle} />
    <GlobalProvider>
      <App />
    </GlobalProvider>

    <Toaster position="top-right" />
  </React.StrictMode>
);
