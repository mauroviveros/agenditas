import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// Todo se renderiza en el servidor: la landing va en otra app (apps/landing).
// Sin sesiones ni optimización de imágenes: el adaptador provisionaría un KV y un
// binding de Images al desplegar, y no usamos ninguno.
// shortcut: sin sesiones ni Images, volver a mirarlo en R3 (logo y portada) o si
// hacen falta sesiones. Los .astro tampoco tienen lint ni typecheck (ver ROADMAP).
export default defineConfig({
  output: "server",
  session: false,
  adapter: cloudflare({ imageService: "passthrough" }),
});
