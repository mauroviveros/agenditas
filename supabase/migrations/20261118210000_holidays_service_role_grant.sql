-- El script `pnpm holidays:sync` entra con la clave de servicio (rol service_role). Los
-- privilegios por defecto están cerrados, así que se le da lo justo para cargar: leer,
-- insertar y actualizar (upsert por fecha). No borra.
grant select, insert, update on public.holidays to service_role;
