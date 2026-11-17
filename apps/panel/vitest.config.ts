import { defineConfig } from "vitest/config";

// Aparte de vite.config.ts para que los tests no carguen los plugins del build.
export default defineConfig({
  test: { environment: "node" },
});
