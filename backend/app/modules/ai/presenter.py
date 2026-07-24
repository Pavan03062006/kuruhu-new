from typing import Any


def unique_values(rows: list[dict[str, Any]], candidates: tuple[str, ...]) -> list[str]:
    values: list[str] = []
    for row in rows:
        for key in candidates:
            value = row.get(key)
            if value is not None and str(value) not in values:
                values.append(str(value))
    return values[:100]


def citations(rows: list[dict[str, Any]]) -> dict[str, list[str] | str]:
    return {
        "fir_references": unique_values(rows, ("crime_number", "case_number", "fir_number", "fir_no", "fir_id")),
        "stations": unique_values(rows, ("police_station", "unit_name", "station_name", "police_station_name")),
        "districts": unique_values(rows, ("district", "district_name")),
        "provenance": "PRAMAAN PostgreSQL operational FIR database (read-only query)",
    }


def visualization(rows: list[dict[str, Any]]) -> dict[str, Any]:
    if not rows:
        return {"type": "empty", "title": "No matching records"}
    columns = list(rows[0])
    numeric = [key for key in columns if any(isinstance(row.get(key), (int, float)) for row in rows)]
    categorical = [key for key in columns if key not in numeric]
    if numeric and categorical and len(rows) <= 30:
        return {"type": "bar", "title": "Query result", "category": categorical[0], "value": numeric[0]}
    return {"type": "table", "title": "Query result", "columns": columns}
