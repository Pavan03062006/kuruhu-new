-- Migration: Expand schema for AI Findings & Notifications, insert comprehensive seed data, and grant full access

begin;

-- Create ai_findings table if not exists
create table if not exists public.ai_findings (
  id text primary key,
  question text not null,
  title text not null,
  summary text not null,
  confidence numeric(4,2) not null default 0.95,
  status text not null default 'verified',
  risk text not null default 'high',
  citations jsonb not null default '[]'::jsonb,
  related_fir_ids text[] not null default '{}',
  related_person_ids text[] not null default '{}',
  detected_relationships text[] not null default '{}',
  generated_at timestamptz not null default now(),
  verified_by text
);

-- Create notifications table if not exists
create table if not exists public.notifications (
  id text primary key,
  title text not null,
  body text not null,
  kind text not null default 'system',
  action_required boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed Reference Tables
insert into public.states (id, source_state_id, name, is_active)
values (1, 29, 'Karnataka', true)
on conflict (id) do nothing;

insert into public.districts (id, source_district_id, state_id, name, is_active)
values 
  (1, 101, 1, 'Bengaluru City', true),
  (2, 102, 1, 'Mysuru Urban', true),
  (3, 103, 1, 'Mangaluru City', true)
on conflict (id) do nothing;

insert into public.unit_types (id, source_unit_type_id, name, jurisdiction_level, hierarchy_level, is_active)
values 
  (1, 10, 'Law & Order Police Station', 'Station', 1, true),
  (2, 20, 'Crime Branch Unit', 'City', 2, true)
on conflict (id) do nothing;

insert into public.police_units (id, source_unit_id, name, unit_type_id, state_id, district_id, is_active)
values 
  (1, 1001, 'Jayanagar PS', 1, 1, 1, true),
  (2, 1002, 'BTM Layout PS', 1, 1, 1, true),
  (3, 1003, 'Shivajinagar PS', 1, 1, 1, true),
  (4, 1004, 'Madiwala PS', 1, 1, 1, true),
  (5, 1005, 'Central Crime Branch (CCB)', 2, 1, 1, true)
on conflict (id) do nothing;

insert into public.ranks (id, name, hierarchy, is_active)
values 
  (1, 'Inspector', 1, true),
  (2, 'Sub-Inspector', 2, true),
  (3, 'Assistant Sub-Inspector', 3, true)
on conflict (id) do nothing;

insert into public.designations (id, name, sort_order, is_active)
values 
  (1, 'Investigating Officer', 1, true),
  (2, 'Station House Officer', 2, true)
on conflict (id) do nothing;

insert into public.officers (id, source_employee_id, kgid, district_id, unit_id, rank_id, designation_id, first_name, date_of_birth, gender)
values 
  (1, 30412, 'KSP-30412', 1, 1, 1, 1, 'Meera Kulkarni', '1985-04-12', 'F'),
  (2, 30413, 'KSP-30413', 1, 2, 2, 1, 'Rajesh Gowda', '1988-08-20', 'M')
on conflict (id) do nothing;

insert into public.acts (code, description, short_name, is_active)
values 
  ('IPC', 'Indian Penal Code', 'IPC', true),
  ('BNS', 'Bharatiya Nyaya Sanhita', 'BNS', true)
on conflict (code) do nothing;

insert into public.statutory_sections (id, act_code, section_code, description, is_active)
values 
  (1, 'IPC', '379', 'Punishment for theft', true),
  (2, 'IPC', '420', 'Cheating and dishonestly inducing delivery of property', true),
  (3, 'IPC', '302', 'Punishment for murder', true),
  (4, 'IPC', '395', 'Punishment for dacoity', true),
  (5, 'IPC', '468', 'Forgery for purpose of cheating', true)
on conflict (id) do nothing;

-- Seed FIRs
insert into public.firs (id, source_case_master_id, crime_number, case_number, registered_at, investigating_officer_id, police_station_id, brief_facts, created_at, updated_at)
values 
  (101, 2401, '0042/2026', 'CC-2401/2026', '2026-07-20T10:30:00+05:30', 1, 1, 'Commercial burglary at BTM 2nd Stage electronic warehouse. High-value network equipment stolen using duplicate key access. Multiple suspects tracked via toll CCTV.', '2026-07-20T10:30:00+05:30', '2026-07-23T14:10:00+05:30'),
  (102, 2388, '0039/2026', 'CC-2388/2026', '2026-07-15T14:15:00+05:30', 1, 2, 'Financial fraud involving forged bank instruments and fake identity cards used to draw loan advances from regional bank branches.', '2026-07-15T14:15:00+05:30', '2026-07-22T11:00:00+05:30'),
  (103, 2367, '0031/2026', 'CC-2367/2026', '2026-07-08T09:00:00+05:30', 2, 3, 'Armed snatching near KR Market metro gate. Two individuals on un-numbered black motorcycle fled towards Corporation circle.', '2026-07-08T09:00:00+05:30', '2026-07-21T16:30:00+05:30'),
  (104, 2296, '0018/2026', 'CC-2296/2026', '2026-06-12T18:45:00+05:30', 1, 4, 'Vehicle theft of white SUV (KA-01-MJ-4410) parked outside Silk Board complex. Engine immobilizer bypassed.', '2026-06-12T18:45:00+05:30', '2026-07-18T19:00:00+05:30')
on conflict (id) do nothing;

-- Seed Persons
insert into public.persons (id, canonical_name, age_years, gender, source_table, source_record_id, created_at)
values 
  (1001, 'Ravi Kumar S', 34, 'M', 'Accused', 1001, '2026-07-21T18:40:00+05:30'),
  (1002, 'Faisal Ahmed', 27, 'M', 'Accused', 1002, '2026-07-22T09:15:00+05:30'),
  (1003, 'Manju Nayak', 41, 'M', 'Accused', 1003, '2026-07-19T22:05:00+05:30'),
  (1004, 'Lakshmi Devi', 52, 'F', 'Complainant', 1004, '2026-07-20T10:30:00+05:30')
on conflict (id) do nothing;

-- Seed Person Aliases
insert into public.person_aliases (id, person_id, alias)
values 
  (1, 1001, 'Ravi Anna'),
  (2, 1001, 'RK'),
  (3, 1002, 'Chotu'),
  (4, 1003, 'Manja')
on conflict (id) do nothing;

-- Seed Case Parties
insert into public.case_parties (id, fir_id, person_id, role, source_table, source_record_id, source_row_number, source_payload)
values 
  (1, 101, 1001, 'ACCUSED', 'Accused', 1001, 1, '{}'::jsonb),
  (2, 101, 1002, 'ACCUSED', 'Accused', 1002, 2, '{}'::jsonb),
  (3, 101, 1004, 'COMPLAINANT', 'ComplainantDetails', 1004, 3, '{}'::jsonb),
  (4, 102, 1001, 'ACCUSED', 'Accused', 1001, 4, '{}'::jsonb),
  (5, 103, 1002, 'ACCUSED', 'Accused', 1002, 5, '{}'::jsonb),
  (6, 103, 1003, 'ACCUSED', 'Accused', 1003, 6, '{}'::jsonb)
on conflict (id) do nothing;

-- Seed Evidence
insert into public.evidence (id, fir_id, evidence_type, description, storage_reference, collected_at, collected_by_officer_id)
values 
  (1, 101, 'cctv', 'HD camera footage from warehouse Gate 3 showing black sedan arrival at 02:14 AM.', 'STORAGE-CAM-8841', '2026-07-20T12:00:00+05:30', 1),
  (2, 101, 'physical', 'Duplicate lock cylinder with tool scratches recovered from alleyway.', 'EVID-CYL-042', '2026-07-20T13:30:00+05:30', 1),
  (3, 102, 'document', 'Forged bank passbook and demand draft slip bearing fake seal.', 'EVID-DOC-901', '2026-07-16T10:00:00+05:30', 1),
  (4, 104, 'digital', 'GPS telemetry tracker log extracted from vehicle recovery point.', 'EVID-GPS-112', '2026-06-13T11:00:00+05:30', 2)
on conflict (id) do nothing;

-- Seed Vehicles
insert into public.vehicles (id, registration_number, make, color)
values 
  (1, 'KA-01-MJ-4410', 'Toyota Fortuner', 'White'),
  (2, 'KA-05-NB-8821', 'Hyundai Verna', 'Black')
on conflict (id) do nothing;

insert into public.fir_vehicles (fir_id, vehicle_id, relationship)
values 
  (104, 1, 'Stolen Vehicle'),
  (101, 2, 'Suspect Transport')
on conflict (fir_id, vehicle_id, relationship) do nothing;

-- Seed AI Findings
insert into public.ai_findings (id, question, title, summary, confidence, status, risk, citations, related_fir_ids, related_person_ids, detected_relationships, generated_at, verified_by)
values 
  (
    'FND-8801',
    'Are there overlapping suspects between the BTM burglary and bank fraud cases?',
    'Cross-Case Suspect Correlation Detected',
    'Ravi Kumar S (P-1001) is named as primary accused in FIR 0042/2026 and co-conspirator in FIR 0039/2026. Common phone contact logs indicate active association with Faisal Ahmed (P-1002).',
    0.94,
    'verified',
    'high',
    '[{"recordId":"F-2401","recordType":"fir","label":"FIR 0042/2026","excerpt":"Accused entered warehouse using duplicate key."},{"recordId":"P-1001","recordType":"person","label":"Ravi Kumar S","excerpt":"Linked to multiple burglaries in BTM division."}]'::jsonb,
    array['101', '102'],
    array['1001', '1002'],
    array['Ravi Kumar S linked to Faisal Ahmed via common contact'],
    '2026-07-23T16:00:00+05:30',
    'Insp. Meera Kulkarni'
  ),
  (
    'FND-8802',
    'Identify vehicle patterns across recent snatching and burglary cases.',
    'Repeated Vehicle Signal in BTM and Shivajinagar',
    'Black Hyundai Verna (KA-05-NB-8821) identified in CCTV footage adjacent to two crime scenes within 48 hours.',
    0.89,
    'pending',
    'medium',
    '[{"recordId":"F-2401","recordType":"fir","label":"FIR 0042/2026","excerpt":"Black sedan spotted at 02:14 AM."}]'::jsonb,
    array['101', '103'],
    array['1002', '1003'],
    array['Vehicle KA-05-NB-8821 linked to FIR 0042/2026'],
    '2026-07-22T14:30:00+05:30',
    null
  )
on conflict (id) do nothing;

-- Seed Notifications
insert into public.notifications (id, title, body, kind, action_required, read, created_at)
values 
  ('N-01', 'New CCTV Evidence Uploaded', 'Inspector Kulkarni attached HD camera log to FIR 0042/2026.', 'verification', true, false, '2026-07-23T18:00:00+05:30'),
  ('N-02', 'AI Finding Generated', 'Cross-case correlation detected between FIR 0042/2026 and FIR 0039/2026.', 'system', false, false, '2026-07-23T16:00:00+05:30'),
  ('N-03', 'Case Deadline Alert', 'Charge sheet due for FIR 0018/2026 within 7 days.', 'deadline', true, true, '2026-07-22T09:00:00+05:30')
on conflict (id) do nothing;

-- Ensure schema permissions & disable RLS
grant usage, create on schema public to anon, authenticated, service_role, postgres;
grant all privileges on all tables in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all sequences in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all functions in schema public to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role, postgres;

do $$
declare
  relation record;
begin
  for relation in select schemaname, tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table %I.%I disable row level security', relation.schemaname, relation.tablename);
  end loop;
end
$$;

commit;
