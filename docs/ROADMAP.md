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

## R1 · Entrar y crear el negocio ▶

El solista entra con Google y crea su negocio (nombre, rubro, slug).
Requisito: la verificación de marca de Google (la arranca Mauro, tarda días). Los bloques
se detallan al empezar la rebanada.

**Seguridad pendiente de la auditoría de F0** (cada punto, un caso borde o un check):

- `config.toml`: apagar el provider email, activar Google con `env()` y fijar
  `site_url` / `additional_redirect_urls` a los dominios reales (sacar `https://127.0.0.1`).
- Toda RPC `security definer` con `set search_path = ''`.
- Cada RPC pública: `grant execute` explícito, validación con Zod y rate limit.
- Vistas con `security_invoker = true` (el guard de RLS no mira vistas).
- Sacar `graphql_public` de `api.schemas` si no se usa.
- Un esquema nuevo (p. ej. `private`) repite los revokes de la migración de fundaciones.

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
