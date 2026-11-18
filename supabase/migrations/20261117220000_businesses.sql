-- Negocios: uno por solista. Se crea con la RPC create_business (bloque 2);
-- desde el navegador solo se lee el propio.
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null
    check (name = btrim(name) and char_length(name) between 2 and 60),
  -- Va en /reservar/{slug}: minúsculas, números y guiones sueltos entre medio.
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

grant select on public.businesses to authenticated;

create policy "el dueño lee su negocio"
  on public.businesses for select
  to authenticated
  using (owner_id = (select auth.uid()));
