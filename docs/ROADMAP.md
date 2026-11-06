# Agenditas · Roadmap

> Versión 1 · 2026-11-06. Orden de trabajo del MVP. Cómo se trabaja cada bloque: `AGENTS.md`. Decisiones técnicas: `docs/ARQUITECTURA.md`. Vistas y rutas: `docs/RUTAS.md`.

## Cómo se lee

- **Rebanada** = una funcionalidad de punta a punta con datos reales. Cada rebanada es **una branch y una PR**.
- Dentro de cada branch, **bloques** numerados que se hacen en orden y uno por vez: **DB** (tablas, RLS, `GRANT`, funciones y sus tests pgTAP) → **Backend** (capa de datos y Server Actions con `zod`) → **Vista** (pantallas con componentes de `src/components/ui`) → **Auditoría**.
- Cada bloque termina con la prueba que lo cierra y los comandos de commit. El último bloque de cada branch es siempre la auditoría (`/ponytail-audit` o `/code-review`) más el recorrido en el navegador.
- Una rebanada crea solo las tablas y columnas que sus vistas usan. El modelo completo de `docs/PROYECTO.md` §5 se va completando rebanada a rebanada.
- Estado: ✅ hecho · ▶ en curso · ⏸ estacionado · vacío = pendiente.

## Por qué este orden

Todo lo que ve el cliente final depende de datos que carga el negocio. Si se empieza por la reserva, primero habría que inventar el negocio. Por eso el orden sigue el recorrido real del dueño: entra, crea su negocio, carga servicios, equipo y horarios, publica su página, y recién ahí se puede reservar. Desde la rebanada 6 hay turnos reales, así que la agenda (7–8) se construye sobre reservas de verdad. Avisos, pagos y dominios van al final porque dependen de que el turno exista.

La UI de la página pública y la reserva ya existe en la branch `feat/pagina-publica-reserva` (⏸, con datos demo). Las rebanadas 5 y 6 la toman como base visual y la conectan a la base, en vez de rehacerla.

---

## F0 · Fundaciones ✅

| Branch | Qué dejó |
|---|---|
| `main` | `AGENTS.md`, skills del proyecto, `docs/PRODUCT.md`, `docs/ARQUITECTURA.md`, shadcn tematizado con `/dev/componentes`, `docs/DESIGN.md` y este roadmap |
| `feat/pagina-publica-reserva` ⏸ | Página pública y reserva en 3 pasos con un negocio demo en memoria. Se retoma en las rebanadas 5 y 6 |

---

## 1 · Base de Supabase e ingreso · `feat/ingresar` ▶

Primera rebanada: deja Supabase andando de punta a punta con lo mínimo que tiene vista, que es ingresar al panel.

1. **DB** · `supabase init` + `supabase start`, `config.toml` con Auth por link mágico (Mailpit local) y Google; variables en `.env.local` y `.env.example`. *Listo cuando* `supabase status` muestra la base local y el Studio abre.
2. **Backend** · Clientes `src/lib/supabase/{server,client}.ts` con `@supabase/ssr`, tipos generados, y `src/proxy.ts` que solo refresca la sesión con `getClaims()`. *Listo cuando* un test de humo (un Route Handler de solo desarrollo) devuelve los claims con y sin sesión.
3. **Backend** · Server Actions de ingresar (link mágico y Google), callback `/auth/callback` y salir. Errores en voseo (link vencido, email inválido). *Listo cuando* el mail llega a Mailpit y el link deja la sesión iniciada.
4. **Vista** · `/ingresar`, `/ingresar/revisa-tu-mail` y un layout de panel vacío ("Tu agenda está por acá") protegido: sin sesión redirige a `/ingresar`. *Listo cuando* se ingresa, se recarga, se sale y se vuelve a ingresar sin errores.
5. **Auditoría** · seguridad de sesión (nada de `getSession()` en el servidor, cookies `httpOnly`), recorrido en móvil y escritorio.

## 2 · Crear el negocio · `feat/alta-negocio`

1. **DB** · `businesses` (slug único, rubro, zona horaria, tema), `locations` (una por negocio), `memberships` (rol). RLS: el miembro ve y edita su negocio; `anon` todavía nada. Validación de slugs reservados (`docs/RUTAS.md` §0) en la base. pgTAP de RLS: un usuario no ve el negocio de otro.
2. **Backend** · Capa de datos `src/lib/data/negocio.ts` (negocio activo del usuario) y la Server Action "crear negocio" con `zod`: crea negocio, local y membresía de dueño en una transacción (RPC).
3. **Vista** · `/alta/negocio` (nombre, rubro, dirección, zona horaria, slug con vista previa `slug.agenditas.app` y aviso si está tomado) y `/alta/modo` (solo, equipo con organizador, autogestionado). Después del alta, el panel muestra el nombre del negocio.
4. **Auditoría**.

## 3 · Servicios · `feat/servicios`

1. **DB** · `services` (duración, precio fijo / "desde" / a consultar, categoría, orden, activo). RLS por negocio. Checks de duración y precio.
2. **Backend** · Leer, crear, editar, ordenar y archivar servicios. Plantillas por rubro como datos (no como código).
3. **Vista** · `/alta/servicios` con plantillas para arrancar rápido, `/servicios` (lista por categoría) y `/servicios/[id]` en panel lateral. Estado vacío: "Cargá tu primer servicio".
4. **Auditoría**.

## 4 · Equipo y horarios · `feat/equipo-horarios`

1. **DB** · `staff`, `staff_services`, `availability_rules` (varios tramos por día), `availability_exceptions` y `holidays` con los feriados AR precargados. RLS por negocio; permisos según el modo elegido en el alta.
2. **Backend** · Horario semanal, almuerzo y excepciones. Invitación al equipo por link (`/invitacion/[token]`).
3. **Vista** · `/alta/horarios`, `/alta/equipo`, `/alta/listo` (link y QR), `/equipo`, `/equipo/[id]/horarios`, `/horarios`. Quien trabaja solo se saltea el paso de equipo.
4. **Auditoría**.

## 5 · Página pública · `feat/pagina-publica`

1. **DB** · Columna `publicado` en `businesses`. Políticas `TO anon` de solo lectura para negocios publicados (negocio, servicios activos, equipo, horarios) con sus `GRANT`. pgTAP: `anon` no ve negocios sin publicar ni datos privados.
2. **Backend** · `src/lib/data/publico.ts` con `"use cache"` + ``cacheTag(`business:${id}`)``, y `revalidateTag` desde las acciones de las rebanadas 2–4. Metadatos, imagen OG y `LocalBusiness`.
3. **Vista** · `/[slug]` portado de la branch estacionada a componentes shadcn y datos reales. 404 de negocio inexistente ("¿Es tuyo? Crealo"). Botón "Publicar" en el panel.
4. **Auditoría** · incluye el recorrido de impeccable (`/impeccable critique` o `audit`) sobre la página.

## 6 · Reserva · `feat/reserva`

1. **DB** · `clients`, `appointments` con `EXCLUDE USING gist` (sin superposición por profesional), `time_blocks`. Función `available_slots` (port de `slotsFor`/`nextFree` de la branch estacionada) con los casos de `demo.test.ts` pasados a pgTAP.
2. **DB** · RPC `book_appointment` en un esquema no expuesto: valida, crea o reusa el cliente, inserta el turno en una transacción y devuelve `taken` si choca. pgTAP de la carrera: dos reservas al mismo horario, una gana.
3. **Backend** · Disponibilidad sin cache dentro de `<Suspense>`; Server Action `reservar` con `zod` que llama a la RPC y redirige a `?tomado=1` si corresponde. Cliente recordado en el dispositivo.
4. **Vista** · `/reservar`, `/reservar/horario`, `/reservar/datos`, `/reservar/listo` portados de la branch estacionada. Agregar al calendario con `/api/calendario/[token].ics`.
5. **Auditoría** · más el primer e2e con `@playwright/test`: reservar de punta a punta y el caso "horario tomado".

## 7 · Agenda del día · `feat/agenda-dia`

1. **DB** · Políticas de lectura y edición de turnos para el panel según el rol; índices por negocio y fecha.
2. **Backend** · Turnos del día por profesional, mover, reprogramar, marcar atendido o no vino, cancelar. Realtime de `appointments` para el negocio activo.
3. **Vista** · `/agenda` vista día (columnas por profesional, línea de ahora, huecos, estados de turno), `/turnos/[id]` y `/turnos/nuevo` como paneles laterales con URL, `/bloqueos/nuevo`. Arrastrar y soltar en un bloque aparte, con su prueba.
4. **Auditoría**.

## 8 · Mi día · `feat/mi-dia`

1. **Backend** · Turno en curso, lo que sigue y bloqueo rápido (15′, 30′, 1 h, "hasta…").
2. **Vista** · `/hoy` móvil con barra inferior del panel (Hoy · Agenda · Clientes · Más). Redirección de `/` según dispositivo y rol.
3. **Auditoría**.

## 9 · Clientes · `feat/clientes`

1. **DB/Backend** · Ficha del cliente con historial, notas privadas, etiquetas y no-shows. Búsqueda.
2. **Vista** · `/clientes`, `/clientes/[id]` y `/clientes/nuevo`; paleta ⌘K para buscar clientes y turnos.
3. **Auditoría**.

## 10 · Turno del cliente · `feat/turno-cliente`

1. **DB** · Token por turno (aleatorio, no adivinable) y RPC de reprogramar y cancelar que respetan la política del negocio.
2. **Vista** · `/t/[token]`, `/t/[token]/reprogramar`, `/t/[token]/cancelar`, `/t/[token]/confirmar`, `/t/vencido`.
3. **Auditoría**.

## 11 · Avisos · `feat/avisos`

1. **Backend** · Resend + React Email: confirmación, reprogramación y cancelación con la marca del negocio. Avisos internos al profesional.
2. **DB** · `notifications` + `pg_cron` para los recordatorios de 24 h y 2 h.
3. **Vista** · `/config/notificaciones`.
4. **Auditoría**.

## 12 · Señas con Mercado Pago · `feat/senas`

1. **DB** · `payments`, estado "seña pendiente" con vencimiento y su `pg_cron` de liberación.
2. **Backend** · Conectar la cuenta de MP (OAuth), Checkout Pro y webhook que confirma el turno.
3. **Vista** · `/config/pagos`, `/reservar/pago` y su resultado, `/cobros`, `/t/[token]/pagar`.
4. **Auditoría**.

## 13 · Editor de la página pública · `feat/editor-pagina`

1. **Backend** · Apariencia (acento con chequeo de contraste, par tipográfico, fondo, esquinas, logo y portada en Storage), reglas de reserva y políticas.
2. **Vista** · `/pagina`, `/pagina/apariencia`, `/pagina/reservas`, `/pagina/politicas`, `/pagina/compartir` (link y QR).
3. **Auditoría**.

## 14 · Dominios y despliegue · `chore/hosts-vercel`

1. **Backend** · `src/proxy.ts` con la reescritura por host (`panel.`, `{slug}.`) y slugs reservados.
2. **Infra** · Proyecto de Vercel con `*.agenditas.app`, proyecto Supabase de preview y CI (`lint`, tipos, tests, `supabase test db`, e2e).
3. **Auditoría**.

## 15 · Lanzamiento · varias branches

- `feat/landing-precios`: `/` y `/precios`.
- `feat/legales`: términos y privacidad.
- `feat/pwa`: manifest, íconos y sin conexión.
- `feat/plan-facturacion`: planes y cobro de la suscripción.
- `chore/monitoreo`: errores y métricas.

---

## Después del MVP

Lo marcado F2 y F3 en `docs/RUTAS.md`: WhatsApp, reportes, dominio propio, lista de espera, galería y reseñas, combos, sucursales, recursos y semana / mes / lista en la agenda.
