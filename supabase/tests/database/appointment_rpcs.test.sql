-- RPC de turnos: crear, mover, cancelar, restaurar y bloquear horario («salgo N min»).
begin;
create extension if not exists pgtap with schema extensions;
select plan(41);

select has_function('public', 'create_appointment', array['uuid', 'uuid', 'text', 'text', 'timestamp with time zone'],
  'existe create_appointment(business_id, service_id, client_name, client_phone, starts_at)');
select has_function('public', 'move_appointment', array['uuid', 'uuid', 'timestamp with time zone'],
  'existe move_appointment(business_id, appointment_id, starts_at)');
select has_function('public', 'cancel_appointment', array['uuid', 'uuid'],
  'existe cancel_appointment(business_id, appointment_id)');
select has_function('public', 'restore_appointment', array['uuid', 'uuid'],
  'existe restore_appointment(business_id, appointment_id)');
select has_function('public', 'block_time', array['uuid', 'timestamp with time zone', 'integer'],
  'existe block_time(business_id, starts_at, minutes)');

-- Las cinco son security definer con search_path vacío, y solo authenticated las ejecuta.
select results_eq(
  $$ select count(*)::int from pg_proc
     where pronamespace = 'public'::regnamespace
       and proname in ('create_appointment', 'move_appointment', 'cancel_appointment',
                       'restore_appointment', 'block_time')
       and prosecdef and 'search_path=""' = any(proconfig) $$,
  array[5], 'las cinco RPC son security definer con search_path vacío');
select results_eq(
  $$ select count(*)::int from pg_proc
     where pronamespace = 'public'::regnamespace
       and proname in ('create_appointment', 'move_appointment', 'cancel_appointment',
                       'restore_appointment', 'block_time')
       and has_function_privilege('authenticated', oid, 'execute') $$,
  array[5], 'authenticated puede ejecutar las cinco');
select results_eq(
  $$ select count(*)::int from pg_proc
     where pronamespace = 'public'::regnamespace
       and proname in ('create_appointment', 'move_appointment', 'cancel_appointment',
                       'restore_appointment', 'block_time')
       and (has_function_privilege('anon', oid, 'execute')
            or has_function_privilege('public', oid, 'execute')) $$,
  array[0], 'anon no puede ejecutar ninguna');

-- Ana y Beto con negocio; Caro sin. Ana tiene Corte (30 min) y un servicio archivado.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'caro@test.local');
insert into public.businesses (id, owner_id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Barbería Ana', 'barberia-ana'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Tattoo Beto', 'tattoo-beto');
insert into public.services (id, business_id, name, duration_minutes, price_cents, archived_at) values
  ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Corte', 30, 1500000, null),
  ('a0000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Viejo', 30, 100, now()),
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Tatuaje chico', 60, 3000000, null);
-- Un turno de Beto, para probar que Ana no lo toca.
insert into public.appointments (id, business_id, service_id, service_name,
  service_duration_minutes, service_price_cents, client_name, starts_at, ends_at)
values ('b1000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'b0000000-0000-0000-0000-000000000001', 'Tatuaje chico', 60, 3000000, 'Cliente de Beto',
  '2027-03-01 10:00-03', '2027-03-01 11:00-03');

set local role authenticated;

-- Crear.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', 'Lucía', null, '2027-03-01 10:00-03') $$,
  'P0001', 'not_authenticated', 'sin usuario no se crea nada');

select set_config('request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select isnt(
  public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000001', 'Lucía', '+54 9 11 5555-1234',
    '2027-03-01 10:00-03'),
  null, 'crear devuelve el id del turno');
select results_eq(
  $$ select kind::text, status::text, service_name, service_duration_minutes::int,
            service_price_cents, client_name, client_phone, ends_at - starts_at
     from public.appointments where client_name = 'Lucía' $$,
  $$ values ('appointment', 'confirmed', 'Corte', 30, 1500000, 'Lucía',
             '+54 9 11 5555-1234', interval '30 minutes') $$,
  'el turno copia el servicio y dura lo que dura el servicio');

-- Si el servicio cambia después, el turno ya agendado no.
select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a0000000-0000-0000-0000-000000000001', 'Corte premium', 45, 2000000);
select results_eq(
  $$ select service_name, service_duration_minutes::int, service_price_cents
     from public.appointments where client_name = 'Lucía' $$,
  $$ values ('Corte', 30, 1500000) $$,
  'editar el servicio no cambia un turno ya agendado');
select public.save_service('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a0000000-0000-0000-0000-000000000001', 'Corte', 30, 1500000);

select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', 'Pisa', null, '2027-03-01 10:15-03') $$,
  'P0001', 'overlap', 'un turno que pisa a otro da overlap');
select lives_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', 'Pegado', null, '2027-03-01 10:30-03') $$,
  'un turno puede arrancar donde termina otro');
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000002', 'Viejo', null, '2027-03-02 10:00-03') $$,
  'P0001', 'not_business_owner', 'un servicio archivado no se agenda');
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b0000000-0000-0000-0000-000000000001', 'Ajeno', null, '2027-03-02 10:00-03') $$,
  'P0001', 'not_business_owner', 'Ana no agenda con el servicio de Beto');
select throws_ok(
  $$ select public.create_appointment('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
       'b0000000-0000-0000-0000-000000000001', 'Intruso', null, '2027-03-02 10:00-03') $$,
  'P0001', 'not_business_owner', 'Ana no agenda en el negocio de Beto');
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', '', null, '2027-03-02 10:00-03') $$,
  'P0001', 'invalid_appointment', 'un cliente sin nombre se rechaza');
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', null, null, '2027-03-02 10:00-03') $$,
  'P0001', 'invalid_appointment', 'un cliente null se rechaza');
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', 'Sin hora', null, null) $$,
  'P0001', 'invalid_appointment', 'un turno sin hora se rechaza');

-- Mover: conserva la duración.
select lives_ok(
  $$ select public.move_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía'), '2027-03-01 14:00-03') $$,
  'Ana mueve su turno a un horario libre');
select results_eq(
  $$ select starts_at, ends_at from public.appointments where client_name = 'Lucía' $$,
  $$ values ('2027-03-01 14:00-03'::timestamptz, '2027-03-01 14:30-03'::timestamptz) $$,
  'al mover, el turno conserva su duración');
select throws_ok(
  $$ select public.move_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía'), '2027-03-01 10:15-03') $$,
  'P0001', 'overlap', 'mover encima de otro turno da overlap');
select lives_ok(
  $$ select public.move_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía'), '2027-03-01 14:10-03') $$,
  'un turno se puede correr 10 minutos aunque pise su propio horario anterior');
select throws_ok(
  $$ select public.move_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b1000000-0000-0000-0000-000000000001', '2027-03-05 10:00-03') $$,
  'P0001', 'not_business_owner', 'Ana no mueve el turno de Beto');

-- Cancelar y restaurar (el Deshacer).
select lives_ok(
  $$ select public.cancel_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía')) $$,
  'Ana cancela su turno');
select results_eq(
  $$ select status::text from public.appointments where client_name = 'Lucía' $$,
  array['cancelled'], 'el turno quedó cancelado, no borrado');
select throws_ok(
  $$ select public.cancel_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía')) $$,
  'P0001', 'not_business_owner', 'cancelar uno ya cancelado da error');
select throws_ok(
  $$ select public.move_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía'), '2027-03-06 10:00-03') $$,
  'P0001', 'not_business_owner', 'un turno cancelado no se mueve');
select throws_ok(
  $$ select public.cancel_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'b1000000-0000-0000-0000-000000000001') $$,
  'P0001', 'not_business_owner', 'Ana no cancela el turno de Beto');
select lives_ok(
  $$ select public.restore_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía')) $$,
  'Ana restaura (deshace) la cancelación');
select throws_ok(
  $$ select public.restore_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía')) $$,
  'P0001', 'not_business_owner', 'restaurar uno que no está cancelado da error');
select public.cancel_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (select id from public.appointments where client_name = 'Lucía'));
select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a0000000-0000-0000-0000-000000000001', 'Ocupa el hueco', null, '2027-03-01 14:10-03');
select throws_ok(
  $$ select public.restore_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       (select id from public.appointments where client_name = 'Lucía')) $$,
  'P0001', 'overlap', 'no se restaura si el horario se ocupó mientras tanto');

-- Salgo N min.
select isnt(
  public.block_time('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2027-03-08 12:00-03', 30),
  null, 'bloquear devuelve el id del bloqueo');
select results_eq(
  $$ select kind::text, ends_at - starts_at from public.appointments where kind = 'block' $$,
  $$ values ('block', interval '30 minutes') $$,
  'el bloqueo dura lo pedido y no lleva servicio ni cliente');
select throws_ok(
  $$ select public.block_time('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2027-03-01 10:15-03', 30) $$,
  'P0001', 'overlap', 'un bloqueo que pisa un turno da overlap y no se crea');
select throws_ok(
  $$ select public.block_time('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2027-03-09 12:00-03', 0) $$,
  'P0001', 'invalid_appointment', 'un bloqueo de 0 minutos se rechaza');
select throws_ok(
  $$ select public.block_time('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2027-03-09 12:00-03', 481) $$,
  'P0001', 'invalid_appointment', 'un bloqueo de más de 480 minutos se rechaza');
select throws_ok(
  $$ select public.block_time('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '294276-12-31 23:50+00', 30) $$,
  'P0001', 'invalid_appointment', 'una fecha en el límite del calendario se rechaza');
select throws_ok(
  $$ select public.block_time('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2027-03-09 12:00-03', 30) $$,
  'P0001', 'not_business_owner', 'Ana no bloquea horario en el negocio de Beto');

-- Caro, sin negocio, tampoco puede.
select set_config('request.jwt.claims',
  '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.create_appointment('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
       'a0000000-0000-0000-0000-000000000001', 'Intruso', null, '2027-03-09 10:00-03') $$,
  'P0001', 'not_business_owner', 'Caro no agenda en el negocio de Ana');

select * from finish();
rollback;
