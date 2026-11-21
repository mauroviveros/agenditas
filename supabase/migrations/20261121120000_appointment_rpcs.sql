-- RPC de turnos: la única forma de escribir en appointments desde la app. El dueño sale del
-- token; que el negocio sea suyo lo decide is_business_owner. No miran los horarios ni los
-- feriados del negocio: la pantalla avisa y el solista decide (atiende fuera de horario).
-- La no-superposición la garantiza el constraint appointments_no_overlap.
-- Errores (en el mensaje, para que la Server Action los traduzca):
-- not_authenticated; not_business_owner (también si el negocio, el servicio o el turno no
-- existen, son de otro negocio, el servicio está archivado o el turno no está en el estado
-- que la acción necesita, para no revelarlo); overlap (el horario se pisa con otro turno
-- o bloqueo); invalid_appointment (algún dato rompe las reglas de la tabla).
-- Los parámetros se llaman como las columnas, así que van siempre como función.x.
-- shortcut: sin rate limit; ya está en "Antes de producción" del ROADMAP.

-- Agenda un turno con la copia del servicio y devuelve su id. Termina cuando termina el
-- servicio.
create function public.create_appointment(
  business_id uuid,
  service_id uuid,
  client_name text,
  client_phone text,
  starts_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen public.services;
  created_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(create_appointment.business_id) then
    raise exception 'not_business_owner';
  end if;

  select * into chosen from public.services s
  where s.id = create_appointment.service_id
    and s.business_id = create_appointment.business_id
    and s.archived_at is null;

  if not found then
    raise exception 'not_business_owner';
  end if;

  insert into public.appointments (business_id, service_id, service_name,
    service_duration_minutes, service_price_cents, client_name, client_phone, starts_at, ends_at)
  values (create_appointment.business_id, chosen.id, chosen.name, chosen.duration_minutes,
    chosen.price_cents, create_appointment.client_name, create_appointment.client_phone,
    create_appointment.starts_at,
    create_appointment.starts_at + make_interval(mins => chosen.duration_minutes))
  returning id into created_id;

  return created_id;
exception
  when exclusion_violation then
    raise exception 'overlap';
  -- La fecha es tan lejana que sumarle la duración se sale del calendario.
  when check_violation or not_null_violation or datetime_field_overflow then
    raise exception 'invalid_appointment';
end;
$$;

-- Mueve un turno (o bloqueo) confirmado a otra hora, con la misma duración.
create function public.move_appointment(
  business_id uuid,
  appointment_id uuid,
  starts_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(move_appointment.business_id) then
    raise exception 'not_business_owner';
  end if;

  update public.appointments a
  set starts_at = move_appointment.starts_at,
      ends_at = move_appointment.starts_at + (a.ends_at - a.starts_at)
  where a.id = move_appointment.appointment_id
    and a.business_id = move_appointment.business_id
    and a.status = 'confirmed';

  if not found then
    raise exception 'not_business_owner';
  end if;
exception
  when exclusion_violation then
    raise exception 'overlap';
  -- La fecha es tan lejana que sumarle la duración se sale del calendario.
  when check_violation or not_null_violation or datetime_field_overflow then
    raise exception 'invalid_appointment';
end;
$$;

-- Cancela un turno (o bloqueo) confirmado: queda registrado y libera el horario.
create function public.cancel_appointment(business_id uuid, appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(cancel_appointment.business_id) then
    raise exception 'not_business_owner';
  end if;

  update public.appointments a
  set status = 'cancelled'
  where a.id = cancel_appointment.appointment_id
    and a.business_id = cancel_appointment.business_id
    and a.status = 'confirmed';

  if not found then
    raise exception 'not_business_owner';
  end if;
end;
$$;

-- Deshace una cancelación. Si mientras tanto el horario se ocupó, da overlap.
create function public.restore_appointment(business_id uuid, appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(restore_appointment.business_id) then
    raise exception 'not_business_owner';
  end if;

  update public.appointments a
  set status = 'confirmed'
  where a.id = restore_appointment.appointment_id
    and a.business_id = restore_appointment.business_id
    and a.status = 'cancelled';

  if not found then
    raise exception 'not_business_owner';
  end if;
exception
  when exclusion_violation then
    raise exception 'overlap';
end;
$$;

-- «Salgo N min»: bloquea el horario desde starts_at, sin servicio ni cliente. Si pisa un
-- turno, da overlap y no crea nada. De 5 minutos a 8 horas, como un servicio.
create function public.block_time(
  business_id uuid,
  starts_at timestamptz,
  minutes integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(block_time.business_id) then
    raise exception 'not_business_owner';
  end if;

  if block_time.minutes is null or block_time.minutes not between 5 and 480 then
    raise exception 'invalid_appointment';
  end if;

  insert into public.appointments (business_id, kind, starts_at, ends_at)
  values (block_time.business_id, 'block', block_time.starts_at,
    block_time.starts_at + make_interval(mins => block_time.minutes))
  returning id into created_id;

  return created_id;
exception
  when exclusion_violation then
    raise exception 'overlap';
  -- La fecha es tan lejana que sumarle la duración se sale del calendario.
  when check_violation or not_null_violation or datetime_field_overflow then
    raise exception 'invalid_appointment';
end;
$$;

grant execute on function public.create_appointment(uuid, uuid, text, text, timestamptz),
  public.move_appointment(uuid, uuid, timestamptz),
  public.cancel_appointment(uuid, uuid),
  public.restore_appointment(uuid, uuid),
  public.block_time(uuid, timestamptz, integer)
  to authenticated;
