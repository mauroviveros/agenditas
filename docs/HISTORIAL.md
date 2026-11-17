# Agenditas — Historial

> Qué se hizo en cada rebanada y por qué. Lo nuevo va arriba. No se lee entero: se
> busca cuando hace falta el porqué de algo. Lo que sigue está en [ROADMAP](./ROADMAP.md).

---

## F0 · Fundaciones — en curso

Branch `chore/fundaciones`

**Qué quedó:** documentos base (en curso).

**Decisiones**
- **Reinicio desde cero** (2026-11-17), porque con Astro + React SPA Mauro perdía el
  control de cada etapa y el diseño de R2 no lo convenció. Quedan dos tags: `legacy`
  (primer intento con Next) y `legacy-astro` (segundo intento). No se reusa código.
- **Una sola app Next.js**, porque Mauro la lee y es un solo deploy. Descartado:
  Astro (landing + página pública) + Next (panel), porque la ganancia es de 100 a 200 ms
  en el celu contra mantener dos apps desde el día 1. La meta de rendimiento de la
  página pública decide en R5 si se saca a Astro.
- **Supabase**, por el exclusion constraint, RLS y Auth. Descartados: Neon + Drizzle +
  Better Auth (más código propio para auditar) y una API aparte (todavía no hay app
  móvil ni API pública).
- **Login solo con Google**, porque es un toque en el celu y evita SMTP y links vencidos.
  Descartado: magic link. Si algún solista lo pide, se agrega el mail.
- **Cierre de bloque:** el agente commitea después del OK de Mauro, y el merge del PR
  lo hace Mauro. Reemplaza el flujo anterior, en el que Mauro corría los commits.
- **Diseño:** canvas de direcciones primero, impeccable después. El estilo anterior,
  "calma operativa", queda descartado.
- **Sentry, más adelante.**
