begin;
select plan(30);

-- Dos usuarios. Todo lo que sigue corre como ellos (rol `authenticated` + claims),
-- igual que la Data API.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'ana@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'bruno@test.local');

-- ── Ana crea su negocio ─────────────────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ select public.create_business('Barbería Ceibo', 'Barbería', 'barberia-ceibo') $$,
  'a signed-in user creates a business'
);
select is(
  (select count(*)::int from public.businesses), 1,
  'the owner sees their business'
);
select is(
  (select count(*)::int from public.memberships where role = 'owner'), 1,
  'creating a business also creates the owner membership'
);
select throws_ok(
  $$ select public.create_business('Otro', 'Barbería', 'otro-negocio') $$,
  'P0001', 'business_already_exists',
  'a second create (double submit or second business) is rejected'
);
select lives_ok(
  $$ update public.businesses set name = 'Ceibo Barber' $$,
  'the owner updates their business'
);
select throws_ok(
  $$ update public.businesses set name = '   ' $$,
  '23514', null,
  'a blank name is rejected on direct update too'
);
select is(
  (select name from public.businesses), 'Ceibo Barber',
  'the owner can rename their business'
);

-- ── Bruno no ve ni toca lo de Ana ───────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.businesses), 0,
  'a user does not see another user''s business'
);
select is(
  (select count(*)::int from public.memberships), 0,
  'a user does not see another user''s memberships'
);
select lives_ok(
  $$ update public.businesses set name = 'Hackeado' $$,
  'another user''s update matches no rows instead of failing'
);
select throws_ok(
  $$ insert into public.businesses (name, category, slug) values ('X', 'Y', 'negocio-x') $$,
  '42501', null,
  'a user cannot insert into businesses directly'
);
select throws_ok(
  $$ select public.create_business('Ceibo 2', 'Barbería', 'Barberia-Ceibo') $$,
  'P0001', 'slug_taken',
  'a taken slug is rejected regardless of case'
);
select is(public.slug_available('barberia-ceibo'), false, 'a taken slug is not available');
select is(public.slug_available('BARBERIA-CEIBO'), false, 'availability ignores case');
select is(public.slug_available('admin'), false, 'a reserved slug is not available');
select is(public.slug_available('Libre-Uno'), true, 'a free slug is available');
select throws_ok(
  $$ select public.create_business('Admin', 'Otro', 'admin') $$,
  'P0001', 'slug_invalid',
  'a reserved slug is rejected'
);
select throws_ok(
  $$ select public.create_business('Corto', 'Otro', 'ab') $$,
  'P0001', 'slug_invalid',
  'a slug under 3 characters is rejected'
);
select throws_ok(
  format($$ select public.create_business('Largo', 'Otro', %L) $$, repeat('a', 41)),
  'P0001', 'slug_invalid',
  'a slug over 40 characters is rejected'
);
select throws_ok(
  $$ select public.create_business('Raro', 'Otro', 'con espacios') $$,
  'P0001', 'slug_invalid',
  'a slug with spaces or accents is rejected'
);
select throws_ok(
  $$ select public.create_business('   ', 'Otro', 'sin-nombre') $$,
  'P0001', 'name_invalid',
  'a blank name is rejected'
);

reset role;
select is(
  (select name from public.businesses where slug = 'barberia-ceibo'), 'Ceibo Barber',
  'a user cannot edit another user''s business'
);
select is(
  (select count(*)::int from public.memberships
   where user_id = '00000000-0000-0000-0000-0000000000b2'), 0,
  'failed creates leave no membership behind'
);

set local role authenticated;
select lives_ok(
  $$ select public.create_business('Bruno', 'Otro', 'MiNegocio-Bruno') $$,
  'a slug typed with capitals is accepted'
);
reset role;
select is(
  (select slug from public.businesses
   where id = (select business_id from public.memberships
               where user_id = '00000000-0000-0000-0000-0000000000b2')),
  'minegocio-bruno',
  'the slug is stored lowercase'
);

-- ── El slug no cambia una vez publicado ─────────────────────────────────────
select lives_ok(
  $$ update public.businesses set slug = 'bruno-barber' where slug = 'minegocio-bruno' $$,
  'the slug can change before publishing'
);
update public.businesses set published_at = now() where slug = 'bruno-barber';
select throws_ok(
  $$ update public.businesses set slug = 'bruno-otro' where slug = 'bruno-barber' $$,
  'P0001', 'slug_locked',
  'the slug cannot change after publishing'
);

-- ── anon y sesión sin usuario ───────────────────────────────────────────────
set local role anon;
select throws_ok(
  $$ select public.create_business('Anon', 'Otro', 'anon-negocio') $$,
  '42501', null,
  'anon cannot execute create_business'
);
select throws_ok(
  $$ select count(*) from public.businesses $$,
  '42501', null,
  'anon cannot read businesses'
);

select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.create_business('Fantasma', 'Otro', 'fantasma') $$,
  'P0001', 'not_authenticated',
  'a session without a user id is rejected'
);

select * from finish();
rollback;
