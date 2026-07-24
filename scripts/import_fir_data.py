#!/usr/bin/env python3
import argparse
import csv
import hashlib
import json
import re
import uuid
from pathlib import Path

import psycopg
from psycopg import sql

from dataset_spec import IMPORT_ORDER
from validate_dataset import validate

SCHEMA_VERSION = "scrb-v1"


def dataset_digest(dataset: Path) -> str:
    digest = hashlib.sha256()
    for path in sorted(dataset.glob("*.csv")):
        digest.update(path.name.encode())
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
    return digest.hexdigest()


def table_name(filename: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", Path(filename).stem.lower()).strip("_")


def stage_file(connection: psycopg.Connection[tuple[object, ...]], run_id: uuid.UUID, schema_name: str, path: Path, batch_size: int, resume_row: int = 0) -> tuple[int, int]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        headers = next(reader)
        target = table_name(path.name)
        columns = [sql.Identifier(header) for header in headers]
        with connection.cursor() as cursor:
            cursor.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(schema_name)))
            definitions = sql.SQL(", ").join(sql.SQL("{} text").format(column) for column in columns)
            cursor.execute(sql.SQL("CREATE UNLOGGED TABLE IF NOT EXISTS {}.{} (_source_row bigint PRIMARY KEY, {})").format(sql.Identifier(schema_name), sql.Identifier(target), definitions))
        imported = 0
        read = 0
        pending: list[tuple[object, ...]] = []
        for row_number, row in enumerate(reader, start=2):
            read += 1
            if row_number <= resume_row:
                continue
            pending.append((row_number, *row))
            if len(pending) >= batch_size:
                _write_batch(connection, schema_name, target, headers, pending)
                imported += len(pending)
                _checkpoint(connection, run_id, path.name, row_number, len(pending), len(pending))
                pending.clear()
        if pending:
            _write_batch(connection, schema_name, target, headers, pending)
            imported += len(pending)
            _checkpoint(connection, run_id, path.name, pending[-1][0], len(pending), len(pending))
        return read, imported


def _write_batch(connection: psycopg.Connection[tuple[object, ...]], schema_name: str, target: str, headers: list[str], rows: list[tuple[object, ...]]) -> None:
    column_list = sql.SQL(", ").join([sql.Identifier("_source_row"), *(sql.Identifier(header) for header in headers)])
    placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in range(len(headers) + 1))
    statement = sql.SQL("INSERT INTO {}.{} ({}) VALUES ({}) ON CONFLICT (_source_row) DO NOTHING").format(sql.Identifier(schema_name), sql.Identifier(target), column_list, placeholders)
    with connection.cursor() as cursor:
        cursor.executemany(statement, rows)
    connection.commit()


def _checkpoint(connection: psycopg.Connection[tuple[object, ...]], run_id: uuid.UUID, filename: str, row_number: int, rows_read: int, rows_imported: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute("UPDATE data_import_runs SET status='RUNNING', last_file=%s, last_row_number=%s, rows_read=rows_read+%s, rows_imported=rows_imported+%s WHERE id=%s", (filename, row_number, rows_read, rows_imported, run_id))
    connection.commit()


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate, stage, and transform the SCRB-shaped FIR proxy dataset.")
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--database-url", required=True, help="PostgreSQL URL accepted by psycopg")
    parser.add_argument("--batch-size", type=int, default=2000)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--keep-staging", action="store_true")
    args = parser.parse_args()
    dataset = args.dataset.resolve()
    report = validate(dataset)
    if not report["valid"]:
        print(json.dumps({"status": "rejected", "error_counts": report["error_counts"], "first_errors": report["errors"][:25]}, indent=2))
        return 2
    digest = dataset_digest(dataset)
    with psycopg.connect(args.database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, status, last_file, last_row_number FROM data_import_runs WHERE dataset_sha256=%s AND schema_version=%s", (digest, SCHEMA_VERSION))
            existing = cursor.fetchone()
            if existing and not args.resume:
                raise RuntimeError(f"Dataset already registered as run {existing[0]}; pass --resume")
            if existing:
                run_id, _, last_file, last_row = existing
            else:
                run_id, last_file, last_row = uuid.uuid4(), None, 0
                cursor.execute("INSERT INTO data_import_runs (id,dataset_name,dataset_sha256,schema_version,status,started_at,statistics) VALUES (%s,%s,%s,%s,'RUNNING',now(),%s::jsonb)", (run_id, dataset.name, digest, SCHEMA_VERSION, json.dumps({"validation": report["table_counts"]})))
        connection.commit()
        schema_name = f"import_{str(run_id).replace('-', '_')}"
        resume_reached = last_file is None
        for filename in IMPORT_ORDER:
            if not resume_reached:
                resume_reached = filename == last_file
                if not resume_reached:
                    continue
            resume_row = int(last_row or 0) if filename == last_file else 0
            stage_file(connection, run_id, schema_name, dataset / filename, args.batch_size, resume_row)
        transform = (Path(__file__).parents[1] / "database" / "import_transform.sql").read_text(encoding="utf-8")
        with connection.cursor() as cursor:
            cursor.execute(sql.SQL("SET LOCAL search_path TO {}, public").format(sql.Identifier(schema_name)))
            cursor.execute(transform, {"run_id": run_id})
            cursor.execute("UPDATE data_import_runs SET status='COMPLETED', completed_at=now(), last_file=NULL, last_row_number=0 WHERE id=%s", (run_id,))
            if not args.keep_staging:
                cursor.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema_name)))
        connection.commit()
        print(json.dumps({"status": "completed", "import_run_id": str(run_id), "dataset_sha256": digest}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
