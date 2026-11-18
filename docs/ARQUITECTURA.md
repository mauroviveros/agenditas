# Agenditas — Arquitectura

> Una página. Cada decisión con su porqué. El modelo de datos no va acá: la verdad
> está en las migraciones.

```
Cliente final (anónimo)                    Solista (Google)
      │                                          │
      ▼                                          ▼
agenditas.app/reservar/[slug] ── Next.js (1 app) ── agenditas.app/panel/…
agenditas.app (landing)          │
                                 ▼
               Supabase · Postgres (sa-east-1)
               RLS por negocio · RPC de horarios y reserva
               exclusion constraint: dos turnos no se pisan
```

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Mauro lo lee. Una sola app para landing, página pública y panel: un deploy, una config |
| Datos | Supabase (Postgres) | Exclusion constraint para cero superposiciones, RLS por negocio, RPC |
| Auth | Supabase Auth, **solo Google** | Un toque en el celu, sin SMTP ni links vencidos. Los clientes finales no se loguean |
| UI | Tailwind + shadcn con los tokens del estilo elegido | Componentes accesibles que quedan en el repo y se pueden leer |
| Hosting | Vercel (`gru1`) | Camino nativo de Next, cerca de Argentina |
| Tests | Vitest (lógica), pgTAP (base y RLS), Playwright (flujos) | Cada capa con su herramienta |
| Lint | Oxlint + `tsc --noEmit` | Rápido; el typecheck cubre lo que oxlint no |

## Capas

- **La lógica de turnos vive en Postgres:** horarios libres, reserva y superposición.
  Next solo llama a funciones RPC, así cualquier front futuro (Astro, app móvil) reusa
  lo mismo.
- **Lecturas:** Server Components con el cliente de Supabase del usuario (RLS aplica).
- **Escrituras:** Server Actions que validan con Zod y llaman a la RPC. Nunca se escribe
  desde el navegador directo a una tabla.
- **Quién autoriza:** RLS en cada tabla. La única escritura anónima es la RPC `reservar`,
  con Turnstile y límite por IP/teléfono.
- **Hora:** se guarda en `timestamptz` y se muestra en `America/Argentina/Buenos_Aires`.

## Entornos y claves

- **Local:** Supabase CLI (`supabase start`), `.env.local` fuera de git; `.env.example`
  documenta cada variable.
- **Preview y producción:** variables en Vercel y proyectos de Supabase separados.
- En el navegador solo la clave pública (publishable). La secreta nunca sale del servidor
  y un test falla si aparece una clave `service_role` en el bundle.

## Calidad y CI

Cada PR corre lint, typecheck, Vitest, pgTAP y Playwright contra Supabase local. `main`
está protegida (PR obligatorio y CI en verde). Las reglas que se pueden chequear son checks:
colores solo desde los tokens, cada tabla con RLS y tipos de la base al día.

## Rendimiento

Meta de la página pública: **LCP < 2,5 s** en un móvil medio con 4G y **< 100 KB de JS**.
Se mide en R5. Si no llega, la página pública se saca a Astro, y es barato porque la
lógica está en la base.

## Preguntas abiertas

- **Sentry:** más adelante; mientras tanto, los logs de Vercel.
- **Feriados:** se toman de la API de ArgentinaDatos y se cargan con `pnpm holidays:sync`
  (a mano, una vez al año; también saca las fechas que la API ya no trae). Si algún día
  conviene que se refresque solo, pasa a un cron con tope de tamaño de respuesta.
