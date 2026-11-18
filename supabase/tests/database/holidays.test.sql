-- Feriados: tabla global de solo lectura. Forma, restricciones, permisos y RLS.
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select has_table('public', 'holidays', 'existe la tabla holidays');
select columns_are('public', 'holidays', array['date', 'name', 'kind'],
  'holidays tiene solo las columnas esperadas');
select col_is_pk('public', 'holidays', 'date', 'la fecha es la clave');
select is(
  (select relrowsecurity from pg_class where oid = 'public.holidays'::regclass), true,
  'holidays tiene RLS activada');

-- Permisos: todos leen (la página pública la va a usar); nadie escribe desde el navegador.
select table_privs_are('public', 'holidays', 'authenticated', array['SELECT'],
  'authenticated solo puede leer holidays');
select table_privs_are('public', 'holidays', 'anon', array['SELECT'],
  'anon solo puede leer holidays');

-- Restricciones.
insert into public.holidays (date, name, kind) values
  ('2026-05-25', 'Día de la Revolución de Mayo', 'fixed'),
  ('2026-03-23', 'Puente turístico no laborable', 'bridge');
select throws_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-05-26', 'Inventado', 'otro') $$,
  '23514', null, 'un tipo desconocido no entra');
select throws_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-05-26', '   ', 'fixed') $$,
  '23514', null, 'el nombre no puede estar vacío');
select throws_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-05-25', 'Repetido', 'fixed') $$,
  '23505', null, 'una fecha no se repite');

-- Lectura: authenticated y anon ven los feriados; nadie escribe desde el navegador.
set local role authenticated;
select results_eq(
  $$ select date::text from public.holidays order by date $$,
  $$ values ('2026-03-23'), ('2026-05-25') $$,
  'authenticated lee los feriados');
select throws_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-07-09', 'Día de la Independencia', 'fixed') $$,
  '42501', null, 'authenticated no inserta feriados');
select throws_ok($$ update public.holidays set name = 'Otro' $$,
  '42501', null, 'authenticated no modifica feriados');
select throws_ok($$ delete from public.holidays $$,
  '42501', null, 'authenticated no borra feriados');
reset role;

set local role anon;
select results_eq(
  $$ select count(*)::int from public.holidays $$,
  $$ values (2) $$,
  'anon lee los feriados');
select throws_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-07-09', 'Día de la Independencia', 'fixed') $$,
  '42501', null, 'anon no inserta feriados');
reset role;

-- El dueño de la base (el script de carga, con la clave de servicio) sí puede escribir.
select lives_ok($$ insert into public.holidays (date, name, kind)
  values ('2026-07-09', 'Día de la Independencia', 'fixed') $$,
  'el dueño de la base puede cargar feriados');

select * from finish();
rollback;
