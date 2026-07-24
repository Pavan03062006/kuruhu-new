# Database boundary

Session 2 establishes the SCRB-aligned PostgreSQL model. `schema.sql` is the canonical empty-database DDL, `migration.sql` is the psql entry point, and the matching Alembic baseline lives under `backend/alembic/versions`. The proxy dataset is never copied into this repository.

Apply migrations through Alembic in managed environments. Direct `schema.sql` use is reserved for disposable local databases and reviewed bootstrap procedures.
