import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorScreen, Splash } from "./components/Splash";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const STALE_TIME_MS = 30_000;
// Evita el parpadeo de "Cargando…" cuando la pantalla llega al toque.
const PENDING_DELAY_MS = 300;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: STALE_TIME_MS } },
});
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingComponent: Splash,
  defaultPendingMs: PENDING_DELAY_MS,
  defaultErrorComponent: ErrorScreen,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Falta el elemento #root en index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
