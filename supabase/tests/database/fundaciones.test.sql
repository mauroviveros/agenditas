-- Fundaciones de la base: lo que vale para toda tabla y función futura.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

-- btree_gist hace posible el exclusion constraint (dos turnos no se pisan).
select has_extension('btree_gist', 'btree_gist está instalada');

-- Guarda: toda tabla de public tiene RLS. Falla en cuanto alguien olvide activarla.
select is_empty(
  $$ select c.relname from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'toda tabla de public tiene RLS'
);

-- Privilegios por defecto cerrados: una tabla nueva no abre nada a anon ni authenticated.
create table public.sonda (id int);
alter table public.sonda enable row level security;
select table_privs_are('public', 'sonda', 'anon', array[]::text[],
  'una tabla nueva no da privilegios a anon');
select table_privs_are('public', 'sonda', 'authenticated', array[]::text[],
  'una tabla nueva no da privilegios a authenticated');

-- Lo mismo para funciones: ejecutarlas se concede a mano, una por una.
create function public.sonda_fn() returns int language sql as 'select 1';
select function_privs_are('public', 'sonda_fn', array[]::text[], 'anon', array[]::text[],
  'una función nueva no la puede ejecutar anon');
select function_privs_are('public', 'sonda_fn', array[]::text[], 'authenticated', array[]::text[],
  'una función nueva no la puede ejecutar authenticated');

select * from finish();
rollback;
