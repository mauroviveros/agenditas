---
name: Agenditas · Calma operativa
description: Agenda de turnos para pymes que venden tiempo. Calma, orden y la marca del negocio adelante.
colors:
  papel-tiza: "#F5F4F1"
  hoja: "#FFFFFF"
  hundido: "#EFEEEA"
  bruma: "#ECEBE7"
  borde: "#E3E1DB"
  borde-firme: "#CFCBC2"
  tinta-de-agenda: "#1C1C1A"
  tinta-segunda: "#55534E"
  tinta-tenue: "#6E6B65"
  verde-pino: "#1F6F5C"
  rojo-ladrillo: "#B42318"
  linea-de-ahora: "#D4402B"
  sena-fondo: "#FFF5DE"
  sena-borde: "#E8C878"
  sena-tinta: "#4D3500"
  noche: "#151514"
  hoja-noche: "#1C1C1B"
  hundido-noche: "#232321"
  borde-noche: "#33322F"
  tinta-noche: "#EDECE8"
  verde-pino-noche: "#23806A"
  verde-pino-texto-noche: "#5CC4A6"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: "54px"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-publico:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
  hora:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "32px"
    fontFeature: "\"tnum\" 1"
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.hoja}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-publico:
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.hoja}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "52px"
  button-outline:
    backgroundColor: "{colors.papel-tiza}"
    textColor: "{colors.tinta-de-agenda}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.tinta-de-agenda}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.hoja}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip-horario:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.tinta-de-agenda}"
    typography: "{typography.hora}"
    rounded: "{rounded.sm}"
    height: "44px"
  badge-sena:
    backgroundColor: "{colors.sena-fondo}"
    textColor: "{colors.sena-tinta}"
    rounded: "{rounded.pill}"
    height: "20px"
  segmented:
    backgroundColor: "{colors.bruma}"
    rounded: "{rounded.md}"
    padding: "4px"
---

# Design System: Agenditas · Calma operativa

> Tokens y reglas visuales. La fuente de los valores es `src/app/globals.css`; los componentes viven en `src/components/ui` y se ven en `/dev/componentes`. Comportamiento de la UI, componentes de dominio, grilla, emails y móvil: `docs/DESIGN_SYSTEM.md`.

## Overview

**Creative North Star: "La agenda en calma"**

Una agenda llena no tiene que dar ansiedad. El sistema trabaja con superficies quietas y cálidas, mucho aire y un solo acento por vista: lo que se mueve en el día de un local (un turno nuevo, uno que empieza, uno que se cancela) se destaca contra un fondo que no pide atención. En cada pantalla, el dato más importante es una hora o un turno, y va en Geist Mono con el mayor peso del bloque.

La marca es del negocio. En el panel, el acento del negocio aparece solo en acciones, selección y foco; fondos, bordes y textos quedan neutros. En lo público el acento es libre, pero pasa por un chequeo de contraste. Agenditas firma chico: un wordmark en el panel y "Reservas con Agenditas" en el pie.

Densidad media: el panel trabaja a 14 px y admite un modo compacto; lo público sube a 16 px y a objetivos táctiles de 44–52 px. Sin ilustraciones, sin degradés decorativos, sin vidrio esmerilado.

**Key Characteristics:**
- Neutros cálidos, un solo acento y estados que se leen por texto e ícono antes que por color.
- La hora en mono tabular, siempre.
- Primero el borde: sombra solo en lo que flota.
- Componentes firmes y discretos: borde fino, esquinas de 8 px, cero adorno.
- Claro y oscuro con los mismos roles; el acento del negocio entra por una sola variable (`--primary`).

## Colors

Una paleta de papel y tinta cálidos, con un único verde que hace todo el trabajo de acción.

### Primary
- **Verde pino** (#1F6F5C; oscuro #23806A, como texto en oscuro #5CC4A6): el acento por defecto de Agenditas. Botón principal, selección, turno en curso y foco del acento. Texto blanco encima: 6,0:1. Cada negocio lo reemplaza con su color a través de `--primary`, y los derivados (`--primary-soft` al 9 %, `--primary-border` al 30 %) salen con `color-mix()`.

### Neutral
- **Papel tiza** (#F5F4F1 / noche #151514): el lienzo de la app y de lo público.
- **Hoja** (#FFFFFF / #1C1C1B): tarjetas, grilla, campos y paneles.
- **Hundido** (#EFEEEA / #232321): fuera de horario, huecos, zonas de carga.
- **Bruma** (#ECEBE7 / #2A2A28): pista del segmentado, hover y avatares sin foto.
- **Borde** (#E3E1DB / #33322F) y **Borde firme** (#CFCBC2 / #46443F): divisiones y contornos; el firme para controles en hover y el turno cancelado (punteado).
- **Tinta de agenda** (#1C1C1A / #EDECE8): títulos y cuerpo principal. También es el color del anillo de foco.
- **Tinta segunda** (#55534E / #B4B1A9) y **Tinta tenue** (#6E6B65 / #8F8C85): cuerpo secundario y metadatos. Todas cumplen 4,5:1 sobre Hoja y Papel tiza.

### Funcionales
- **Rojo ladrillo** (#B42318 / #F0806E): error, no-show, borrar.
- **Línea de ahora** (#D4402B / #F06A55): la línea roja de la hora actual en la grilla. No se usa para nada más.
- **Seña** (fondo #FFF5DE, borde #E8C878, tinta #4D3500; en oscuro #3A2E12 / #6B5320 / #F3D58B): seña pendiente, avisos y "horario tomado".

### Named Rules
**The Un Solo Acento Rule.** Una sola acción con relleno de acento por vista. El resto de los botones son con borde o fantasma.

**The Color Que Se Explica Rule.** Ningún estado depende solo del color: confirmado, seña pendiente, en curso, atendido, no vino y canceló llevan siempre ícono y etiqueta.

**The Acento Prestado Rule.** El acento del negocio entra solo por `--primary`. En el panel pinta acciones, selección y foco; nunca fondos de sección ni texto corrido.

## Typography

**Display / Body Font:** Geist (con system-ui, sans-serif)
**Mono Font:** Geist Mono (con ui-monospace, monospace)

**Character:** Una grotesca neutra y precisa para todo el texto, y su mono para horas, precios, duraciones y códigos. El par se lee como una agenda impresa: la tipografía no actúa; ordena.

### Hierarchy
- **Display** (600, 52/54 px, −0,03 em): solo el hero de lo público. Con el nombre del negocio en la portada baja a 40/44.
- **Headline** (600, 28/34 px, −0,01 em): título de paso en la reserva y nombre en el detalle de turno.
- **Title** (600, 18/26 px): títulos de sección y de tarjeta.
- **Body** (400, 14/20 px en el panel; 16/24 px en lo público y en campos móviles): cuerpo. En lo público, medida máxima de 65–75 caracteres.
- **Label** (600, 12/16 px): etiquetas de grupo y estados en turnos. Sentence case, nunca mayúsculas sostenidas.
- **Hora** (Geist Mono 600, 28/32 px, cifras tabulares): la hora destacada. En chips de horario, 16 px; en la tarjeta de la portada, 22 px.

### Named Rules
**The La Hora Manda Rule.** Toda hora, precio y duración va en Geist Mono con `tabular-nums`, sin importar el par tipográfico que elija el negocio.

**The Cinco Pares Rule.** Lo público puede cambiar los títulos a uno de los cinco pares curados (Neutra, Editorial, Clásica, Amable, Urbana). El panel siempre es Geist.

## Layout

- **Escala de espaciado** de base 4: 4, 8, 12, 16, 20, 24, 32, 48, 64. Más aire arriba de un título que abajo.
- **Panel:** sidebar en escritorio y barra inferior en móvil (Hoy · Agenda · Clientes · Más). Densidad cómoda (80 px por hora en la grilla) o compacta (56 px), con `data-density="compact"`.
- **Público:** columna centrada de `max-w-xl` (576 px) con 16 px de margen lateral. La portada va a sangre. La acción principal queda en una barra inferior fija, con `safe-area-inset-bottom`.
- **Objetivos táctiles:** 44 × 44 px mínimo en móvil; controles de 40 px de alto en el panel de escritorio.

## Elevation & Depth

Plano por defecto. La profundidad se arma con capas tonales (Papel tiza → Hoja → Hundido) y bordes de 1 px. La sombra aparece solo en lo que flota sobre la página.

### Shadow Vocabulary
- **Flotante** (`0 1px 2px rgb(28 28 26 / 0.06), 0 8px 24px rgb(28 28 26 / 0.1)`): menús, popovers, tooltips, la tarjeta de horarios sobre la portada y la hoja móvil.
- **Arrastre** (`0 2px 4px rgb(28 28 26 / 0.08), 0 14px 32px rgb(28 28 26 / 0.16)`): solo el turno mientras se arrastra en la grilla.

### Named Rules
**The Primero El Borde Rule.** Tarjetas, campos y paneles se separan con borde, nunca con sombra. Si algo tiene sombra, flota.

**The Velo Plano Rule.** Detrás de diálogos y paneles laterales va un velo negro al 40 %, sin desenfoque.

## Shapes

Esquinas suaves y consistentes: **Seis** (6 px) para ítems de menú, **Ocho** (8 px) para botones, campos, chips de horario y toggles, **Diez** (10 px) para la pista del segmentado, **Catorce** (14 px) para tarjetas, diálogos, paneles laterales y menús. Pastilla (999 px) para badges y filtros. Lo público puede subir un escalón si el negocio elige "redondeado". Avatares redondos. Bordes de 1 px; el turno cancelado usa borde punteado en Borde firme.

## Components

Firmes y discretos: borde fino, esquinas de 8 px, sin sombras. Se notan cuando hacen falta.

### Buttons
- **Shape:** esquinas suaves (8 px).
- **Primary:** relleno de acento con texto blanco (o tinta, si el acento del negocio no da 4,5:1). Alturas de 32, 40, 44 y 52 px; el de 52 es la acción principal en lo público.
- **Hover / Focus:** hover aclara el acento (`brightness(1.1)`), así funciona con cualquier color de negocio. El foco es el anillo global: 2 px en Tinta de agenda con 2 px de separación.
- **Outline / Ghost / Destructive / Link:** outline con borde y fondo de lienzo; ghost sin fondo; destructive con fondo rojo al 10 % y texto rojo; link en `--primary-text`.

### Chips de horario
- **Style:** Hoja con borde, hora en Geist Mono; 44 px de alto en una grilla de 4 columnas (mañana y tarde).
- **State:** el elegido pasa a `--primary-soft` con borde de acento, un ícono de check y la hora en negrita. Días cerrados en Hundido, sin enlace.

### Cards / Containers
- **Corner Style:** 14 px.
- **Background:** Hoja sobre Papel tiza.
- **Shadow Strategy:** ninguna (ver Elevation).
- **Border:** 1 px en Borde.
- **Internal Padding:** 16 px.

### Inputs / Fields
- **Style:** Hoja, borde de 1 px en Borde, 8 px de radio, 40 px de alto (48 en lo público). Etiqueta siempre visible arriba.
- **Focus:** el anillo global; el borde no cambia.
- **Error / Disabled:** error con borde Rojo ladrillo y mensaje debajo (qué pasó + qué hacer); deshabilitado al 50 %.

### Segmentado
- Pista Bruma con 4 px de padding y 10 px de radio; la opción activa es una pastilla Hoja con sombra mínima y texto en Tinta de agenda; las demás en Tinta segunda. Para Día / Semana / Mes / Lista.

### Badges de estado
- Pastillas de 20 px con ícono + texto: confirmado en acento, seña pendiente en los tonos de Seña, atendido con borde, no vino en rojo al 10 %.

### Navigation
- Barra superior de la reserva: 56 px, fondo de lienzo con borde inferior, botón de volver de 44 px y "Paso n de 3" a la derecha. Panel: sidebar en escritorio y barra inferior de 4 ítems en móvil.

## Do's and Don'ts

### Do:
- **Do** poner toda hora, precio y duración en Geist Mono con cifras tabulares.
- **Do** usar una sola acción con relleno de acento por vista.
- **Do** acompañar cada estado con ícono y texto, además del color.
- **Do** usar el anillo de foco global (2 px, Tinta de agenda, 2 px de separación) y no reemplazarlo por halos de color.
- **Do** separar superficies con borde de 1 px y capas tonales.
- **Do** validar el contraste del acento de cada negocio: si el blanco encima no da 4,5:1, usar tinta.

### Don't:
- **Don't** usar sombras en tarjetas, campos o paneles en reposo.
- **Don't** desenfocar el fondo (nada de vidrio esmerilado ni `backdrop-blur`).
- **Don't** usar ilustraciones: los estados vacíos son ícono + título + una línea + acción.
- **Don't** usar el acento del negocio como fondo de sección o texto corrido en el panel.
- **Don't** usar la Línea de ahora para otra cosa que la hora actual en la grilla.
- **Don't** agregar rebotes, confeti ni celebraciones; el movimiento es funcional, de 120–200 ms con `cubic-bezier(.2,.8,.2,1)`.
