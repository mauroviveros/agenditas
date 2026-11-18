-- Feriados de Argentina. Tabla global (no es de ningún negocio) y de solo lectura: la
-- carga el script `pnpm holidays:sync` con la clave de servicio, que se salta la RLS.
-- kind: fixed = inamovible, movable = trasladable, bridge = puente turístico no laborable
-- (los mismos tipos que devuelve ArgentinaDatos, en inglés).
create table public.holidays (
  date date primary key,
  name text not null
    constraint holidays_name_check check (btrim(name) <> '' and length(name) <= 120),
  kind text not null
    constraint holidays_kind_check check (kind in ('fixed', 'movable', 'bridge'))
);

alter table public.holidays enable row level security;

-- Todos los leen: la página pública de reservas la va a usar sin sesión (R5). Nadie
-- escribe desde el navegador: no hay GRANT de INSERT, UPDATE ni DELETE.
grant select on public.holidays to anon, authenticated;

create policy "los feriados los lee cualquiera"
  on public.holidays
  for select
  to anon, authenticated
  using (true);
