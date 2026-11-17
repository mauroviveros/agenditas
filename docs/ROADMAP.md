# Agenditas — Roadmap

> Qué se hace ahora y qué sigue. Lo terminado y sus decisiones están en
> [HISTORIAL](./HISTORIAL.md). Estados: ▶ en curso · ⏸ estacionado · sin marca =
> pendiente. Objetivo: menos de 200 líneas.

## Cómo se lee

- **Rebanada** = una funcionalidad de punta a punta con datos reales. Una branch
  `feat/<rebanada>`.
- Tramos en orden: **Datos** (casos borde → tests → migración, lecturas, acciones) →
  **Diseño** (2 o 3 alternativas, elige Mauro) → **Vista** (estados, e2e,
  accesibilidad, revisa Mauro).
- Cada bloque cierra con un *Listo cuando* verificable.
- Al cerrar una rebanada se pasa al HISTORIAL y se borra de acá, en el mismo cambio.

## Por qué este orden

Nada existe hasta que alguien lo carga:

1. El solista entra y crea su negocio (R1).
2. Carga lo que vende y cuándo atiende (R2).
3. Publica su página (R3).
4. Su cliente reserva (R4).
5. El solista ve y maneja esos turnos y avisa por WhatsApp (R5).

---

## F0 · Fundaciones ▶

Branch `chore/fundaciones`. Se planea con `/ecc:plan` antes de tocar código.

- Borrar el código de Next (queda en el tag `legacy-next`) y los docs viejos
  (`PROYECTO`, `RUTAS`, `DESIGN_SYSTEM`, `DESIGN`).
- Monorepo pnpm: `apps/web` (Astro + Cloudflare), `apps/panel` (Vite + React +
  TanStack Router), `packages/ui` (tokens + shadcn), `packages/db`.
- `supabase init` con la CLI fijada como devDependency y la primera migración:
  `btree_gist`, revocar los privilegios por defecto de tablas y funciones, y el pgTAP
  que exige RLS y lista qué funciones ejecuta `anon`.
- Panel: `_headers` con la CSP y fallback de SPA (`not_found_handling`). Web: una
  página de prueba en `/s/{slug}` (SSR).
- Biome, `typecheck`, Vitest, CI de GitHub Actions y los checks de ARQUITECTURA
  ("Calidad y CI").
- Deploy de preview de las dos apps en Cloudflare (`*.workers.dev`) para validar el
  adaptador de Astro desde el día uno.
- `.claude/launch.json` con los dos dev servers, `.claude/settings.json`, `AGENTS.md`
  + symlink `CLAUDE.md`, README con "Cómo se construye".
- Protección de `main` en GitHub (con OK de Mauro).

*Listo cuando* `pnpm dev` levanta web y panel, CI pasa en el PR y las dos previews
responden en Cloudflare.

## R1 · Ingreso y alta del negocio

El solista entra con link mágico o Google, crea su negocio (nombre, rubro, slug) y ve
su panel vacío con el nombre del negocio.

**Casos borde** (se vuelven tests antes del código):

- Un usuario no ve ni edita el negocio de otro.
- El slug se normaliza (minúsculas, sin tildes, guiones) y la base rechaza los
  reservados (`www`, `panel`, `api`, `app`, `admin`…) y los tomados, sin distinguir
  mayúsculas. Entre 3 y 40 caracteres.
- El alta propone el slug desde el nombre ("Barbería Ceibo" → `barberia-ceibo`),
  editable y con aviso de disponibilidad en vivo; si está tomado, sugiere `-2`.
- El slug no se puede cambiar una vez publicado el negocio.
- Crear el negocio es atómico (negocio + membresía de dueño); un doble envío no crea
  dos.
- Un usuario tiene un solo negocio en el MVP.
- Sin negocio, el panel lleva al alta; con negocio, el alta lleva al panel.
- El link mágico abierto en otro dispositivo funciona (`token_hash`); vencido, avisa y
  deja pedir otro.
- Toda tabla nueva tiene RLS (el check de F0 lo garantiza).

1. **Datos.** Auth en `config.toml` (link mágico con Mailpit local, Google),
   plantilla `token_hash` del mail, SMTP propio (Resend) en `agenditas-dev` y URLs de
   redirección por entorno. `businesses` y `memberships` con RLS y `GRANT`. RPC
   `create_business`. pgTAP de los casos borde.
   *Listo cuando* los tests pasan y `/code-review` no deja nada alto.
2. **Diseño.** Ingreso, "revisá tu mail", alta del negocio y panel vacío. Primera
   pantalla: `/impeccable init` para `DESIGN.md`.
   *Listo cuando* Mauro eligió una alternativa.
3. **Vista.** Esas pantallas con estados de carga, error y vacío, splash del panel,
   salir.
   *Listo cuando* el e2e "entrar → crear negocio → ver panel" pasa y Mauro la revisó.

## R2 · Servicios y horarios

El solista carga sus servicios (duración, precio) y su horario semanal con almuerzo,
días cerrados y feriados AR.

## R3 · Página pública

El solista publica y su página `agenditas.app/s/{slug}` muestra marca, servicios y
horarios, con su imagen OG.

## R4 · Reserva

El cliente elige servicio, día y hora y deja sus datos; la base garantiza que no haya
dos turnos a la vez y le da un link a su turno.

## R5 · Agenda del día

El solista ve sus turnos del día, bloquea un rato ("salgo 30 min"), marca atendido o
no vino, cancela y avisa al cliente con un WhatsApp prearmado.

## ⏸ Estacionado

- Subdominios `{slug}.agenditas.app` (dirección base de todos los planes) y dominio
  propio (premium): después del MVP. `/s/{slug}` queda como respaldo y redirige a la
  dirección canónica.
- Equipo (varios profesionales, "cualquiera"): después del MVP solista.
- Señas con Mercado Pago: necesita `apps/api` para el webhook.
- Avisos automáticos (email o API de WhatsApp): cuando los avisos prearmados queden
  cortos.
- Editor de apariencia (acento, tipografía, logo): después de R3, con pilotos.
- Landing y precios (`apps/landing`, app aparte): antes de abrir a desconocidos.
- Cambiar el slug: el dueño lo cambia con confirmación explícita ("el link viejo
  deja de andar"), el anterior se libera y no hay redirecciones. Va después del MVP.
- Antes del primer piloto: aviso de privacidad (Ley 25.326, se guardan nombre y
  teléfono del cliente), Sentry en el panel y Supabase Pro en producción.
- OG por negocio: con el editor de apariencia, si entra en el límite del Worker.
- Realtime en la agenda: cuando haya equipo (varias personas tocando la misma agenda).
