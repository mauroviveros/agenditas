-- Servicios archivables (R4): con turnos apuntando a servicios ya no se puede borrar de
-- verdad. delete_service archiva (archived_at) y restore_service lo desarchiva, con el mismo
-- id: es el Deshacer. Un archivado no se ve en la lista, no cuenta para el tope de 50, no se
-- edita y libera su nombre.
alter table public.services add column archived_at timestamptz;

-- Un nombre por negocio entre los activos, sin distinguir mayúsculas.
drop index public.services_name_unique;
create unique index services_name_unique
  on public.services (business_id, lower(name))
  where archived_at is null;

-- save_service: igual que antes, pero el tope cuenta solo los activos y no edita archivados.
create or replace function public.save_service(
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
        where s.business_id = save_service.business_id
          and s.archived_at is null) >= max_services then
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
      and s.archived_at is null
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

-- Archiva un servicio del negocio (no lo borra). Errores: not_authenticated,
-- not_business_owner (también si no existe, es de otro negocio o ya está archivado, para no
-- revelarlo). Los parámetros van siempre como delete_service.x.
-- shortcut: sin rate limit; ya está en "Antes de producción" del ROADMAP.
create or replace function public.delete_service(business_id uuid, service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(delete_service.business_id) then
    raise exception 'not_business_owner';
  end if;

  update public.services s
  set archived_at = now()
  where s.id = delete_service.service_id
    and s.business_id = delete_service.business_id
    and s.archived_at is null;

  if not found then
    raise exception 'not_business_owner';
  end if;
end;
$$;

-- Desarchiva un servicio (el Deshacer de borrar). Errores: not_authenticated,
-- not_business_owner (no existe, es de otro negocio o no está archivado), duplicate_name
-- (mientras tanto se creó otro activo con ese nombre), service_limit (ya hay 50 activos).
-- Los parámetros van siempre como restore_service.x.
create function public.restore_service(business_id uuid, service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_services constant int := 50;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_business_owner(restore_service.business_id) then
    raise exception 'not_business_owner';
  end if;

  -- Igual que save_service: serializa contra otro guardado del mismo negocio.
  perform 1 from public.businesses b
  where b.id = restore_service.business_id
  for update;

  if (select count(*) from public.services s
      where s.business_id = restore_service.business_id
        and s.archived_at is null) >= max_services then
    raise exception 'service_limit';
  end if;

  update public.services s
  set archived_at = null
  where s.id = restore_service.service_id
    and s.business_id = restore_service.business_id
    and s.archived_at is not null;

  if not found then
    raise exception 'not_business_owner';
  end if;
exception
  when unique_violation then
    raise exception 'duplicate_name';
end;
$$;

grant execute on function public.restore_service(uuid, uuid) to authenticated;
