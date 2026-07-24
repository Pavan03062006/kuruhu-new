-- PRAMAAN uses Supabase as managed PostgreSQL behind FastAPI.
-- The public schema is intentionally not exposed to browser clients.
-- Run the Alembic migrations first, then apply this hardening migration.

begin;

revoke all on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

do $$
declare
  relation record;
begin
  for relation in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      relation.schemaname,
      relation.tablename
    );
  end loop;
end
$$;

commit;
