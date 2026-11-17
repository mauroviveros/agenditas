# AGENTS.md

Reglas para cualquier agente (y persona) que trabaje en Agenditas. `CLAUDE.md` es un
symlink a este archivo. Solo va lo que no se deduce del código ni lo chequea una
herramienta.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Antes de empezar

- Leé la rebanada en curso (▶) del [ROADMAP](./docs/ROADMAP.md). No leas el resto.
- Si necesitás el porqué de algo ya hecho, buscalo en el
  [HISTORIAL](./docs/HISTORIAL.md) (`grep`), no lo leas entero.

## Cómo trabajamos

- **Rebanadas verticales con datos reales**: Datos → Diseño → Vista. Ni pantallas con
  datos inventados ni backend sin vista.
- **Bloques chicos, una parada por bloque**: una tabla, un endpoint o una pantalla por
  vez. Mauro aprueba la lista de bloques al empezar la rebanada.
- **Cierre de bloque**: test primero (que falle) → código → `pnpm check` en verde →
  chequeo de seguridad si toca auth, inputs, claves o la reserva → el agente abre la
  vista y deja 2 o 3 cosas para probar, con al menos un caso de error → **OK de Mauro**
  → el agente commitea el bloque. Sin OK no se arranca el siguiente.
- **Un test que nunca falló no prueba nada**: si pasa de entrada, se lo hace fallar a
  propósito antes de darlo por bueno.
- **Comandos que crean o instalan cosas** (apps, paquetes, herramientas) los corre Mauro,
  de a uno: el agente da el comando exacto con su versión, espera y revisa el resultado.
- **Pantallas**: diseño con impeccable dentro de [`DESIGN.md`](./docs/DESIGN.md); estados
  de vacío, carga y error; e2e al terminarla.
- **Auditoría al cerrar la rebanada**: `code-reviewer` + `security-reviewer`; Mauro elige
  qué se arregla.
- **Si algo contradice los documentos, se pregunta.** No se decide en el código.

## Una rebanada está lista cuando

- [ ] Cumple los *Listo cuando* del ROADMAP y cubre error, vacío y carga.
- [ ] Pasa `pnpm check`, `pnpm test:db` y `pnpm test:e2e` (el CI corre los tres).
- [ ] Tiene su entrada en el HISTORIAL y salió del ROADMAP, en el mismo cambio.
- [ ] Mauro la revisó y mergeó el PR.

## Commits y PR

- Una branch por rebanada (`feat/<rebanada>`); `main` está protegida por el ruleset
  `main protegida`: PR, CI en verde, commits firmados e historia lineal.
- Skill **`mviveros:commit`**: Conventional Commits con gitmoji en shortcode, en inglés.
- El agente commitea cada bloque aprobado con rutas exactas (nunca `git add .` ni `-A`),
  pushea la branch y abre el PR. **El merge (squash) lo hace Mauro.**

## Documentos

| Documento | Decide sobre |
|---|---|
| [`docs/PRODUCT.md`](./docs/PRODUCT.md) | Usuarios, voz y textos |
| [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md) | Decisiones técnicas |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | Estilo visual y tokens |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Qué se hace ahora |
| [`docs/HISTORIAL.md`](./docs/HISTORIAL.md) | Qué se hizo y por qué |

Si dos se contradicen, decide el de la tabla y el otro se corrige en el mismo cambio.

## Convenciones

- **Idioma**: UI en español rioplatense con voseo; código de dominio en español
  (`formatearHora`, `turnos`); commits y PR en inglés.
- **Hora**: se guarda en `timestamptz` y se muestra con `src/lib/hora.ts`
  (`America/Argentina/Buenos_Aires`). Nunca `toLocaleString` suelto.
- **Datos**: la lógica de turnos vive en Postgres (RPC). Lecturas en Server Components;
  escrituras en Server Actions que validan con Zod y llaman a la RPC. Nunca se escribe
  a una tabla desde el navegador.
- **Permisos**: toda tabla nueva lleva RLS y sus `GRANT` explícitos en la misma
  migración (los privilegios por defecto están cerrados y un test pgTAP lo vigila).
- **Colores**: solo los tokens de `globals.css`; `scripts/check-colores.sh` corta el resto.

Un atajo con límite conocido lleva:

```ts
// shortcut: <límite>, <cuándo cambiarlo>
```

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (puerto 3000) |
| `pnpm check` | oxlint + colores + typecheck + Vitest |
| `pnpm test:db` | Tests pgTAP (necesita `pnpm exec supabase start`) |
| `pnpm test:e2e` | Build de producción + Playwright (puerto 3100) |
