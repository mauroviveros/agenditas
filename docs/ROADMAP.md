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

## Antes de producción

Lo que dejó R1 y no bloquea el merge, pero sí el deploy. Cada punto, un caso borde o un
check.

**Google** (lo hace Mauro; la verificación tarda días): el cliente OAuth
`Agenditas local` ya existe en modo Testing. Falta: verificar `agenditas.app` en Search
Console; publicar una home y una política de privacidad en `agenditas.app` (Google las
revisa); cargar Branding (logo, home, privacidad, dominio autorizado); crear el cliente
`Agenditas prod` con el callback de Supabase de producción; publicar la app y pedir la
verificación.

**Configuración y seguridad**
- Producción: apagar el provider email y `enable_signup` en el proyecto remoto (en local
  quedan prendidos para los e2e) y cargar en Supabase las URL de redirección exactas, sin
  comodines. Que `Host` sea el dominio público detrás del proxy del hosting.
- Cabeceras de seguridad en `next.config.ts`: `frame-ancestors 'none'`, `nosniff` y
  `Referrer-Policy` (hoy `/login` y `/panel` se pueden meter en un iframe).
- Rate limit en `is_slug_available`, `create_business`, `save_service` y `delete_service`.
- `create_business`: nombres explícitos de los constraints de `businesses` (con un test
  por código) y traducir `not_null_violation`.
- Un test pgTAP que recorra los grants de `public` para `anon` y `authenticated`.
- Un JWT ya emitido vale hasta 1 hora aunque se cierre sesión; si hace falta revocar
  antes en acciones sensibles, usar `getUser()`. `signOut()` cierra todos los
  dispositivos (scope global): confirmar que es lo que se quiere.
- `proxy.ts` corre `getClaims()` en todos los pedidos; en R5 las páginas públicas no
  deberían pagarlo.

**Calidad**
- Tests unitarios de `createBusiness` (Zod, mapeo de errores de la RPC, redirects).
- Nombres de variables de los e2e en inglés (AGENTS.md).
- `/login` en `next dev`: "Could not validate `instant` because a Client Component in a
  parent segment prevented the page from rendering" (solo en desarrollo; el build y los
  e2e pasan). Entender y arreglar o marcar `instant = false` con su porqué.
- Crear negocio: si se escribe el nombre antes de que hidrate la página, el campo
  muestra el texto pero el link no lo toma (queda en `tu-negocio`).

- `PanelHeader` (título y acciones): entran por portal, así que aparecen después de
  hidratar y no en el primer pintado (pasa en Horarios y en Servicios). Renderizar el
  título en el servidor.
- Servicios: sin aviso al guardar («Guardaste X»); si se suma sonner, usarlo también para
  el Deshacer. Nombres con caracteres de control (`\n`, `\t`): rechazarlos en Zod y en el
  constraint. Test del tope de 50 con dos sesiones (pgTAP no puede). Sin sesión, las
  acciones de servicios redirigen a `/panel` en vez de `/login`.
- Movimiento reducido: ni el esqueleto ni el Sheet o Drawer respetan
  `prefers-reduced-motion`; resolverlo en los componentes compartidos.

**Horarios (R2):** verificar en un dispositivo real con región es-AR que las horas se
muestran en 24 h (en un navegador en inglés se ven en 12 h).

**Para decidir con Mauro**
- DESIGN.md: oscurecer `--input` (los bordes de campos y chips miden 1,26:1 y WCAG pide
  3:1), si el título del panel sigue `text-base` o pasa a la receta del h1 (`text-2xl`), y
  si los controles de escritorio miden 44 px como en Horarios o `md:h-8` como en Servicios.
- ¿"Desktop first" vale para toda la app? DESIGN.md ahora dice "celu y escritorio" sin
  fijar cuál va primero.
- Sin "Copiar link" ni compartir por WhatsApp, el link de reservas en celu solo se ve
  abriendo el cajón.

## ▶ R3b · Marco del panel

Que todas las pantallas del panel se definan de una sola manera. Branch `feat/panel-frame`.
Brief: header con título y bajada desde un registro de pantallas (`src/lib/panel/screens.ts`,
lo leen el header y el menú); la bajada es de una línea y se ve desde `md`; la ayuda de uso va
en el cuerpo; el título de card baja a `text-base font-semibold`; controles de 44 px en celu y
de 32 px desde `md`, filas de ~56 px en escritorio.

1. **Registro y header.** Hecho: `SCREENS`, `findScreen`, `PanelHeader` en el layout, páginas
   y `loading.tsx` sin wrapper, menú alimentado por el registro. Sin commitear.
   También: `search.ts` a `lib/services/` y `empty.tsx` dentro de `view.tsx`.
2. **Densidad única.** 44 px en celu y 32 px desde `md` en filas, chips, footer y botones.
   *Listo cuando:* las filas de Horarios miden ~56 px en escritorio y 44 px en celu, medido
   en el navegador.
3. **Receta de formulario (Horarios).** Título de card a `text-base`; la ayuda pasa a la
   card y Horarios gana su bajada en el registro. Misma estructura de carpeta que Servicios
   (`index.tsx` con Suspense y lectura, `skeleton.tsx`, `view.tsx`).
4. **Receta de lista (Servicios).** Buscador, contenedor de tabla y contador alineados a la
   receta. Un solo `(app)/error.tsx` con «Probá de nuevo» para todas las pantallas (el error
   de lectura sube ahí; el sidebar y el header quedan): se van `failed.tsx` y el `try/catch`
   del loader, que pasa a `index.tsx`.
5. **Documentos.** `DESIGN.md` (h1 `text-base`, bajada, densidad, recetas, registro), este
   ROADMAP y el HISTORIAL.

Para después, si Mauro lo decide: una sola lista de filas en vez de tabla y lista de celu a
la vez, y ver si con tope de 50 servicios hace falta paginar.

## R4 · Agenda del día

Cargar un turno a mano, moverlo, cancelar con deshacer y "salgo 30 min".

Al empezar, decidir el borrado de servicios: hoy es real y Deshacer los recrea con otro id.
Con turnos apuntando a servicios pasa a archivar, y cada turno guarda su copia de nombre,
duración y precio. Borrar uno con turnos futuros pide confirmar (hay un cliente avisado).

## R5 · Página pública y reserva

Reserva en tres pasos, con Turnstile y límite por IP/teléfono. Se mide la meta de
rendimiento.

## R6 · Clientes y WhatsApp

## R7 · Caja

## R8 · Rebranding

Hasta acá la app se desarrolla con el diseño base de shadcn (neutral, Geist). Al final se
decide la identidad: restaurar Mate (está en `main` en el commit `9afb39d`, ver
`globals.css` y el `DESIGN.md` de esa fecha) o probar otras variantes. Como las pantallas
usan solo tokens y componentes de shadcn, el cambio debería quedar en `globals.css` y en
las fuentes de `layout.tsx`. Al empezar, resolver también lo pendiente de `DESIGN.md`:
alto táctil de 44 px, contraste de bordes y foco, y modo oscuro.

## ⏸ Estacionado

- **Equipos** (dueño, recepción, varios profesionales): después del MVP.
- **Sentry:** cuando haya usuarios reales.
