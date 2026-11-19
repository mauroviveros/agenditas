-- Borra un servicio del negocio. Es la única forma de borrar en services (crear y editar
-- van por save_service). El dueño sale del token; que el negocio sea suyo lo decide
-- is_business_owner.
-- Errores (en el mensaje, para que la Server Action los traduzca):
-- not_authenticated, not_business_owner (también si el negocio o el servicio no existen,
-- o el servicio es de otro negocio, para no revelarlo).
-- Los parámetros se llaman como las columnas, así que van siempre como delete_service.x.
-- shortcut: borrado real, sin papelera; en R4, cuando los turnos apunten a servicios, se
-- pasa a archivar y cada turno guarda su copia de nombre, duración y precio.
-- shortcut: sin rate limit; ya está en "Antes de producción" del ROADMAP.
create function public.delete_service(business_id uuid, service_id uuid)
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

  delete from public.services s
  where s.id = delete_service.service_id
    and s.business_id = delete_service.business_id;

  if not found then
    raise exception 'not_business_owner';
  end if;
end;
$$;

grant execute on function public.delete_service(uuid, uuid) to authenticated;
