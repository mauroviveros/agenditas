# AGENTS.md

Reglas para cualquier agente (y persona) que trabaje en Agenditas. `CLAUDE.md` es un
symlink a este archivo. Solo va lo que no se deduce del código ni lo chequea una
herramienta. Producto: SaaS de turnos para pymes que venden tiempo, en voseo es-AR.

## Antes de empezar

- Leé la rebanada en curso (▶) del [ROADMAP](./docs/ROADMAP.md). No leas el resto.
- Si necesitás el porqué de algo ya hecho, buscalo en el
  [HISTORIAL](./docs/HISTORIAL.md) (`grep`), no lo leas entero.

## Cómo trabajamos

- **Rebanadas verticales con datos reales**: Datos → Diseño → Vista. Ni pantallas con
  datos inventados ni backend sin vista.
- **Casos borde primero**: los de la rebanada se vuelven tests antes del código.
- **Dos paradas por rebanada**: Mauro elige el diseño y revisa la vista terminada. El
  resto corre de corrido. Parás antes solo si algo contradice los documentos o aparece
  una decisión de producto.
- **Probar antes de seguir**: navegador o test. Si algo no se pudo probar, se dice.
- **`/code-review` al cerrar Datos**; `/accessibility` y e2e al cerrar la Vista.
- **Nada se instala sin OK** (dependencias ni skills). Antes de agregar algo, se busca si
  ya existe en el repo o la plataforma.
- **Si algo contradice los documentos, se pregunta.** No se decide en el código.

## Una rebanada está lista cuando

- [ ] Cumple los *Listo cuando* del ROADMAP y cubre error, vacío y carga.
- [ ] Pasan `pnpm lint`, `pnpm typecheck` y `pnpm test` (y `pnpm supabase test db`).
- [ ] Tiene su entrada en el HISTORIAL y salió del ROADMAP, en el mismo cambio.
- [ ] Mauro la revisó.

## Commits

- Una branch por rebanada; nada directo en `main`.
- Skill **`mviveros:commit`**: Conventional Commits con gitmoji en shortcode, en inglés,
  sin firma de coautoría.
- **El agente commitea y pushea la branch de la rebanada y abre el PR.** Rutas exactas,
  un commit por cambio lógico, nunca `--force` ni push a `main` (lo bloquea
  `.claude/settings.json`). Mauro revisa el código en el PR y hace el merge.

## Documentos

| Documento | Decide sobre |
|---|---|
| [`docs/PRODUCT.md`](./docs/PRODUCT.md) | Usuarios, voz y textos |
| [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md) | Decisiones técnicas |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Qué se hace ahora |
| [`docs/HISTORIAL.md`](./docs/HISTORIAL.md) | Qué se hizo y por qué |

Si dos se contradicen, decide el de la tabla y el otro se corrige en el mismo cambio.
`PRODUCT.md` de la raíz es un symlink a `docs/` para que lo encuentre impeccable.

## Convenciones

- **Copy:** voseo, oraciones cortas, verbo primero en botones, formato es-AR (`15:30`,
  `$19.500`). Ver `docs/PRODUCT.md`.
- **Colores y radios** solo en `packages/ui/src/styles/tokens.css`. La CI lo chequea
  (`scripts/check-colors.sh`).
- **La base es el único guardia.** RLS en toda tabla y cada permiso como `GRANT`
  explícito en una migración. Reservar, mover y cancelar solo por RPC, y `anon` no
  ejecuta la de reservar. Detalle en `docs/ARQUITECTURA.md`.
- **Tipos de la base:** `pnpm db:types` después de cada migración. No se editan a mano.
- **Claves:** el navegador solo recibe la clave publicable; `readSupabaseConfig` rechaza
  una `sb_secret_…`. Ninguna clave va en el código.
- **Dependencias:** se respeta la antigüedad mínima de `pnpm` (no se excluyen versiones
  nuevas); las CLIs van con versión exacta. Las acciones de GitHub, fijadas por SHA.
- **Los `.astro` no pasan por Biome ni por el typecheck** (ver ROADMAP, Estacionado).
- Un atajo con límite conocido lleva:

```ts
// shortcut: <límite>, <cuándo cambiarlo>
```

## Entorno

- **Docker** abierto para `pnpm supabase start`. Node según `.nvmrc`.
- **`pnpm` no está en el PATH de la shell del agente ni de la app** (vive en
  `~/Library/pnpm/bin` y `node` viene de `fnm`; ninguno carga `~/.zshrc`). En Bash,
  anteponé `export PATH="$HOME/Library/pnpm/bin:$PATH"`. Por eso `.claude/launch.json`
  arranca con `zsh -ic`: sin eso, `preview_start` no encuentra `pnpm`.
- **Hooks de ECC:** el gate pide datos al crear archivos nuevos; se responden. La
  exención local está en `.claude/settings.local.json` (no se commitea). El hook de
  protección de config bloquea editar `biome.json`: se arregla el código, no la config.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Panel (`:5173`) y web (`:4321`) |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | Los checks de la CI |
| `pnpm build` | Build de las dos apps |
| `pnpm supabase start` · `stop` | Base local (Studio `:54323`, mails en Mailpit `:54324`) |
| `pnpm supabase test db` | Pruebas pgTAP |
| `pnpm db:types` | Regenera `packages/db/src/types.ts` |
| `./scripts/check-colors.sh` | Colores fuera de los tokens |

## Skills

Instaladas en `.claude/skills/` y fijadas en `skills-lock.json` (se restauran con
`npx skills experimental_install`): `vite`, `vitest`, `workers-best-practices`.

Para su rebanada, con OK de Mauro: `supabase` y `supabase-postgres-best-practices`
(R1, antes de la primera tabla), `shadcn` (R1, primer componente), `accessibility`
(R1, al cerrar la Vista) y `playwright-best-practices` (R4, e2e). `impeccable` es un
plugin del proyecto: diseño, crítica y `DESIGN.md`.
