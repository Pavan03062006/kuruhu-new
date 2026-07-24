# FIR import pipeline

## Workflow

1. Extract the archive into an access-controlled working directory.
2. Run `validate_dataset.py`. It checks required files, primary keys, foreign keys, and quarantine counts without modifying source data.
3. Calculate a deterministic SHA-256 digest across filenames and bytes.
4. Register `data_import_runs`. The digest plus schema version prevents accidental duplicate imports.
5. Stage every source table as text in a run-specific unlogged PostgreSQL schema. Batches commit independently and update the file/row checkpoint.
6. Run set-based transformations in dependency order: masters → units/officers → FIRs → people/roles → sections → arrests/chargesheets.
7. Preserve raw payloads and row numbers on transactional records, and materialize source-to-target lineage.
8. Mark the run completed and remove staging unless `--keep-staging` is requested.

Validation failures stop transformation. Invalid records must be inserted into `data_import_rejections` by an approved remediation workflow; `Victim_orphaned_records.csv` remains quarantine input and is never loaded as a valid victim.

## Commands

```powershell
python scripts/validate_dataset.py C:\secure\fir_synthetic_data_50k_cleaned --report validation-report.json
cd backend
alembic -c alembic.ini upgrade head
cd ..
python scripts/import_fir_data.py C:\secure\fir_synthetic_data_50k_cleaned --database-url "postgresql://pramaan_import:***@localhost:5432/pramaan"
```

Resume after an interrupted stage:

```powershell
python scripts/import_fir_data.py C:\secure\fir_synthetic_data_50k_cleaned --database-url "$env:PRAMAAN_IMPORT_DATABASE_URL" --resume
```

## Reconciliation

After import, compare source counts with `data_import_runs.statistics`, target counts, and rejection counts. Verify representative source keys from every table. Run foreign-key and constraint tests, sample query plans for indexed investigator paths, and archive the validation report plus dataset digest with the deployment record.

Never pass credentials on shared terminals in production; use the approved secret manager to populate `PRAMAAN_IMPORT_DATABASE_URL`.
