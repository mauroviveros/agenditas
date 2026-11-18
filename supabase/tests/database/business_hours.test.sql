-- Horarios de atención: forma de la tabla, restricciones, permisos y RLS.
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- is_business_owner: el único lugar donde se decide quién manda en un negocio.
-- Las policies la usan; si algún día hay roles, se cambia solo esta función.
select has_function('public', 'is_business_owner', array['uuid'],
  'existe is_business_owner(business_id)');
select function_privs_are('public', 'is_business_owner', array['uuid'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar is_business_owner');
select function_privs_are('public', 'is_business_owner', array['uuid'],
  'anon', array[]::text[], 'anon no puede ejecutar is_business_owner');

select has_table('public', 'business_hours', 'existe la tabla business_hours');
select columns_are('public', 'business_hours',
  array['id', 'business_id', 'weekday', 'start_time', 'end_time'],
  'business_hours tiene solo las columnas esperadas');

-- Permisos: authenticated solo lee (escribe la RPC del bloque 2); anon, nada.
select table_privs_are('public', 'business_hours', 'authenticated', array['SELECT'],
  'authenticated solo puede leer business_hours');
select table_privs_are('public', 'business_hours', 'anon', array[]::text[],
  'anon no tiene privilegios sobre business_hours');

-- Datos de prueba: Ana y Beto con negocio; Caro sin.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (id, owner_id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Barbería Ana', 'barberia-ana'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Tattoo Beto', 'tattoo-beto');

-- Ana atiende los lunes de 9 a 13 y de 15 a 19 (el almuerzo es el hueco).
insert into public.business_hours (business_id, weekday, start_time, end_time) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '13:00'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '15:00', '19:00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '10:00', '14:00');

-- Restricciones.
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, '09:00', '13:00') $$,
  '23514', null, 'el día va de 1 (lunes) a 7 (domingo): 0 se rechaza');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 8, '09:00', '13:00') $$,
  '23514', null, 'el día va de 1 (lunes) a 7 (domingo): 8 se rechaza');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '13:00', '09:00') $$,
  '23514', null, 'el fin no puede ser antes del inicio');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '09:00') $$,
  '23514', null, 'una franja no puede durar cero');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '12:00', '16:00') $$,
  '23P01', null, 'dos franjas del mismo día no se pisan');
select lives_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '19:00', '20:00') $$,
  'una franja que arranca donde termina otra no se pisa');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('99999999-9999-9999-9999-999999999999', 1, '09:00', '13:00') $$,
  '23503', null, 'una franja necesita un negocio que exista');

-- RLS: cada solista ve solo sus horarios (Ana tiene 3 franjas; Beto, 1).
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select results_eq(
  $$ select count(*)::int from public.business_hours $$,
  array[3],
  'Ana ve solo sus 3 franjas y no la de Beto');
select ok(public.is_business_owner('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'Ana es dueña de su negocio');
select ok(not public.is_business_owner('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  'Ana no es dueña del negocio de Beto');
select throws_ok(
  $$ insert into public.business_hours (business_id, weekday, start_time, end_time)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '13:00') $$,
  '42501', null, 'authenticated no inserta directo en la tabla');
select throws_ok(
  $$ update public.business_hours set end_time = '23:00' $$,
  '42501', null, 'authenticated no modifica directo la tabla');

-- Un usuario sin negocio no ve nada.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select is_empty($$ select 1 from public.business_hours $$,
  'Caro, sin negocio, no ve ninguna franja');
select ok(not public.is_business_owner('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'Caro no es dueña del negocio de Ana');

-- Al borrar el negocio se van sus horarios.
reset role;
delete from public.businesses where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
select is_empty(
  $$ select 1 from public.business_hours
     where business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'al borrar el negocio se borran sus horarios');

select * from finish();
rollback;
