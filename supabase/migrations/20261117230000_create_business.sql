-- Crea el negocio del usuario logueado. Es la única forma de escribir en businesses:
-- el dueño sale del token, nunca de los parámetros.
-- Errores (en el mensaje, para que la Server Action los traduzca):
-- not_authenticated, business_already_exists, slug_taken, invalid_slug, invalid_name.
-- shortcut: sin rate limit; un solo negocio por usuario ya la limita. Revisar si
-- algún día se permite más de un negocio por solista.
create function public.create_business(name text, slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_id uuid;
  violated_constraint text;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.businesses (owner_id, name, slug)
  values (current_user_id, create_business.name, create_business.slug)
  returning id into new_id;

  return new_id;
exception
  when unique_violation or check_violation then
    get stacked diagnostics violated_constraint = constraint_name;
    raise exception '%', case violated_constraint
      when 'businesses_owner_id_key' then 'business_already_exists'
      when 'businesses_slug_key' then 'slug_taken'
      when 'businesses_slug_check' then 'invalid_slug'
      when 'businesses_name_check' then 'invalid_name'
      else 'invalid_business'
    end;
end;
$$;

grant execute on function public.create_business(text, text) to authenticated;
