-- R2 · Servicios y horarios.
-- Solo el dueño del negocio lee y escribe lo suyo; el público no lee nada todavía.
-- Los feriados no se guardan acá: el panel los trae de la API de feriados de Argentina.
-- Los horarios son horas de pared en la zona del negocio (`businesses.time_zone`).

-- ── Zona horaria del negocio ────────────────────────────────────────────────
create function public.is_valid_time_zone(p_zone text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = p_zone and name like '%/%')
$$;

grant execute on function public.is_valid_time_zone(text) to authenticated;

alter table public.businesses
  add column time_zone text not null default 'America/Argentina/Buenos_Aires'
    constraint businesses_time_zone_valid check (public.is_valid_time_zone(time_zone));

grant update (time_zone) on public.businesses to authenticated;

-- ── Servicios ───────────────────────────────────────────────────────────────
create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null
    constraint services_name_valid check (char_length(btrim(name)) between 1 and 80),
  duration_minutes integer not null
    constraint services_duration_valid
      check (duration_minutes between 5 and 480 and duration_minutes % 5 = 0),
  price_ars integer
    constraint services_price_valid check (price_ars is null or price_ars >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

-- Un servicio se archiva, no se borra: el nombre se libera al archivarlo.
create unique index services_active_name_key
  on public.services (business_id, lower(btrim(name)))
  where archived_at is null;

-- ── Horario semanal: un tramo por día, con almuerzo opcional adentro ────────
-- `weekday` es ISO (1 = lunes … 7 = domingo). Un día cerrado no tiene fila.
create table public.weekly_hours (
  business_id uuid not null references public.businesses (id) on delete cascade,
  weekday smallint not null constraint weekly_hours_weekday_valid check (weekday between 1 and 7),
  opens time not null,
  closes time not null,
  lunch_starts time,
  lunch_ends time,
  primary key (business_id, weekday),
  constraint weekly_hours_range_valid check (
    opens < closes and closes < time '24:00'
    and extract(epoch from opens)::integer % 900 = 0
    and extract(epoch from closes)::integer % 900 = 0
  ),
  constraint weekly_hours_lunch_valid check (
    (lunch_starts is null and lunch_ends is null)
    or (
      lunch_starts is not null and lunch_ends is not null
      and opens < lunch_starts and lunch_starts < lunch_ends and lunch_ends < closes
      and extract(epoch from lunch_starts)::integer % 900 = 0
      and extract(epoch from lunch_ends)::integer % 900 = 0
    )
  )
);

-- ── Excepciones por fecha: cerrar un día o abrir un feriado ─────────────────
create table public.day_overrides (
  business_id uuid not null references public.businesses (id) on delete cascade,
  on_date date not null,
  kind text not null constraint day_overrides_kind_valid check (kind in ('closed', 'open')),
  note text constraint day_overrides_note_valid check (note is null or char_length(note) <= 120),
  created_at timestamptz not null default now(),
  primary key (business_id, on_date)
);

-- "Hoy" se mide en la zona del negocio, no en la del servidor.
create function public.day_overrides_no_past()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_today date;
begin
  select (now() at time zone b.time_zone)::date into v_today
  from public.businesses b where b.id = new.business_id;
  if new.on_date < v_today then
    raise exception 'date_in_past';
  end if;
  return new;
end;
$$;

create trigger day_overrides_no_past
  before insert on public.day_overrides
  for each row execute function public.day_overrides_no_past();

-- ── Guardar la semana completa de una vez ───────────────────────────────────
-- Reemplaza todos los días del negocio del usuario; si un día falla, no cambia nada.
-- Corre con los permisos de quien llama: la RLS y los CHECK de la tabla siguen mandando.
create function public.save_weekly_hours(p_hours jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_business uuid;
begin
  select m.business_id into v_business
  from public.memberships m
  where m.user_id = (select auth.uid());
  if v_business is null then
    raise exception 'no_business';
  end if;

  delete from public.weekly_hours where business_id = v_business;
  insert into public.weekly_hours (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
  select v_business, d.weekday, d.opens, d.closes, d.lunch_starts, d.lunch_ends
  from jsonb_to_recordset(p_hours)
    as d (weekday smallint, opens time, closes time, lunch_starts time, lunch_ends time);
end;
$$;

grant execute on function public.save_weekly_hours(jsonb) to authenticated;

-- ── RLS y permisos: cada tabla, explícita ───────────────────────────────────
alter table public.services enable row level security;
alter table public.weekly_hours enable row level security;
alter table public.day_overrides enable row level security;

create policy services_owner on public.services
  for all to authenticated
  using (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())))
  with check (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())));

create policy weekly_hours_owner on public.weekly_hours
  for all to authenticated
  using (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())))
  with check (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())));

create policy day_overrides_owner on public.day_overrides
  for all to authenticated
  using (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())))
  with check (business_id in (select m.business_id from public.memberships m where m.user_id = (select auth.uid())));

grant select on public.services to authenticated;
grant insert (business_id, name, duration_minutes, price_ars) on public.services to authenticated;
grant update (name, duration_minutes, price_ars, archived_at) on public.services to authenticated;

grant select, delete on public.weekly_hours to authenticated;
grant insert (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
  on public.weekly_hours to authenticated;
grant update (opens, closes, lunch_starts, lunch_ends) on public.weekly_hours to authenticated;

grant select, delete on public.day_overrides to authenticated;
grant insert (business_id, on_date, kind, note) on public.day_overrides to authenticated;
grant update (kind, note) on public.day_overrides to authenticated;
