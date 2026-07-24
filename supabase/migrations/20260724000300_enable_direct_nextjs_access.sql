begin;

create table if not exists public.app_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in (
    'super_admin',
    'scrb_admin',
    'district_admin',
    'investigation_officer',
    'analyst',
    'read_only_auditor'
  )),
  district_id bigint references public.districts(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.app_members enable row level security;

create policy "members_read_own_membership"
on public.app_members
for select
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select on public.app_members to authenticated;

do $$
declare
  table_name text;
  protected_tables text[] := array[
    'states', 'districts', 'unit_types', 'police_units',
    'case_categories', 'case_statuses', 'gravity_offences',
    'crime_heads', 'crime_sub_heads', 'acts', 'statutory_sections',
    'officers', 'firs', 'occurrences', 'persons', 'case_parties',
    'person_aliases', 'addresses', 'organizations', 'vehicles',
    'fir_vehicles', 'weapons', 'fir_weapons', 'evidence',
    'fir_sections', 'arrests', 'arrest_parties', 'charge_sheets',
    'investigation_notes', 'attachments'
  ];
begin
  foreach table_name in array protected_tables loop
    execute format('grant select on public.%I to authenticated', table_name);
    execute format('drop policy if exists %I on public.%I',
      'active_members_read_' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (
        exists (
          select 1 from public.app_members member
          where member.user_id = (select auth.uid())
            and member.is_active
        )
      )',
      'active_members_read_' || table_name,
      table_name
    );
  end loop;
end
$$;

commit;
