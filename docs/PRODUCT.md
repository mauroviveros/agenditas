# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Una sola app de Next.js sirve marketing, panel y páginas públicas. El panel se instala como PWA en el celu; no hay app nativa en el MVP.

## Users

- **Dueño, recepción y profesionales** de pymes que venden tiempo (barberías, peluquerías, estética, lashistas, consultorios, kinesiología, psicología, tatuadores, entrenadores, talleres). Hoy manejan los turnos por WhatsApp, cuaderno o planilla.
  - **Solista:** una persona, su propia agenda, casi todo desde el celu entre cliente y cliente.
  - **Equipo con organizador:** dueño o recepción asigna y mueve turnos de todos, normalmente en la compu del mostrador.
  - **Equipo autogestionado:** cada profesional maneja su agenda; comparten marca y página.
- **Cliente final** del negocio: saca, reprograma o cancela su turno y paga la seña desde el celu, sin crear cuenta (link por email o WhatsApp).

## Product Purpose

Reemplazar el WhatsApp, el cuaderno y la planilla por dos cosas:

1. Para el negocio, una grilla de turnos que respeta horarios, almuerzo, imprevistos y salidas, y que se usa igual de bien en la compu o en el celu.
2. Para sus clientes, una página con la marca del negocio donde reservan solos en tres pasos, con o sin seña, eligiendo profesional o "cualquiera".

Éxito: menos mensajes a toda hora, cero superposiciones, menos huecos muertos y menos ausentes.

## Positioning

Lo que un vecino (AgendaPro, Reservo, Calendly o el WhatsApp de siempre) no puede decir a la vez con verdad:

- **La marca es del negocio.** Todo lo que ve el cliente final es del negocio (subdominio, dominio propio, acento, tipografía, textos); Agenditas es el andamio y apenas firma en el pie.
- **Hecho para Argentina.** Señas con Mercado Pago, feriados AR precargados, voseo, formato es-AR, WhatsApp como canal natural.
- **Respeta el día a día real** de un local chico: bloqueos rápidos ("salgo 30 min"), almuerzo, imprevistos, "cualquiera" con reglas de asignación.
- **Precio pyme y solista:** accesible para quien trabaja solo, sin el peso de un software de clínica.

## Operating Context

- Panel: entre cliente y cliente, con una mano, en el celu (vista "Mi día"); o en el mostrador con la grilla del día de todos abierta.
- Reserva pública: llega desde Instagram, Google, un QR en el local o un link de WhatsApp; se completa en el celu.
- Avisos por email (MVP) y WhatsApp (fase 2); el link del turno (`/t/[token]`) es la "cuenta" del cliente.
- Dominios: `agenditas.app` (marketing y links de turno), `panel.agenditas.app`, `{slug}.agenditas.app` y dominio propio en F2.

## Capabilities and Constraints

- Inventario de vistas y fases: `docs/RUTAS.md`. Visión, módulos, stack y modelo de datos: `docs/PROYECTO.md`.
- Roles fijos en el MVP: dueño, admin/recepción, profesional, cliente final. Recepción ve precios y señas por turno y puede cobrar, pero no movimientos, caja ni reportes.
- La base garantiza que no haya dos turnos superpuestos por profesional/recurso. Todo en UTC; zona horaria por negocio (`America/Argentina/Buenos_Aires` por defecto).
- Acciones rápidas y deshacibles; confirmación solo cuando hay plata o un aviso al cliente de por medio.
- Tematizable por negocio en runtime (acento, tipografía, fondo de lo público).
- Textos en catálogo desde el día uno (un solo idioma por ahora, preparado para i18n).
- Mercado: solo Argentina en el lanzamiento; otros países (Stripe) después.
- Sin decidir: landing en Astro o dentro de Next; transferencia con comprobante para señas; WhatsApp en MVP o F2; modelo de precios (por profesional, plan fijo, freemium para solistas).

## Brand Commitments

- Nombre: **Agenditas**. Discreta: wordmark chico en el panel y "Reservas con Agenditas" en el pie de lo público.
- Voz: voseo cercano, oraciones cortas, verbo primero en botones, sentence case, sin "por favor", "exitosamente" ni "simplemente"; sin signos de exclamación en el panel. Errores = qué pasó + qué hacer. Estados vacíos invitan, no se disculpan.
- Panel: calma, orden y rapidez. Público, reserva y mensajes: cálido y humano; el negocio habla en primera persona del plural.
- Formato es-AR: 24 h (`15:30`), `$19.500`, "mié 22 de oct".
- Sistema visual vigente: "Calma operativa" (`docs/DESIGN_SYSTEM.md`, tokens en `src/app/globals.css`).

## Evidence on Hand

Nada todavía: no hay clientes, negocios piloto, testimonios, métricas ni prensa. No inventar ninguno. Los negocios de ejemplo (p. ej. "Barbería Ceibo") son demo y deben leerse como tales.

## Product Principles

1. **La marca es del negocio.** Ante la duda, cede protagonismo al negocio, no a Agenditas.
2. **La hora manda.** En cada pantalla lo más importante es un turno o un horario.
3. **Rápido sin pedir permiso.** Hacer al toque y poder deshacer; frenar solo si hay plata o un cliente avisado.
4. **El día real, no el ideal.** Imprevistos, almuerzos, salidas y "cualquiera" son casos de primera clase.
5. **Celu primero para el profesional y el cliente;** compu para la recepción.

## Accessibility & Inclusion

WCAG 2.2 AA en todo (panel, página pública, reserva y emails). Ningún estado se comunica solo con color: texto e ícono primero. Contraste mínimo 4,5:1 también con el acento de cada negocio (el editor de apariencia lo chequea).
