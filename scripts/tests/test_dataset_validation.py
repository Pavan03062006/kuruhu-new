import csv
from pathlib import Path

from validate_dataset import read_keys


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def test_duplicate_primary_key_is_rejected(tmp_path: Path) -> None:
    path = tmp_path / "State.csv"
    write_csv(path, [{"StateID": "1", "StateName": "Karnataka"}, {"StateID": "1", "StateName": "Duplicate"}])
    _, errors, count = read_keys(path, ("StateID",))
    assert count == 2
    assert errors[0]["code"] == "DUPLICATE_PRIMARY_KEY"


def test_blank_primary_key_is_rejected(tmp_path: Path) -> None:
    path = tmp_path / "State.csv"
    write_csv(path, [{"StateID": "", "StateName": "Unknown"}])
    _, errors, _ = read_keys(path, ("StateID",))
    assert errors[0]["code"] == "NULL_PRIMARY_KEY"
