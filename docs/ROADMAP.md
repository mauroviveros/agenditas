# Agenditas — Roadmap

> Qué se hace ahora y qué sigue. Lo terminado y sus decisiones están en
> [HISTORIAL](./HISTORIAL.md). Estados: ▶ en curso · ⏸ estacionado · sin marca =
> pendiente. Objetivo: menos de 200 líneas.

## Cómo se lee

- **Rebanada** = una funcionalidad de punta a punta con datos reales. Una branch
  `feat/<rebanada>`.
- **Bloques de una sola cosa** (una tabla, un endpoint, una pantalla), en orden: primero
  los datos, después cada pantalla. Cada bloque cierra con un *Listo cuando* verificable.
- **Cierre de bloque:** test primero → checks en verde → chequeo de seguridad si toca
  auth, inputs, claves o la reserva (🔒) → el agente abre la vista y deja 2 o 3 cosas
  para probar → **OK de Mauro** → el agente commitea el bloque.
- **Cierre de rebanada:** auditoría (code-reviewer + security-reviewer) → PR con CI
  verde → **el merge lo hace Mauro**. Se pasa al HISTORIAL y se borra de acá.
- Los comandos que crean o instalan cosas los corre Mauro, de a uno.

## Por qué este orden

Nada existe hasta que alguien lo carga:

1. El solista entra y crea su negocio (R1).
2. Carga cuándo atiende (R2) y qué ofrece (R3).
3. Usa su agenda (R4).
4. Sus clientes reservan solos (R5) y quedan registrados (R6).
5. Cobra (R7).

---

## F0 · Fundaciones ▶

Branch `chore/fundaciones`. Esqueleto, calidad y estilo general antes de la primera
pantalla real.

1. **Documentos base:** PRODUCT, ARQUITECTURA, ROADMAP e HISTORIAL.
   *Listo cuando* Mauro los aprueba.
2. **Esqueleto Next** (lo corre Mauro) y `.claude/launch.json`.
   *Listo cuando* `pnpm dev` muestra la página en el browser del app.
3. **Lint, typecheck y Vitest** con un script `pnpm check`.
   *Listo cuando* `pnpm check` pasa y falla con un error a propósito.
4. **Supabase local:** `supabase init`, primera migración (`btree_gist`, privilegios
   por defecto cerrados) y un test pgTAP que falla si una tabla no tiene RLS. 🔒
   *Listo cuando* `supabase test db` pasa.
5. **Estilo general:** canvas con 3 a 5 direcciones sobre la agenda del día y la página
   de reserva. Mauro elige una e impeccable la fija en `DESIGN.md`, con los tokens en
   Tailwind y una página `/dev/tokens` para verlos.
   *Listo cuando* Mauro eligió y ve los tokens aplicados.
6. **CI + protección de `main`** (con el OK de Mauro): lint, typecheck, Vitest, pgTAP y
   un smoke de Playwright, más el check de colores fuera de los tokens.
   *Listo cuando* el PR muestra el CI en verde.
7. **AGENTS.md** (con CLAUDE.md como symlink), `.claude/settings.json` y README con
   "Cómo se construye". *Listo cuando* la auditoría de F0 no deja nada alto.

## R1 · Entrar y crear el negocio

El solista entra con Google y crea su negocio (nombre, rubro, slug).
Mauro arranca en F0 la verificación de marca de Google, porque tarda días.

## R2 · Horarios

Semana, almuerzo y feriados de Argentina.

## R3 · Servicios

Nombre, duración y precio.

## R4 · Agenda del día

Cargar un turno a mano, moverlo, cancelar con deshacer y "salgo 30 min".

## R5 · Página pública y reserva

Reserva en tres pasos, con Turnstile y límite por IP/teléfono. Se mide la meta de
rendimiento.

## R6 · Clientes y WhatsApp

## R7 · Caja

## ⏸ Estacionado

- **Equipos** (dueño, recepción, varios profesionales): después del MVP.
- **Sentry:** cuando haya usuarios reales.
