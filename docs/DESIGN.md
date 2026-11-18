---
name: Agenditas
description: Agenda y reservas para solistas. Base shadcn neutral; el rebranding es una rebanada aparte.
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
- **Títulos:** el `h1` de pantalla lleva `font-heading text-2xl font-semibold tracking-tight
  text-balance`; no hay componente, se copia la receta.
- **Errores:** `text-destructive` sobre `bg-destructive/10` con borde `border-destructive/30`,
  siempre con ícono y texto. Nada se distingue solo por color.
- **Radio:** `--radius` es 0.625 rem (10 px): `rounded-lg` en controles, `rounded-xl` en
  tarjetas.
- **Horas:** números tabulares y formato 24 h `HH:mm`, en hora de Buenos Aires.
- **Idioma:** voseo y textos cortos ("Elegí un horario", "Probá de nuevo").

## Tamaños táctiles

La base trae botones y campos de 32 px (`default`) y 36 px (`lg`). La acción principal de
cada pantalla usa `size="lg"`. Los controles táctiles clave en celu se suben a 44 px a
mano (`h-11`) hasta que se decida si la base cambia.

## Layout

Una columna en celu con 20 px de margen lateral. Desde `md` (768 px) el panel muestra el
sidebar `inset`: el contenido es una tarjeta sobre el fondo. Las pantallas de formulario
usan dos columnas, formulario y vista previa. Cada pantalla se diseña para celu y para
escritorio.

## Pendiente de decidir

- Contraste de bordes y foco: `--input` y `--ring` de shadcn son claros; la regla del
  producto pide 3:1 en controles (WCAG 1.4.11).
- Alto táctil de 44 px: ver arriba.
- Modo oscuro: la base trae el bloque `.dark`, pero la app es solo clara.
