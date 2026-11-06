# Agenditas · Idea del proyecto, stack y hoja de ruta

> Documento vivo. Última actualización: 2026-10-21.

## 1. Visión

Agenditas es un SaaS de turnos para pymes y emprendedores que venden **tiempo**: barberías, peluquerías, estética, lashistas, consultorios, kinesiología, psicología, tatuadores, entrenadores, talleres, etc.

Hoy la mayoría maneja los turnos por WhatsApp, un cuaderno o una planilla. Eso genera mensajes a toda hora, superposiciones, huecos muertos y clientes que no vienen. Agenditas resuelve dos cosas:

1. **Para el negocio**: una grilla de turnos clara que respeta los horarios de cada profesional, el almuerzo, los imprevistos y las salidas, y que se puede manejar desde la compu o el celu.
2. **Para sus clientes**: una página pública con la marca del negocio donde sacan turno solos, en tres toques, con o sin seña, eligiendo un profesional o "cualquiera".

Principio rector: **la marca es del negocio**. Agenditas es el andamio; todo lo que ve el cliente final se puede personalizar al máximo.

## 2. Perfiles de uso

| Perfil | Cómo trabaja | Qué necesita |
|---|---|---|
| **Solista** | Una persona, su propia agenda | Panel móvil simple, bloquear un rato rápido, link para compartir |
| **Equipo con organizador** | Un dueño o recepción asigna y mueve turnos de todos | Grilla multi-profesional, arrastrar y soltar, vista del día en vivo |
| **Equipo autogestionado** | Cada profesional maneja su agenda; el negocio comparte marca y página | Permisos por profesional, cada uno con su disponibilidad |

### Roles

- **Dueño (owner)**: todo, incluida facturación del SaaS y personalización.
- **Admin / recepción**: agenda de todos, clientes, servicios. Sin facturación.
- **Profesional**: su agenda, sus clientes, su disponibilidad (configurable si puede editar o solo ver).
- **Cliente final**: reserva, reprograma, cancela, paga seña. Sin cuenta obligatoria (link mágico por email/WhatsApp).

## 3. Módulos

### 3.1 Agenda y grilla
- Vistas: día (columnas por profesional), semana, lista, y "mi día" en móvil.
- Línea de "ahora", huecos libres visibles, estados de turno (confirmado, pendiente de seña, en curso, completado, ausente/no-show, cancelado).
- Crear, mover (drag & drop), redimensionar, reprogramar, turnos recurrentes, sobreturno con permiso.
- Recursos opcionales (sillas, camillas, salas) que también se ocupan.
- Actualización en tiempo real cuando entra una reserva online.

### 3.2 Disponibilidad
- Horario base semanal por profesional (varios tramos por día).
- Almuerzo / pausas fijas.
- Excepciones por fecha (abre distinto un día puntual).
- Ausencias: vacaciones, licencias, feriados (con calendario de feriados AR precargado).
- **Bloqueos rápidos**: "salgo 30 min", "imprevisto hasta las 12", desde el celu en dos toques.
- Buffers antes/después de cada servicio, anticipación mínima y máxima para reservar, intervalo de grilla (5/10/15/30 min).

### 3.3 Servicios
- Nombre, descripción, duración, precio (fijo, "desde" o a consultar), categoría, foto.
- Qué profesionales lo hacen (con duración/precio distinto por profesional si hace falta).
- Seña: ninguna, monto fijo o porcentaje; política de reembolso.
- Combos / servicios encadenados.

### 3.4 Reserva pública
- Flujo: **servicio → profesional o "cualquiera" → día y hora → datos → seña (si aplica) → confirmación**.
- "Cualquiera" asigna por reglas (el primero libre, reparto equitativo, prioridad).
- Reprogramar y cancelar desde el link del turno, respetando la política del negocio.
- Sin lugar: se muestra el próximo turno libre. Lista de espera en la fase 2.
- Anti-spam (Turnstile) y límites por cliente.

### 3.5 Pagos y señas
- Mercado Pago (Checkout Pro / link de pago) con webhook que confirma el turno.
- Turno "pendiente de seña" que se libera si no se paga en X minutos.
- Más adelante: Stripe para otros países, cobro total online, gift cards, paquetes.

### 3.6 Notificaciones
- Email (confirmación, recordatorio, cambios, cancelación) con la marca del negocio.
- WhatsApp (recordatorio con botón de confirmar/cancelar) en una fase posterior.
- Avisos internos al profesional (nueva reserva, cancelación).

### 3.7 Clientes
- Ficha: contacto, historial, notas privadas, etiquetas, no-shows, gasto acumulado.
- Importación desde CSV / contactos.

### 3.8 Personalización (white-label)
- Logo, portada, colores, tipografía (de un set curado), textos, políticas, preguntas extra en el formulario.
- Secciones de la página pública activables y ordenables (servicios, equipo, galería, reseñas, ubicación, horarios).
- Subdominio `negocio.agenditas.app` y dominio propio.
- Widget embebible y botón para Instagram/Google.

### 3.9 Reportes
- Ocupación, ingresos estimados, servicios más pedidos, no-shows, clientes nuevos vs recurrentes, por profesional.

### 3.10 SaaS
- Onboarding guiado (negocio → servicios → equipo → horarios → publicar).
- Planes por cantidad de profesionales y features (señas, WhatsApp, dominio propio).
- Facturación de la suscripción.

## 4. Stack y arquitectura

Las decisiones técnicas (librerías, Supabase, capa de datos, entornos y hosting) viven en [`docs/ARQUITECTURA.md`](ARQUITECTURA.md). Las rutas y vistas, en [`docs/RUTAS.md`](RUTAS.md).

## 5. Modelo de datos inicial

```
businesses        (id, slug, nombre, rubro, zona_horaria, tema jsonb, políticas jsonb, plan)
locations         (id, business_id, nombre, dirección, zona_horaria)   -- una por negocio en el MVP
memberships       (business_id, user_id, rol, staff_id?)
staff             (id, business_id, nombre, foto, color, bio, activo, orden)
resources         (id, business_id, nombre, tipo)                      -- opcional
services          (id, business_id, nombre, duración, precio, seña_tipo, seña_valor, buffers, categoría)
staff_services    (staff_id, service_id, duración?, precio?)
availability_rules(id, staff_id, día_semana, desde, hasta)            -- horario base
availability_exceptions (id, staff_id, fecha, desde?, hasta?, tipo)    -- abre distinto / cerrado
time_blocks       (id, staff_id, rango tstzrange, motivo, tipo)        -- almuerzo puntual, imprevisto, ausencia
clients           (id, business_id, nombre, teléfono, email, notas, etiquetas)
appointments      (id, business_id, staff_id, resource_id?, client_id, service_id,
                   rango tstzrange, estado, origen, precio, notas,
                   EXCLUDE USING gist (staff_id WITH =, rango WITH &&) WHERE estado activo)
payments          (id, appointment_id, proveedor, monto, estado, external_id)
notifications     (id, appointment_id, canal, tipo, programada_para, enviada_en, estado)
holidays          (fecha, país, nombre)
```

La disponibilidad ofrecida al cliente se calcula como: horario base ± excepciones − bloqueos − turnos − buffers, cortado por el intervalo de grilla y la anticipación permitida. Se implementa como función en Postgres (o en el servidor) y se cachea por día/profesional.

## 6. Hoja de ruta de diseño y desarrollo

1. **Idea y stack** — este documento. ✅
2. **Exploración de estilos** — canvas con 5 estilos nuevos × 4 pantallas (agenda del día del equipo, reserva pública móvil, página pública del negocio, panel móvil del profesional). Elegido: **Calma operativa**. ✅
3. **Design system completo** — rondas de preguntas (marca, tono, densidad, accesibilidad, modo oscuro, tematización por negocio, grilla, estados, iconos, motion, móvil, emails) y canvas del sistema. ✅ (`docs/DESIGN_SYSTEM.md`)
4. **Documentación** — `docs/DESIGN_SYSTEM.md` (tokens, tipografía, componentes, reglas) y `docs/RUTAS.md` (todas las vistas y rutas).
5. **Vista por vista** — para cada ruta: artboard → aprobación → implementación.

### MVP técnico (en paralelo a partir del paso 4)
1. Esquema Supabase + RLS + seeds de un negocio demo.
2. Auth + onboarding.
3. Servicios, equipo, disponibilidad.
4. Grilla del día/semana.
5. Página pública + reserva sin seña.
6. Emails de confirmación y recordatorio.
7. Señas con Mercado Pago.
8. Personalización y subdominios.

## 7. Antecedentes de diseño

- Canvas **"Rediseño Almanaque"**: sistema Almanaque v0.2 y direcciones Clínico, Editorial, Oscuro neón, Bento y Cálido; landing, onboarding, reserva, panel y app del profesional.
- Canvas **"Sistema de diseño Agenditas"**: direcciones Cálido, Sobrio, Suave y Vivo; agenda día/semana, cliente, equipo, servicios, reportes, personalización, temas, páginas públicas por rubro e imágenes OG.

Sirven como referencia de contenido y flujos. La exploración del paso 2 busca looks nuevos.

## 8. Preguntas abiertas

- ¿Landing en Astro aparte o dentro de Next?
- ¿Mercado Pago solo o también transferencia con comprobante para señas?
- ¿WhatsApp en el MVP o fase 2?
- Pricing: ¿por profesional, por plan fijo, freemium para solistas?
- ¿App nativa (PWA primero) para profesionales?
- Multi-sucursal: no en el MVP, pero el modelo de datos ya tiene `locations` (decidido 2026-10-21).
