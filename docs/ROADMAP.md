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

## R3 · Página pública ▶

El solista publica y su página `agenditas.app/s/{slug}` muestra marca, servicios y
horarios, con su imagen OG.

## R4 · Reserva

El cliente elige servicio, día y hora y deja sus datos; la base garantiza que no haya
dos turnos a la vez y le da un link a su turno.

## R5 · Agenda del día

El solista ve sus turnos del día, bloquea un rato ("salgo 30 min"), marca atendido o
no vino, cancela y avisa al cliente con un WhatsApp prearmado.

## ⏸ Estacionado

- **Feriados y disponibilidad (decidir en R4):** los feriados los lee el panel de la API,
  pero la RPC de disponibilidad corre en la base y no los ve. Opciones: que el panel
  grabe el cierre como excepción «cerrado» al elegir, o que un job traiga los feriados a
  la base. Hay que resolverlo antes de que el público reserve.
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
- **Deploy y previews en Cloudflare** (se dejó afuera de F0 porque aún no hay nada que
  mirar). Hacerlo **antes de publicar la primera página real (R3)**:
  - Hasta entonces quedan sin verificar en Cloudflare de verdad: la CSP y el fallback
    de SPA del panel (probados solo en `wrangler dev`), el adaptador de Astro y que la
    migración se aplique en el proyecto hosteado.
  - Plan: `wrangler preview` (no exige deploy a producción; `wrangler` ≥ 4.135 y el
    Worker `agenditas-panel` / `agenditas-web`), con `CLOUDFLARE_API_TOKEN` y
    `CLOUDFLARE_ACCOUNT_ID` como secretos del repo y un workflow que comenta la URL en
    el PR. Sin verificar: que ande con el Worker de solo assets y con el de Astro.
  - Las previews son públicas por defecto: activar Access antes de que haya datos
    reales.
- **Revisar `apps/web` y Cloudflare** (anotado en F0):
  - Recursos del adaptador: `session: false` e `imageService: "passthrough"` evitan que
    el deploy cree un KV y un binding de Images. Volver a mirarlo en R3 (logo y portada
    del negocio) y si alguna vez hacen falta sesiones.
  - Archivos `.astro` sin lint ni typecheck: Biome no ve la plantilla y
    `@astrojs/check` no soporta TypeScript 7. Volver a mirarlo cuando haya componentes
    `.astro` con lógica (R3) o cuando salga un `@astrojs/check` compatible.
- **Anotado en la auditoría de F0** (2026-11-17):
  - Borrar `getSupabase` (panel) y `createServerSupabase` (web) si R1 no los usa
    enseguida: hoy no los importa nadie, solo los cubre el typecheck.
  - README "Cómo se construye": reescribirlo con las palabras de Mauro.
  - Google en el ingreso: crear el cliente OAuth, activar `[auth.external.google]` y
    `VITE_GOOGLE_ENABLED=true`; hoy el botón no se muestra.
  - SMTP propio (Resend) y `site_url` del proyecto hosteado apuntando al panel.
  - Estados de carga del alta con conexión lenta.
  - Sin verificar en real: `style-src 'self'` de la CSP con Radix/shadcn (R1) y los
    privilegios por defecto de `supabase_admin` en el proyecto hosteado.
- **Anotado en el /code-review de R1:**
  - Borrar un usuario deja su negocio sin dueño y con el slug tomado: resolverlo antes
    de ofrecer "borrar mi cuenta".
  - Cambiar el slug por UPDATE (antes de publicar) devuelve el 23505 crudo, no
    `slug_taken`: pasarlo por una RPC cuando la vista de edición lo necesite.
  - `slug_available` deja enumerar slugs a cualquier usuario con cuenta: sumar límite
    de ritmo antes de abrir a desconocidos.
  - `site_url` del proyecto hosteado tiene que apuntar al panel (la plantilla del link
    mágico usa `{{ .SiteURL }}/auth/confirm`).
  - `slugWithSuffix("")` da `-2` (inválido): la vista pide un slug si `slugify` queda vacío.
