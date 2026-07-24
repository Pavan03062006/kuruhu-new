"""SCRB-aligned PRAMAAN data model baseline."""
from pathlib import Path

from alembic import op

revision = "0001_scrb_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    schema_path = Path(__file__).parents[3] / "database" / "schema.sql"
    ddl = schema_path.read_text(encoding="utf-8").replace("BEGIN;", "", 1).rsplit("COMMIT;", 1)[0]
    op.get_bind().exec_driver_sql(ddl)


def downgrade() -> None:
    raise RuntimeError("Baseline downgrade is intentionally disabled; restore from a verified backup instead.")
