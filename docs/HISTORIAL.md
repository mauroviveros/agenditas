# Agenditas — Historial

> Qué se hizo en cada rebanada y por qué. Lo nuevo va arriba. No se lee entero: se
> busca cuando hace falta el porqué de algo. Lo que sigue está en [ROADMAP](./ROADMAP.md).

## Formato de cada entrada

```md
## R<n> · <Nombre> — <AAAA-MM-DD>

Branch `feat/<rebanada>` · PR <link>

**Qué quedó:** <qué puede hacer alguien ahora, en una o dos líneas>.

**Decisiones**
- <Qué se decidió>, porque <por qué>. Descartado: <alternativa> (<por qué no>).

**Diseño elegido:** <alternativa y por qué>. (Solo si hubo tramo Diseño.)

**Atajos:** <límite> → <cuándo cambiarlo>. (También comentados como `// shortcut:`.)

**Pendiente:** <lo que quedó afuera a propósito; si se va a hacer, está en el ROADMAP>.
```

---

## F0 · Fundaciones — en curso (kickoff 2026-11-16)

Branch `chore/fundaciones`

**Qué quedó:** `PRODUCT`, `ARQUITECTURA`, `ROADMAP` y este historial. El esqueleto y
CI todavía no.

**Decisiones**
- Reiniciar desde cero en el mismo repo, porque el producto estaba bien definido pero
  el stack no convencía. El estado anterior queda en el tag `legacy-next`.
  Descartado: repo nuevo (se pierden historial y remoto sin ganar nada).
- MVP solo para el solista: ingreso, negocio, servicios, horarios, página pública,
  reserva y agenda del día. Descartados por ahora: equipo, señas, email y editor de
  apariencia (ver Estacionado en el ROADMAP).
- Avisos por links `wa.me` con el mensaje prearmado, porque es el canal que el
  solista ya usa y no cuesta ni pide aprobación de Meta. Descartado: email en el MVP.
- Cloudflare en vez de Vercel para todo el hosting, por preferencia de Mauro y para
  tener DNS, comodín y Turnstile en un lugar.
- Supabase se queda (datos, Auth, Realtime), porque `EXCLUDE` + RLS resuelven lo
  difícil. Descartado: D1 (SQLite sin `EXCLUDE`, RLS ni Realtime).
- Supabase Auth. Descartado: Better Auth (no es proveedor nativo; rompe `auth.uid()`
  en la RLS).
- Página pública y reserva en `apps/web` (Astro SSR); la landing, cuando llegue, en
  una app aparte (`apps/landing`, estática). Se había elegido una sola app y se
  revirtió el mismo día: con subdominios obliga a `run_worker_first` y ata el deploy
  de marketing al de la reserva.
- Direcciones: MVP en `agenditas.app/s/{slug}` (el prefijo `/s/` no choca con las
  rutas de la landing y queda siempre como respaldo). Después del MVP: subdominio
  `{slug}.agenditas.app` como base de todos los planes y dominio propio como premium.
  Una sola dirección canónica por negocio. Descartado: `/{slug}` pelado (choca con
  las rutas de la landing).
- Slug: se arma desde el nombre del negocio (como un repo de GitHub), el primero que
  lo toma se lo queda y el id no aparece en la URL (es solo la clave interna); en el
  MVP es fijo después de publicar. Cuando se pueda cambiar, el link viejo deja de
  andar y el slug anterior se libera, con el consentimiento explícito del dueño.
  Descartados: `/s/id/{id}` (dos direcciones para lo mismo) y una tabla de
  redirecciones (más estado que mantener; se acepta que los links viejos mueran).
- Panel como SPA (Vite + React + TanStack Router/Query). Descartados: Next + OpenNext
  (adaptador atrás de Next, sin middleware de Node), panel en Astro (la grilla sería
  una isla gigante), Angular (sin componentes compartidos con las islas). La seguridad
  queda toda en la RLS y las RPC, que ya era el guardia real.
- Backend aparte (`apps/api`, Hono) recién cuando haga falta un webhook.
- Revisión de `ecc:architect`: la RPC de reservar no la ejecuta `anon` (si no,
  Turnstile se saltea llamando a la Data API); la llama el Worker con la clave
  secreta. SMTP propio para el link mágico. Sin Realtime ni OG por negocio en el MVP.
- Previews de Cloudflare fuera de F0, porque no hay nada que mirar más que páginas de
  esqueleto y piden un token de API en los secretos del repo. Costo aceptado: la CSP y
  el fallback de SPA del panel, el adaptador de Astro y la migración en el proyecto
  hosteado siguen sin verificarse en Cloudflare hasta el primer deploy (ver ROADMAP).
  Hallazgo para cuando se haga: `wrangler preview` no exige un deploy previo a
  producción; `wrangler versions upload` sí.
- Versiones fijadas bajo la regla de antigüedad de pnpm (`supabase` 3.1.0, `wrangler`
  4.162.0): se había colado `wrangler` 4.163.0 por una exclusión automática y el
  lockfile la arrastraba.
- Acciones de GitHub fijadas por SHA: un tag se puede reapuntar a código malicioso
  (como pasó con `tj-actions/changed-files` en 2025) y la CI va a tener secretos.
- Protección de `main` (2026-11-17): PR obligatorio con 0 aprobaciones (GitHub no deja
  aprobar el PR propio), checks `check` y `database` obligatorios y al día con `main`,
  `enforce_admins` para que valga también para Mauro, sin force push ni borrado.
  Funciona en el repo privado con plan personal. No se probó un push directo: la
  regla `deny` de `.claude/settings.json` le impide al agente intentarlo.
- `Workers Builds: agenditas` aparece como check en los PR: el Worker `agenditas` de
  Cloudflare está conectado a este repo y compila en cada push. No es parte de la CI
  del repo ni se exige en la protección; decidir si se desconecta o se reconfigura.

## Antes del reinicio · Next.js + Supabase — 2026-10-21 a 2026-11-16

Tag `legacy-next` (30 commits sobre `main`).

**Qué quedó:** ingreso con link mágico y Google, panel protegido vacío y shadcn
tematizado ("Calma operativa"). Sin migraciones.

**Decisiones que siguen valiendo**
- Link mágico con `token_hash` y no PKCE, para que ande abierto en otro dispositivo.
- Roles en tablas (`memberships`), nunca en `user_metadata`, que el usuario edita.
- Turnos sin superposición con `EXCLUDE USING gist` sobre `tstzrange`; reservas solo
  por RPC; todo en UTC con zona horaria por negocio.
- Las tablas nuevas no se exponen solas a la Data API: cada una necesita su `GRANT`.

**Pendiente:** la branch `feat/pagina-publica-reserva` (UI de reserva con datos demo)
ya no existe local ni en el remoto; si aparece, sirve de referencia para R4.
Referencias de producto (módulos, modelo de datos, rutas) en `docs/PROYECTO.md` y
`docs/RUTAS.md` del tag.
