-- RPC is_slug_available: el formulario pregunta si un link está libre.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select has_function('public', 'is_slug_available', array['text'],
  'existe is_slug_available(slug)');
select is_definer('public', 'is_slug_available', array['text'],
  'is_slug_available es security definer (la RLS no deja ver negocios ajenos)');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.is_slug_available(text)'::regprocedure),
  'is_slug_available fija search_path vacío');
select function_privs_are('public', 'is_slug_available', array['text'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar is_slug_available');
select function_privs_are('public', 'is_slug_available', array['text'],
  'anon', array[]::text[], 'anon no puede ejecutar is_slug_available');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (owner_id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Barbería Ana', 'barberia-ana');

-- Caro todavía no tiene negocio.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);

select is(public.is_slug_available('unas-caro'), true, 'un link libre está disponible');
select is(public.is_slug_available('barberia-ana'), false,
  'el link de otro negocio no está disponible aunque la RLS no deje verlo');
select is(public.is_slug_available(null), false, 'un link nulo no está disponible');
-- Lo que create_business rechazaría tampoco se ofrece como libre.
select is(public.is_slug_available('Tito_X'), false, 'un link con formato inválido no está disponible');
select is(public.is_slug_available('ab'), false, 'un link de menos de 3 caracteres no está disponible');

-- Ana pregunta por su propio link: ya es suyo, no está libre.
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select is(public.is_slug_available('barberia-ana'), false, 'el link propio tampoco está libre');

reset role;
set local role anon;
select throws_ok($$ select public.is_slug_available('lo-que-sea') $$,
  '42501', null, 'anon no puede preguntar por links');

select * from finish();
rollback;
