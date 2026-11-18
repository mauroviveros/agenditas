-- Guarda la semana de atención de un negocio: reemplaza todas las franjas de una vez.
-- Es la única forma de escribir en business_hours. `ranges` es una lista:
--   [{"weekday": 1, "start_time": "09:00", "end_time": "13:00"}, ...]
-- Una lista vacía deja la semana sin horarios. Todo o nada: si una franja falla, no se
-- toca nada. El dueño sale del token; que el negocio sea suyo lo decide is_business_owner.
-- Errores (en el mensaje, para que la Server Action los traduzca):
-- not_authenticated, not_business_owner (también si el negocio no existe, para no
-- revelarlo), invalid_range (día o fin fuera de rango), overlap, invalid_ranges
-- (la lista misma está mal armada).
-- shortcut: sin rate limit; ya está en "Antes de producción" del ROADMAP.
create function public.set_business_hours(business_id uuid, ranges jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Una semana con varias franjas por día entra de sobra; el tope corta lo absurdo.
  max_ranges constant int := 70;
  violated_constraint text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(set_business_hours.business_id) then
    raise exception 'not_business_owner';
  end if;

  if jsonb_typeof(ranges) is distinct from 'array'
     or jsonb_array_length(ranges) > max_ranges then
    raise exception 'invalid_ranges';
  end if;

  -- Serializa dos guardados a la vez del mismo negocio.
  perform 1 from public.businesses b
  where b.id = set_business_hours.business_id
  for update;

  delete from public.business_hours h
  where h.business_id = set_business_hours.business_id;

  insert into public.business_hours (business_id, weekday, start_time, end_time)
  select set_business_hours.business_id, r.weekday, r.start_time, r.end_time
  from jsonb_to_recordset(ranges)
    as r(weekday smallint, start_time time, end_time time);
exception
  when check_violation or exclusion_violation then
    get stacked diagnostics violated_constraint = constraint_name;
    raise exception '%', case violated_constraint
      when 'business_hours_no_overlap' then 'overlap'
      else 'invalid_range'
    end;
  -- Faltó un campo, o no es un número, una hora o un objeto.
  when not_null_violation or invalid_text_representation or invalid_parameter_value
    or numeric_value_out_of_range or datetime_field_overflow or invalid_datetime_format then
    raise exception 'invalid_ranges';
end;
$$;

grant execute on function public.set_business_hours(uuid, jsonb) to authenticated;
