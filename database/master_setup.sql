-- ============================================================
-- KURUHU / PRAMAAN — Master Setup Script
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Schema source: database/schema.sql (Alembic-managed tables)
-- Key rules applied:
--   1. OVERRIDING SYSTEM VALUE for all GENERATED ALWAYS identity columns
--   2. source_row_number NOT NULL — must be provided for firs, case_parties, etc.
--   3. source_payload jsonb NOT NULL — must be provided for firs, case_parties, etc.
--   4. normalized_name is a GENERATED column — do NOT insert it
--   5. gender uses the gender_code enum ('M','F','T','O','U')
-- ============================================================

begin;

-- ============================================================
-- STEP 1: Grant schema access
-- ============================================================
grant usage, create on schema public to anon, authenticated, service_role, postgres;

grant all privileges on all tables    in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all sequences in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all functions in schema public to anon, authenticated, service_role, postgres;

alter default privileges in schema public grant all on tables    to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role, postgres;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role, postgres;

-- ============================================================
-- STEP 2: Disable RLS on ALL tables and drop all policies
-- ============================================================
do $$
declare
  t record;
  pol record;
begin
  for t in select schemaname, tablename from pg_tables where schemaname = 'public' loop
    for pol in select policyname from pg_policies where schemaname = t.schemaname and tablename = t.tablename loop
      execute format('drop policy if exists %I on %I.%I', pol.policyname, t.schemaname, t.tablename);
    end loop;
    execute format('alter table %I.%I disable row level security', t.schemaname, t.tablename);
  end loop;
end
$$;

-- ============================================================
-- STEP 3: Create app-layer tables (not in original Alembic schema)
-- ============================================================

create table if not exists public.ai_findings (
  id text primary key,
  question text not null default '',
  title text not null default '',
  summary text not null default '',
  confidence numeric(4,2) not null default 0.95,
  status text not null default 'pending',
  risk text not null default 'medium',
  citations jsonb not null default '[]'::jsonb,
  related_fir_ids text[] not null default '{}',
  related_person_ids text[] not null default '{}',
  detected_relationships text[] not null default '{}',
  generated_at timestamptz not null default now(),
  verified_by text
);

create table if not exists public.notifications (
  id text primary key,
  title text not null default '',
  body text not null default '',
  kind text not null default 'system',
  action_required boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- STEP 4: Seed reference / lookup tables
-- These use GENERATED ALWAYS identity → need OVERRIDING SYSTEM VALUE
-- ============================================================

insert into public.states (id, source_state_id, name, is_active)
overriding system value
values (1, 29, 'Karnataka', true)
on conflict (id) do nothing;

insert into public.districts (id, source_district_id, state_id, name, is_active)
overriding system value
values 
  (1, 101, 1, 'Bengaluru City', true),
  (2, 102, 1, 'Mysuru Urban', true),
  (3, 103, 1, 'Mangaluru City', true)
on conflict (id) do nothing;

insert into public.unit_types (id, source_unit_type_id, name, jurisdiction_level, hierarchy_level, is_active)
overriding system value
values 
  (1, 10, 'Law & Order Police Station', 'Station', 1, true),
  (2, 20, 'Crime Branch Unit', 'City', 2, true)
on conflict (id) do nothing;

insert into public.police_units (id, source_unit_id, name, unit_type_id, state_id, district_id, is_active)
overriding system value
values 
  (1, 1001, 'Jayanagar PS',              1, 1, 1, true),
  (2, 1002, 'BTM Layout PS',             1, 1, 1, true),
  (3, 1003, 'Shivajinagar PS',           1, 1, 1, true),
  (4, 1004, 'Madiwala PS',               1, 1, 1, true),
  (5, 1005, 'Central Crime Branch (CCB)',2, 1, 1, true)
on conflict (id) do nothing;

-- ranks uses bigint PRIMARY KEY (not GENERATED ALWAYS) — no override needed
insert into public.ranks (id, name, hierarchy, is_active)
values 
  (1, 'Inspector', 1, true),
  (2, 'Sub-Inspector', 2, true),
  (3, 'Assistant Sub-Inspector', 3, true)
on conflict (id) do nothing;

-- designations uses bigint PRIMARY KEY (not GENERATED ALWAYS) — no override needed
insert into public.designations (id, name, sort_order, is_active)
values 
  (1, 'Investigating Officer', 1, true),
  (2, 'Station House Officer', 2, true)
on conflict (id) do nothing;

insert into public.acts (code, description, short_name, is_active)
values 
  ('IPC', 'Indian Penal Code', 'IPC', true),
  ('BNS', 'Bharatiya Nyaya Sanhita', 'BNS', true)
on conflict (code) do nothing;

insert into public.statutory_sections (id, act_code, section_code, description, is_active)
overriding system value
values 
  (1, 'IPC', '379',  'Punishment for theft', true),
  (2, 'IPC', '420',  'Cheating and dishonestly inducing delivery of property', true),
  (3, 'IPC', '302',  'Punishment for murder', true),
  (4, 'IPC', '392',  'Robbery', true),
  (5, 'IPC', '468',  'Forgery for purpose of cheating', true),
  (6, 'IPC', '34',   'Acts done by several persons in furtherance of common intention', true)
on conflict (id) do nothing;

-- officers — GENERATED ALWAYS identity, gender uses enum type
insert into public.officers (id, source_employee_id, kgid, district_id, unit_id, rank_id, designation_id, first_name, date_of_birth, gender)
overriding system value
values 
  (1, 30412, 'KSP-30412', 1, 1, 1, 1, 'Rajesh Kumar',  '1985-04-12', 'M'),
  (2, 30413, 'KSP-30413', 1, 2, 2, 1, 'Priya Sharma',  '1988-08-20', 'F')
on conflict (id) do nothing;

-- ============================================================
-- STEP 5: Seed FIRs
-- Required NOT NULL columns: source_case_master_id, crime_number,
-- registered_at, police_station_id, source_row_number, source_payload
-- ============================================================

insert into public.firs (
  id,
  source_case_master_id,
  crime_number,
  case_number,
  registered_at,
  investigating_officer_id,
  police_station_id,
  brief_facts,
  source_row_number,
  source_payload,
  created_at,
  updated_at
)
overriding system value
values 
  (101, 2401, '0042/2026', 'CC-2401/2026', '2026-07-20T10:30:00+05:30', 1, 1,
   'Commercial burglary at BTM 2nd Stage electronic warehouse. High-value network equipment stolen using duplicate key access. Multiple suspects tracked via toll CCTV.',
   1, '{"source":"seed"}'::jsonb, '2026-07-20T10:30:00+05:30', '2026-07-23T14:10:00+05:30'),

  (102, 2388, '0039/2026', 'CC-2388/2026', '2026-07-15T14:15:00+05:30', 1, 2,
   'Financial fraud involving forged bank instruments and fake identity cards used to draw loan advances from regional bank branches.',
   2, '{"source":"seed"}'::jsonb, '2026-07-15T14:15:00+05:30', '2026-07-22T11:00:00+05:30'),

  (103, 2367, '0031/2026', 'CC-2367/2026', '2026-07-08T09:00:00+05:30', 2, 3,
   'Armed snatching near KR Market metro gate. Two individuals on un-numbered black motorcycle fled towards Corporation circle.',
   3, '{"source":"seed"}'::jsonb, '2026-07-08T09:00:00+05:30', '2026-07-21T16:30:00+05:30'),

  (104, 2296, '0018/2026', 'CC-2296/2026', '2026-06-12T18:45:00+05:30', 1, 4,
   'Vehicle theft of white SUV (KA-01-MJ-4410) parked outside Silk Board complex. Engine immobilizer bypassed.',
   4, '{"source":"seed"}'::jsonb, '2026-06-12T18:45:00+05:30', '2026-07-18T19:00:00+05:30')

on conflict (id) do nothing;

-- ============================================================
-- STEP 6: Seed Persons
-- NOTE: Do NOT include normalized_name (it is a GENERATED column).
-- gender uses the gender_code enum ('M','F','T','O','U').
-- ============================================================

insert into public.persons (id, canonical_name, age_years, gender, source_table, source_record_id, created_at)
overriding system value
values 
  (1001, 'Ravi Kumar S',  34, 'M', 'Accused',     1001, '2026-07-21T18:40:00+05:30'),
  (1002, 'Faisal Ahmed',  27, 'M', 'Accused',     1002, '2026-07-22T09:15:00+05:30'),
  (1003, 'Manju Nayak',   41, 'M', 'Accused',     1003, '2026-07-19T22:05:00+05:30'),
  (1004, 'Lakshmi Devi',  52, 'F', 'Complainant', 1004, '2026-07-20T10:30:00+05:30')
on conflict (id) do nothing;

-- person_aliases: GENERATED ALWAYS identity, normalized_alias is GENERATED — do not insert it
insert into public.person_aliases (id, person_id, alias)
overriding system value
values 
  (1, 1001, 'Ravi Anna'),
  (2, 1001, 'RK'),
  (3, 1002, 'Chotu'),
  (4, 1003, 'Manja')
on conflict (id) do nothing;

-- ============================================================
-- STEP 7: Seed Case Parties
-- Required NOT NULL: fir_id, person_id, role (enum), source_table,
-- source_record_id, source_row_number, source_payload
-- role must be the party_role enum: 'ACCUSED', 'VICTIM', 'COMPLAINANT'
-- IMPORTANT: (source_table, source_record_id) must be UNIQUE per row.
--   Use sequential IDs (1-6) as source_record_id, NOT the person_id.
-- ============================================================

insert into public.case_parties (
  id, fir_id, person_id, role,
  source_table, source_record_id, source_row_number, source_payload
)
overriding system value
values 
  (1, 101, 1001, 'ACCUSED',     'Accused',            1, 1, '{"source":"seed","party_seq":1}'::jsonb),
  (2, 101, 1002, 'ACCUSED',     'Accused',            2, 2, '{"source":"seed","party_seq":2}'::jsonb),
  (3, 101, 1004, 'COMPLAINANT', 'ComplainantDetails', 3, 3, '{"source":"seed","party_seq":3}'::jsonb),
  (4, 102, 1001, 'ACCUSED',     'Accused',            4, 4, '{"source":"seed","party_seq":4}'::jsonb),
  (5, 103, 1002, 'ACCUSED',     'Accused',            5, 5, '{"source":"seed","party_seq":5}'::jsonb),
  (6, 103, 1003, 'ACCUSED',     'Accused',            6, 6, '{"source":"seed","party_seq":6}'::jsonb)
on conflict (source_table, source_record_id) do nothing;


-- ============================================================
-- STEP 8: Seed Evidence
-- ============================================================

insert into public.evidence (id, fir_id, evidence_type, description, storage_reference, collected_at, collected_by_officer_id)
overriding system value
values 
  (1, 101, 'cctv',     'HD camera footage from warehouse Gate 3 showing black sedan arrival at 02:14 AM.', 'STORAGE-CAM-8841', '2026-07-20T12:00:00+05:30', 1),
  (2, 101, 'physical', 'Duplicate lock cylinder with tool scratches recovered from alleyway.',              'EVID-CYL-042',     '2026-07-20T13:30:00+05:30', 1),
  (3, 102, 'document', 'Forged bank passbook and demand draft slip bearing fake seal.',                     'EVID-DOC-901',     '2026-07-16T10:00:00+05:30', 1),
  (4, 104, 'digital',  'GPS telemetry tracker log extracted from vehicle recovery point.',                  'EVID-GPS-112',     '2026-06-13T11:00:00+05:30', 2)
on conflict (id) do nothing;

-- ============================================================
-- STEP 9: Seed Vehicles
-- ============================================================

insert into public.vehicles (id, registration_number, make, color)
overriding system value
values 
  (1, 'KA-01-MJ-4410', 'Toyota Fortuner', 'White'),
  (2, 'KA-05-NB-8821', 'Hyundai Verna',   'Black')
on conflict (id) do nothing;

insert into public.fir_vehicles (fir_id, vehicle_id, relationship)
values 
  (104, 1, 'Stolen Vehicle'),
  (101, 2, 'Suspect Transport')
on conflict (fir_id, vehicle_id, relationship) do nothing;

-- ============================================================
-- STEP 10: Seed AI Findings (text PK — no GENERATED ALWAYS)
-- ============================================================

insert into public.ai_findings (id, question, title, summary, confidence, status, risk, citations, related_fir_ids, related_person_ids, detected_relationships, generated_at, verified_by)
values 
  (
    'FND-8801',
    'Are there overlapping suspects between the BTM burglary and bank fraud cases?',
    'Cross-Case Suspect Correlation Detected',
    'Ravi Kumar S (P-1001) is named as primary accused in FIR 0042/2026 and co-conspirator in FIR 0039/2026. Common phone contact logs indicate active association with Faisal Ahmed (P-1002).',
    0.94, 'verified', 'high',
    '[{"recordId":"F-2401","recordType":"fir","label":"FIR 0042/2026","excerpt":"Accused entered warehouse using duplicate key."},{"recordId":"P-1001","recordType":"person","label":"Ravi Kumar S","excerpt":"Linked to multiple burglaries in BTM division."}]'::jsonb,
    array['101','102'], array['1001','1002'],
    array['Ravi Kumar S linked to Faisal Ahmed via common contact'],
    '2026-07-23T16:00:00+05:30', 'Investigating Officer'
  ),
  (
    'FND-8802',
    'Identify vehicle patterns across recent snatching and burglary cases.',
    'Repeated Vehicle Signal in BTM and Shivajinagar',
    'Black Hyundai Verna (KA-05-NB-8821) identified in CCTV footage adjacent to two crime scenes within 48 hours.',
    0.89, 'pending', 'medium',
    '[{"recordId":"F-2401","recordType":"fir","label":"FIR 0042/2026","excerpt":"Black sedan spotted at 02:14 AM."}]'::jsonb,
    array['101','103'], array['1002','1003'],
    array['Vehicle KA-05-NB-8821 linked to FIR 0042/2026'],
    '2026-07-22T14:30:00+05:30', null
  )
on conflict (id) do nothing;

-- ============================================================
-- STEP 11: Seed Notifications (text PK — no GENERATED ALWAYS)
-- ============================================================

insert into public.notifications (id, title, body, kind, action_required, read, created_at)
values 
  ('N-01', 'New CCTV Evidence Uploaded',  'Officer attached HD camera log to FIR 0042/2026. Please review and verify.', 'verification', true,  false, '2026-07-23T18:00:00+05:30'),
  ('N-02', 'AI Finding Generated',         'Cross-case correlation detected between FIR 0042/2026 and FIR 0039/2026.',   'system',       false, false, '2026-07-23T16:00:00+05:30'),
  ('N-03', 'Case Deadline Alert',          'Charge sheet due for FIR 0018/2026 within 7 days.',                          'deadline',     true,  true,  '2026-07-22T09:00:00+05:30')
on conflict (id) do nothing;

-- ============================================================
-- STEP 12: Re-grant after creating new tables
-- ============================================================
grant all privileges on all tables    in schema public to anon, authenticated, service_role, postgres;
grant all privileges on all sequences in schema public to anon, authenticated, service_role, postgres;

commit;

-- ✅ Done! RLS disabled, permissions granted, seed data inserted.
-- Refresh the app — live data will now come from Supabase.
