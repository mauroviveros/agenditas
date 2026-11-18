---
name: Agenditas
description: Agenda y reservas para solistas, con estilo Mate.
colors:
  fondo: "#F2F4EE"
  superficie: "#FFFFFF"
  tinta: "#17261E"
  tinta-suave: "#536158"
  acento: "#1E5B3F"
  resalte: "#F2C230"
  bloque: "#DDE5D6"
  linea: "#B9C4B4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control: "0.625rem"
  tarjeta: "18px"
  panel: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  boton-primario:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.pill}"
    height: "50px"
  boton-secundario:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    height: "50px"
  turno:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    height: "46px"
  bloqueo:
    backgroundColor: "{colors.bloque}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    height: "46px"
  ahora:
    backgroundColor: "{colors.resalte}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.panel}"
    padding: "18px"
---

# Design System: Agenditas

## Overview

**Creative North Star: "La mesa del mate"**

Agenditas se siente como sentarse a organizar el día con alguien de confianza: cálido,
directo y sin ceremonia. Fondo verde claro, tinta verde casi negra, formas redondeadas y
una sola nota fuerte (el amarillo) para lo que pasa ahora. Es una herramienta de uso
diario en el celu, con una mano: la calidez está en el tono y en las formas, nunca a
costa de leer la hora de un vistazo.

La página pública es del negocio: Mate pone la estructura (tipografías, formas,
espaciado) y el color del negocio ocupa el lugar del acento.

Se descartó el estilo "calma operativa" (gris, frío, de oficina).

**Key Characteristics:**
- Horas grandes en Bricolage Grotesque con números tabulares.
- Pills para acciones y horarios; tarjetas de 14 a 22 px de radio.
- Amarillo solo para "Ahora".
- Hecho para 390 px de ancho primero; objetivos táctiles de 44 px o más.

## Colors

Verdes de yerba y un amarillo de lata de mate sobre un fondo claro, nunca blanco puro.

### Primary
- **Verde yerba** (#1E5B3F): acciones principales ("+ Turno"), links y el "libre"
  accionable. Contraste 8:1 sobre blanco.

### Secondary
- **Amarillo mate** (#F2C230): fondo del turno "Ahora". Siempre con tinta encima
  (9:1). Nunca como color de texto.

### Neutral
- **Fondo hoja** (#F2F4EE): fondo de toda pantalla.
- **Superficie** (#FFFFFF): tarjetas de turno, chips y horarios sin elegir.
- **Tinta** (#17261E): texto principal y botones oscuros.
- **Tinta suave** (#536158): texto secundario (duración, detalle, fecha). 5,9:1 sobre el fondo.
- **Bloque** (#DDE5D6): almuerzo, "salgo 30 min" y cualquier tiempo no reservable.
- **Línea** (#B9C4B4): bordes punteados de lo libre y divisores. Nunca para texto.

### Named Rules
**La regla del amarillo.** Una sola cosa amarilla por pantalla: lo que está pasando ahora.

**La regla de la marca ajena.** En la página pública, el color del negocio reemplaza a
Verde yerba en acciones y selección; Agenditas no impone su verde ahí.

## Typography

**Display Font:** Bricolage Grotesque (con sans-serif)
**Body Font:** Figtree (con sans-serif)

**Character:** Bricolage aporta personalidad en títulos y horas; Figtree es clara y
amable para leer al paso.

### Hierarchy
- **Display** (800, 40px, 1.05): la hora del turno "Ahora" y saludos.
- **Headline** (800, 28px, 1.15): título de cada pantalla o paso.
- **Title** (700, 18px, 1.3): nombre del cliente en el turno destacado.
- **Body** (500, 15px, 1.45): nombres en la lista, servicios.
- **Label** (600, 13px, 1.3): fecha, duración, "Paso 2 de 3", en Tinta suave.

### Named Rules
**La regla de la hora.** Toda hora usa números tabulares (`tabular-nums`) y formato 24 h
`HH:mm`, en hora de Buenos Aires.

## Layout

Una columna para el celu (390 px de referencia) con 16 a 20 px de margen lateral.
Listas con 6 px entre turnos; secciones separadas por 12 a 20 px. Las acciones
principales viven abajo, al alcance del pulgar, en una barra pill flotante.

**Escritorio** (desde `md`, 768 px), definido en R1 con la pantalla de crear el negocio:
contenido centrado hasta 1024 px; formularios en dos columnas, el formulario a la
izquierda (hasta 26rem) y a la derecha una vista previa en Superficie (radio de 22 px)
de lo que se está armando. El título sube a Display (40 px) y la acción principal va
debajo del formulario, no fija abajo. Cada pantalla se diseña para los dos tamaños.

**Controles de texto** (`Input`, `InputGroup` de shadcn): 50 px de alto, Superficie,
borde de 1 px en Tinta suave (contraste 3:1) y radio de 10 px.

## Elevation & Depth

Plano por defecto: la profundidad sale de capas de color (fondo → superficie → bloque).
La única sombra es la de la barra de acciones flotante.

### Shadow Vocabulary
- **Flotante** (`box-shadow: 0 6px 24px rgba(23, 38, 30, .14)`): la barra de acciones
  fija abajo. Nada más flota.

## Shapes

Todo redondeado, nada filoso: controles y turnos con 10 px (el radio base de shadcn, 0.625rem), tarjetas con 18 px, el
bloque "Ahora" y encabezados de marca con 22 a 26 px, y pills (999 px) para botones,
horarios y etiquetas. Lo libre se dibuja con borde punteado de 2 px en Línea.

## Components

### Buttons
- **Shape:** pill (999px), alto de 46 a 54 px.
- **Primary:** Verde yerba con texto blanco, Figtree 700 de 16 px.
- **Secondary:** Fondo hoja con texto Tinta, o borde de 2 px en Tinta sobre amarillo.
- **Focus:** anillo visible de 2 px en Tinta con 2 px de separación.

### Chips (días y horarios)
- **Style:** Superficie blanca y texto Tinta; los días con radio de 18 px y los horarios en pill.
- **State:** el elegido se pinta con el acento (o el color del negocio) y texto blanco,
  y lleva `aria-pressed`.

### Cards / Containers
- **Turno:** Superficie, radio de 10 px, alto mínimo de 46 px, sin borde ni sombra.
- **Ahora:** Amarillo mate, radio de 22 px, 18 px de padding, con etiqueta pill en Tinta.
- **Bloqueo:** fondo Bloque, radio de 10 px, nombre en 700 y detalle en Tinta suave.
- **Libre:** botón con borde punteado de 2 px en Línea y texto en el acento:
  tocarlo carga un turno.

## Do's and Don'ts

### Do:
- **Do** usar solo los tokens de este archivo (clases `bg-fondo`, `text-tinta`, etc.).
- **Do** poner la hora como lo más grande de cada bloque.
- **Do** escribir en voseo y corto ("Elegí un horario", "Salgo un rato").

### Don't:
- **Don't** usar el amarillo para nada que no sea "Ahora".
- **Don't** usar texto gris neutro: el secundario es Tinta suave (verdoso).
- **Don't** usar sombras salvo la de la barra flotante.
- **Don't** volver a Geist, Inter ni al estilo "calma operativa".
