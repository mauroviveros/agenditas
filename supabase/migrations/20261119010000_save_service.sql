-- Crea o edita un servicio y devuelve su id: sin service_id crea uno nuevo; con service_id
-- edita ese, siempre que sea del negocio. Es la única forma de escribir en services
-- (borrar va por delete_service). El dueño sale del token; que el negocio sea suyo lo
-- decide is_business_owner.
-- Errores (en el mensaje, para que la Server Action los traduzca):
-- not_authenticated, not_business_owner (también si el negocio o el servicio no existen,
-- o el servicio es de otro negocio, para no revelarlo), service_limit (ya tiene 50),
-- duplicate_name, invalid_service (algún dato rompe las reglas de la tabla).
-- Los parámetros se llaman como las columnas, así que van siempre como save_service.x.
-- shortcut: sin rate limit; ya está en "Antes de producción" del ROADMAP.
create function public.save_service(
  business_id uuid,
  service_id uuid,
  name text,
  duration_minutes integer,
  price_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_services constant int := 50;
  saved_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(save_service.business_id) then
    raise exception 'not_business_owner';
  end if;

  -- Serializa dos guardados a la vez del mismo negocio: si no, los dos podrían contar 49
  -- y crear el 50 y el 51.
  perform 1 from public.businesses b
  where b.id = save_service.business_id
  for update;

  if save_service.service_id is null then
    if (select count(*) from public.services s
        where s.business_id = save_service.business_id) >= max_services then
      raise exception 'service_limit';
    end if;

    insert into public.services (business_id, name, duration_minutes, price_cents)
    values (save_service.business_id, save_service.name, save_service.duration_minutes,
            save_service.price_cents)
    returning id into saved_id;
  else
    update public.services s
    set name = save_service.name,
        duration_minutes = save_service.duration_minutes,
        price_cents = save_service.price_cents
    where s.id = save_service.service_id
      and s.business_id = save_service.business_id
    returning s.id into saved_id;

    if saved_id is null then
      raise exception 'not_business_owner';
    end if;
  end if;

  return saved_id;
exception
  when unique_violation then
    raise exception 'duplicate_name';
  -- Rompe un check, falta un dato o la duración no entra en smallint.
  when check_violation or not_null_violation or numeric_value_out_of_range then
    raise exception 'invalid_service';
end;
$$;

grant execute on function public.save_service(uuid, uuid, text, integer, integer)
  to authenticated;
