-- RPC delete_service: quién la puede llamar, qué borra y qué errores devuelve.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select has_function('public', 'delete_service', array['uuid', 'uuid'],
  'existe delete_service(business_id, service_id)');
select is_definer('public', 'delete_service', array['uuid', 'uuid'],
  'delete_service es security definer');
select ok(
  (select 'search_path=""' = any(proconfig) from pg_proc
   where oid = 'public.delete_service(uuid, uuid)'::regprocedure),
  'delete_service fija search_path vacío');
select function_privs_are('public', 'delete_service', array['uuid', 'uuid'],
  'authenticated', array['EXECUTE'], 'authenticated puede ejecutar delete_service');
select function_privs_are('public', 'delete_service', array['uuid', 'uuid'],
  'anon', array[]::text[], 'anon no puede ejecutar delete_service');

-- Ana tiene dos servicios, Beto uno; Caro no tiene negocio.
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
  ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Corte', 30, 1500000),
  ('a0000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Barba', 15, 800000),
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Tatuaje chico', 60, 3000000);

set local role authenticated;

-- Sin usuario en el token.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_authenticated', 'sin usuario no se borra nada');

-- Ana borra uno de los suyos.
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select lives_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'Ana borra su Corte');
select results_eq(
  $$ select name from public.services $$,
  $$ values ('Barba') $$,
  'a Ana le queda solo la Barba');

-- Errores: todos dicen lo mismo, así no se revela qué existe.
select throws_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_business_owner', 'borrar uno que ya no existe da error');
select throws_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_business_owner', 'Ana no borra el servicio de Beto (con su propio negocio)');
select throws_ok(
  $$ select public.delete_service('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
       'b0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_business_owner', 'Ana no borra con el negocio de Beto');
select throws_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null) $$,
  'P0001', 'not_business_owner', 'sin servicio no se borra nada');

-- Caro, sin negocio, tampoco puede.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.delete_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000002') $$,
  'P0001', 'not_business_owner', 'Caro no borra servicios del negocio de Ana');

-- Después de todo eso, quedan la Barba de Ana y el servicio de Beto.
reset role;
select results_eq(
  -- Solo los negocios de este test: la base local puede traer servicios de otras pruebas.
  $$ select name from public.services
     where business_id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
     order by name $$,
  $$ values ('Barba'), ('Tatuaje chico') $$,
  'solo se borró el Corte de Ana');

select * from finish();
rollback;
