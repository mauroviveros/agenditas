-- RPC set_business_hours: quién la puede llamar, cómo reemplaza la semana y qué errores devuelve.
begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

select has_function('public', 'set_business_hours', array['uuid', 'jsonb'],
  'existe set_business_hours(business_id, ranges)');
select is_definer('public', 'set_business_hours', array['uuid', 'jsonb'],
  'set_business_hours es security definer');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.set_business_hours(uuid, jsonb)'::regprocedure),
  'set_business_hours fija search_path vacío');
select function_privs_are('public', 'set_business_hours', array['uuid', 'jsonb'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar set_business_hours');
select function_privs_are('public', 'set_business_hours', array['uuid', 'jsonb'],
  'anon', array[]::text[], 'anon no puede ejecutar set_business_hours');

-- Ana y Beto tienen negocio; Caro no. Beto ya tiene una franja.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (id, owner_id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Barbería Ana', 'barberia-ana'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Tattoo Beto', 'tattoo-beto');
insert into public.business_hours (business_id, weekday, start_time, end_time) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '10:00', '14:00');

set local role authenticated;

-- Sin usuario en el token.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '[]') $$,
  'P0001', 'not_authenticated', 'sin usuario no se guarda nada');

-- Ana carga su semana: lunes partido (el almuerzo es el hueco) y martes corrido.
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select lives_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 1, "start_time": "09:00", "end_time": "13:00"},
    {"weekday": 1, "start_time": "15:00", "end_time": "19:00"},
    {"weekday": 2, "start_time": "09:00", "end_time": "13:00"}]') $$,
  'Ana carga su semana');
select results_eq(
  $$ select weekday::int, start_time::text, end_time::text
     from public.business_hours order by weekday, start_time $$,
  $$ values (1, '09:00:00', '13:00:00'), (1, '15:00:00', '19:00:00'),
            (2, '09:00:00', '13:00:00') $$,
  'quedan las tres franjas');

-- Volver a guardar reemplaza la semana entera, no suma.
select lives_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 3, "start_time": "10:00", "end_time": "14:00"}]') $$,
  'Ana vuelve a guardar');
select results_eq(
  $$ select weekday::int, start_time::text, end_time::text from public.business_hours $$,
  $$ values (3, '10:00:00', '14:00:00') $$,
  'la semana anterior se reemplazó');

-- Datos inválidos: cada uno con su código.
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 1, "start_time": "13:00", "end_time": "09:00"}]') $$,
  'P0001', 'invalid_range', 'el fin antes del inicio se rechaza');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 8, "start_time": "09:00", "end_time": "13:00"}]') $$,
  'P0001', 'invalid_range', 'un día fuera de 1 a 7 se rechaza');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 1, "start_time": "09:00", "end_time": "13:00"},
    {"weekday": 1, "start_time": "12:00", "end_time": "16:00"}]') $$,
  'P0001', 'overlap', 'dos franjas que se pisan se rechazan');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '{"weekday": 1}') $$,
  'P0001', 'invalid_ranges', 'algo que no es una lista se rechaza');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 1, "start_time": "09:00"}]') $$,
  'P0001', 'invalid_ranges', 'una franja sin fin se rechaza');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": 1, "start_time": "25:00", "end_time": "26:00"}]') $$,
  'P0001', 'invalid_ranges', 'una hora que no existe se rechaza');
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[{"weekday": "lunes", "start_time": "09:00", "end_time": "13:00"}]') $$,
  'P0001', 'invalid_ranges', 'un día que no es número se rechaza');
select results_eq(
  $$ select weekday::int, start_time::text, end_time::text from public.business_hours $$,
  $$ values (3, '10:00:00', '14:00:00') $$,
  'tras los errores la semana de Ana sigue intacta');

-- El negocio tiene que ser del usuario; no se distingue "ajeno" de "no existe".
select throws_ok($$ select public.set_business_hours('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '[{"weekday": 5, "start_time": "09:00", "end_time": "13:00"}]') $$,
  'P0001', 'not_business_owner', 'Ana no escribe en el negocio de Beto');
select throws_ok($$ select public.set_business_hours('99999999-9999-9999-9999-999999999999',
  '[]') $$,
  'P0001', 'not_business_owner', 'un negocio que no existe se trata como ajeno');

-- Una lista vacía deja la semana sin horarios.
select lives_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[]') $$, 'Ana guarda una semana vacía');
select is_empty($$ select 1 from public.business_hours $$,
  'la semana de Ana quedó sin franjas');

-- Caro no tiene negocio.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[]') $$,
  'P0001', 'not_business_owner', 'Caro no escribe en el negocio de Ana');

-- Lo de Beto no se tocó.
reset role;
select results_eq(
  $$ select weekday::int, start_time::text from public.business_hours $$,
  $$ values (1, '10:00:00') $$,
  'la franja de Beto sigue igual');

-- anon no llega ni a ejecutarla.
set local role anon;
select throws_ok($$ select public.set_business_hours('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[]') $$,
  '42501', null, 'anon no puede llamar a set_business_hours');

select * from finish();
rollback;
