# Agenditas — Arquitectura

> Una página. Cada decisión con su porqué. El modelo de datos no va acá: la verdad
> está en `supabase/migrations/`.

## Forma

```
apps/web      Astro (SSR) · página pública del negocio y reserva en /s/{slug}
apps/panel    Vite + React SPA · agenda, servicios, horarios (detrás del login)
packages/ui   tokens de Tailwind + componentes shadcn (los usan el panel y las islas)
packages/db   tipos generados de Supabase + esquemas zod compartidos
supabase/     migraciones, RLS, RPC, pgTAP, plantillas de Auth
```

| Dirección | App | Cuándo |
|---|---|---|
| `agenditas.app/s/{slug}` | `apps/web` | MVP. Queda siempre como dirección de respaldo |
| `panel.agenditas.app` | `apps/panel` | MVP |
| `{slug}.agenditas.app` | `apps/web` | Después del MVP: dirección base de todos los planes |
| `dominiodelnegocio.com` | `apps/web` | Después del MVP: nivel premium (Cloudflare for SaaS + tabla `custom_domains`) |
| `agenditas.app` (landing) | `apps/landing` | Antes de abrir a desconocidos. App aparte, estática |

- `/s/` es el prefijo de las páginas de negocio: no choca con las rutas de la landing.
- La landing es una app aparte y no vive en `apps/web`. Con subdominios,
  `*.agenditas.app/*` va al Worker de `apps/web` y `agenditas.app` a la landing:
  Cloudflare decide por host, sin lógica de host en el código ni `run_worker_first`.
  Una landing rota no tumba la reserva.
- Cada negocio tiene una sola dirección canónica; las otras redirigen (301) a ella,
  para no duplicar contenido en Google.
- El comodín (cuando llegue) va como ruta `*.agenditas.app/*` con un registro DNS `*`
  proxeado; los Custom Domains de Workers no aceptan comodines.
- Los slugs reservados (`www`, `panel`, `api`, `app`, `admin`, `mail`, `status`…) se
  rechazan con un `CHECK` desde R1, para que los subdominios futuros no choquen.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Monorepo | pnpm workspaces | Alcanza para 2 apps y 2 paquetes. Turborepo cuando el build tarde |
| Web pública | Astro 7 + `@astrojs/cloudflare` 14, islas de React | SSR rápido en el celu para la página del negocio y la reserva. La landing, cuando llegue, es otra app Astro estática. Descartado: una sola app con la landing adentro (con subdominios obliga a `run_worker_first` y ata el deploy de marketing al de la reserva) |
| Panel | Vite + React + TanStack Router + TanStack Query | Detrás del login no hace falta SSR: sin servidor ni adaptador. Descartados: Next + OpenNext (adaptador atrás de Next), Astro (la grilla sería una isla gigante), Angular (sin componentes compartidos con las islas) |
| UI | Tailwind v4 + shadcn/ui (Radix) + `lucide-react` | Lo mismo en panel e islas, tematizable por negocio |
| Datos | Supabase (Postgres) | `EXCLUDE` con `tstzrange` impide turnos superpuestos; RLS por negocio. Descartado: D1 (sin `EXCLUDE` ni RLS) |
| Auth | Supabase Auth: link mágico (`token_hash`) + Google | `auth.uid()` en la RLS sin puentes. Solo la usa el panel. Descartado: Better Auth (no es proveedor nativo de Supabase) |
| Mail de Auth | SMTP propio (Resend) | El SMTP incluido de Supabase solo manda al equipo del proyecto; sin esto el link mágico no llega a los dueños |
| Hosting | Cloudflare Workers (assets estáticos para el panel, adaptador para Astro) | Sin Vercel; DNS, comodín, Turnstile y rate limiting en el mismo lugar |
| Avisos | Links `wa.me` con el mensaje prearmado | Sin costo ni aprobación de Meta. API de WhatsApp después |
| OG | Una imagen estática por app; en la página pública, nombre del negocio en título y descripción | Satori + resvg puede pasar el límite de 3 MB del Worker. OG por negocio, estacionado |
| Validación | `zod` en formularios; la verdad, en la base (`CHECK`, `EXCLUDE`, RPC) | La UI ayuda, la base protege |
| Fechas | `timestamptz` en UTC, zona por negocio; `Intl` y `AT TIME ZONE` para mostrar | Los dos manejan el horario de verano |
| Tests | Vitest (lógica), pgTAP (`supabase test db`), Playwright (e2e desde R4) | Vitest viene con Vite |
| Lint y formato | Biome | Ya conocido, rápido |

## Capas y quién autoriza

- **La base es el único guardia.** La clave publicable es pública y la Data API se
  puede llamar sin la app, así que todo permiso vive en Postgres:
  - RLS en todas las tablas. La primera migración revoca los privilegios por defecto
    de tablas y funciones a `anon`, `authenticated` y `PUBLIC`; cada `GRANT` es
    explícito.
  - **Panel:** `TO authenticated` + pertenencia al negocio. UPDATE con `USING` y
    `WITH CHECK`.
  - **Público:** `anon` lee solo las columnas que muestra la página y solo de negocios
    publicados. La disponibilidad sale de una RPC que devuelve horarios libres, nunca
    turnos ni clientes.
  - **Escrituras críticas** (reservar, mover, cancelar) solo por RPC. Las
    `security definer` viven en el esquema `private`.
- **Reservar:** la RPC **no** la ejecuta `anon`. La llama el Worker de `apps/web` con
  la clave secreta, después de validar Turnstile y el rate limiting de Cloudflare. La
  base además limita reservas activas por teléfono y por negocio (el abuso real es
  ocupar horarios, no el spam).
- **Sin superposición:** `EXCLUDE USING gist` con `btree_gist`, que ignora los turnos
  cancelados. Almuerzos y bloqueos ("salgo 30 min") viven en la misma tabla que los
  turnos para que el `EXCLUDE` los vea.
- **Panel:** lee y escribe con `supabase-js` desde el navegador, a través de TanStack
  Query. Sin Realtime en el MVP: refetch al volver a la pestaña o reconectar, y cada
  60 s. La sesión vive en el navegador → CSP estricta en `_headers` (`connect-src` con
  las URL https y wss de Supabase) y nada de `dangerouslySetInnerHTML`. Splash en
  `index.html` y esqueletos por pantalla.
- **Web pública:** lee en el servidor con la clave publicable como `anon`.
  `persistSession: false`: nunca toca Auth ni pone cookies en `.agenditas.app`.
- **Lógica pura** (formatos es-AR, armado del mensaje de WhatsApp) en funciones sin
  I/O con su test.
- **Backend aparte** (`apps/api`, Hono en Workers): recién cuando haga falta un webhook
  (Mercado Pago, API de WhatsApp).

## Entornos y claves

| Entorno | Base | Apps |
|---|---|---|
| Local | `supabase start` (Docker); `db reset` aplica migraciones + `seed.sql` | `pnpm dev` levanta web y panel |
| Preview | Proyecto Supabase `agenditas-dev` | Versión de preview de Cloudflare por PR (`*.workers.dev`) |
| Producción | Proyecto Supabase `agenditas` (plan Pro: el gratis se pausa a los 7 días sin uso) | Deploy desde `main` |

- Claves en `.env` (local) y en los secretos de Cloudflare y GitHub. Ninguna en el
  código; `.env.example` lista los nombres.
- La clave publicable va a los dos clientes. `SUPABASE_SECRET_KEY` solo en el Worker
  de `apps/web`.
- URLs de redirección de Auth por entorno, incluidas las previews.
- Migraciones imperativas (`supabase migration new`). En CI, token con alcance
  (`SUPABASE_ACCESS_TOKEN`), nunca el de `supabase login`.

## Calidad y CI

Cada PR corre: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `supabase test db` y, desde
R4, Playwright. Checks que reemplazan reglas en prosa:

- pgTAP que falla si una tabla de `public` no tiene RLS, y que lista exactamente qué
  funciones puede ejecutar `anon`.
- `pnpm db:types` + `git diff --exit-code`: tipos generados al día.
- `grep` en CI de hex y colores de Tailwind fuera de `packages/ui/tokens.css`.
- `main` protegida: PR obligatorio, CI en verde, sin force push.
- Errores: logs de Workers; Sentry en el panel antes del primer piloto.

## Preguntas abiertas

- Precios del SaaS: fuera del MVP.
