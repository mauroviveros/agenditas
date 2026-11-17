-- Fundaciones: lo que vale para toda tabla y función futura. Todo es idempotente.

-- Hace posible el exclusion constraint que impide que dos turnos se pisen.
create extension if not exists btree_gist with schema extensions;

-- Nada nuevo queda abierto a anon ni a authenticated: cada GRANT se da a mano,
-- junto con su política de RLS, en la migración de esa tabla o función.
-- Regla: todo objeto va en `public` y lo crea `postgres` (rol de las migraciones).
-- Un esquema nuevo necesita repetir estos revokes para sus tablas y secuencias.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
-- Postgres da EXECUTE a PUBLIC en toda función nueva; lo cerramos también.
alter default privileges for role postgres
  revoke execute on functions from public;
