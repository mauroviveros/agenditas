-- Servicios que ofrece un negocio: nombre, duración y precio. Se escriben con las RPC
-- save_service y delete_service (bloques 2 y 3); desde el navegador solo se lee lo propio.
-- El tope de 50 por negocio lo controla save_service, no la tabla.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Se guarda recortado (ni espacios ni saltos de línea en los bordes): así " Corte" y
  -- "Corte" no pasan como dos servicios distintos.
  name text not null
    constraint services_name_check
      check (name !~ '^[[:space:]]|[[:space:]]$' and name <> '' and length(name) <= 60),
  duration_minutes smallint not null
    constraint services_duration_check
      check (duration_minutes between 5 and 480 and duration_minutes % 5 = 0),
  -- En centavos: $1.500,50 = 150050. 0 es un servicio sin cargo; el tope es $10.000.000.
  price_cents integer not null
    constraint services_price_check check (price_cents between 0 and 1000000000),
  created_at timestamptz not null default now()
);

-- Un nombre por negocio, sin distinguir mayúsculas. También sirve de índice por negocio.
-- shortcut: lower() no iguala todo Unicode (ß y SS cuentan distinto); alcanza para
-- nombres de servicios en castellano, cambiarlo por una collation ICU si molesta.
create unique index services_name_unique on public.services (business_id, lower(name));

alter table public.services enable row level security;

grant select on public.services to authenticated;

create policy "el dueño lee los servicios de su negocio"
  on public.services for select
  to authenticated
  using (public.is_business_owner(business_id));
