begin;
select plan(10);

-- Estado real del esquema: estas tres pruebas corren antes de crear nada.
select has_extension(
  'extensions', 'btree_gist',
  'btree_gist is installed in the extensions schema'
);

select is_empty(
  $$ select c.relname
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'every table in public has row level security enabled'
);

select is_empty(
  $$ select n.nspname || '.' || p.proname
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private')
       and has_function_privilege('anon', p.oid, 'execute') $$,
  'anon can execute no function in public or private'
);

-- Defaults: lo que se crea de acá en adelante no queda expuesto por la Data API.
create table public.zz_probe_table (id serial primary key);
create function public.zz_probe_fn() returns int language sql as 'select 1';

select ok(
  not has_table_privilege('anon', 'public.zz_probe_table', 'select,insert,update,delete'),
  'anon gets no privilege on a new table'
);
select ok(
  not has_table_privilege('authenticated', 'public.zz_probe_table', 'select,insert,update,delete'),
  'authenticated gets no privilege on a new table'
);
select ok(
  not has_sequence_privilege('anon', 'public.zz_probe_table_id_seq', 'usage,select,update'),
  'anon gets no privilege on a new sequence'
);
select ok(
  not has_function_privilege('anon', 'public.zz_probe_fn()', 'execute'),
  'anon cannot execute a new function'
);
select ok(
  not has_function_privilege('authenticated', 'public.zz_probe_fn()', 'execute'),
  'authenticated cannot execute a new function'
);

-- Los detectores de arriba tienen que poder fallar: si no, el check no vale nada.
select isnt_empty(
  $$ select c.relname
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'the RLS check flags a table created without RLS'
);

grant execute on function public.zz_probe_fn() to anon;
select isnt_empty(
  $$ select p.proname
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private')
       and has_function_privilege('anon', p.oid, 'execute') $$,
  'the anon check flags a function granted to anon'
);

select * from finish();
rollback;
