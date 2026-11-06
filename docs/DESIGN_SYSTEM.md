# Agenditas · Design system "Calma operativa"

> Versión 1.1 · 2026-11-06. Comportamiento de la UI: voz, estados de turno, grilla, componentes de dominio, móvil y emails. **Los tokens y las reglas visuales (colores, tipografía, radios, sombras) mandan en [`docs/DESIGN.md`](DESIGN.md)**; los valores viven en `src/app/globals.css` y los componentes se ven en `/dev/componentes`.

## 1. Principios

1. **La hora manda.** En cada pantalla el dato más importante es una hora o un turno. Va en Geist Mono, con el mayor peso del bloque.
2. **Calma y orden.** Superficies neutras, mucho aire y un solo acento por vista. La agenda llena no tiene que dar ansiedad.
3. **La marca es del negocio.** Agenditas es discreta: wordmark chico en el panel y "Reservas con Agenditas" en el pie de lo público. El acento, la tipografía y el fondo de lo público son del negocio.
4. **Rápido sin pedir permiso.** Las acciones se hacen al toque y se pueden deshacer. Los diálogos de confirmación solo aparecen si hay plata o un aviso al cliente de por medio.
5. **Nunca solo color.** Cada estado se lee por texto e ícono antes que por color.

### Personalidad por superficie

| Superficie | Personalidad | En la práctica |
|---|---|---|
| Panel (dueño, recepción, profesional) | Calma y orden + rapidez | Copys cortos, atajos, deshacer, densidad ajustable |
| Página pública, reserva, emails, WhatsApp | Cálido y humano | Nombres propios, el profesional con foto, frases del negocio en primera persona del plural |

## 2. Voz y tono

- **Voseo cercano** en todo: "Elegí un horario", "Tu agenda de hoy", "Podés reprogramar hasta 3 h antes".
- Oraciones cortas, verbo primero en botones: "Nuevo turno", "Bloquear horario", "Reservar turno". Sin signos de exclamación en el panel.
- Mayúscula solo al inicio (sentence case). Nada de "Por favor", "exitosamente", "simplemente".
- Errores: qué pasó + qué hacer. "Ese horario se ocupó recién. Elegí otro."
- Estados vacíos: invitación, no disculpa. "Cargá tu primer servicio" + botón.
- En lo público, el negocio habla como "nosotros": "Nos vemos el miércoles, Martina".
- Formato regional es-AR: 24 h (`15:30`), `$19.500`, "mié 22 de oct", zona horaria del negocio. Todos los textos van en un catálogo desde el día uno, aunque por ahora haya un solo idioma (preparado para i18n).

## 3. Color

### 3.1 Neutros (claro / oscuro)

Valores y nombres en [`docs/DESIGN.md` → Colors](DESIGN.md#colors).

### 3.2 Acento

- Acento por defecto, derivados (`--primary-soft`, `--primary-border`, `--primary-text`) y valores: [`docs/DESIGN.md` → Colors](DESIGN.md#colors).
- **Una sola acción con relleno de acento por vista.** El resto de los botones son con borde o fantasma.

#### El acento del negocio

- En el **panel**, el acento del negocio reemplaza a `--primary`, pero **solo en acciones**: botón principal, selección, turno en curso y foco. Fondos, bordes y textos quedan neutros.
- En lo **público**, el acento es libre. Al guardarlo se valida el contraste: si el texto blanco sobre el acento da menos de 4,5:1, se usa tinta (`#1C1C1A`) como `--primary-foreground`. Si el acento como texto sobre la tarjeta da menos de 4,5:1, se genera `--primary-text` oscureciéndolo en OKLCH hasta pasar.
- Se aplica en runtime con un `style="--primary: …"` en el contenedor del tenant. Los derivados (`soft`, `border`) salen con `color-mix()`.

### 3.3 Estados de turno

El color de un turno en la grilla lo define **su estado**. El profesional se distingue por la columna.

| Estado | Fondo | Borde | Texto | Ícono (Lucide) | Etiqueta |
|---|---|---|---|---|---|
| Confirmado | `--primary-soft` | `--primary-border` | `--foreground` | `check` | Confirmado |
| Seña pendiente | `#FFF5DE` / `#3A2E12` | `#E8C878` / `#6B5320` | `#4D3500` / `#F3D58B` | `clock` | Seña pendiente · vence 14:00 |
| En curso | `--primary` | `--primary` | `--primary-foreground` | `play` | En curso |
| Atendido | `#F1F0EC` / `#242422` | `--border` | `--foreground-2` | `check-check` | Atendido |
| Ausente (no-show) | `--card` | `--destructive` 40 % | `--destructive` | `user-x` | No vino |
| Cancelado | `--card` | `--border-strong` **punteado** | `--muted-foreground`, nombre tachado | `x` | Canceló |

Otros colores funcionales:

- `--destructive`: `#B42318` / `#F0806E` (errores, no-show, borrar).
- `--now`: `#D4402B` / `#F06A55` (línea de "ahora" en la grilla).
- `--warning-*`: los mismos valores que seña pendiente.

### 3.4 Bloques de tiempo (rayado distinto por tipo)

| Tipo | Tratamiento |
|---|---|
| Fuera de horario | `--sunken` liso + "Fuera de horario" en 11 px |
| Almuerzo / pausa fija | Rayado gris a 135° (`#F1F0EC` / `#E8E6E1`, 6 px + 1 px) + "Almuerzo · 13:00–14:00" |
| Bloqueo / imprevisto | Rayado ámbar a 135° (`#FBF3E4` / `#F1E2C4`) + motivo ("Trámite en el banco") |
| Ausencia de todo el día | Columna entera con rayado gris y el motivo arriba |
| Hueco libre (vista móvil) | Borde punteado con el acento + "Libre 15 min · visible en tu página" |

## 4. Tipografía

Familias, jerarquía y tamaños: [`docs/DESIGN.md` → Typography](DESIGN.md#typography). Base de texto: 14 px en el panel, 16 px en lo público y en campos de formulario móviles (evita el zoom de iOS).

### Pares tipográficos curados para lo público (el negocio elige uno)

| Nombre | Títulos | Cuerpo |
|---|---|---|
| Neutra (por defecto) | Geist 600 | Geist |
| Editorial | Fraunces 600 | Geist |
| Clásica | Playfair Display 600 | Geist |
| Amable | Figtree 700 | Figtree |
| Urbana | Space Grotesk 600 | Geist |

La hora y los precios siempre van en Geist Mono, sin importar el par.

## 5. Forma, espacio y elevación

Radios, escala de espaciado y sombras: [`docs/DESIGN.md`](DESIGN.md) (Layout, Elevation & Depth, Shapes). Objetivos táctiles: 44 × 44 px en móvil; controles de 40 px en el panel de escritorio.

## 6. Íconos e imágenes

- **Lucide**, trazo de 1,75 px, 16 px en línea con texto, 18–20 px en navegación, 22 px en la barra inferior móvil.
- Los botones que tienen solo un ícono llevan `aria-label`. Los íconos decorativos van con `aria-hidden`.
- **Sin ilustraciones.** Estados vacíos = ícono + título + una línea + acción.
- Fotos: solo las del negocio (logo, portada, equipo, galería). Mientras no haya, se muestran iniciales sobre `--muted`.

## 7. Movimiento

- Funcional y corto. Duraciones: `--dur-fast` 120 ms (hover, toggles), `--dur-base` 160 ms (paneles, popovers), `--dur-slow` 200 ms (hoja móvil, toast).
- Curva: `--ease-out` `cubic-bezier(.2,.8,.2,1)`.
- Con `prefers-reduced-motion` se pasa a fundidos de opacidad, sin desplazamiento. Cada componente con movimiento usa las variantes `motion-safe:` / `motion-reduce:` de Tailwind.
- Nada de rebotes, confeti ni celebraciones.

## 8. Densidad

- Preferencia guardada por usuario: **Cómoda** (por defecto, 80 px por hora en la grilla) o **Compacta** (56 px por hora, padding de controles −25 %).
- Se aplica con `data-density="compact"` en el contenedor del panel.

## 9. Modo oscuro

- **Panel:** sigue al sistema y también se puede forzar claro u oscuro (`data-theme="light|dark"` en `<html>`).
- **Público:** opcional. El negocio elige fondo claro, crema u oscuro. El cliente no lo cambia.

## 10. Componentes

Base: **shadcn/ui + Radix**, con el código en el repo (`src/components/ui`), tematizado con estos tokens. Los nombres de los tokens siguen el contrato de shadcn (`--background`, `--card`, `--primary`, `--border`, `--ring`, `--radius`), así que los componentes se instalan sin retocar.

### Primitivas

| Componente | Notas |
|---|---|
| Button | Variantes: `default` (acento, una por vista), `outline` (borde), `ghost`, `destructive`, `link`. Tamaños: `sm` 32, `default` 40, `lg` 44, `xl` 52 (público). Ícono a la izquierda. |
| Input, Textarea, Select, Combobox | Fondo `--card`, borde `--border`, foco con anillo de 2 px `--ring`. Etiqueta siempre visible arriba. |
| Segmented | `ToggleGroup variant="segmented"`: fondo `--muted`; la opción activa es una "pastilla" `--card` con sombra mínima. Para Día / Semana / Mes / Lista. |
| Switch, Checkbox, Radio | Activo en `--primary`. |
| Chip / Badge | Píldora. Estado = color + ícono + texto. |
| Avatar | Foto o iniciales sobre `--muted`. |
| Tooltip, Popover, DropdownMenu | `--popover` + `--shadow-float`. |
| Sheet (panel lateral) | **Patrón de edición principal.** A la derecha en escritorio (360–420 px), hoja desde abajo en móvil. |
| Dialog | Solo para acciones con plata o aviso al cliente, y para flujos que lo justifiquen. |
| Toast | Abajo al centro, 6 s. Siempre con **Deshacer** cuando la acción lo permite. |
| Command (⌘K) | Paleta de comandos: buscar clientes y turnos y ejecutar acciones ("mover Diego 12:30 Lucas"). |
| Skeleton | En lugar de spinners. |

### Componentes de dominio

| Componente | Notas |
|---|---|
| `AgendaGrid` | Columnas por profesional, regla de horas, bloques de tiempo, línea de ahora, scroll sincronizado. Vistas: día, semana, mes, lista. |
| `AppointmentBlock` | Turno en la grilla. Versión corta (≤ 30 min) en una línea. Seleccionado = anillo de 2 px en `--foreground`. |
| `TimeBlock` | Fuera de horario, almuerzo, bloqueo, ausencia (ver 3.4). |
| `NowLine` | 2 px en `--now`, con un punto en la regla. |
| `AppointmentSheet` | Detalle y edición: cliente, servicio, hora, precio, seña, notas, acciones (atendido, reprogramar, WhatsApp). |
| `QuickBlock` | "Bloquear un rato" en dos toques: 15 / 30 / 60 min / hasta… + motivo. |
| `SlotPicker` | Días en tira horizontal + horarios en grilla de 4 columnas (mañana y tarde). |
| `StaffPicker` | Avatares con "Cualquiera" primero. |
| `ServiceRow` | Nombre, descripción, duración (mono), precio (mono), seña. |
| `BookingSummaryBar` | Pie fijo en la reserva: resumen + "Continuar". |

### Interacciones de la grilla (MVP)

- **Arrastrar para mover** (de hora o de profesional) con un fantasma `--shadow-drag`. Al soltar sobre un conflicto, rebota y explica por qué.
- **Estirar el borde inferior** para cambiar la duración, de a 5, 10, 15 o 30 min según la configuración.
- **Clic en un hueco** abre "Nuevo turno" en el panel lateral, ya con la hora y el profesional.
- **Teclado:** `N` nuevo turno · `B` bloquear · `←` `→` día anterior o siguiente · `T` hoy · `D` `W` `M` `L` para día, semana, mes y lista · `1`–`9` filtrar profesional · `A` marcar atendido · `R` reprogramar o mover · `⌘K` paleta · `Esc` cerrar. Los atajos se pueden ver con `?`.

## 11. Accesibilidad (WCAG 2.2 AA)

- Contraste: 4,5:1 en texto y 3:1 en bordes de controles y elementos gráficos.
- Foco visible siempre: anillo de 2 px `--ring` con 2 px de separación.
- Todo se puede usar con teclado, incluida la grilla (flechas entre turnos, `Enter` abre, `R` reprograma o mueve).
- Objetivos táctiles de 44 px. Los estados nunca se transmiten solo por color.
- Se respeta `prefers-reduced-motion`.
- HTML semántico: `button`, `a`, `label`. Las regiones de la grilla tienen `aria-label` y cada turno un nombre accesible completo ("Diego A., corte + barba, 11:15 a 12:15, en curso").

## 12. Página pública y reserva

- **Flujo en 3 pasos:** 1) servicio → 2) profesional + día + hora en una pantalla → 3) datos + seña → confirmación.
- **Sin cuenta:** nombre y WhatsApp. Se recuerda en el dispositivo. El turno se gestiona desde su link.
- **Sin lugar:** se muestra "No hay lugar este día. El próximo libre es el jue 09:30" con acceso directo. La lista de espera queda para la fase 2.
- **Secciones del MVP:** servicios y precios, equipo, horarios, ubicación y políticas. Cada negocio las activa y las ordena.
- **Fase 2:** galería de trabajos, reseñas propias o importadas de Google, conexión con redes y fotos traídas de Instagram, lista de espera.
- **Personalización:** acento (con validación de contraste), uno de los 5 pares tipográficos, fondo (claro, crema `#F6F1E7` u oscuro), esquinas (estándar o redondeado), logo y portada.

## 13. Móvil

- **PWA instalable**: manifest con el ícono y el color del negocio para el profesional, notificaciones push (nueva reserva, cancelación, seña acreditada).
- Barra inferior: Hoy · Agenda · Clientes · Más. Botón principal flotante solo en la agenda.
- Hojas desde abajo en lugar de paneles laterales.

## 14. Emails y mensajes

- Plantillas con **React Email**, con la marca del negocio (logo, acento, par tipográfico con fallback web-safe). Agenditas aparece solo en el pie.
- Tipos: confirmación, recordatorio (24 h y 2 h), reprogramación, cancelación, seña pendiente o acreditada, y un aviso interno al profesional.
- WhatsApp (fase 2): mismo tono cálido, con botones de confirmar o cancelar.

## 15. Implementación

- Tokens en `src/app/globals.css` (Tailwind v4 `@theme inline`). Utilidades: `bg-background`, `bg-card`, `bg-sunken`, `text-foreground-2`, `text-muted-foreground`, `bg-primary`, `bg-primary-soft`, `border-border`, `rounded-sm|md|lg`, `font-mono`, etc.
- Tema del tenant: `<div style={{ "--primary": business.accent, "--primary-foreground": business.accentFg }}>`, calculado y validado en el servidor al guardar.
- Densidad: `data-density="compact"`. Tema: `data-theme` en `<html>`.
- Componentes shadcn en `src/components/ui`, componentes de dominio en `src/components/agenda`, `src/components/booking`, etc.
