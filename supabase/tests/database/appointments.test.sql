-- Turnos: forma de la tabla, restricciones, no-superposición, permisos y RLS.
begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

select has_table('public', 'appointments', 'existe la tabla appointments');
select columns_are('public', 'appointments',
  array['id', 'business_id', 'service_id', 'service_name', 'service_duration_minutes',
        'service_price_cents', 'client_name', 'client_phone', 'starts_at', 'ends_at',
        'status', 'created_at'],
  'appointments tiene solo las columnas esperadas');
select col_not_null('public', 'appointments', 'service_name',
  'el turno guarda su copia del nombre del servicio');

-- Permisos: authenticated solo lee (escriben las RPC del bloque 4); anon, nada.
select table_privs_are('public', 'appointments', 'authenticated', array['SELECT'],
  'authenticated solo puede leer appointments');
select table_privs_are('public', 'appointments', 'anon', array[]::text[],
  'anon no tiene privilegios sobre appointments');

-- Ana y Beto con negocio; Caro sin. Cada uno con un servicio.
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
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Tatuaje chico', 60, 3000000);

-- Un turno de Ana el 2027-03-01 de 10:00 a 10:30 (hora de Buenos Aires, UTC-3).
insert into public.appointments (business_id, service_id, service_name,
  service_duration_minutes, service_price_cents, client_name, client_phone, starts_at, ends_at)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
  'Corte', 30, 1500000, 'Lucía', '+54 9 11 5555-1234',
  '2027-03-01 10:00-03', '2027-03-01 10:30-03');

select is(
  (select status::text from public.appointments), 'confirmed',
  'un turno nuevo nace confirmado');

-- Cliente.
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, '', '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  '23514', null, 'el nombre del cliente no puede estar vacío');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, ' Lucía ', '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  '23514', null, 'el nombre del cliente se guarda sin espacios en los bordes');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, repeat('a', 81), '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  '23514', null, 'el nombre del cliente tiene hasta 80 caracteres');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, client_phone, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Lucía', '', '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  '23514', null, 'el teléfono, si hay, no puede estar vacío');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, client_phone, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Lucía', repeat('1', 31), '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  '23514', null, 'el teléfono tiene hasta 30 caracteres');
select lives_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Sin teléfono', '2027-03-02 10:00-03', '2027-03-02 10:30-03') $$,
  'el teléfono es opcional');

-- Copia del servicio: mismas reglas que la tabla services.
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       '', 30, 100, 'Lucía', '2027-03-03 10:00-03', '2027-03-03 10:30-03') $$,
  '23514', null, 'la copia del nombre del servicio no puede estar vacía');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 32, 100, 'Lucía', '2027-03-03 10:00-03', '2027-03-03 10:30-03') $$,
  '23514', null, 'la duración copiada va en pasos de 5');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, -1, 'Lucía', '2027-03-03 10:00-03', '2027-03-03 10:30-03') $$,
  '23514', null, 'el precio copiado no puede ser negativo');

-- Horario: termina después de empezar.
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Lucía', '2027-03-04 10:00-03', '2027-03-04 10:00-03') $$,
  '23514', null, 'un turno no puede durar cero');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Lucía', '2027-03-04 10:30-03', '2027-03-04 10:00-03') $$,
  '23514', null, 'un turno no puede terminar antes de empezar');

-- Relaciones: negocio y servicio tienen que existir.
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('99999999-9999-9999-9999-999999999999', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Lucía', '2027-03-05 10:00-03', '2027-03-05 10:30-03') $$,
  '23503', null, 'un turno necesita un negocio que exista');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999',
       'Corte', 30, 100, 'Lucía', '2027-03-05 10:00-03', '2027-03-05 10:30-03') $$,
  '23503', null, 'un turno necesita un servicio que exista');

-- Cero superposiciones: dos turnos confirmados del mismo negocio no se pisan.
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Pisa', '2027-03-01 10:15-03', '2027-03-01 10:45-03') $$,
  '23P01', null, 'un turno que pisa a otro se rechaza');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Adentro', '2027-03-01 10:05-03', '2027-03-01 10:10-03') $$,
  '23P01', null, 'un turno metido adentro de otro se rechaza');
select lives_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Pegado', '2027-03-01 10:30-03', '2027-03-01 11:00-03') $$,
  'un turno puede arrancar justo donde termina otro');
select lives_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000000-0000-0000-0000-000000000001',
       'Tatuaje chico', 60, 100, 'Otro negocio', '2027-03-01 10:00-03', '2027-03-01 11:00-03') $$,
  'dos negocios distintos pueden tener turnos a la misma hora');

-- Un turno cancelado libera el horario.
update public.appointments set status = 'cancelled' where client_name = 'Lucía';
select lives_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Reemplazo', '2027-03-01 10:00-03', '2027-03-01 10:30-03') $$,
  'el horario de un turno cancelado queda libre');
select throws_ok(
  $$ update public.appointments set status = 'confirmed' where client_name = 'Lucía' $$,
  '23P01', null, 'no se puede reconfirmar un turno si su horario se ocupó');

-- RLS: cada solista ve solo sus turnos (Ana tiene 4; Beto, 1).
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select results_eq(
  $$ select count(*)::int from public.appointments $$,
  array[4],
  'Ana ve solo sus 4 turnos y no el de Beto');
select throws_ok(
  $$ insert into public.appointments (business_id, service_id, service_name,
       service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000000-0000-0000-0000-000000000001',
       'Corte', 30, 100, 'Directo', '2027-03-09 10:00-03', '2027-03-09 10:30-03') $$,
  '42501', null, 'authenticated no inserta directo en la tabla');
select throws_ok(
  $$ update public.appointments set client_name = 'X' $$,
  '42501', null, 'authenticated no modifica directo la tabla');

-- Un usuario sin negocio no ve nada.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select is_empty($$ select 1 from public.appointments $$,
  'Caro, sin negocio, no ve ningún turno');

-- anon no ve nada.
reset role;
set local role anon;
select throws_ok($$ select 1 from public.appointments $$,
  '42501', null, 'anon no puede leer appointments');

select * from finish();
rollback;
