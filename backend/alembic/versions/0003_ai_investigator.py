"""AI Investigator conversations, query history and audit trail."""
from alembic import op

revision = "0003_ai_investigator"
down_revision = "0002_auth_rbac"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE ai_conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, title varchar(255) NOT NULL, context jsonb NOT NULL DEFAULT '{}'::jsonb, is_pinned boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
    CREATE INDEX ix_ai_conversations_user_time ON ai_conversations(user_id,updated_at DESC);
    CREATE TABLE ai_queries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, natural_language_query text NOT NULL, generated_sql text, parameters jsonb NOT NULL DEFAULT '{}'::jsonb, answer text, explanation jsonb NOT NULL DEFAULT '{}'::jsonb, visualization jsonb NOT NULL DEFAULT '{}'::jsonb, result_preview jsonb NOT NULL DEFAULT '[]'::jsonb, row_count bigint NOT NULL DEFAULT 0, execution_ms bigint, status varchar(32) NOT NULL, error_code varchar(64), created_at timestamptz NOT NULL DEFAULT now());
    CREATE INDEX ix_ai_queries_user_time ON ai_queries(user_id,created_at DESC); CREATE INDEX ix_ai_queries_conversation ON ai_queries(conversation_id,created_at);
    CREATE TABLE ai_query_audits (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, query_id uuid UNIQUE NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id), occurred_at timestamptz NOT NULL DEFAULT now(), generated_sql text, execution_ms bigint, tables_accessed jsonb NOT NULL DEFAULT '[]'::jsonb, returned_rows bigint NOT NULL DEFAULT 0, succeeded boolean NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb);
    CREATE INDEX ix_ai_query_audits_user_time ON ai_query_audits(user_id,occurred_at DESC);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS ai_query_audits,ai_queries,ai_conversations CASCADE")
