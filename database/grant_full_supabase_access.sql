-- Migration: Grant full schema and table access to anon, authenticated, service_role, postgres and disable Row Level Security (RLS)
begin;

-- Grant schema permissions
grant usage, create on schema public to anon, authenticated, service_role, postgres;

-- Grant table, sequence, and function permissions on all existing objects
grant all privileges on all tables in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all sequences in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all functions in schema public to anon, authenticated, service_role, postgres;

-- Ensure default privileges for any future tables, sequences, and functions
alter default privileges in schema public grant all on tables to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role, postgres;

-- Disable Row Level Security (RLS) on all public tables and drop existing restrictive policies
do $$
declare
  relation record;
  pol record;
begin
  for relation in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    -- Drop all policies on the table
    for pol in
      select policyname
      from pg_policies
      where schemaname = relation.schemaname and tablename = relation.tablename
    loop
      execute format(
        'drop policy if exists %I on %I.%I',
        pol.policyname,
        relation.schemaname,
        relation.tablename
      );
    end loop;

    -- Disable Row Level Security (RLS)
    execute format(
      'alter table %I.%I disable row level security',
      relation.schemaname,
      relation.tablename
    );
  end loop;
end
$$;

commit;
