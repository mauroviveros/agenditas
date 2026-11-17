import { defineConfig } from "vitest/config";

// Los tests entienden el alias `@/` de tsconfig.json.
export default defineConfig({
  resolve: { tsconfigPaths: true },
});
