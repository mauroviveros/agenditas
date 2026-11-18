-- Horarios de atención: franjas por día de la semana. El almuerzo es el hueco entre
-- dos franjas (9–13 y 15–19). Se escribe con la RPC set_business_hours (bloque 2);
-- desde el navegador solo se lee lo propio.
-- shortcut: start_time/end_time son hora de pared de Buenos Aires y `time` no llega a
-- 24:00, así que una franja no cruza la medianoche; cambiarlo si hay un negocio nocturno.
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- 1 = lunes … 7 = domingo (ISO).
  weekday smallint not null
    constraint business_hours_weekday_check check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  constraint business_hours_range_check check (end_time > start_time),
  -- Dos franjas del mismo día no se pisan; una puede arrancar donde termina otra.
  constraint business_hours_no_overlap exclude using gist (
    business_id with =,
    weekday with =,
    tsrange(date '2000-01-01' + start_time, date '2000-01-01' + end_time) with &&
  )
);

alter table public.business_hours enable row level security;

grant select on public.business_hours to authenticated;

-- ¿El usuario del token manda en este negocio? Todas las policies de tablas del negocio
-- la usan en vez de repetir la consulta. Si algún día hay equipos o roles, se cambia
-- solo esta función (por una consulta a business_members) y las policies no se tocan.
-- Es security invoker: la RLS de businesses ya limita lo que se ve, así que quien no es
-- dueño no encuentra el negocio y recibe false.
create function public.is_business_owner(business_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = is_business_owner.business_id
      and b.owner_id = (select auth.uid())
  );
$$;

grant execute on function public.is_business_owner(uuid) to authenticated;

create policy "el dueño lee los horarios de su negocio"
  on public.business_hours for select
  to authenticated
  using (public.is_business_owner(business_id));
