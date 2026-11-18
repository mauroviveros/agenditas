-- Si ArgentinaDatos corrige o traslada un feriado, `pnpm holidays:sync` tiene que sacar la
-- fecha vieja y no solo cargar la nueva: sin esto la card mostraría los dos días. Solo la
-- clave de servicio puede borrar; anon y authenticated siguen sin escribir.
grant delete on public.holidays to service_role;
