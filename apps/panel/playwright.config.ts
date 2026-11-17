import { defineConfig, devices } from "@playwright/test";

// Se usa 127.0.0.1 (no localhost) porque es el `site_url` de la base local: el link
// mágico del mail apunta ahí.
const BASE_URL = "http://127.0.0.1:5173";
const CI_RETRIES = 1;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  fullyParallel: false,
  retries: process.env.CI ? CI_RETRIES : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: BASE_URL, trace: "retain-on-failure", ...devices["Pixel 7"] },
  // Necesita `pnpm supabase start` y `apps/panel/.env.local` (ver .env.example).
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 5173 --strictPort",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
