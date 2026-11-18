-- `kind` pasa de text + CHECK a un enum: `supabase gen types` lo tipa como unión
-- ("fixed" | "movable" | "bridge") y el código no necesita casts. Los valores son los mismos.
create type public.holiday_kind as enum ('fixed', 'movable', 'bridge');

alter table public.holidays drop constraint holidays_kind_check;

alter table public.holidays
  alter column kind type public.holiday_kind using kind::public.holiday_kind;
