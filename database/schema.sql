BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE party_role AS ENUM ('ACCUSED', 'VICTIM', 'COMPLAINANT');
CREATE TYPE gender_code AS ENUM ('M', 'F', 'T', 'O', 'U');
CREATE TYPE import_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

CREATE TABLE states (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_state_id bigint UNIQUE,
  name citext NOT NULL UNIQUE,
  nationality_id bigint,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE districts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_district_id bigint UNIQUE,
  state_id bigint NOT NULL REFERENCES states(id),
  name citext NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (state_id, name)
);

CREATE TABLE unit_types (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_unit_type_id bigint UNIQUE,
  name citext NOT NULL UNIQUE,
  jurisdiction_level varchar(32),
  hierarchy_level smallint,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE police_units (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_unit_id bigint UNIQUE,
  name citext NOT NULL,
  unit_type_id bigint NOT NULL REFERENCES unit_types(id),
  parent_unit_id bigint REFERENCES police_units(id),
  state_id bigint REFERENCES states(id),
  district_id bigint REFERENCES districts(id),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (district_id, name)
);

CREATE TABLE case_categories (id smallint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE case_statuses (id smallint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE gravity_offences (id smallint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE crime_heads (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE, is_active boolean NOT NULL DEFAULT true);
CREATE TABLE crime_sub_heads (
  id bigint PRIMARY KEY,
  crime_head_id bigint NOT NULL REFERENCES crime_heads(id),
  name citext NOT NULL,
  sequence_no integer,
  UNIQUE (crime_head_id, name)
);
CREATE TABLE occupations (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE religions (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE castes (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE);
CREATE TABLE ranks (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE, hierarchy smallint, is_active boolean NOT NULL DEFAULT true);
CREATE TABLE designations (id bigint PRIMARY KEY, name citext NOT NULL UNIQUE, sort_order smallint, is_active boolean NOT NULL DEFAULT true);

CREATE TABLE acts (
  code varchar(32) PRIMARY KEY,
  description text NOT NULL,
  short_name citext NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE statutory_sections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  act_code varchar(32) NOT NULL REFERENCES acts(code),
  section_code varchar(64) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (act_code, section_code)
);

CREATE TABLE crime_head_sections (
  crime_head_id bigint NOT NULL REFERENCES crime_heads(id),
  section_id bigint NOT NULL REFERENCES statutory_sections(id),
  PRIMARY KEY (crime_head_id, section_id)
);

CREATE TABLE courts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_court_id bigint UNIQUE,
  district_id bigint REFERENCES districts(id),
  state_id bigint REFERENCES states(id),
  name citext NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE officers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_employee_id bigint UNIQUE,
  kgid varchar(64) UNIQUE,
  district_id bigint REFERENCES districts(id),
  unit_id bigint REFERENCES police_units(id),
  rank_id bigint REFERENCES ranks(id),
  designation_id bigint REFERENCES designations(id),
  first_name text NOT NULL,
  date_of_birth date,
  gender gender_code NOT NULL DEFAULT 'U',
  blood_group_id bigint,
  is_physically_challenged boolean,
  appointment_date date
);

CREATE TABLE firs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_case_master_id bigint NOT NULL UNIQUE,
  crime_number varchar(64) NOT NULL,
  case_number varchar(64),
  registered_at timestamptz NOT NULL,
  investigating_officer_id bigint REFERENCES officers(id),
  police_station_id bigint NOT NULL REFERENCES police_units(id),
  category_id smallint REFERENCES case_categories(id),
  gravity_id smallint REFERENCES gravity_offences(id),
  crime_head_id bigint REFERENCES crime_heads(id),
  crime_sub_head_id bigint REFERENCES crime_sub_heads(id),
  status_id smallint REFERENCES case_statuses(id),
  court_id bigint REFERENCES courts(id),
  incident_from timestamptz,
  incident_to timestamptz,
  information_received_at timestamptz,
  latitude numeric(9,6),
  longitude numeric(9,6),
  brief_facts text,
  source_file varchar(255) NOT NULL DEFAULT 'CaseMaster.csv',
  source_row_number bigint NOT NULL,
  source_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fir_incident_range CHECK (incident_to IS NULL OR incident_from IS NULL OR incident_to >= incident_from),
  CONSTRAINT fir_latitude CHECK (latitude IS NULL OR latitude > -90 AND latitude < 90),
  CONSTRAINT fir_longitude CHECK (longitude IS NULL OR longitude > -180 AND longitude < 180),
  UNIQUE (police_station_id, crime_number)
);

CREATE TABLE occurrences (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  occurred_from timestamptz,
  occurred_to timestamptz,
  latitude numeric(9,6),
  longitude numeric(9,6),
  source_row_number bigint,
  CHECK (occurred_to IS NULL OR occurred_from IS NULL OR occurred_to >= occurred_from)
);

CREATE TABLE persons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  canonical_name text NOT NULL,
  normalized_name text GENERATED ALWAYS AS (lower(regexp_replace(canonical_name, '\\s+', ' ', 'g'))) STORED,
  age_years smallint,
  gender gender_code NOT NULL DEFAULT 'U',
  aadhaar_hash char(64),
  source_table varchar(64),
  source_record_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (age_years IS NULL OR age_years BETWEEN 0 AND 110),
  CHECK (aadhaar_hash IS NULL OR aadhaar_hash ~ '^[0-9a-f]{64}$'),
  UNIQUE (source_table, source_record_id)
);

CREATE TABLE case_parties (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  person_id bigint NOT NULL REFERENCES persons(id),
  role party_role NOT NULL,
  source_table varchar(64) NOT NULL,
  source_record_id bigint NOT NULL,
  source_person_id varchar(64),
  occupation_id bigint REFERENCES occupations(id),
  religion_id bigint REFERENCES religions(id),
  caste_id bigint REFERENCES castes(id),
  is_police_person boolean,
  source_row_number bigint NOT NULL,
  source_payload jsonb NOT NULL,
  UNIQUE (source_table, source_record_id)
);

CREATE TABLE person_aliases (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id bigint NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text GENERATED ALWAYS AS (lower(regexp_replace(alias, '\\s+', ' ', 'g'))) STORED,
  UNIQUE (person_id, normalized_alias)
);

CREATE TABLE person_contacts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id bigint NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  contact_type varchar(24) NOT NULL CHECK (contact_type IN ('MOBILE', 'PHONE', 'EMAIL')),
  value_encrypted bytea NOT NULL,
  value_hash char(64) NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  UNIQUE (contact_type, value_hash)
);

CREATE TABLE addresses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id bigint REFERENCES persons(id) ON DELETE CASCADE,
  organization_id bigint,
  address_type varchar(24) NOT NULL DEFAULT 'OTHER',
  line_1 text,
  line_2 text,
  locality text,
  district_id bigint REFERENCES districts(id),
  state_id bigint REFERENCES states(id),
  postal_code varchar(12),
  latitude numeric(9,6),
  longitude numeric(9,6),
  CHECK ((person_id IS NOT NULL) <> (organization_id IS NOT NULL))
);

CREATE TABLE organizations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name citext NOT NULL,
  organization_type varchar(64),
  registration_number varchar(128),
  UNIQUE (name, registration_number)
);
ALTER TABLE addresses ADD CONSTRAINT addresses_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE vehicles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registration_number citext NOT NULL UNIQUE,
  chassis_hash char(64),
  engine_hash char(64),
  make text,
  model text,
  color text
);
CREATE TABLE fir_vehicles (fir_id bigint REFERENCES firs(id) ON DELETE CASCADE, vehicle_id bigint REFERENCES vehicles(id), relationship varchar(32) NOT NULL, PRIMARY KEY (fir_id, vehicle_id, relationship));

CREATE TABLE weapons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  weapon_type varchar(128) NOT NULL,
  description text,
  serial_number_hash char(64)
);
CREATE TABLE fir_weapons (fir_id bigint REFERENCES firs(id) ON DELETE CASCADE, weapon_id bigint REFERENCES weapons(id), PRIMARY KEY (fir_id, weapon_id));

CREATE TABLE evidence (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  evidence_type varchar(64) NOT NULL,
  description text,
  storage_reference text,
  collected_at timestamptz,
  collected_by_officer_id bigint REFERENCES officers(id),
  chain_of_custody jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE fir_sections (
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  section_id bigint NOT NULL REFERENCES statutory_sections(id),
  act_order smallint,
  section_order smallint,
  source_row_number bigint,
  PRIMARY KEY (fir_id, section_id)
);

CREATE TABLE arrests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_arrest_id bigint UNIQUE,
  fir_id bigint NOT NULL REFERENCES firs(id),
  arrest_type_id bigint,
  arrested_at timestamptz,
  state_id bigint REFERENCES states(id),
  district_id bigint REFERENCES districts(id),
  police_station_id bigint REFERENCES police_units(id),
  investigating_officer_id bigint REFERENCES officers(id),
  court_id bigint REFERENCES courts(id),
  is_accused boolean,
  is_complainant_accused boolean,
  source_row_number bigint NOT NULL,
  source_payload jsonb NOT NULL
);
CREATE TABLE arrest_parties (arrest_id bigint REFERENCES arrests(id) ON DELETE CASCADE, case_party_id bigint REFERENCES case_parties(id), PRIMARY KEY (arrest_id, case_party_id));

CREATE TABLE charge_sheets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_charge_sheet_id bigint UNIQUE,
  fir_id bigint NOT NULL REFERENCES firs(id),
  filed_at timestamptz NOT NULL,
  charge_sheet_type varchar(8) NOT NULL,
  filing_officer_id bigint REFERENCES officers(id),
  source_row_number bigint NOT NULL,
  source_payload jsonb NOT NULL
);

CREATE TABLE investigation_notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  author_officer_id bigint NOT NULL REFERENCES officers(id),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fir_id bigint NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
  object_key text NOT NULL UNIQUE,
  original_name text NOT NULL,
  media_type varchar(255) NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  sha256 char(64) NOT NULL,
  uploaded_by_officer_id bigint REFERENCES officers(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE data_import_runs (
  id uuid PRIMARY KEY,
  dataset_name text NOT NULL,
  dataset_sha256 char(64) NOT NULL,
  schema_version varchar(32) NOT NULL,
  status import_status NOT NULL DEFAULT 'PENDING',
  started_at timestamptz,
  completed_at timestamptz,
  last_file varchar(255),
  last_row_number bigint NOT NULL DEFAULT 0,
  rows_read bigint NOT NULL DEFAULT 0,
  rows_imported bigint NOT NULL DEFAULT 0,
  rows_rejected bigint NOT NULL DEFAULT 0,
  statistics jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  UNIQUE (dataset_sha256, schema_version)
);

CREATE TABLE data_import_rejections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  import_run_id uuid NOT NULL REFERENCES data_import_runs(id) ON DELETE CASCADE,
  source_file varchar(255) NOT NULL,
  source_row_number bigint NOT NULL,
  reason_code varchar(64) NOT NULL,
  reason_detail text NOT NULL,
  source_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (import_run_id, source_file, source_row_number, reason_code)
);

CREATE TABLE source_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  import_run_id uuid NOT NULL REFERENCES data_import_runs(id),
  source_file varchar(255) NOT NULL,
  source_table varchar(64) NOT NULL,
  source_record_id varchar(128),
  source_row_number bigint NOT NULL,
  target_table varchar(64),
  target_record_id bigint,
  payload_sha256 char(64) NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (import_run_id, source_file, source_row_number)
);

CREATE TABLE audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_officer_id bigint REFERENCES officers(id),
  action varchar(64) NOT NULL,
  entity_type varchar(64) NOT NULL,
  entity_id varchar(128) NOT NULL,
  request_id uuid,
  source_ip inet,
  before_data jsonb,
  after_data jsonb,
  reason text
);

CREATE INDEX ix_firs_crime_number ON firs (crime_number);
CREATE INDEX ix_firs_registered_at ON firs (registered_at DESC);
CREATE INDEX ix_firs_station_date ON firs (police_station_id, registered_at DESC);
CREATE INDEX ix_firs_head_date ON firs (crime_head_id, registered_at DESC);
CREATE INDEX ix_firs_status_station ON firs (status_id, police_station_id);
CREATE INDEX ix_firs_brief_facts_trgm ON firs USING gin (brief_facts gin_trgm_ops);
CREATE INDEX ix_police_units_district_type ON police_units (district_id, unit_type_id);
CREATE INDEX ix_case_parties_fir_role ON case_parties (fir_id, role);
CREATE INDEX ix_case_parties_person_role ON case_parties (person_id, role);
CREATE INDEX ix_persons_name_trgm ON persons USING gin (normalized_name gin_trgm_ops);
CREATE INDEX ix_person_aliases_trgm ON person_aliases USING gin (normalized_alias gin_trgm_ops);
CREATE INDEX ix_person_contacts_hash ON person_contacts (value_hash);
CREATE INDEX ix_fir_sections_section_fir ON fir_sections (section_id, fir_id);
CREATE INDEX ix_arrests_fir_date ON arrests (fir_id, arrested_at DESC);
CREATE INDEX ix_charge_sheets_fir_date ON charge_sheets (fir_id, filed_at DESC);
CREATE INDEX ix_occurrences_time ON occurrences (occurred_from, occurred_to);
CREATE INDEX ix_source_records_lookup ON source_records (source_table, source_record_id);
CREATE INDEX ix_audit_entity_time ON audit_logs (entity_type, entity_id, occurred_at DESC);
CREATE INDEX ix_audit_actor_time ON audit_logs (actor_officer_id, occurred_at DESC);

COMMIT;
