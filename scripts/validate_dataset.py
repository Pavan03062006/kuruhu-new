#!/usr/bin/env python3
import argparse
import csv
import json
from collections import Counter
from pathlib import Path

from dataset_spec import QUARANTINE_FILES, SOFT_FOREIGN_KEYS, TABLE_SPECS


def read_keys(path: Path, columns: tuple[str, ...]) -> tuple[set[tuple[str, ...]], list[dict[str, object]], int]:
    keys: set[tuple[str, ...]] = set()
    errors: list[dict[str, object]] = []
    count = 0
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = [column for column in columns if column not in (reader.fieldnames or [])]
        if missing:
            return keys, [{"file": path.name, "row": 1, "code": "MISSING_COLUMN", "detail": missing}], 0
        for row_number, row in enumerate(reader, start=2):
            count += 1
            key = tuple((row.get(column) or "").strip() for column in columns)
            if not all(key):
                errors.append({"file": path.name, "row": row_number, "code": "NULL_PRIMARY_KEY", "detail": columns})
            elif key in keys:
                errors.append({"file": path.name, "row": row_number, "code": "DUPLICATE_PRIMARY_KEY", "detail": key})
            else:
                keys.add(key)
    return keys, errors, count


def validate(dataset: Path) -> dict[str, object]:
    errors: list[dict[str, object]] = []
    warnings: list[dict[str, object]] = []
    counts: dict[str, int] = {}
    key_cache: dict[tuple[str, str], set[str]] = {}
    primary_keys: dict[str, set[tuple[str, ...]]] = {}
    for filename, spec in TABLE_SPECS.items():
        path = dataset / filename
        if not path.exists():
            errors.append({"file": filename, "row": 0, "code": "MISSING_FILE", "detail": "required SCRB source table"})
            continue
        keys, table_errors, count = read_keys(path, spec.primary_key)
        primary_keys[filename] = keys
        counts[filename] = count
        errors.extend(table_errors)
    for filename, spec in TABLE_SPECS.items():
        path = dataset / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8-sig", newline="") as handle:
            for row_number, row in enumerate(csv.DictReader(handle), start=2):
                for foreign_key in spec.foreign_keys:
                    value = (row.get(foreign_key.column) or "").strip()
                    if not value and foreign_key.nullable:
                        continue
                    cache_key = (foreign_key.target_file, foreign_key.target_column)
                    if cache_key not in key_cache:
                        target_path = dataset / foreign_key.target_file
                        if target_path.exists():
                            with target_path.open(encoding="utf-8-sig", newline="") as target:
                                key_cache[cache_key] = {(item.get(foreign_key.target_column) or "").strip() for item in csv.DictReader(target)}
                        else:
                            key_cache[cache_key] = set()
                    if not value or value not in key_cache[cache_key]:
                        issue = {"file": filename, "row": row_number, "code": "FOREIGN_KEY_NOT_FOUND", "detail": {foreign_key.column: value, "target": cache_key}}
                        (warnings if (filename, foreign_key.column) in SOFT_FOREIGN_KEYS else errors).append(issue)
    for filename in QUARANTINE_FILES:
        path = dataset / filename
        if path.exists():
            with path.open(encoding="utf-8-sig", newline="") as handle:
                counts[filename] = sum(1 for _ in csv.DictReader(handle))
                warnings.append({"file": filename, "row": 0, "code": "QUARANTINED_FILE", "detail": {"rows": counts[filename]}})
    return {"valid": not errors, "table_counts": counts, "error_counts": dict(Counter(error["code"] for error in errors)), "warning_counts": dict(Counter(warning["code"] for warning in warnings)), "warning_file_counts": {f"{filename}:{code}": count for (filename, code), count in Counter((warning["file"], warning["code"]) for warning in warnings).items()}, "errors": errors, "warnings": warnings}


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate an SCRB-shaped FIR proxy dataset without modifying it.")
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--max-errors", type=int, default=1000)
    args = parser.parse_args()
    report = validate(args.dataset.resolve())
    report["errors"] = report["errors"][: args.max_errors]
    report["warnings"] = report["warnings"][: args.max_errors]
    output = json.dumps(report, indent=2, ensure_ascii=False)
    if args.report:
        args.report.write_text(output + "\n", encoding="utf-8")
    print(output)
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
