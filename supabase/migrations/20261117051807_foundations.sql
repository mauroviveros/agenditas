-- Fundaciones de la base. No crea tablas: deja las reglas que toda tabla futura hereda.

-- Necesaria para el EXCLUDE de turnos (gist sobre staff_id + rango de tiempo).
-- Va en `extensions` para que la Data API no exponga sus funciones.
create extension if not exists btree_gist with schema extensions;

-- Supabase da por defecto todos los privilegios a anon y authenticated sobre lo que se
-- crea en `public`, y Postgres da EXECUTE a PUBLIC en toda función nueva. Se revoca
-- para que cada permiso sea un GRANT explícito y revisable en una migración.
-- service_role queda igual: es solo de servidor y no pasa por la RLS.
-- Solo cubre lo que crea `postgres` (las migraciones); un objeto de otro dueño, como
-- los de supabase_admin, conserva los defaults de Supabase (lo chequea el test).
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges in schema public
  revoke all on functions from anon, authenticated;

-- El default de PUBLIC es global (no se puede quitar por esquema). Consecuencia: una
-- función de una extensión instalada después necesita su GRANT explícito.
alter default privileges
  revoke execute on functions from public;
