# Agenditas — Historial

> Qué se hizo en cada rebanada y por qué. Lo nuevo va arriba. No se lee entero: se
> busca cuando hace falta el porqué de algo. Lo que sigue está en [ROADMAP](./ROADMAP.md).

---

## R3 · Servicios — 2026-11-18

Branch `feat/r3-servicios-v2` (la primera quedó con commits sin firma tras un rebase de GitHub) · PR pendiente (se abre con el push)

**Qué quedó:** `/panel/servicios`, donde el solista crea, edita y borra lo que ofrece. En
escritorio, una tabla con búsqueda por nombre (sin acentos ni mayúsculas), columnas
ordenables y paginación de 10; en celu, filas planas de borde a borde. Crear y editar abren
un Sheet (escritorio) o un Drawer (celu) con nombre, duración en chips («Otra…» para el
resto) y precio. Borrar avisa con «Borraste X» y un Deshacer de 6 segundos. Cubre vacío,
carga, error, búsqueda sin resultados y el tope de 50. «Nuevo servicio» vive en el
encabezado del panel. Datos: tabla `services`, RPC `save_service` y `delete_service`,
`src/lib/services/` y las Server Actions. 183 tests pgTAP, 243 de Vitest y 45 e2e.

**Decisiones**
- **Precio en centavos** (`price_cents`); $0 vale y se lee «Sin cargo»; tope $10.000.000.
  Se escribe en pesos con coma para los centavos («1500,50»); el punto de miles también se
  acepta. Duración de 5 a 480 minutos, en pasos de 5. Nombre de 1 a 60, único por negocio
  sin distinguir mayúsculas.
- **Una sola RPC para crear y editar** (`save_service`). El negocio sale de la sesión, nunca
  del navegador. El tope de 50 se cuenta con `FOR UPDATE` sobre la fila del negocio, así
  dos altas a la vez no lo pasan. Un servicio ajeno da el mismo error que uno que no existe.
- **Borrar es borrado real y Deshacer lo recrea:** vuelve con otro id y al final de la
  lista. Es un límite conocido; en R4, cuando los turnos apunten a servicios, se pasa a
  archivar.
- **Sin card en la colección principal.** El fondo del panel ya es `bg-card`; una card va
  solo para un grupo con título propio (como en Horarios). La lista de celu usa `Item` de
  shadcn; la tabla de escritorio, TanStack Table v9 (`@tanstack/react-table`).
- **La búsqueda filtra los datos antes de la tabla** y la paginación es de TanStack. La
  página se conserva al guardar o borrar, y solo vuelve a la primera al buscar.
- **Encabezado del panel:** `PanelHeader` recibe `title` y `subtitle` y trae los estilos;
  `PanelHeaderActions` pone acciones a la derecha. En celu la acción es solo el ícono y el
  subtítulo se oculta. Hay un separador entre el botón del menú y el título.
- **Los errores van donde se mira:** el de borrar y el de guardar, dentro del formulario
  abierto; el aviso con Deshacer es una barra sobre la lista que pausa su tiempo al apuntar
  o enfocar. Tras un envío fallido el foco va al primer campo con aviso.
- **Atajo:** `saveService` castea `service_id` a `null` al crear, porque los tipos
  generados lo marcan no nulo (`// shortcut:` en el código).
- **Diseño:** tabla estándar de shadcn con búsqueda arriba y paginación en el pie, filas
  planas en celu (variante 2 de `/impeccable live`).

**Auditoría:** `code-reviewer` y `security-reviewer` sin hallazgos CRITICAL ni HIGH. Se
arreglaron seis puntos del primero (error de borrar escondido tras el panel, doble toque,
página al guardar, errores del formulario, pausa del Deshacer y editor desactualizado).
`/impeccable critique` dio 26/40 y `audit` 14/20; se arreglaron el precio, el foco, «Borrar»
aparte, el motivo del límite, el esqueleto de carga, los botones de 44 px, el radio de las
cajas, el subtítulo del editor y los textos. Además se restauró el fondo del overlay del
Sheet (una clase mal escrita) y su botón «Cerrar». El detector de impeccable no cubre
`.tsx`: se revisó a mano.

**Pendiente (ver ROADMAP)**
- El título y el botón del encabezado aparecen después de hidratar, no en el primer
  pintado (entran por portal; también pasa en Horarios).
- Sin aviso de «Guardaste X» al cerrar el panel; un toast (sonner) lo resolvería.
- Borrar un servicio con turnos futuros: se decide en R4.
- Rate limit en `save_service` y `delete_service`; nombres con caracteres de control; un
  test del tope de 50 con dos sesiones (pgTAP corre en una sola transacción).
- Decisiones de DESIGN.md: contraste de los bordes de los campos (1,26:1, pide 3:1),
  receta del h1 contra el encabezado compacto y alto de controles en escritorio.

---

## R2b · Feriados — 2026-11-18

Branch `feat/r2b-feriados` · PR pendiente (se abre con el push)

**Qué quedó:** bajo la semana de `/panel/horarios`, la card «Próximos feriados» con los
próximos cinco: la fecha arriba, el nombre abajo, «Hoy» si cae hoy y «Puente» en los
puentes turísticos. Datos: tabla `holidays` (global, solo lectura para la app) y el script
`pnpm holidays:sync`, que carga el año actual y el siguiente desde ArgentinaDatos. 114 tests
pgTAP, 104 de Vitest y 33 e2e.

**Decisiones**
- **La carga es a mano**, una vez al año, con la clave de servicio (`service_role`, el
  único con `INSERT`, `UPDATE` y `DELETE`). Es idempotente y borra de esos dos años lo que
  la API ya no trae (un feriado trasladado). Si la API responde vacía, no borra nada.
- **El parser desconfía de la API:** un tipo desconocido, un feriado de otro año o más de
  100 filas cortan la carga en vez de guardar datos raros. Quita del nombre la fecha entre
  paréntesis («… (20/11)»), porque la fila ya la muestra.
- **`kind` es un enum de Postgres** (`fixed`, `movable`, `bridge`): `supabase gen types` lo
  tipa como unión y desaparecen los casts. El cliente de Supabase va tipado con `Database`.
- **Tipos generados commiteados** (`src/lib/supabase/database.types.ts`, `pnpm db:types`):
  typecheck y build no necesitan la base. El CI regenera el archivo y falla si difiere.
- **«Hoy» y la lista salen de la misma fecha de Buenos Aires**, calculada una vez en el
  loader.
- **Un error al leer no tumba la pantalla:** la card muestra el aviso y los horarios siguen
  usables. Es lo contrario de los horarios, donde el error sube a `error.tsx` para no
  invitar a pisar lo guardado.
- **Carpetas y archivos:** se reordenaron con reglas nuevas en AGENTS.md (carpeta = qué es,
  archivo = su rol, `index.tsx` solo si es el principal, sección con datos = `index` +
  `skeleton` y `loader` si tiene ramas). Se aplicaron a `holidays/` y `hours/`.
- **Diseño:** fila con la fecha primero (variante 2 de `/impeccable live`).

**Pendiente**
- «Cerrar o abrir un feriado» (lo opcional del ROADMAP) no se hizo: el negocio todavía no
  puede decidir que atiende un feriado.
- La tabla no se refresca sola: si nadie corre `pnpm holidays:sync` al empezar un año, la
  card muestra el aviso de vacío.
- Sin verificar en pantalla: el Badge «Hoy» (hoy no cae ningún feriado) y el estado de
  error en el navegador.

---

## R2 · Horarios — 2026-11-18

Branch `feat/r2-horarios` · PR pendiente (se abre con el push)

**Qué quedó:** `/panel/horarios`, donde el solista carga su semana: un interruptor por
día, hasta dos franjas y el almuerzo como el hueco entre ellas. Cada día muestra sus horas
netas y el de hoy lleva una marca. Se puede copiar el horario de un día a lunes a viernes
o a toda la semana (menú en escritorio, «Aplicar a» en la hoja del celu). Guardar y
Descartar viven en el pie del panel y solo aparecen con cambios. Datos: tabla
`business_hours`, `is_business_owner` y la RPC `set_business_hours`. 94 tests pgTAP, 76 de
Vitest y 32 e2e. Los feriados quedaron para R2b.

**Decisiones**
- **El almuerzo no se guarda:** es el hueco entre dos franjas del mismo día. La pantalla
  limita a dos franjas por día; la base solo exige que no se pisen (restricción de
  exclusión con `btree_gist`).
- **Guardar reemplaza la semana entera** con una sola RPC (`set_business_hours`), así no
  quedan semanas a medias. El negocio sale de la sesión, nunca del navegador.
- **`is_business_owner(business_id)`** en vez de comparar `owner_id` en cada política: el
  día que haya varios dueños o roles se cambia en un solo lugar.
- **Marco del panel con huecos:** `SidebarInset` pasó a `div` con header, `main` y
  `footer`. Cada pantalla pone su título y sus acciones con `PanelHeader` y `PanelFooter`
  (un contexto guarda los nodos y se dibuja con un portal). Como el botón Guardar queda
  fuera del `<form>` en el DOM, se asocia con el atributo `form`.
- **«Hoy» lo calcula el servidor** en hora de Buenos Aires (`weekdayIndex`), para que lo
  que dibuja el servidor y el navegador coincidan.
- **Copiar pisa los otros días** sin confirmar: el pie muestra «Cambios sin guardar» y
  Descartar lo deshace.
- **Diseño:** la fila del día sigue el canvas «Equipo y horarios» (sin equipos); el control
  de copiar y el «Aplicar a» salieron de rondas de `/impeccable live`.

**Pendiente**
- La hora se ve en 12 h en un navegador en inglés; en es-AR debería ser 24 h y no se
  verificó en un dispositivo real (ver «Antes de producción»).
- No hay estado vacío propio: con la semana sin horarios se ve todo «No atiende» y la
  frase de ayuda.
- Del critique y el audit (25/40 y 14/20), sin hacer: las dos franjas de un día suenan igual
  para un lector de pantalla («Lunes, desde»), la fila con almuerzo ocupa tres líneas entre
  768 y 1024 px y se parte a 1280 px, y en el celu «Listo» parece el final aunque falta
  Guardar (y su `aria-label` oculta las horas).

---

## Base visual neutra — 2026-11-18

Branch `chore/base-visual` · PR pendiente (se abre con el push)

**Qué quedó:** el estilo Mate se reemplazó por shadcn `base-nova` con el tema neutral,
tal como lo genera `shadcn init`, con Geist y el sidebar `inset`. Los componentes de `ui/`
quedaron estándar. `DESIGN.md` y `/dev/tokens` se reescribieron, el header del panel pasó
a `(app)/header.tsx` y se quitó `PageTitle` (el `h1` lleva la receta de clases). Sin
cambios de datos ni de lógica.

**Decisiones**
- **Por qué:** el canvas de diseño de "Equipo y horarios" se veía distinto a Mate y
  diseñar sobre shadcn estándar es más rápido. Se sigue con este diseño durante el
  desarrollo; al final, la rebanada R8 decide si se restaura Mate (queda en `main` en el
  commit `9afb39d`) o se prueban otras variantes.
- **Errores:** `text-destructive` sobre `bg-destructive/10`, siempre con ícono y texto.
- **Tamaños:** la acción principal usa `size="lg"` (36 px). El 44 px táctil y el
  contraste 3:1 de bordes y foco quedaron sin resolver; están listados en `DESIGN.md`.
- **Tokens que se fueron:** todos los de Mate (`fondo`, `tinta`, `acento`, `bloque`…,
  `--radius-tarjeta`, `--radius-panel`, `--shadow-flotante`) y la regla global de foco.

---

## R1 · Entrar y crear el negocio — 2026-11-18

Branch `feat/r1-login` · PR pendiente (se abre con el push)

**Qué quedó:** `/login` con Google, `/panel/nuevo-negocio` (nombre y link con vista
previa), y `/panel` con sidebar, el link de reservas y "Salir". La tabla `businesses` con
RLS y las RPC `create_business` e `is_slug_available`. 47 tests pgTAP, 23 de Vitest y
21 e2e.

**Decisiones**
- **Guardas en capas:** el proxy hace el chequeo optimista de sesión (307 a `/login` sin
  sesión, 307 a `/panel` en `/login` con sesión) leyendo solo la cookie; el layout del
  panel vuelve a chequear la sesión y es el único que sabe si hay negocio (necesita la
  base, y las docs de Next piden no consultarla en el proxy); la RLS decide qué filas se
  ven. Un 401 no sirve para páginas: el navegador no tiene a dónde ir. Es para APIs.
- **Cache Components:** lo que lee cookies o headers va dentro de `<Suspense>`;
  `createClient` hace `await connection()` porque Supabase lee la hora al iniciar y eso
  rompía el prerender. La página espera a `getUserId()` antes de consultar la tabla,
  porque layout y página renderizan en paralelo y sin sesión la consulta fallaba.
- **Esqueletos:** el `fallback` del layout dibuja solo el marco (sidebar y encabezado) y
  no sabe qué ruta carga; cada pantalla trae su `loading.tsx`. Cada esqueleto vive junto
  al componente que imita. `SidebarInset` ya es el `<main>`: había dos anidados.
- **shadcn `base-nova` (Base UI, no Radix)** con los tokens de Mate encima. El `init`
  pisó los ajustes de Mate y hubo que restaurarlos; el radio base quedó en `0.625rem`.
  Descartado: sidebar con Superficie como acento (no se ve sobre Fondo): el ítem activo es
  una pastilla Superficie con borde Línea.
- **Link de reservas:** va en el pie del sidebar, sin botón de copiar (decisión de Mauro).
  El dominio sale del header `Host` en el servidor (`getPublicHost`), así llega correcto
  en el primer HTML. Un hook de cliente mostraba `agenditas.app` y saltaba a `localhost`
  al hidratar. El formulario de crear el negocio muestra solo la ruta, para seguir
  siendo estático.
- **Acciones de auth** (`signInWithGoogle`, `signOut`) en `src/app/auth/actions.ts`.
  `signOut` ya no va en un `<form>` dentro del menú: React tiraba "A React form was
  unexpectedly submitted" porque el menú se desmonta al hacer clic.
- **Link del negocio:** si el nombre da un link muy corto o muy largo, "Cambiar link"
  también aparece; la base se recorta para dejar lugar a la zona; el error del servidor
  solo vale para el link con el que se envió.
- **Rojo:** `--destructive` sigue en Tinta (DESIGN.md: error con ícono y texto, sin
  rojo). Si hace falta rojo, entra como token propio con su contraste, no como `oklch`
  suelto en `globals.css` (el chequeo de colores no mira ese archivo).
- **Auditoría de cierre** (code-reviewer, security-reviewer, `audit` medido y `critique`):
  nada CRITICAL ni HIGH. Se arreglaron: salida del formulario con link inválido, "Revisando…"
  colgado sin red, `error.tsx` del panel, `NavBusiness` sin dropdown vacío, textos del
  riel en español, `prefers-reduced-motion` en los esqueletos y el formato. Lo que
  queda está en [ROADMAP](./ROADMAP.md).

**Atajos:** el link público es texto hasta que exista la página (R5); `getPublicHost`
confía en el header `Host`; el sidebar tiene un solo ítem; el estado vacío del panel no
tiene acción porque todavía no hay una pantalla a la cual llevar (R2).

---

## F0 · Fundaciones — 2026-11-17

Branch `chore/fundaciones` · PR https://github.com/mauroviveros/agenditas/pull/4

**Qué quedó:** documentos base, app Next 16 con el estilo Mate, Supabase local con
privilegios cerrados y guarda de RLS, `pnpm check` / `test:db` / `test:e2e`, CI con tres
jobs y `main` protegida.

**Decisiones**
- **Reinicio desde cero** (2026-11-17), porque con Astro + React SPA Mauro perdía el
  control de cada etapa y el diseño de R2 no lo convenció. Quedan dos tags: `legacy`
  (primer intento con Next) y `legacy-astro` (segundo intento). No se reusa código.
- **Una sola app Next.js**, porque Mauro la lee y es un solo deploy. Descartado:
  Astro (landing + página pública) + Next (panel), porque la ganancia es de 100 a 200 ms
  en el celu contra mantener dos apps desde el día 1. La meta de rendimiento de la
  página pública decide en R5 si se saca a Astro.
- **Supabase**, por el exclusion constraint, RLS y Auth. Descartados: Neon + Drizzle +
  Better Auth (más código propio para auditar) y una API aparte (todavía no hay app
  móvil ni API pública).
- **Login solo con Google**, porque es un toque en el celu y evita SMTP y links vencidos.
  Descartado: magic link. Si algún solista lo pide, se agrega el mail.
- **Cierre de bloque:** el agente commitea después del OK de Mauro, y el merge del PR
  lo hace Mauro. Reemplaza el flujo anterior, en el que Mauro corría los commits.
- **Diseño:** canvas de direcciones primero, impeccable después. El estilo anterior,
  "calma operativa", queda descartado.
- **Sentry, más adelante.**
- **Next 16 con Cache Components**, porque nada se cachea salvo que se pida
  (`"use cache"`) y la página pública lo necesita para su meta de rendimiento.
- **Oxlint + `tsc`** en vez de ESLint, por velocidad; `typecheck` corre `next typegen`
  antes para que existan los tipos de rutas (`LayoutProps`).
- **Privilegios por defecto cerrados en una migración** y además
  `auto_expose_new_tables = false` en `config.toml`, porque el default de Supabase abre
  toda tabla, secuencia y función nueva a `anon` y `authenticated`. Un test pgTAP lo
  vigila y se comprobó que falla sin la migración. (Al principio pareció que la CLI ya los
  traía cerrados: eran restos del volumen de Docker del intento anterior.)
- **Paleta de Tailwind borrada** (`--color-*: initial`) y `scripts/check-colores.sh` para
  lo que el reset no cubre: hex, `rgb()`/`hsl()`/`oklch()`, valores arbitrarios con
  colores con nombre (`bg-[red]`) y colores con nombre en estilos en línea. No cubre los
  ~140 nombres de CSS, solo los comunes.
- **Auditoría de F0** (code-reviewer + security-reviewer): nada CRITICAL ni HIGH. Se
  arreglaron 7 puntos chicos (secuencias en pgTAP, `auto_expose_new_tables`, `.env.example`,
  check de colores, CI sin cancelar en `main`) y lo de auth quedó anotado en R1.
- **e2e contra el build de producción** (puerto 3100), para probar lo que se despliega,
  incluido que `/dev/tokens` dé 404.
- **Ruleset `main protegida`** en vez de branch protection: PR, checks `check`/`db`/`e2e`,
  firmas SSH, historia lineal y **solo squash**. Un commit por rebanada en `main`; los
  commits por bloque quedan en el PR. Descartado: rebase-merge (GitHub no puede firmar
  los commits que reescribe) y merge commits (rompen la historia lineal).

**Diseño elegido:** "Mate" (C de 4 direcciones), por cálido y cercano sin perder
legibilidad de la hora. Canvas: https://claude.ai/artifact/GkZLfzBKpXpRiXiPtvtHMd

**Atajos:** la portada `/` es provisoria → se reemplaza cuando se diseñe la landing.

**Pendiente:** `.env.example` llega en R1 con la primera variable real; la verificación de
marca de Google (la arranca Mauro) es requisito de R1.
