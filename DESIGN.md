---
name: Agenditas · La agenda en calma
description: Agenda de turnos para pymes que venden tiempo. Superficies quietas y cálidas, un solo acento por vista y la hora como dato principal.
colors:
  papel-tiza: "#f5f4f1"
  hoja: "#ffffff"
  hundido: "#efeeea"
  borde: "#e3e1db"
  borde-firme: "#cfcbc2"
  borde-de-control: "#85817a"
  tinta-de-agenda: "#1c1c1a"
  tinta-segunda: "#55534e"
  tinta-tenue: "#6e6b65"
  verde-pino: "#1f6f5c"
  rojo-ladrillo: "#b42318"
  linea-de-ahora: "#d4402b"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-formulario:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
  hora:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 600
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "8px"
  md: "10px"
  lg: "14px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.hoja}"
    rounded: "{rounded.md}"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.tinta-de-agenda}"
    rounded: "{rounded.md}"
    height: "48px"
  field:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.tinta-de-agenda}"
    rounded: "{rounded.md}"
    height: "48px"
  chip:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.tinta-de-agenda}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.tinta-de-agenda}"
    textColor: "{colors.hoja}"
    rounded: "{rounded.pill}"
    height: "44px"
---

# Design System: Agenditas · La agenda en calma

## Overview

**Creative North Star: "La agenda en calma"**

Una agenda llena no tiene que dar ansiedad. El sistema trabaja con superficies quietas y cálidas, mucho aire y un solo acento por vista: lo que se mueve en el día de un local (un turno nuevo, uno que empieza, uno que se cancela) se destaca contra un fondo que no pide atención. En cada pantalla, el dato más importante es una hora o un turno, y va en Geist Mono con el mayor peso del bloque.

La marca es del negocio. En el panel, el acento del negocio aparece solo en acciones, selección y foco; fondos, bordes y textos quedan neutros. En lo público el acento es libre, pero pasa por un chequeo de contraste. Agenditas firma chico: un wordmark en el panel y «Reservas con Agenditas» en el pie.

Densidad media: el panel trabaja a 14 px y admite un modo compacto; lo público y los formularios suben a 16 px y a objetivos táctiles de 44–52 px. Sin ilustraciones, sin degradés decorativos, sin vidrio esmerilado.

**Key Characteristics:**
- Papel cálido de fondo y hojas blancas encima; ninguna superficie compite con el dato.
- Un solo acento por vista (verde pino); el rojo solo marca «ahora» y los errores.
- La hora en mono tabular, siempre en columna fija.
- Celu primero, con objetivos de 44 px o más.

## Colors

Una paleta neutra y cálida con un verde profundo como único acento y un rojo reservado para el instante presente.

### Primary
- **Verde pino** (#1f6f5c): botón principal, selección, foco y texto de enlace. Blanco sobre este verde da 6,0:1 y sobre papel da 5,5:1.

### Neutral
- **Papel tiza** (#f5f4f1): fondo de pantalla.
- **Hoja** (#ffffff): tarjetas, campos y barra inferior.
- **Hundido** (#efeeea): pastillas de paso y áreas hundidas.
- **Borde** (#e3e1db) y **borde firme** (#cfcbc2): separadores y contornos de tarjeta, que no son controles.
- **Borde de control** (#85817a): contorno de campos, chips y botón secundario; 3,5:1 contra el papel y 3,9:1 contra la hoja (WCAG 1.4.11).
- **Tinta de agenda** (#1c1c1a), **tinta segunda** (#55534e) y **tinta tenue** (#6e6b65): texto principal, secundario y de apoyo (todos por encima de 4,8:1).

### Semantic
- **Rojo ladrillo** (#b42318): errores; siempre con texto, nunca solo color.
- **Línea de ahora** (#d4402b): la línea y la etiqueta del momento presente en la agenda del día (llega con R5).

### Named Rules
**The One Voice Rule.** Un solo acento por vista. Si hay dos cosas verdes, una sobra.
**The Borde de Control Rule.** Todo contorno que marque un control usa el borde de control, no el borde suave de tarjeta.

## Typography

**Display / Body Font:** Geist (variable, con system-ui de respaldo)
**Mono Font:** Geist Mono (variable) para horas, minutos y direcciones

**Character:** Un grotesk neutro y preciso que se queda en segundo plano, más un mono tabular que le da a la hora su lugar propio.

### Hierarchy
- **Display** (600, 28px, 34px, -0.01em): título de cada pantalla.
- **Title** (600, 18px, 26px): título de tarjeta.
- **Body** (400, 14px, 20px): texto del panel.
- **Body de formulario** (400, 16px, 24px): campos y párrafos de ingreso; 16 px evita el zoom en iOS.
- **Label** (600, 12px, 16px): etiqueta de campo, sentence case.
- **Hora** (Geist Mono 600, tabular): horas, contadores y la dirección pública.

### Named Rules
**The Hora Manda Rule.** En cada bloque, la hora o el turno es lo de mayor peso.

## Layout

Una sola columna de hasta 28 rem (448 px) centrada, con 20 px de margen lateral y la barra inferior fija con 56 px de alto. Espaciado en pasos de 4 px (8, 12, 16, 20, 24). Los formularios y el ingreso comparten un marco con el wordmark chico arriba. El panel deja 96 px abajo para no tapar contenido con la barra.

## Elevation & Depth

Plano. La profundidad se logra con capas tonales (papel, hoja, hundido) y bordes finos; no hay sombras en reposo. El foco se marca con un contorno de 2 px en verde pino, nunca con sombra.

### Named Rules
**The Flat-By-Default Rule.** Ninguna superficie lleva sombra; la jerarquía la dan el tono y el borde.

## Shapes

Esquinas suaves y consistentes: 10 px en botones y campos, 14 px en tarjetas, píldora completa en chips y estaciones del paso. Contornos de 1 px; los controles, en borde de control.

## Components

### Buttons
- **Shape:** 10 px, alto 48 px, ancho completo en celu.
- **Primary:** verde pino con texto blanco, 15 px semibold.
- **Secondary:** hoja con contorno de control y texto de tinta.
- **Hover / Focus:** primario baja a 90 % de opacidad; foco con contorno de 2 px en verde pino a 2 px de distancia. Deshabilitado, 50 % de opacidad.

### Chips
- **Style:** píldora de 44 px de alto, hoja y contorno de control.
- **State:** seleccionado en tinta de agenda con texto blanco; es un radio real, con foco visible.

### Inputs / Fields
- **Style:** hoja, contorno de control de 1 px, 10 px de radio, 48 px de alto, etiqueta de 12 px arriba.
- **Focus:** contorno de 2 px en verde pino.
- **Error:** contorno y mensaje en rojo ladrillo, con texto que dice qué pasó y qué hacer; el mensaje se anuncia con `role="alert"`.

### Navigation
- **Style:** barra inferior fija de dos a cuatro destinos; ícono de contorno y etiqueta de 12 px.
- **State:** el destino activo va en verde pino y semibold, con `aria-current="page"`. Cada destino mide al menos 56 px de alto.

### Tira de la semana
- Siete días de lunes a domingo; hoy va relleno en tinta de agenda con el número en blanco y `aria-current="date"`.

## Do's and Don'ts

### Do:
- **Do** usar la hora en Geist Mono tabular y en columna fija.
- **Do** dejar fondos, bordes y textos neutros y reservar el acento para acciones, selección y foco.
- **Do** escribir con voseo, oraciones cortas y verbo primero en los botones.
- **Do** comunicar cada estado con texto o ícono además del color.

### Don't:
- **Don't** usar ilustraciones, degradés decorativos ni vidrio esmerilado.
- **Don't** poner sombras en superficies en reposo.
- **Don't** usar el borde suave de tarjeta (#e3e1db) como contorno de un control.
- **Don't** usar rojo para nada que no sea «ahora» o un error.
