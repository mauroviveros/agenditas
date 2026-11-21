-- Turnos de un negocio. Se escriben con las RPC del bloque 4; desde el navegador solo se
-- lee lo propio. Cada turno guarda su copia del nombre, la duración y el precio del servicio
-- (service_id queda para saber de cuál salió): editar o archivar el servicio no cambia lo
-- ya agendado. El cliente es texto por ahora; R6 crea `clients` y migra estos datos.
create type public.appointment_status as enum ('confirmed', 'cancelled');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Sin on delete: los servicios no se borran, se archivan; y al borrar un negocio se van
  -- los turnos y los servicios en la misma sentencia.
  service_id uuid not null references public.services (id),
  service_name text not null
    constraint appointments_service_name_check
      check (service_name !~ '^[[:space:]]|[[:space:]]$' and service_name <> ''
             and length(service_name) <= 60),
  service_duration_minutes smallint not null
    constraint appointments_service_duration_check
      check (service_duration_minutes between 5 and 480 and service_duration_minutes % 5 = 0),
  -- En centavos, igual que services.price_cents.
  service_price_cents integer not null
    constraint appointments_service_price_check
      check (service_price_cents between 0 and 1000000000),
  client_name text not null
    constraint appointments_client_name_check
      check (client_name !~ '^[[:space:]]|[[:space:]]$' and client_name <> ''
             and length(client_name) <= 80),
  -- Opcional. Tal cual lo escribió el solista: el formato lo cuida la Server Action.
  client_phone text
    constraint appointments_client_phone_check
      check (client_phone !~ '^[[:space:]]|[[:space:]]$' and client_phone <> ''
             and length(client_phone) <= 30),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  constraint appointments_range_check check (ends_at > starts_at),
  -- Cero superposiciones: dos turnos confirmados del mismo negocio no se pisan (uno puede
  -- arrancar donde termina otro). Los cancelados no cuentan. También sirve de índice para
  -- leer el día de un negocio.
  constraint appointments_no_overlap exclude using gist (
    business_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed')
);

alter table public.appointments enable row level security;

grant select on public.appointments to authenticated;

create policy "el dueño lee los turnos de su negocio"
  on public.appointments for select
  to authenticated
  using (public.is_business_owner(business_id));
