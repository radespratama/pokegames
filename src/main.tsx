import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

import reportWebVitals from "./reportWebVitals.ts";

import AppProvider from "./store/providers/AppProvider.tsx";
import TanStackQueryProvider, {
  queryClient,
} from "@/store/providers/TanstackQueryProvider";

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <TanStackQueryProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </TanStackQueryProvider>
    </StrictMode>,
  );
}

reportWebVitals();
