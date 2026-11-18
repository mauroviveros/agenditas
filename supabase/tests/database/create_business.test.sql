-- RPC create_business: quién la puede llamar y qué errores devuelve.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

select has_function('public', 'create_business', array['text', 'text'],
  'existe create_business(name, slug)');
select is_definer('public', 'create_business', array['text', 'text'],
  'create_business es security definer');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.create_business(text, text)'::regprocedure),
  'create_business fija search_path vacío');
select function_privs_are('public', 'create_business', array['text', 'text'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar create_business');
select function_privs_are('public', 'create_business', array['text', 'text'],
  'anon', array[]::text[], 'anon no puede ejecutar create_business');

-- Ana ya tiene negocio; Caro y Dani todavía no.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local'),
  ('44444444-4444-4444-4444-444444444444', 'dani@test.local');
insert into public.businesses (owner_id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Barbería Ana', 'barberia-ana');

set local role authenticated;

-- Sin usuario en el token.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok($$ select public.create_business('Sin dueño', 'sin-duenio') $$,
  'P0001', 'not_authenticated', 'sin usuario no se crea nada');

-- Caro crea el suyo: queda a su nombre aunque no lo pase.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select lives_ok($$ select public.create_business('Uñas Caro', 'unas-caro') $$,
  'Caro crea su negocio');
select results_eq(
  $$ select owner_id::text, name, slug from public.businesses $$,
  $$ values ('33333333-3333-3333-3333-333333333333', 'Uñas Caro', 'unas-caro') $$,
  'el negocio queda a nombre de Caro y ella lo ve');
select throws_ok($$ select public.create_business('Otro de Caro', 'otro-caro') $$,
  'P0001', 'business_already_exists', 'un segundo negocio se rechaza');

-- Dani prueba un slug ocupado y datos inválidos.
select set_config('request.jwt.claims',
  '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}', true);
select throws_ok($$ select public.create_business('Barbería Dani', 'barberia-ana') $$,
  'P0001', 'slug_taken', 'un slug ocupado se rechaza');
select throws_ok($$ select public.create_business('Dani', 'Dani_Tattoo') $$,
  'P0001', 'invalid_slug', 'un slug con formato inválido se rechaza');
select throws_ok($$ select public.create_business(' ', 'dani-tattoo') $$,
  'P0001', 'invalid_name', 'un nombre inválido se rechaza');

-- anon no llega ni a ejecutarla.
reset role;
set local role anon;
select throws_ok($$ select public.create_business('Anon', 'anon-negocio') $$,
  '42501', null, 'anon no puede llamar a create_business');

select * from finish();
rollback;
