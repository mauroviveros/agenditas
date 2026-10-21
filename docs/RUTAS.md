# Agenditas · Inventario de vistas y rutas

> Borrador v0.2 · 2026-10-21. Para revisar juntos. Cada vista se diseña primero como artboard (con el design system Calma operativa) y después se implementa.
>
> Fase: **MVP** = primera versión que sale · **F2** = después del lanzamiento · **F3** = más adelante.

## 0. Convenciones

### Dominios

| Host | Qué sirve |
|---|---|
| `agenditas.app` | Marketing, links de turno (`/t/…`) |
| `panel.agenditas.app` | Login, registro, alta del negocio y panel. Las cookies de sesión viven solo acá |
| `{slug}.agenditas.app` | Página pública y reserva del negocio |
| Dominio propio del negocio (`turnos.barberiaceibo.com`) | Lo mismo que el subdominio (F2) |

En Next 16 el antiguo middleware se llama **Proxy** (`src/proxy.ts`). Lee el `host` y reescribe: `panel.agenditas.app/*` → `/panel/*`; subdominios y dominios propios → `/(publico)/[slug]/…`. También hace el chequeo optimista de sesión en el panel; la autorización real va en el servidor y en la RLS de Supabase.

### Una sola app

Todos los dominios los sirve **una única app de Next.js** desplegada en un proyecto de Vercel con `agenditas.app`, `panel.agenditas.app`, el comodín `*.agenditas.app` y, en F2, los dominios propios (alta por API). Separar en varias apps solo tendría sentido si el marketing pasa a Astro o si lo público necesita un deploy aparte.

### Slugs reservados

Ningún negocio puede usar como slug: `panel`, `www`, `app`, `api`, `admin`, `ayuda`, `blog`, `status`, `mail`, `t`, `static`, `cdn`, `docs`, `agenditas`, ni los nombres de rubros de `/rubros/…`.

### Negocio activo

El usuario que pertenece a varios negocios elige el activo con un selector en el panel; queda guardado en una cookie. Las URLs del panel no llevan el slug del negocio: son más cortas y se pueden compartir dentro del equipo.

### Paneles laterales con URL

El detalle de un turno, de un cliente y "nuevo turno" se abren como **panel lateral sin perder la grilla**. Tienen URL propia (rutas paralelas e interceptadas: `@sheet`), así que se pueden compartir y recargar. Entrando directo por esa URL, se ven como página completa.

### Estructura de carpetas (propuesta)

```
src/app/
  (marketing)/            landing, precios, rubros, legales
  panel/                  todo lo de panel.agenditas.app (reescrito desde el host)
    (auth)/               ingresar, registro, invitación
    alta/                 alta guiada del negocio
    (app)/                agenda, clientes, etc. (layout con sidebar / barra inferior)
    @sheet/               paneles laterales interceptados
  (publico)/[slug]/       página pública y reserva (reescrita desde el host)
  t/[token]/              gestión del turno por el cliente
  api/                    webhooks y endpoints (sin vista)
src/proxy.ts
```

## A. Marketing (agenditas.app)

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/` | Landing | MVP | Propuesta, cómo funciona, rubros, precios resumidos, CTA "Crear mi agenda" |
| `/precios` | Planes y comparación | MVP | Por cantidad de profesionales y funciones (señas, dominio propio, WhatsApp) |
| `/rubros/[rubro]` | Landing por rubro | F2 | Barberías, estética, salud, etc.; SEO |
| `/funciones/[funcion]` | Detalle de cada función | F2 | Señas, recordatorios, página pública… |
| `/ayuda`, `/ayuda/[articulo]` | Centro de ayuda | F2 | Puede ser externo |
| `/legal/terminos`, `/legal/privacidad` | Legales | MVP | |
| `/contacto` | Contacto | F2 | |

## B. Autenticación (`panel.agenditas.app`)

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/ingresar` | Login | MVP | Email con link mágico + Google |
| `/ingresar/revisa-tu-mail` | Link enviado | MVP | |
| `/registro` | Crear cuenta | MVP | Lleva directo al alta del negocio |
| `/invitacion/[token]` | Aceptar invitación al equipo | MVP | Para profesionales y recepción |
| `/auth/callback` | Callback de OAuth / magic link | MVP | Sin vista |
| `/salir` | Cerrar sesión | MVP | Sin vista |

## C. Alta del negocio (`panel.agenditas.app/alta`)

Asistente en pasos, con progreso y la opción de "lo completo después".

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/alta/negocio` | Nombre, rubro, dirección, zona horaria, slug | MVP | Muestra en vivo `slug.agenditas.app` |
| `/alta/modo` | ¿Trabajás solo o en equipo? ¿Hay organizador? | MVP | Define roles y permisos por defecto |
| `/alta/servicios` | Primeros servicios | MVP | Plantillas por rubro para arrancar rápido |
| `/alta/horarios` | Horario del negocio y del profesional | MVP | Incluye almuerzo |
| `/alta/equipo` | Invitar profesionales | MVP | Se saltea si trabaja solo |
| `/alta/listo` | Listo: link para compartir, QR, próximos pasos | MVP | |

## D. Panel del negocio (`panel.agenditas.app`)

Las rutas se escriben como las ve el usuario; internamente viven en `src/app/panel/`.

Layout: sidebar en escritorio y barra inferior en móvil (Hoy · Agenda · Clientes · Más).

### D1. Inicio y agenda

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/` | Redirige | MVP | A `/hoy` en móvil o para profesionales; a `/agenda` en escritorio con rol recepción/dueño |
| `/hoy` | "Mi día" | MVP | El turno en curso, lo que sigue, bloquear un rato. La vista del profesional en el celu |
| `/agenda` | Agenda · día por profesional | MVP | `?fecha=2026-10-21&vista=dia\|semana\|mes\|lista&pro=nico` |
| `/agenda?vista=semana` | Semana | MVP | Un profesional o todos |
| `/agenda?vista=mes` | Mes | MVP | Ocupación por día, feriados |
| `/agenda?vista=lista` | Lista de próximos | MVP | Ideal para recepción y móvil |
| `/turnos/nuevo` | Nuevo turno · panel lateral | MVP | `?pro=&inicio=` precargados al tocar un hueco |
| `/turnos/[id]` | Detalle y edición del turno · panel lateral | MVP | Atendido, reprogramar, cancelar, no vino, WhatsApp, cobrar |
| `/bloqueos/nuevo` | Bloquear un rato · panel lateral u hoja | MVP | 15′, 30′, 1 h, hasta… + motivo |
| ⌘K | Paleta de comandos | MVP | Sin ruta propia; se abre en todo el panel |
| `/notificaciones` | Novedades | F2 | Reservas nuevas, cancelaciones, señas acreditadas |
| `/lista-de-espera` | Lista de espera | F2 | |

### D2. Clientes

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/clientes` | Lista con búsqueda y filtros | MVP | Etiquetas, última visita, no-shows |
| `/clientes/[id]` | Ficha del cliente · panel lateral o página | MVP | Datos, historial, notas privadas, próximos turnos |
| `/clientes/nuevo` | Alta de cliente | MVP | |
| `/clientes/importar` | Importar CSV / contactos | F2 | |

### D3. Servicios

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/servicios` | Lista por categoría, ordenable | MVP | |
| `/servicios/nuevo`, `/servicios/[id]` | Crear o editar servicio | MVP | Duración, precio, seña, buffers, profesionales, foto |
| `/servicios/categorias` | Categorías | MVP | Puede vivir dentro de la lista |
| `/servicios/combos` | Combos y paquetes | F3 | |

### D4. Equipo y disponibilidad

Permisos según el modo elegido en el alta: en **equipo autogestionado** cada profesional edita su horario, ausencias y bloqueos; en **equipo con organizador** el profesional solo hace bloqueos rápidos y el resto lo edita el organizador. Quien trabaja solo puede todo.

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/equipo` | Lista de profesionales y personal | MVP | Estado de la invitación, rol |
| `/equipo/invitar` | Invitar | MVP | |
| `/equipo/[id]` | Perfil del profesional | MVP | Foto, bio, servicios que hace, permisos |
| `/equipo/[id]/horarios` | Horario semanal | MVP | Varios tramos por día, almuerzo |
| `/equipo/[id]/ausencias` | Vacaciones, licencias y excepciones | MVP | Abre distinto un día puntual |
| `/horarios` | Horario del negocio y feriados | MVP | Feriados AR precargados |
| `/recursos` | Sillas, camillas, salas | F2 | |
| `/sucursales` | Sucursales | F3 | El modelo ya tiene `locations` desde el MVP (una por negocio); la agenda y la reserva se vuelven filtrables por local |

### D5. Cobros y señas

Recepción ve precios y el estado de las señas en cada turno, y puede cobrar; no ve `/cobros` (movimientos), `/caja` ni `/reportes`. Eso queda para dueño y admin.

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/cobros` | Movimientos: señas y cobros | MVP | Estado de cada pago de Mercado Pago |
| `/cobros/[id]` | Detalle del pago | MVP | Reembolso si aplica |
| `/caja` | Caja del día | F2 | Cobros en el local, medios de pago |

### D6. Reportes

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/reportes` | Resumen | F2 | Ocupación, ingresos estimados, no-shows, clientes nuevos y recurrentes |
| `/reportes/[reporte]` | Detalle por profesional o servicio | F2 | |

### D7. Página pública (editor)

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/pagina` | Editor con vista previa en vivo | MVP | Secciones activables y ordenables |
| `/pagina/apariencia` | Acento, tipografía, fondo, esquinas, logo, portada | MVP | Con chequeo de contraste (tablero "Personalización pública") |
| `/pagina/reservas` | Reglas de reserva | MVP | Anticipación mín./máx., intervalo, "cualquiera" y cómo asigna, preguntas extra |
| `/pagina/politicas` | Seña, cancelación, tolerancia | MVP | |
| `/pagina/compartir` | Link, QR, botón para Instagram/Google, widget embebible | MVP (link y QR) · F2 (widget) | |
| `/pagina/dominio` | Dominio propio | F2 | |
| `/pagina/galeria` | Galería e Instagram | F2 | |
| `/pagina/resenas` | Reseñas | F2 | |

### D8. Configuración

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/config` | Datos del negocio | MVP | Nombre, rubro, dirección, zona horaria, contacto |
| `/config/notificaciones` | Recordatorios y avisos | MVP | Email ahora; WhatsApp en F2 |
| `/config/pagos` | Conectar Mercado Pago | MVP | OAuth de MP |
| `/config/roles` | Roles y permisos | F2 | En el MVP hay roles fijos |
| `/config/plan` | Plan y facturación de Agenditas | MVP | |
| `/config/integraciones` | Google Calendar, WhatsApp, etc. | F3 | |
| `/cuenta` | Mi cuenta | MVP | Nombre, email, tema claro/oscuro, densidad, negocios a los que pertenezco |

## E. Página pública del negocio (`{slug}.agenditas.app`)

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/` | Página del negocio | MVP | Portada, servicios, equipo, horarios, ubicación, políticas, CTA. SEO: metadatos, imagen OG y datos estructurados `LocalBusiness` |
| `/servicios/[servicio]` | Detalle del servicio | F2 | SEO, fotos |
| `/equipo/[pro]` | Perfil del profesional | F2 | En el MVP, el link "reservá conmigo" es `/reservar?pro=nico` |
| `/negocio-pausado` | Reservas pausadas | MVP | Estado, no ruta: el negocio desactivó las reservas online |

## F. Reserva (`{slug}.agenditas.app/reservar`)

Flujo en 3 pasos más la confirmación. El estado vive en la URL para que se pueda volver atrás y compartir.

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/reservar` | Paso 1 · servicio | MVP | Se saltea si llega con `?servicio=` |
| `/reservar/horario` | Paso 2 · profesional + día + hora | MVP | `?servicio=&pro=cualquiera&fecha=`; sin lugar → próximo libre |
| `/reservar/datos` | Paso 3 · nombre, WhatsApp, notas, preguntas extra | MVP | Se recuerdan en el dispositivo |
| `/reservar/pago` | Seña con Mercado Pago | MVP | Redirige a MP; el turno queda "pendiente de seña" con vencimiento |
| `/reservar/pago/resultado` | Volver de MP: aprobado, pendiente o rechazado | MVP | |
| `/reservar/listo` | Confirmación | MVP | Agregar al calendario, link al turno, WhatsApp del negocio |
| `/reservar/horario-tomado` | El horario se ocupó mientras reservaba | MVP | Estado dentro del paso 2, con alternativas |

## G. Gestión del turno por el cliente (`agenditas.app/t/[token]`)

Sin cuenta; el token llega por email o WhatsApp.

| Ruta | Vista | Fase | Notas |
|---|---|---|---|
| `/t/[token]` | Mi turno | MVP | Datos, cómo llegar, agregar al calendario, estado de la seña |
| `/t/[token]/reprogramar` | Elegir otro horario | MVP | Mismo selector del paso 2, respetando la política |
| `/t/[token]/cancelar` | Cancelar | MVP | Explica qué pasa con la seña |
| `/t/[token]/pagar` | Pagar la seña pendiente | MVP | |
| `/t/[token]/confirmar` | Confirmar asistencia (desde el recordatorio) | MVP | |
| `/t/[token]/opinar` | Dejar reseña | F2 | |
| `/t/vencido` | Link inválido o turno pasado | MVP | |

## H. Emails y mensajes (plantillas, no rutas)

| Plantilla | Para | Fase |
|---|---|---|
| Turno confirmado | Cliente | MVP |
| Seña pendiente / acreditada / vencida | Cliente | MVP |
| Recordatorio 24 h y 2 h | Cliente | MVP |
| Turno reprogramado / cancelado (por el negocio o por el cliente) | Cliente | MVP |
| Nueva reserva, cancelación, seña acreditada | Profesional / negocio | MVP |
| Resumen diario de la agenda | Profesional | F2 |
| Link mágico de ingreso, invitación al equipo | Usuario del panel | MVP |
| Bienvenida y onboarding | Dueño | MVP |
| Pedido de reseña | Cliente | F2 |
| Versiones por WhatsApp de lo anterior | Cliente / profesional | F2 |

## I. Sistema

| Ruta | Vista | Fase |
|---|---|---|
| `not-found` | 404 general y 404 de negocio inexistente (`slug` libre → "¿Es tuyo? Crealo") | MVP |
| `error` | Error inesperado, con reintento | MVP |
| `/sin-conexion` | PWA sin conexión | MVP |
| `/mantenimiento` | Mantenimiento | F2 |
| `manifest.webmanifest`, íconos | PWA (por negocio para el panel) | MVP |
| `opengraph-image` | Imagen OG por negocio y por página de marketing | MVP |

## J. Administración interna de Agenditas

| Ruta | Vista | Fase |
|---|---|---|
| `/admin` | Negocios, planes, métricas, soporte, suplantar (con auditoría) | F2 |

## K. Endpoints sin vista (`/api`)

| Ruta | Para |
|---|---|
| `/api/webhooks/mercadopago` | Confirmar señas y cobros |
| `/api/webhooks/suscripcion` | Facturación del plan |
| `/api/cron/recordatorios`, `/api/cron/vencer-senas` | Si no se resuelve con `pg_cron` en Supabase |
| `/api/calendario/[token].ics` | Agregar el turno al calendario |
| `/api/disponibilidad` | Horarios libres para la reserva (o una Server Action) |

## Resumen

| Área | Vistas MVP | F2/F3 |
|---|---|---|
| Marketing | 3 | 4 |
| Auth + alta | 10 | 0 |
| Panel | ~38 | ~14 |
| Público + reserva | 9 | 3 |
| Turno del cliente | 7 | 1 |
| Sistema | 5 | 2 |

## Orden propuesto para diseñar y construir (paso 5)

Primero el recorrido de valor completo: el negocio carga lo mínimo, el cliente reserva y el turno aparece en la agenda.

1. **Agenda · día** (`/agenda`) + panel lateral de turno + nuevo turno + bloquear. El corazón; define la mayoría de los componentes.
2. **Mi día móvil** (`/hoy`).
3. **Página pública** (`/`) y **reserva** en 3 pasos + confirmación.
4. **Gestión del turno** (`/t/[token]`: ver, reprogramar, cancelar).
5. **Servicios** (lista + edición).
6. **Equipo y horarios** (perfil, horario semanal, ausencias, horario del negocio).
7. **Alta del negocio** (6 pasos). Va después porque reutiliza los formularios de 5 y 6.
8. **Auth** (ingresar, registro, invitación).
9. **Clientes** (lista + ficha).
10. **Editor de página pública** (apariencia, reglas, políticas, compartir).
11. **Cobros y Mercado Pago** (conectar, movimientos, seña en la reserva).
12. **Agenda: semana, mes y lista**.
13. **Configuración y cuenta**.
14. **Emails**.
15. **Landing y precios**.
16. **Sistema**: 404, error, sin conexión.

## Decisiones tomadas (2026-10-21)

| Tema | Decisión |
|---|---|
| URL del panel | `panel.agenditas.app`, en la misma app de Next |
| Arquitectura | Una sola app de Next.js para todos los dominios, ruteando por host en `src/proxy.ts` |
| Recepción y plata | Ve precios y señas de cada turno y puede cobrar; no ve movimientos, caja ni reportes |
| Horario del profesional | Según el modo: autogestionado edita todo lo suyo; con organizador, solo bloqueos rápidos |
| Multi-sucursal | No en el MVP; la tabla `locations` existe desde el día uno con una sucursal por negocio |
| SEO | Páginas de servicio y de profesional en F2; el MVP cuida la página principal (metadatos, OG, `LocalBusiness`) |
