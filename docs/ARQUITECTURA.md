# Agenditas · Arquitectura

> Decisiones técnicas. Versión 1 · 2026-11-05. Cambia con cada decisión nueva; lo que todavía no está decidido va en [Preguntas abiertas](#preguntas-abiertas).

## 1. Forma general

- **Una sola app de Next.js 16** (App Router) sirve todos los dominios:

| Host | Sirve | Ruta interna |
|---|---|---|
| `agenditas.app` | Marketing y links de turno (`/t/…`) | `src/app/(marketing)`, `src/app/t` |
| `panel.agenditas.app` | Login, alta y panel | `src/app/panel` |
| `{slug}.agenditas.app` y dominio propio | Página pública y reserva | `src/app/(publico)/[slug]` |

- **`src/proxy.ts`** (en Next 16 el middleware se llama Proxy) hace tres cosas, en este orden:
  1. Refresca la sesión de Supabase (ver §3.4).
  2. Reescribe por host a la ruta interna. Los slugs reservados están en `docs/RUTAS.md` §0.
  3. Chequeo optimista del panel: sin sesión → `/ingresar`. La autorización real va en el servidor y en la RLS.
- **Cache Components** (`cacheComponents: true`) y **Partial Prefetching** activados. Todo lo que lee `params`, `searchParams`, `cookies()` o la hora va dentro de `<Suspense>`. Guía: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.

## 2. Librerías

| Para | Librería | Desde |
|---|---|---|
| UI | shadcn/ui (Radix) + Tailwind v4, tokens de `src/app/globals.css` | Instalada (F0) |
| Íconos | `lucide-react` | Instalada |
| Base de datos, auth, realtime, storage | `@supabase/supabase-js` + `@supabase/ssr` | Rebanada 1 |
| Validación | `zod` (entrada de Server Actions y RPC, esquema compartido cliente/servidor) | Rebanada 2 |
| Formularios | `useActionState` de React. Sin react-hook-form | Ya en uso |
| Fechas | `Intl` con la zona del negocio + `tstzrange` en Postgres. Sin librería | Ya en uso |
| Emails | `resend` + `@react-email/components` | Rebanada 11 |
| Pagos | Mercado Pago (Checkout Pro + webhook) | Rebanada 12 |
| Anti-spam | Cloudflare Turnstile en la reserva | Rebanada 6 |
| Tests de lógica | `node:test` (sin Vitest hasta que haga falta testear componentes) | Ya en uso |
| Tests e2e | `@playwright/test` | Rebanada 6 |
| Tests de base | pgTAP vía `supabase test db` | Rebanada 2 |
| Lint y formato | Biome | Ya en uso |

Regla: no se agrega una librería para lo que resuelven unas pocas líneas o la plataforma. Cada librería nueva entra con su fila en esta tabla.

## 3. Supabase

### 3.1 Entornos

| Entorno | Base | Cómo se aplica el esquema |
|---|---|---|
| Local | `supabase start` (Docker) | `supabase db reset` aplica `supabase/migrations/` + `supabase/seed.sql` |
| Preview (PRs) | Proyecto hosteado `agenditas-dev` | `supabase db push` desde CI |
| Producción | Proyecto hosteado `agenditas` | `supabase db push` desde CI, solo desde `main` |

- **CLI v3 es local por defecto** y pide confirmación para tocar lo hosteado (changelog 2026-11-04). En CI se usa un token personal **con alcance** (`SUPABASE_ACCESS_TOKEN`), nunca el de `supabase login`.
- Migraciones **imperativas** (`supabase migration new <nombre>`). El esquema declarativo está en alfa; se reevalúa cuando salga estable.

### 3.2 Claves y variables

| Variable | Dónde | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente y servidor | Clave publicable (no la `anon` heredada) |
| `SUPABASE_SECRET_KEY` | Solo servidor | Solo para webhooks y cron. Nunca con `NEXT_PUBLIC_` |

### 3.3 Clientes (`src/lib/supabase/`)

- `server.ts`: `createServerClient` con `cookies: { getAll, setAll }` para Server Components, Server Actions y Route Handlers. En Server Components, `setAll` va en try/catch.
- `client.ts`: `createBrowserClient`, solo para Realtime de la grilla.
- `admin.ts`: cliente con la clave secreta. Lleva `import "server-only"` y solo lo usan los webhooks y los cron.
- `types.ts`: generado con `supabase gen types typescript --local`. No se edita a mano.

### 3.4 Auth

- Link mágico por email + Google. La sesión vive en cookies de `panel.agenditas.app`.
- El proxy refresca la sesión con `supabase.auth.getClaims()` y devuelve la respuesta que armó `setAll`.
- Para proteger páginas y datos: `getClaims()`. `getUser()` solo cuando hace falta el registro fresco del servidor de Auth. **Nunca** `getSession()` en el servidor.
- Cada Server Action y Route Handler vuelve a verificar la sesión y el rol cerca del dato.
- Los roles y permisos viven en tablas (`memberships`), nunca en `user_metadata`, que el usuario puede editar.

### 3.5 Esquema, RLS y permisos

- Esquema inicial: el modelo de `docs/PROYECTO.md` §5.
- **No hay dos turnos superpuestos** por profesional ni por recurso: `EXCLUDE USING gist (staff_id WITH =, rango WITH &&) WHERE (estado activo)`.
- **RLS en todas las tablas** de `public`, con políticas según el acceso real:
  - **Panel:** `TO authenticated` + pertenencia al negocio (`business_id in (select … from memberships where user_id = (select auth.uid()))`). UPDATE con `USING` y `WITH CHECK`.
  - **Público:** `TO anon` de solo lectura, y solo para negocios publicados (negocio, servicios, equipo, horarios). Nunca turnos ni clientes.
  - **Reservas:** nadie inserta en `appointments` directo; solo a través de la RPC de §3.6.
- **Las tablas nuevas no se exponen solas a la Data API** (changelog 2026-04-28). Cada tabla que lee el cliente necesita su `GRANT` explícito a `anon` o `authenticated`, además de la RLS.
- Antes de cada migración: `supabase db advisors` y el checklist de seguridad de la skill `supabase`.

### 3.6 Lógica en la base

| Función | Hace | Tipo |
|---|---|---|
| `available_slots(business, service, staff, date)` | Horarios libres. Port de `slotsFor`/`nextFree` de `src/lib/demo.ts` | `security invoker`, `stable` |
| `book_appointment(...)` | Valida, crea o reusa el cliente e inserta el turno en una transacción. Si choca con el `EXCLUDE`, devuelve `taken` | `security definer` en un esquema no expuesto (`private`), con su `GRANT EXECUTE` explícito |

- Los casos de `src/lib/demo.test.ts` pasan a **pgTAP**: horario, almuerzo, anticipación, días cerrados, "cualquiera", superposición.
- Si la RPC devuelve `taken`, la app redirige a `?tomado=1`, el flujo que ya existe en el paso 2.

### 3.7 Otros servicios de Supabase

- **Realtime:** la grilla escucha `appointments` del negocio activo (rebanada 7).
- **Storage:** logo, portada y fotos del equipo (rebanada 13), con políticas por negocio.
- **`pg_cron`:** recordatorios y vencimiento de señas (rebanadas 11 y 12).

## 4. Capa de datos (`src/lib/data/`)

- Solo servidor (`import "server-only"`). Las páginas no llaman a Supabase directo.
- **Lo público** (negocio, servicios, equipo, horarios) usa `"use cache"` + `cacheLife("hours")` + ``cacheTag(`business:${id}`)``, y al editar desde el panel, `revalidateTag`.
- **La disponibilidad** no se cachea: va dentro de `<Suspense>`, como ya está en la página pública.
- **Lo del panel** lee la sesión dentro de `<Suspense>`. Los datos que dependen de la sesión se cachean pasando el `userId` o el `businessId` como argumento, nunca leyendo `cookies()` dentro de `"use cache"`.
- En claves y tags de cache van identificadores, nunca datos personales.

## 5. Fechas y zona horaria

- En la base todo va en UTC (`timestamptz`, `tstzrange`). La zona horaria es por negocio (`America/Argentina/Buenos_Aires` por defecto).
- En TypeScript: `Intl.DateTimeFormat` con `timeZone`, como en `src/lib/demo.ts`.
- `shortcut:` Argentina no tiene horario de verano, así que alcanza. Con el primer negocio de otro país, pasar a `Temporal`.

## 6. Calidad y CI

- **Cada PR:** `pnpm lint`, `pnpm tsc --noEmit`, `node --test`, `supabase test db` y Playwright contra la preview.
- **Merge a `main`:** `supabase db push` a producción y deploy en Vercel.
- Versiones fijadas y `pnpm-lock.yaml` commiteado. Supabase lo pide explícitamente para sus paquetes.

## 7. Hosting

- **Vercel**: un proyecto con `agenditas.app`, `panel.agenditas.app` y el comodín `*.agenditas.app`. Los dominios propios se agregan por API después del MVP.
- **Cloudflare**: DNS y Turnstile.
- Variables de entorno por entorno (local, preview, producción) en Vercel.

## Preguntas abiertas

- ¿Landing en Astro aparte o dentro de Next? (por ahora, dentro de Next)
- ¿Señas solo con Mercado Pago, o también transferencia con comprobante?
- ¿WhatsApp en el MVP o en la fase 2?
- Pricing: ¿por profesional, plan fijo o freemium para solistas?
