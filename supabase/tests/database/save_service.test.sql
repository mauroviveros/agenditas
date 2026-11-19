-- RPC save_service: quién la puede llamar, cómo crea y edita, el tope y qué errores devuelve.
begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

select has_function('public', 'save_service',
  array['uuid', 'uuid', 'text', 'integer', 'integer'],
  'existe save_service(business_id, service_id, name, duration_minutes, price_cents)');
select is_definer('public', 'save_service',
  array['uuid', 'uuid', 'text', 'integer', 'integer'],
  'save_service es security definer');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.save_service(uuid, uuid, text, integer, integer)'::regprocedure),
  'save_service fija search_path vacío');
select function_privs_are('public', 'save_service',
  array['uuid', 'uuid', 'text', 'integer', 'integer'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar save_service');
select function_privs_are('public', 'save_service',
  array['uuid', 'uuid', 'text', 'integer', 'integer'],
  'anon', array[]::text[], 'anon no puede ejecutar save_service');

-- Ana y Beto tienen negocio; Caro no. Beto ya tiene un servicio.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (id, owner_id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Barbería Ana', 'barberia-ana'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Tattoo Beto', 'tattoo-beto');
insert into public.services (id, business_id, name, duration_minutes, price_cents) values
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Tatuaje chico', 60, 3000000);

set local role authenticated;

-- Sin usuario en el token.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Corte', 30, 100) $$,
  'P0001', 'not_authenticated', 'sin usuario no se guarda nada');

-- Ana crea un servicio.
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select isnt(
  public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Corte', 30, 1500000),
  null, 'crear devuelve el id del servicio');
select results_eq(
  $$ select name, duration_minutes::int, price_cents from public.services $$,
  $$ values ('Corte', 30, 1500000) $$,
  'Ana tiene su Corte de 30 minutos a $15.000');

-- Ana lo edita: cambian los tres valores, no se crea otro.
select lives_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.services where name = 'Corte'), 'Corte largo', 45, 2000050) $$,
  'Ana edita su servicio');
select results_eq(
  $$ select name, duration_minutes::int, price_cents from public.services $$,
  $$ values ('Corte largo', 45, 2000050) $$,
  'editar cambia nombre, duración y precio sin crear otro');

-- Errores de los datos.
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'CORTE LARGO', 30, 100) $$,
  'P0001', 'duplicate_name', 'un nombre repetido (sin mayúsculas) se rechaza');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Raro', 32, 100) $$,
  'P0001', 'invalid_service', 'una duración fuera de los pasos de 5 se rechaza');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Larguísimo', 40000, 100) $$,
  'P0001', 'invalid_service', 'una duración que no entra en smallint se rechaza igual');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, ' Barba ', 15, 100) $$,
  'P0001', 'invalid_service', 'un nombre con espacios en los bordes se rechaza');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Barba', 15, null) $$,
  'P0001', 'invalid_service', 'un servicio sin precio se rechaza');

-- Ana no toca lo de Beto, y no se entera de si existe.
select throws_ok(
  $$ select public.save_service('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, 'Intruso', 30, 100) $$,
  'P0001', 'not_business_owner', 'Ana no crea servicios en el negocio de Beto');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b0000000-0000-0000-0000-000000000001', 'Robado', 30, 1) $$,
  'P0001', 'not_business_owner', 'Ana no edita (ni se lleva) el servicio de Beto');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       '99999999-9999-9999-9999-999999999999', 'Fantasma', 30, 1) $$,
  'P0001', 'not_business_owner', 'un servicio que no existe da el mismo error');

-- Caro, sin negocio, tampoco puede.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Corte', 30, 100) $$,
  'P0001', 'not_business_owner', 'Caro no crea servicios en el negocio de Ana');

-- Tope: con 50 servicios no se crea el 51, pero se puede seguir editando.
reset role;
insert into public.services (business_id, name, duration_minutes, price_cents)
select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Servicio ' || n, 30, 100
from generate_series(1, 49) as n;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'El 51', 30, 100) $$,
  'P0001', 'service_limit', 'con 50 servicios no se crea el 51');
select lives_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.services where name = 'Corte largo'), 'Corte largo', 45, 1) $$,
  'con 50 servicios se puede editar uno');

-- Editar también pasa por las reglas de la tabla.
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.services where name = 'Corte largo'), 'servicio 1', 45, 1) $$,
  'P0001', 'duplicate_name', 'renombrar a un nombre que ya existe se rechaza');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.services where name = 'Corte largo'), 'Corte largo', 7, 1) $$,
  'P0001', 'invalid_service', 'editar con una duración inválida se rechaza');
select throws_ok(
  $$ select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.services where name = 'Corte largo'), null, 45, 1) $$,
  'P0001', 'invalid_service', 'editar sin nombre se rechaza');
select throws_ok(
  $$ select public.save_service(null, null, 'Sin negocio', 30, 100) $$,
  'P0001', 'not_business_owner', 'sin negocio no se guarda nada');

-- El servicio de Beto quedó como estaba.
reset role;
select results_eq(
  $$ select business_id, name, price_cents from public.services
     where id = 'b0000000-0000-0000-0000-000000000001' $$,
  $$ values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Tatuaje chico', 3000000) $$,
  'el servicio de Beto no cambió');
select results_eq(
  $$ select count(*)::int from public.services
     where business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  array[50], 'Ana terminó con 50 servicios');

select * from finish();
rollback;
