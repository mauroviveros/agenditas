# Agenditas — Roadmap

> Qué se hace ahora y qué sigue. Lo terminado y sus decisiones están en
> [HISTORIAL](./HISTORIAL.md). Estados: ▶ en curso · ⏸ estacionado · sin marca =
> pendiente. Objetivo: menos de 200 líneas.

## Cómo se lee

- **Rebanada** = una funcionalidad de punta a punta con datos reales. Una branch
  `feat/<rebanada>`.
- **Bloques de una sola cosa** (una tabla, un endpoint, una pantalla), en orden: primero
  los datos, después cada pantalla. Cada bloque cierra con un *Listo cuando* verificable.
- **Cierre de bloque:** test primero → checks en verde → chequeo de seguridad si toca
  auth, inputs, claves o la reserva (🔒) → el agente abre la vista y deja 2 o 3 cosas
  para probar → **OK de Mauro** → el agente commitea el bloque.
- **Pantallas:** `/impeccable shape` → esqueleto → `/impeccable live` → Mauro elige la
  variante → estados, tests y e2e (ver AGENTS.md).
- **Cierre de rebanada:** auditoría (code-reviewer + security-reviewer, y por pantalla
  `/impeccable critique`, `audit` y `polish`) → PR con CI
  verde → **el merge lo hace Mauro**. Se pasa al HISTORIAL y se borra de acá.
- Los comandos que crean o instalan cosas los corre Mauro, de a uno.

## Por qué este orden

Nada existe hasta que alguien lo carga:

1. El solista entra y crea su negocio (R1).
2. Carga cuándo atiende (R2) y qué ofrece (R3).
3. Usa su agenda (R4).
4. Sus clientes reservan solos (R5) y quedan registrados (R6).
5. Cobra (R7).

---

## R1 · Entrar y crear el negocio ▶

El solista entra con Google y crea su negocio (nombre y slug). Rutas: `/login`,
`/panel`; la página pública queda en `/reservar/{slug}` (el prefijo evita choques con
las rutas de la app; subdominio o dominio propio, después del MVP). El rubro queda
afuera hasta que algo lo use.

Bloques: 0 dependencias · 1 🔒 tabla `businesses` · 2 🔒 RPC `create_business` ·
3 🔒 auth (config, clientes, proxy, callback) · 4 pantalla `/login` · 5 🔒 pantalla para
crear el negocio · 6 guardas de `/panel`.

**Google, pendiente para producción** (lo hace Mauro; la verificación tarda días):
el cliente OAuth `Agenditas local` ya existe en modo Testing. Falta: verificar
`agenditas.app` en Search Console; publicar una home y una política de privacidad en
`agenditas.app` (Google las revisa); cargar Branding (logo, home, privacidad,
dominio autorizado); crear el cliente `Agenditas prod` con el callback de Supabase de
producción; publicar la app y pedir la verificación.

**Seguridad pendiente de la auditoría de F0** (cada punto, un caso borde o un check):

- `config.toml`: activar Google con `env()` y fijar `site_url` /
  `additional_redirect_urls` (sacar `https://127.0.0.1`). El provider email queda
  prendido solo en local, para que Playwright pueda entrar; en producción se usa solo
  Google (se configura en el dashboard).
- Toda RPC `security definer` con `set search_path = ''`.
- Cada RPC pública: `grant execute` explícito, validación con Zod y rate limit.
- Vistas con `security_invoker = true` (el guard de RLS no mira vistas).
- Sacar `graphql_public` de `api.schemas` si no se usa.
- Un esquema nuevo (p. ej. `private`) repite los revokes de la migración de fundaciones.

**Para la auditoría de cierre** (revisión de SQL del bloque 5a; Mauro elige):

- MEDIUM: `create_business` traduce errores por los nombres automáticos de los
  constraints; darles nombre explícito en `businesses` y testear cada código.
- MEDIUM: `create_business` no traduce `not_null_violation` (nombre o slug nulos).
- LOW: `is_slug_available` sin rate limit (los slugs son públicos; costo: una búsqueda
  por índice por consulta).
- LOW: un test pgTAP que recorra los grants de `public` para anon y authenticated, por
  si algo se crea fuera de las migraciones.

## R2 · Horarios

Semana, almuerzo y feriados de Argentina.

## R3 · Servicios

Nombre, duración y precio.

## R4 · Agenda del día

Cargar un turno a mano, moverlo, cancelar con deshacer y "salgo 30 min".

## R5 · Página pública y reserva

Reserva en tres pasos, con Turnstile y límite por IP/teléfono. Se mide la meta de
rendimiento.

## R6 · Clientes y WhatsApp

## R7 · Caja

## ⏸ Estacionado

- **Equipos** (dueño, recepción, varios profesionales): después del MVP.
- **Sentry:** cuando haya usuarios reales.
