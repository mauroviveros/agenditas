-- RPC restore_service: desarchiva un servicio (el Deshacer del borrado) con el mismo id.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select has_function('public', 'restore_service', array['uuid', 'uuid'],
  'existe restore_service(business_id, service_id)');
select is_definer('public', 'restore_service', array['uuid', 'uuid'],
  'restore_service es security definer');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.restore_service(uuid, uuid)'::regprocedure),
  'restore_service fija search_path vacío');
select function_privs_are('public', 'restore_service', array['uuid', 'uuid'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar restore_service');
select function_privs_are('public', 'restore_service', array['uuid', 'uuid'],
  'anon', array[]::text[], 'anon no puede ejecutar restore_service');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local');
insert into public.businesses (id, owner_id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Barbería Ana', 'barberia-ana'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Tattoo Beto', 'tattoo-beto');
insert into public.services (id, business_id, name, duration_minutes, price_cents, archived_at) values
  ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Corte', 30, 1500000, now()),
  ('a0000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Barba', 15, 800000, null),
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Tatuaje chico', 60, 3000000, now());

set local role authenticated;

select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_authenticated', 'sin usuario no se restaura nada');

select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select lives_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'Ana restaura su Corte');
select is(
  (select archived_at from public.services where id = 'a0000000-0000-0000-0000-000000000001'),
  null, 'el Corte vuelve con el mismo id y sin archivar');

-- Errores: todos dicen lo mismo, así no se revela qué existe.
select throws_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000002') $$,
  'P0001', 'not_business_owner', 'restaurar uno que no está archivado da error');
select throws_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_business_owner', 'Ana no restaura el servicio de Beto');

-- Si entre el borrado y el Deshacer se creó otro con el mismo nombre, no hay dos iguales.
reset role;
update public.services set archived_at = now()
where id = 'a0000000-0000-0000-0000-000000000001';
insert into public.services (business_id, name, duration_minutes, price_cents)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Corte', 20, 100);
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'duplicate_name', 'no se restaura si ya hay otro servicio con ese nombre');

-- Con 50 activos no se restaura otro.
reset role;
delete from public.services
where business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and name = 'Corte' and archived_at is null;
insert into public.services (business_id, name, duration_minutes, price_cents)
select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Servicio ' || n, 30, 100
from generate_series(1, 49) as n;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.restore_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'service_limit', 'con 50 servicios activos no se restaura otro');

select * from finish();
rollback;
