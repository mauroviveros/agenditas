---
name: Agenditas
description: Agenda y reservas para solistas. Base neutra y sobria; el rebranding es una rebanada aparte.
colors:
  fondo: "#F5F4F1"
  superficie: "#FFFFFF"
  tinta: "#1C1C1A"
  tinta-suave: "#5F5C56"
  acento: "#1F6F5C"
  resalte: "#E3EFE9"
  bloque: "#ECEBE7"
  linea: "#E3E1DB"
  campo: "#8F8C85"
  peligro: "#B42318"
  peligro-suave: "#FDF3F1"
typography:
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  control: "0.625rem"
  card: "0.875rem"
---

# Design System: Agenditas

## Overview

La app usa shadcn casi sin tocar (`base-nova`): neutros cálidos, un solo acento verde y
Geist. Es una base sobria para diseñar pantallas rápido; la identidad propia (nombre del
estilo, tipografía de marca, color) llega en una rebanada de rebranding que cambia los
valores de `globals.css` y nada más, por eso los componentes solo usan tokens.

Se reemplazó el estilo "Mate" (verde yerba, Bricolage, pills y amarillo).

**Key Characteristics:**
- Panel de escritorio con sidebar `inset`: el contenido es una tarjeta blanca sobre Fondo.
- Hecho para celu y escritorio; los controles táctiles que importan (acción principal,
  campos, ítems del menú en celu) miden 44 px. Los botones `default` (36 px) son para
  acciones secundarias en escritorio.
- Nada se distingue solo por color: el error y los estados llevan ícono y texto.

## Colors

Neutros cálidos (nunca gris frío) y un verde para lo accionable.

- **Fondo** (#F5F4F1): fondo de la app y del sidebar.
- **Superficie** (#FFFFFF): tarjetas, el contenido del panel y los campos.
- **Tinta** (#1C1C1A): texto principal y anillo de foco.
- **Tinta suave** (#5F5C56): texto secundario. 6:1 sobre Fondo.
- **Acento** (#1F6F5C): acción principal, links y selección. 6:1 sobre blanco.
- **Resalte** (#E3EFE9): selección de texto y fondo de lo marcado.
- **Bloque** (#ECEBE7): hover, chips y tiempo no reservable (almuerzo).
- **Línea** (#E3E1DB): divisores y bordes de tarjetas. Nunca para texto ni para campos.
- **Campo** (#8F8C85): borde de un control de texto; contraste 3:1 (WCAG 1.4.11).
- **Peligro** (#B42318) y **Peligro suave** (#FDF3F1): errores, siempre con ícono y texto.

**La regla de la marca ajena.** En la página pública, el color del negocio reemplaza al
Acento en acciones y selección.

## Typography

Una sola familia, **Geist**, y **Geist Mono** para códigos. Las horas usan números
tabulares (`tabular-nums`) y formato 24 h `HH:mm` en hora de Buenos Aires.

- **Título de pantalla** (`PageTitle`): 24 px, 600, tracking ajustado. Es el único estilo
  de `h1`; las pantallas no definen el suyo.
- **Cuerpo**: 14 px, 400. **Etiqueta**: 14 px, 500.
- **Secundario**: Tinta suave, mismo tamaño.

## Layout

Una columna en celu con 20 px de margen lateral. Desde `md` (768 px) el panel muestra el
sidebar y el contenido ocupa todo el ancho de la tarjeta, con 40 px de margen. Las
pantallas de formulario usan dos columnas: formulario a la izquierda y vista previa a la
derecha. Cada pantalla se diseña para los dos tamaños.

**Controles de texto** (`Input`, `InputGroup`): 44 px de alto, Superficie, borde de 1 px
en Campo y radio `rounded-lg`.

## Elevation & Depth

Plano: la profundidad sale del contraste entre Fondo, Superficie y Línea. Sin sombras
salvo las propias de los componentes de shadcn (menús, diálogos, cajones).

## Shapes

Radio `rounded-lg` (10 px, el `--radius` de shadcn) en botones y controles, `rounded-xl`
(14 px) en tarjetas. Los
estados vacíos usan borde punteado de 1 px en Línea.

## Components

- **Botón primario**: Acento con texto blanco, `rounded-lg`. El tamaño `xl` (44 px) es el
  de la acción principal de cada pantalla; el resto usa `default`.
- **Botón secundario (`outline`)**: Superficie con borde Línea.
- **Foco**: anillo visible en Tinta; no se quita nunca.
- **Aviso de error**: Peligro suave con borde Peligro al 30 %, ícono en Peligro y el
  mensaje en Tinta.
- **Componentes**: primero los de shadcn (ver AGENTS.md); a mano solo si no existe.

## Do's and Don'ts

### Do:
- **Do** usar solo los tokens de este archivo (`bg-fondo`, `text-tinta`, `text-peligro`…).
- **Do** escribir en voseo y corto ("Elegí un horario", "Probá de nuevo").
- **Do** probar cada pantalla a 390 px y en escritorio.

### Don't:
- **Don't** poner un color suelto: `scripts/check-colores.sh` lo corta.
- **Don't** señalar un error o un estado solo con color.
- **Don't** definir un título de pantalla propio: usar `PageTitle`.
