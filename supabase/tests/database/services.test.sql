-- Servicios: forma de la tabla, restricciones, permisos y RLS.
begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

select has_table('public', 'services', 'existe la tabla services');
select columns_are('public', 'services',
  array['id', 'business_id', 'name', 'duration_minutes', 'price_cents', 'created_at',
        'archived_at'],
  'services tiene solo las columnas esperadas');
select col_not_null('public', 'services', 'price_cents', 'el precio es obligatorio');

-- Permisos: authenticated solo lee (escriben las RPC del bloque 2); anon, nada.
select table_privs_are('public', 'services', 'authenticated', array['SELECT'],
  'authenticated solo puede leer services');
select table_privs_are('public', 'services', 'anon', array[]::text[],
  'anon no tiene privilegios sobre services');

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

insert into public.services (business_id, name, duration_minutes, price_cents) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Corte', 30, 1500000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Barba', 15, 800050),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Corte', 60, 3000000);

-- Nombre.
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '', 30, 100) $$,
  '23514', null, 'el nombre no puede estar vacío');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', ' Color ', 30, 100) $$,
  '23514', null, 'el nombre se guarda sin espacios en los bordes');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', E'Color\n', 30, 100) $$,
  '23514', null, 'ni saltos de línea en los bordes');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', repeat('a', 61), 30, 100) $$,
  '23514', null, 'el nombre tiene hasta 60 caracteres');
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', repeat('a', 60), 30, 100) $$,
  'un nombre de 60 caracteres entra');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CORTE', 30, 100) $$,
  '23505', null, 'no hay dos servicios con el mismo nombre en un negocio (sin mayúsculas)');
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barba', 15, 100) $$,
  'dos negocios distintos pueden tener un servicio con el mismo nombre');

-- Duración: de 5 a 480 minutos, en pasos de 5.
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cero', 0, 100) $$,
  '23514', null, 'la duración mínima es 5');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Largo', 485, 100) $$,
  '23514', null, 'la duración máxima es 480');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Raro', 32, 100) $$,
  '23514', null, 'la duración va en pasos de 5');
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Express', 5, 100),
            ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Día completo', 480, 100) $$,
  '5 y 480 minutos entran');

-- Precio: obligatorio, en centavos, de 0 a $10.000.000.
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sin precio', 30, null) $$,
  '23502', null, 'un servicio sin precio se rechaza');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Negativo', 30, -1) $$,
  '23514', null, 'el precio no puede ser negativo');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carísimo', 30, 1000000001) $$,
  '23514', null, 'el precio máximo es $10.000.000');
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consulta', 15, 0),
            ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tope', 30, 1000000000) $$,
  'un servicio sin cargo ($0) y uno de $10.000.000 entran');

select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('99999999-9999-9999-9999-999999999999', 'Huérfano', 30, 100) $$,
  '23503', null, 'un servicio necesita un negocio que exista');

-- RLS: cada solista ve solo sus servicios (Ana tiene 7; Beto, 1).
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select results_eq(
  $$ select count(*)::int from public.services $$,
  array[7],
  'Ana ve solo sus 7 servicios y no el de Beto');
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_cents)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Directo', 30, 100) $$,
  '42501', null, 'authenticated no inserta directo en la tabla');
select throws_ok(
  $$ update public.services set price_cents = 1 $$,
  '42501', null, 'authenticated no modifica directo la tabla');
select throws_ok(
  $$ delete from public.services $$,
  '42501', null, 'authenticated no borra directo de la tabla');

-- Un usuario sin negocio no ve nada.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select is_empty($$ select 1 from public.services $$,
  'Caro, sin negocio, no ve ningún servicio');

-- anon no ve nada (la página pública los va a leer en R5, por otro camino).
reset role;
set local role anon;
select throws_ok($$ select 1 from public.services $$,
  '42501', null, 'anon no lee services');

-- Al borrar el negocio se van sus servicios.
reset role;
delete from public.businesses where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
select is_empty(
  $$ select 1 from public.services
     where business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'al borrar el negocio se borran sus servicios');

select * from finish();
rollback;
