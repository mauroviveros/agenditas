# Agenditas

Tus clientes reservan solos desde tu página. Agenda, horarios, clientes y caja para
solistas (barberías, lashistas, psicólogas, tatuadores, entrenadores), hecho para
Argentina.

Qué es y para quién: [docs/PRODUCT.md](docs/PRODUCT.md). Cómo está armado:
[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md). Qué sigue: [docs/ROADMAP.md](docs/ROADMAP.md).

## Arrancar

Necesitás Node 26, pnpm y Docker (para Supabase local).

```bash
pnpm install
pnpm exec supabase start
pnpm dev
```

La app queda en http://localhost:3000 y el estilo en http://localhost:3000/dev/tokens.

| Comando | Qué hace |
|---|---|
| `pnpm check` | Lint, colores, tipos y tests unitarios |
| `pnpm test:db` | Tests de la base (pgTAP) |
| `pnpm test:e2e` | Build de producción + Playwright |

## Cómo se construye

Agenditas se construye con Claude Code, con un método que no se negocia:

1. **Primero la estructura, no el código.** La IA propone arquitectura y diseño (qué
   partes tiene el proyecto y cómo se conectan) y se revisa que tenga sentido antes de
   escribir una línea.
2. **Bloques pequeños.** Una función, un componente, un endpoint a la vez, en
   rebanadas verticales con datos reales. Nunca "la app completa" de una vez.
3. **Cada bloque se prueba antes de seguir.** Test primero, checks en verde y una
   prueba a mano en la vista. Solo con el OK humano se commitea.
4. **Seguridad antes de conectar nada sensible.** Claves y variables de entorno,
   validación de inputs, permisos en la base y rate limiting.
5. **Auditoría al cerrar cada rebanada.** Una segunda revisión de todo lo construido
   siempre encuentra algo que se pasó.

Las decisiones son humanas; la IA propone, escribe y verifica. Nada llega a `main` sin
un PR con CI en verde y el merge de una persona.
