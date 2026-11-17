-- R1: negocios y membresías. Un usuario tiene un solo negocio en el MVP (solista).
-- Crear solo por RPC: no hay INSERT para ningún rol de la Data API.

-- Reglas del slug en un solo lugar: las usan el CHECK y las RPC.
-- Minúsculas, números y guiones sueltos; 3 a 40 caracteres; sin reservados.
create function public.is_valid_slug(p_slug text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(p_slug) between 3 and 40
    and p_slug <> all (array[
      'www', 'panel', 'api', 'app', 'admin', 's', 'static', 'assets', 'cdn',
      'mail', 'blog', 'status', 'login', 'ingresar', 'soporte', 'ayuda',
      'precios', 'agenditas'
    ]),
    false
  )
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  category text not null check (char_length(btrim(category)) between 1 and 60),
  slug text not null unique check (public.is_valid_slug(slug)),
  -- Lo completa la rebanada de publicar (R3). Desde ahí el slug queda fijo.
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.memberships (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id),
  -- shortcut: un negocio por usuario (MVP solista), sacarlo cuando haya equipo.
  unique (user_id)
);

alter table public.businesses enable row level security;
alter table public.memberships enable row level security;

create policy businesses_select_member on public.businesses
  for select to authenticated
  using (id in (
    select business_id from public.memberships
    where user_id = (select auth.uid())
  ));

create policy businesses_update_owner on public.businesses
  for update to authenticated
  using (id in (
    select business_id from public.memberships
    where user_id = (select auth.uid()) and role = 'owner'
  ));

create policy memberships_select_own on public.memberships
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Sin INSERT ni DELETE: el alta es la RPC. `published_at` lo toca solo el servidor.
grant select on public.businesses to authenticated;
grant update (name, category, slug) on public.businesses to authenticated;
grant select on public.memberships to authenticated;

-- El slug no cambia después de publicar.
create function public.businesses_lock_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.published_at is not null and new.slug is distinct from old.slug then
    raise exception 'slug_locked';
  end if;
  return new;
end
$$;

create trigger businesses_lock_slug
  before update on public.businesses
  for each row execute function public.businesses_lock_slug();

-- Alta atómica: negocio + membresía de dueño en una sola transacción. Los errores
-- llevan una clave estable en el mensaje para que la vista elija el texto.
create function public.create_business(p_name text, p_category text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_name text := btrim(coalesce(p_name, ''));
  v_category text := btrim(coalesce(p_category, ''));
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_id uuid;
  v_constraint text;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if char_length(v_name) not between 1 and 80 then
    raise exception 'name_invalid';
  end if;
  if char_length(v_category) not between 1 and 60 then
    raise exception 'category_invalid';
  end if;
  if not public.is_valid_slug(v_slug) then
    raise exception 'slug_invalid';
  end if;
  if exists (select 1 from public.memberships where user_id = v_user) then
    raise exception 'business_already_exists';
  end if;

  insert into public.businesses (name, category, slug)
  values (v_name, v_category, v_slug)
  returning id into v_id;

  insert into public.memberships (business_id, user_id, role)
  values (v_id, v_user, 'owner');

  return v_id;
exception
  -- Carreras: un doble envío o el mismo slug en simultáneo.
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'memberships_user_id_key' then
      raise exception 'business_already_exists';
    end if;
    raise exception 'slug_taken';
end
$$;

-- Disponibilidad en vivo para el alta. Dice lo mismo que ya es público (el slug
-- ocupado), así que alcanza con `authenticated`.
create function public.slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_valid_slug(lower(btrim(coalesce(p_slug, ''))))
    and not exists (
      select 1 from public.businesses
      where slug = lower(btrim(coalesce(p_slug, '')))
    )
$$;

-- Los CHECK de la tabla la evalúan con el rol que escribe, así que necesita EXECUTE.
-- Es pura (solo mira el texto), no expone nada.
grant execute on function public.is_valid_slug(text) to authenticated;
grant execute on function public.create_business(text, text, text) to authenticated;
grant execute on function public.slug_available(text) to authenticated;
