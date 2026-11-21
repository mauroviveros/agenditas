-- Bloqueos de horario («salgo 30 min») en la misma tabla que los turnos: así el constraint
-- appointments_no_overlap (un solo lugar, lo garantiza la base) cubre turno con turno,
-- turno con bloqueo y bloqueo con bloqueo. Un bloqueo es una fila sin servicio ni cliente.
-- shortcut: bloqueos y turnos comparten tabla; si los bloqueos ganan campos propios (motivo,
-- repetición), pasarlos a su propia tabla y resolver ahí la no-superposición (ROADMAP).
create type public.appointment_kind as enum ('appointment', 'block');

alter table public.appointments
  add column kind public.appointment_kind not null default 'appointment';

alter table public.appointments
  alter column service_id drop not null,
  alter column service_name drop not null,
  alter column service_duration_minutes drop not null,
  alter column service_price_cents drop not null,
  alter column client_name drop not null;

-- Un turno lleva servicio (con su copia) y cliente; un bloqueo no lleva nada de eso.
alter table public.appointments
  add constraint appointments_kind_check check (
    case kind
      when 'appointment' then
        service_id is not null and service_name is not null
        and service_duration_minutes is not null and service_price_cents is not null
        and client_name is not null
      when 'block' then
        service_id is null and service_name is null
        and service_duration_minutes is null and service_price_cents is null
        and client_name is null and client_phone is null
    end
  );
