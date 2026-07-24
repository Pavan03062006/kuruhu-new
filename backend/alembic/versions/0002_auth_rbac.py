"""Enterprise authentication and database-driven RBAC."""
from alembic import op

revision = "0002_auth_rbac"
down_revision = "0001_scrb_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE roles (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, code varchar(64) UNIQUE NOT NULL, name varchar(128) UNIQUE NOT NULL, description varchar(500), is_system boolean NOT NULL DEFAULT false);
    CREATE TABLE permissions (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, code varchar(128) UNIQUE NOT NULL, name varchar(128) NOT NULL, description varchar(500));
    CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), login_identifier varchar(128) UNIQUE NOT NULL, mobile_number varchar(16) UNIQUE, psn varchar(64) UNIQUE, password_hash varchar(255) NOT NULL, is_active boolean NOT NULL DEFAULT true, failed_login_count integer NOT NULL DEFAULT 0, locked_until timestamptz, last_login_at timestamptz, password_changed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK (mobile_number IS NOT NULL OR psn IS NOT NULL));
    CREATE TABLE user_profiles (user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, display_name varchar(255) NOT NULL, district_id bigint REFERENCES districts(id), language varchar(8) NOT NULL DEFAULT 'en');
    CREATE TABLE role_permissions (role_id bigint REFERENCES roles(id) ON DELETE CASCADE, permission_id bigint REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY(role_id,permission_id));
    CREATE TABLE user_roles (user_id uuid REFERENCES users(id) ON DELETE CASCADE, role_id bigint REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY(user_id,role_id));
    CREATE TABLE refresh_tokens (id uuid PRIMARY KEY, family_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash char(64) UNIQUE NOT NULL, issued_at timestamptz NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz, replaced_by_id uuid, created_ip inet, user_agent varchar(500));
    CREATE INDEX ix_refresh_tokens_family ON refresh_tokens(family_id); CREATE INDEX ix_refresh_tokens_user ON refresh_tokens(user_id); CREATE INDEX ix_refresh_tokens_expiry ON refresh_tokens(expires_at);
    CREATE TABLE password_reset_tokens (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash char(64) UNIQUE NOT NULL, expires_at timestamptz NOT NULL, used_at timestamptz);
    CREATE TABLE login_attempts (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, identifier_hash char(64) NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(), succeeded boolean NOT NULL, ip_address inet, request_id uuid);
    CREATE INDEX ix_login_attempts_identifier_time ON login_attempts(identifier_hash,occurred_at DESC);
    CREATE TABLE audit_events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, occurred_at timestamptz NOT NULL DEFAULT now(), user_id uuid REFERENCES users(id), action varchar(64) NOT NULL, result varchar(32) NOT NULL, ip_address inet, user_agent varchar(500), request_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb);
    CREATE INDEX ix_audit_events_user_time ON audit_events(user_id,occurred_at DESC); CREATE INDEX ix_audit_events_action_time ON audit_events(action,occurred_at DESC);
    """)
    permissions = [('firs:view','View FIRs'),('firs:search','Search FIRs'),('cases:create','Create Cases'),('cases:edit','Edit Cases'),('reports:export','Export Reports'),('analytics:view','View Analytics'),('ai:access','Access AI Investigator'),('users:manage','Manage Users'),('roles:manage','Manage Roles'),('audit:view','View Audit Logs'),('system:configure','Configure System')]
    for code, name in permissions:
        op.execute(f"INSERT INTO permissions(code,name) VALUES ('{code}','{name}') ON CONFLICT DO NOTHING")
    roles = [('super_admin','Super Admin'),('scrb_admin','SCRB Admin'),('district_admin','District Admin'),('investigation_officer','Investigation Officer'),('analyst','Analyst'),('read_only_auditor','Read-Only Auditor')]
    for code, name in roles:
        op.execute(f"INSERT INTO roles(code,name,is_system) VALUES ('{code}','{name}',true) ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='super_admin' ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code<>'system:configure' WHERE r.code='scrb_admin' ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('firs:view','firs:search','cases:create','cases:edit','users:manage','audit:view') WHERE r.code='district_admin' ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('firs:view','firs:search','cases:create','cases:edit','ai:access') WHERE r.code='investigation_officer' ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('firs:view','firs:search','analytics:view','reports:export') WHERE r.code='analyst' ON CONFLICT DO NOTHING")
    op.execute("INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('firs:view','firs:search','audit:view') WHERE r.code='read_only_auditor' ON CONFLICT DO NOTHING")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS audit_events,password_reset_tokens,login_attempts,refresh_tokens,user_roles,role_permissions,user_profiles,users,permissions,roles CASCADE")
