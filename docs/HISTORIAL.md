# Agenditas — Historial

> Qué se hizo en cada rebanada y por qué. Lo nuevo va arriba. No se lee entero: se
> busca cuando hace falta el porqué de algo. Lo que sigue está en [ROADMAP](./ROADMAP.md).

---

## F0 · Fundaciones — 2026-11-17

Branch `chore/fundaciones` · PR https://github.com/mauroviveros/agenditas/pull/4

**Qué quedó:** documentos base, app Next 16 con el estilo Mate, Supabase local con
privilegios cerrados y guarda de RLS, `pnpm check` / `test:db` / `test:e2e`, CI con tres
jobs y `main` protegida.

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
- **Next 16 con Cache Components**, porque nada se cachea salvo que se pida
  (`"use cache"`) y la página pública lo necesita para su meta de rendimiento.
- **Oxlint + `tsc`** en vez de ESLint, por velocidad; `typecheck` corre `next typegen`
  antes para que existan los tipos de rutas (`LayoutProps`).
- **Privilegios por defecto cerrados en una migración** y además
  `auto_expose_new_tables = false` en `config.toml`, porque el default de Supabase abre
  toda tabla, secuencia y función nueva a `anon` y `authenticated`. Un test pgTAP lo
  vigila y se comprobó que falla sin la migración. (Al principio pareció que la CLI ya los
  traía cerrados: eran restos del volumen de Docker del intento anterior.)
- **Paleta de Tailwind borrada** (`--color-*: initial`) y `scripts/check-colores.sh` para
  lo que el reset no cubre: hex, `rgb()`/`hsl()`/`oklch()`, valores arbitrarios con
  colores con nombre (`bg-[red]`) y colores con nombre en estilos en línea. No cubre los
  ~140 nombres de CSS, solo los comunes.
- **Auditoría de F0** (code-reviewer + security-reviewer): nada CRITICAL ni HIGH. Se
  arreglaron 7 puntos chicos (secuencias en pgTAP, `auto_expose_new_tables`, `.env.example`,
  check de colores, CI sin cancelar en `main`) y lo de auth quedó anotado en R1.
- **e2e contra el build de producción** (puerto 3100), para probar lo que se despliega,
  incluido que `/dev/tokens` dé 404.
- **Ruleset `main protegida`** en vez de branch protection: PR, checks `check`/`db`/`e2e`,
  firmas SSH, historia lineal y **solo squash**. Un commit por rebanada en `main`; los
  commits por bloque quedan en el PR. Descartado: rebase-merge (GitHub no puede firmar
  los commits que reescribe) y merge commits (rompen la historia lineal).

**Diseño elegido:** "Mate" (C de 4 direcciones), por cálido y cercano sin perder
legibilidad de la hora. Canvas: https://claude.ai/artifact/GkZLfzBKpXpRiXiPtvtHMd

**Atajos:** la portada `/` es provisoria → se reemplaza cuando se diseñe la landing.

**Pendiente:** `.env.example` llega en R1 con la primera variable real; la verificación de
marca de Google (la arranca Mauro) es requisito de R1.
