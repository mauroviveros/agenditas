---
name: Agenditas
description: Agenda y reservas para solistas. Base shadcn neutral; el rebranding es una rebanada aparte.
typography:
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  panel-title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  base: "0.625rem"
---

# Design System: Agenditas

## Overview

La app usa shadcn `base-nova` con el tema `neutral`, tal como lo genera `shadcn init`:
grises neutros, Geist y los tokens estándar (`background`, `card`, `primary`, `muted`,
`destructive`, `border`, `input`, `ring`…) en `src/app/globals.css`. Es una base para
diseñar pantallas rápido; la identidad propia (color, tipografía, nombre del estilo) llega
en una rebanada de rebranding que cambia esos valores y nada más.

El estilo anterior ("Mate": verde yerba, Bricolage, pills y amarillo) está en `main` en el
commit `9afb39d`. Se sigue con shadcn durante el desarrollo y, al final (R8 del ROADMAP),
se decide si se restaura Mate o se prueban otras variantes.

## Reglas

- **Colores:** solo los tokens de `globals.css` (`bg-background`, `text-muted-foreground`,
  `text-destructive`…). `scripts/check-colores.sh` corta cualquier otro.
- **Componentes:** primero los de shadcn en `src/components/ui/`; se instalan, no se
  reescriben. Si hay que ajustar uno, se anota por qué.
- **Títulos:** en el panel, el `h1` lo dibuja el encabezado (`panel-title`: `font-heading
  text-base font-medium`) y el `h2` de cada sección lo dibuja `SectionCard` (`text-base
  font-semibold`). Miden lo mismo, así que la jerarquía la da el lugar y no el tamaño. Las
  pantallas fuera del marco del panel (login, crear negocio, error de pantalla completa)
  llevan `title`: `font-heading text-2xl font-semibold tracking-tight text-balance`; ahí no
  hay componente, se copia la receta.
- **Errores:** `text-destructive` sobre `bg-destructive/10` con borde `border-destructive/30`,
  siempre con ícono y texto. Nada se distingue solo por color.
- **Radio:** `--radius` es 0.625 rem (10 px): `rounded-lg` en controles, `rounded-xl` en
  tarjetas.
- **Horas:** números tabulares y formato 24 h `HH:mm`, en hora de Buenos Aires.
- **Idioma:** voseo y textos cortos ("Elegí un horario", "Probá de nuevo").

## Tamaños táctiles

Una sola regla, escrita en `Button`, `Input` e `InputGroup`: 44 px en celu y, desde `md`,
32 px (`default` e `icon`), 28 px (`sm`) y 36 px (`lg`, la acción principal de cada
pantalla). Las pantallas usan el `size` y no repiten `h-11 md:h-N`. Es un ajuste a propósito
de la base de shadcn, para cumplir los 44 px de PRODUCT.md. Lo que no
es `Button` ni `Input` (chips, filas) sigue la misma medida: filas de 56 px desde `md` y de
64 px en celu, con 24 px de padding lateral.

## Pantallas del panel

Todas se definen igual; solo cambia el cuerpo.

- **Registro:** `src/lib/panel/screens.ts` lista cada pantalla (ruta, nombre, bajada,
  ícono). Lo leen el menú y el encabezado, así que una pantalla nueva se suma ahí y en
  ningún otro lugar. Sin entrada, el encabezado queda sin título.
- **Encabezado:** `(app)/header.tsx` dibuja el menú, el título, la bajada y las acciones. El
  título sale del registro según la ruta (Inicio muestra el nombre del negocio) y llega en
  el primer HTML. La bajada es de una línea, se ve desde `md` y dice qué es la pantalla; la
  ayuda de uso va en el cuerpo, porque en celu el encabezado no la muestra. Las acciones de
  la pantalla entran por portal (`PanelHeaderActions`) y las de pie por `PanelFooter`: viven
  en el árbol de quien tiene el estado.
- **Cuerpo de formulario:** una `SectionCard` (`src/components/section-card.tsx`) por
  sección, con su título, su descripción y las filas sin padding lateral.
- **Cuerpo de lista:** el buscador, una caja `rounded-xl border bg-card` que sirve a la tabla
  de escritorio y a la lista de celu, y el contador y la paginación debajo.
- **Esqueletos:** la misma caja y filas de la misma altura que las reales, para que la
  pantalla no salte al cargar.
- **Errores de lectura:** suben a `(app)/error.tsx`; el menú y el encabezado quedan. Las
  pantallas no los atrapan: un vacío falso invitaría a guardar y pisar lo real.
  `panel/error.tsx` cubre el layout (sesión y negocio).

## Layout

Una columna en celu con 20 px de margen lateral. Desde `md` (768 px) el panel muestra el
sidebar `inset`: el contenido es una tarjeta sobre el fondo. Las pantallas de formulario
usan dos columnas, formulario y vista previa. Cada pantalla se diseña para celu y para
escritorio.

## Pendiente de decidir

- Contraste de bordes y foco: `--input` y `--ring` de shadcn son claros; la regla del
  producto pide 3:1 en controles (WCAG 1.4.11).
- Modo oscuro: la base trae el bloque `.dark`, pero la app es solo clara.
