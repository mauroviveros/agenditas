-- ¿Está libre este link? Lo usa el formulario de crear negocio mientras el solista
-- escribe el nombre. Es security definer porque la RLS solo deja ver el negocio propio.
-- Solo responde sí o no: los links van a ser públicos en /reservar/{slug}, así que
-- saber si uno existe no expone nada. La última palabra la tiene create_business.
create function public.is_slug_available(slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  -- Mismo formato y largo que el check de businesses.slug: lo que create_business
  -- rechazaría no se ofrece como libre.
  -- coalesce: con un slug nulo la comparación da null, y la respuesta es "no".
  select coalesce(
    is_slug_available.slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(is_slug_available.slug) between 3 and 40
      and not exists (
        select 1 from public.businesses b where b.slug = is_slug_available.slug
      ),
    false
  );
$$;

grant execute on function public.is_slug_available(text) to authenticated;
