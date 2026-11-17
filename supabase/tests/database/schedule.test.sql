begin;
select plan(42);

-- Dos dueños con su negocio, creados como lo hace la app (RPC con sesión).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'ana@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'bruno@test.local');

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
set local role authenticated;
select public.create_business('Barbería Ceibo', 'Barbería', 'barberia-ceibo');
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select public.create_business('Estética Luna', 'Estética', 'estetica-luna');
reset role;

create temp table ids as
select
  (select business_id from public.memberships
   where user_id = '00000000-0000-0000-0000-0000000000a1') as ana,
  (select business_id from public.memberships
   where user_id = '00000000-0000-0000-0000-0000000000b2') as bruno;
grant select on ids to authenticated, anon;

-- ── Zona horaria del negocio ────────────────────────────────────────────────
select is(
  (select time_zone from public.businesses where slug = 'barberia-ceibo'),
  'America/Argentina/Buenos_Aires',
  'a business defaults to the Buenos Aires time zone'
);
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ update public.businesses set time_zone = 'America/Argentina/Cordoba'
     where slug = 'barberia-ceibo' $$,
  'a time zone that exists in Postgres is accepted'
);
select throws_ok(
  $$ update public.businesses set time_zone = 'EST'
     where slug = 'barberia-ceibo' $$,
  '23514', null,
  'a fixed-offset abbreviation is not a valid time zone'
);
select throws_ok(
  $$ update public.businesses set time_zone = 'Mars/Olympus'
     where slug = 'barberia-ceibo' $$,
  '23514', null,
  'a made-up time zone is rejected'
);

-- ── Servicios ───────────────────────────────────────────────────────────────
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_ars)
     select ana, 'Corte clásico', 45, 19500 from ids $$,
  'the owner creates a service'
);
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, 'Diseño de barba', 30 from ids $$,
  'a service can have no price'
);
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_ars)
     select ana, 'Cortesía', 5, 0 from ids $$,
  'a free service with the minimum duration is accepted'
);
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_ars)
     select ana, 'Jornada larga', 480, 100000 from ids $$,
  'the maximum duration is accepted'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, 'Raro', 7 from ids $$,
  '23514', null,
  'a duration that is not a multiple of 5 is rejected'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, 'Eterno', 485 from ids $$,
  '23514', null,
  'a duration over 480 minutes is rejected'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes, price_ars)
     select ana, 'Regalo', 30, -1 from ids $$,
  '23514', null,
  'a negative price is rejected'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, '   ', 30 from ids $$,
  '23514', null,
  'a blank name is rejected'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, ' CORTE clásico ', 30 from ids $$,
  '23505', null,
  'an active service name is unique per business regardless of case and spaces'
);
select lives_ok(
  $$ update public.services set archived_at = now() where name = 'Corte clásico' $$,
  'a service is archived instead of deleted'
);
select lives_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select ana, 'Corte clásico', 40 from ids $$,
  'an archived service frees its name'
);
select throws_ok(
  $$ delete from public.services $$,
  '42501', null,
  'services cannot be deleted'
);
select throws_ok(
  $$ insert into public.services (business_id, name, duration_minutes)
     select bruno, 'Colado', 30 from ids $$,
  '42501', null,
  'an owner cannot create a service in another business'
);

-- Bruno no ve ni toca lo de Ana.
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.services), 0,
  'a user does not see another business''s services'
);
select lives_ok(
  $$ update public.services set name = 'Hackeado' $$,
  'another user''s update matches no rows instead of failing'
);

-- ── Horario semanal ─────────────────────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.weekly_hours
       (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
     select ana, 1, '09:00', '18:00', '13:00', '14:00' from ids $$,
  'the owner sets a day with lunch'
);
select lives_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 2, '10:00', '19:30' from ids $$,
  'a day can have no lunch'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 1, '09:00', '12:00' from ids $$,
  '23505', null,
  'a weekday has a single time range'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 3, '18:00', '09:00' from ids $$,
  '23514', null,
  'closing before opening is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 3, '09:10', '18:00' from ids $$,
  '23514', null,
  'a time that is not a multiple of 15 minutes is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 8, '09:00', '18:00' from ids $$,
  '23514', null,
  'a weekday outside 1 to 7 is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours
       (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
     select ana, 3, '09:00', '18:00', '08:00', '09:30' from ids $$,
  '23514', null,
  'lunch starting before opening is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours
       (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
     select ana, 3, '09:00', '18:00', '09:00', '10:00' from ids $$,
  '23514', null,
  'lunch touching the opening time is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours
       (business_id, weekday, opens, closes, lunch_starts, lunch_ends)
     select ana, 3, '09:00', '18:00', '13:00', '13:00' from ids $$,
  '23514', null,
  'an empty lunch is rejected'
);
select throws_ok(
  $$ insert into public.weekly_hours
       (business_id, weekday, opens, closes, lunch_starts)
     select ana, 3, '09:00', '18:00', '13:00' from ids $$,
  '23514', null,
  'lunch needs both a start and an end'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, d.day, '09:00'::time,
       case when d.day = 5 then '08:00'::time else '18:00'::time end
     from ids, (values (4), (5), (6)) as d(day) $$,
  '23514', null,
  'one bad day fails the whole batch'
);
select throws_ok(
  $$ insert into public.weekly_hours (business_id, weekday, opens, closes)
     select ana, 7, '09:00', '24:00' from ids $$,
  '23514', null,
  'closing at 24:00 is rejected'
);
select lives_ok(
  $$ select public.save_weekly_hours(
       '[{"weekday":1,"opens":"09:00","closes":"13:00"},
         {"weekday":6,"opens":"10:00","closes":"14:00"}]') $$,
  'saving the week replaces the previous one'
);
select is(
  (select count(*)::int from public.weekly_hours), 2,
  'the saved week has exactly the days that were sent'
);
select throws_ok(
  $$ select public.save_weekly_hours(
       '[{"weekday":1,"opens":"09:00","closes":"13:00"},
         {"weekday":2,"opens":"18:00","closes":"09:00"}]') $$,
  '23514', null,
  'a bad day rejects the whole save'
);
select is(
  (select count(*)::int from public.weekly_hours where weekday in (1, 6)), 2,
  'a rejected save keeps the previous week'
);
select throws_ok(
  $$ update public.services set business_id = (select bruno from ids) $$,
  '42501', null,
  'a service cannot be moved to another business'
);
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.weekly_hours), 0,
  'a user does not see another business''s hours'
);

-- ── Excepciones por fecha ───────────────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.day_overrides (business_id, on_date, kind, note)
     select ana, current_date + 30, 'closed', 'Vacaciones' from ids $$,
  'the owner closes a future day'
);
select throws_ok(
  $$ insert into public.day_overrides (business_id, on_date, kind)
     select ana, current_date + 30, 'open' from ids $$,
  '23505', null,
  'a day has a single exception'
);
select throws_ok(
  $$ insert into public.day_overrides (business_id, on_date, kind)
     select ana, current_date - 3, 'closed' from ids $$,
  'P0001', 'date_in_past',
  'an exception in a past date is rejected'
);
select throws_ok(
  $$ insert into public.day_overrides (business_id, on_date, kind)
     select ana, current_date + 40, 'maybe' from ids $$,
  '23514', null,
  'an unknown exception kind is rejected'
);
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.day_overrides), 0,
  'a user does not see another business''s exceptions'
);

select * from finish();
rollback;
