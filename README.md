# Agenditas

Turnos para pymes que venden tiempo (barberías, lashistas, consultorios, tatuadores,
entrenadores). El negocio maneja su agenda desde el celu y sus clientes reservan solos,
en una página con la marca del negocio. Producto y voz: [`docs/PRODUCT.md`](./docs/PRODUCT.md).

## Qué hay acá

| Carpeta | Qué es |
|---|---|
| `apps/panel` | El panel del negocio: SPA de Vite + React, detrás del login |
| `apps/web` | La página pública y la reserva: Astro en Cloudflare Workers (`/s/{slug}`) |
| `packages/ui` | Tokens de diseño y componentes compartidos |
| `packages/db` | Tipos generados de Supabase y validaciones compartidas |
| `supabase/` | Migraciones, pruebas pgTAP y config de la base local |

Las decisiones técnicas y su porqué están en [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md).

## Cómo correrlo

Hace falta Node (la versión de `.nvmrc`), `pnpm` y Docker abierto.

```bash
pnpm install
pnpm supabase start
```

Copiá los ejemplos de variables y completá la URL y la clave publicable con lo que
muestra `pnpm supabase status`:

```bash
cp apps/panel/.env.example apps/panel/.env.local
cp apps/web/.dev.vars.example apps/web/.dev.vars
```

```bash
pnpm dev
```

El panel queda en `http://localhost:5173` y la web en `http://localhost:4321/s/ceibo`.
Los comandos de todos los días están en [`AGENTS.md`](./AGENTS.md).

## Cómo se construye

Agenditas se construye con [Claude Code](https://claude.com/claude-code), y esta sección
reemplaza la firma de coautoría en cada commit.

- **Rebanadas verticales con datos reales.** Cada funcionalidad se arma de punta a
  punta (datos, diseño, vista) sobre la base de verdad, sin pantallas con datos
  inventados. El orden está en [`docs/ROADMAP.md`](./docs/ROADMAP.md) y lo ya hecho, con
  su porqué, en [`docs/HISTORIAL.md`](./docs/HISTORIAL.md).
- **Las decisiones son de una persona.** Mauro elige el diseño y revisa cada vista
  terminada. El agente propone, escribe y prueba; no decide producto.
- **Se prueba antes de seguir.** Los casos borde se escriben como tests antes del
  código, la base se prueba con pgTAP y la CI corre lint, tipos, tests y build en cada PR.
- **Todo entra por un PR.** El agente commitea en una branch y abre el PR; el código se
  revisa ahí y el merge lo hace Mauro. `main` no recibe cambios directos.
