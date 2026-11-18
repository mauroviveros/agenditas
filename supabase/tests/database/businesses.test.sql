-- Negocios: forma de la tabla, permisos y RLS.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select has_table('public', 'businesses', 'existe la tabla businesses');
select columns_are('public', 'businesses',
  array['id', 'owner_id', 'name', 'slug', 'created_at'],
  'businesses tiene solo las columnas esperadas');

-- Permisos: authenticated solo lee (escribe la RPC del bloque 2); anon, nada.
select table_privs_are('public', 'businesses', 'authenticated', array['SELECT'],
  'authenticated solo puede leer businesses');
select table_privs_are('public', 'businesses', 'anon', array[]::text[],
  'anon no tiene privilegios sobre businesses');

-- Datos de prueba: tres solistas; Ana y Beto ya tienen negocio.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (owner_id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Barbería Ana', 'barberia-ana'),
  ('22222222-2222-2222-2222-222222222222', 'Tattoo Beto', 'tattoo-beto');

-- Restricciones.
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('11111111-1111-1111-1111-111111111111', 'Otro', 'otro-de-ana') $$,
  '23505', null, 'un solista tiene un solo negocio');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', 'Copia', 'barberia-ana') $$,
  '23505', null, 'el slug es único');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', 'Caro', 'Caro_Uñas') $$,
  '23514', null, 'el slug solo admite minúsculas, números y guiones');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', 'Caro', '-caro-') $$,
  '23514', null, 'el slug no empieza ni termina con guion');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', 'Caro', 'ca') $$,
  '23514', null, 'el slug tiene al menos 3 caracteres');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', '  Caro ', 'caro') $$,
  '23514', null, 'el nombre no tiene espacios al principio ni al final');

-- RLS: cada solista ve solo su negocio.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select results_eq(
  $$ select slug from public.businesses $$,
  array['barberia-ana'],
  'Ana ve solo su negocio');
select throws_ok(
  $$ insert into public.businesses (owner_id, name, slug)
     values ('33333333-3333-3333-3333-333333333333', 'Caro', 'caro') $$,
  '42501', null, 'authenticated no inserta directo en la tabla');
select throws_ok(
  $$ update public.businesses set name = 'Robado' $$,
  '42501', null, 'authenticated no modifica directo la tabla');

-- Un usuario sin negocio no ve nada.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select is_empty($$ select 1 from public.businesses $$, 'Caro, sin negocio, no ve ninguno');

select * from finish();
rollback;
