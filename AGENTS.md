# Agenditas · reglas para agentes

SaaS de turnos para pymes que venden tiempo. Next.js 16 + Supabase. Todo el producto habla en voseo es-AR.

## Cómo trabajamos

1. **Construir por bloques pequeños.** Una función, un componente o un endpoint a la vez. Nunca "la app completa" de una sola vez.
2. **Probar cada bloque antes de seguir.** Que funcione, que maneje errores, que tenga su test y que tenga sentido. Al terminar un bloque, parar y esperar que el usuario lo revise. Avanzar sobre cosas no probadas es acumular problemas para después.
3. **Auditar lo que construimos juntos.** Al cerrar cada branch, revisar todo su código y listar qué mejorarías y qué riesgos ves (`/ponytail-audit` o `/code-review`). Una segunda revisión siempre encuentra algo que se pasó.
4. **Usar `/find-skills`** cuando aparezca un área nueva (una librería, una integración) y proponer la skill que corresponda. No instalar ninguna sin el OK del usuario.

### Un bloque está listo cuando

- Anda: se ve en el navegador o lo prueba un test.
- Cubre los estados de error, vacío y carga que le tocan.
- Pasan `pnpm lint`, `pnpm tsc --noEmit` y los tests.
- El usuario lo revisó.

### Branches y commits

- Una branch por entrega del roadmap (`docs/ROADMAP.md`), con varios bloques adentro. Nada se trabaja directo en `main`.
- Commits y PRs según el skill `commits-a-mi-nombre`: a nombre del usuario, sin footer de coautoría, Conventional Commits con gitmoji y en inglés.
- **Al cerrar cada bloque**, si se puede commitear solo, pasarle al usuario los comandos listos para copiar: el `git add` con los archivos exactos (nunca `git add .`) y el `git commit -m "..."` con el mensaje. Si el bloque depende de otro que todavía no está, avisarlo y juntar los comandos cuando se pueda commitear el conjunto. El agente no commitea: el usuario corre los comandos.

## Documentos

| Documento | Responde | Manda sobre |
|---|---|---|
| `docs/PRODUCT.md` | Para quién es, qué resuelve, voz y principios | Producto y copy |
| `docs/DESIGN.md` | Tokens y reglas visuales (lo genera `/impeccable document`) | Colores, tipografía, formas, componentes |
| `docs/DESIGN_SYSTEM.md` | Componentes de dominio, grilla, estados de turno, emails, móvil | Comportamiento de la UI |
| `docs/ARQUITECTURA.md` | Librerías, Supabase, capa de datos, entornos | Decisiones técnicas |
| `docs/RUTAS.md` | Todas las vistas y rutas, por fase | Qué pantallas existen |
| `docs/ROADMAP.md` | Orden de trabajo: fases → branches → bloques | Qué se hace ahora |
| `docs/PROYECTO.md` | Visión, módulos y modelo de datos inicial | Contexto general |

Si dos documentos chocan, manda el de la columna "Manda sobre" y se corrige el otro en el mismo cambio.

`PRODUCT.md` y `DESIGN.md` en la raíz son symlinks a `docs/` para que impeccable los encuentre.

## Convenciones

- **Copy:** voseo, oraciones cortas, verbo primero en botones, formato es-AR (`15:30`, `$19.500`, "mié 22 de oct"). Ver `docs/PRODUCT.md`.
- **Diseño:** tokens de `src/app/globals.css` y componentes de `src/components/ui` (shadcn tematizado). Nada de colores ni radios sueltos.
- **Next.js 16:** antes de usar una API, leer su guía en `node_modules/next/dist/docs/`. Hay Cache Components: lo que lee `params`, `searchParams`, `cookies()` o la hora va dentro de `<Suspense>`.
- **Atajos con límite conocido** llevan un comentario `shortcut: <límite>, <cuándo cambiarlo>`.

## Comandos

```bash
pnpm dev                      # servidor local en :3000
pnpm lint                     # Biome
pnpm tsc --noEmit             # tipos
node --test src/lib/*.test.ts # tests de lógica pura
```

Desde la F1 del roadmap: `supabase start` (base local en Docker) y `supabase test db` (pgTAP).

## Skills

| Skill | Cuándo |
|---|---|
| `impeccable` | Diseñar, criticar o pulir UI; `document` regenera `docs/DESIGN.md` |
| `frontend-design` | Dirección visual de una vista nueva |
| `ponytail` / `ponytail-audit` | Cambio mínimo completo; auditoría al cerrar una branch |
| `code-review` | Revisión de un diff o PR |
| `commits-a-mi-nombre` | Todo commit, merge o PR |
| `find-skills` | Buscar una skill para un área nueva |
| `shadcn` | Agregar, adaptar o depurar componentes de `src/components/ui` |
| `supabase` | Todo lo de Supabase: Auth, `@supabase/ssr`, CLI, RLS, Realtime |
| `supabase-postgres-best-practices` | Antes de escribir o cambiar esquema, migraciones, políticas, índices o funciones SQL |
| `next-cache-components-optimizer` | Cuando una ruta tarda en mostrar contenido o Next avisa por `<Suspense>`/datos fuera del shell |
| `vercel-react-best-practices` | Al escribir o revisar componentes React y data fetching |
| `accessibility` | Auditar o corregir accesibilidad (WCAG 2.2 AA) |

Las skills del proyecto viven en `.claude/skills/` y se fijan en `skills-lock.json`. Se restauran con `npx skills experimental_install`.

**Para su fase** (todavía sin instalar): `currents-dev/playwright-best-practices-skill@playwright-best-practices` (F1, e2e), `resend/resend-skills@resend` y `resend/react-email@react-email` (F4, emails), `mercadopago/mercadopago-claude-marketplace@mp-integrate` y `@mp-webhooks` (F4, señas; oficiales pero con pocas instalaciones, revisarlas antes).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
