import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
// if (import.meta.env.VITE_SENTRY_DSN) {
//   import("~/utils/monitoring.client").then(({ init }) => init());
// }

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
