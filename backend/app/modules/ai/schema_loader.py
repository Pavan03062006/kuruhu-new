from dataclasses import dataclass


@dataclass(frozen=True)
class TableSchema:
    description: str
    columns: tuple[str, ...]


ALLOWED_SCHEMA: dict[str, TableSchema] = {
    "firs": TableSchema("Registered FIR and case facts", ("id", "source_case_master_id", "crime_number", "case_number", "registered_at", "police_station_id", "crime_head_id", "crime_sub_head_id", "status_id", "incident_from", "incident_to", "brief_facts")),
    "police_units": TableSchema("Police stations and hierarchical units", ("id", "source_unit_id", "name", "unit_type_id", "parent_unit_id", "district_id")),
    "districts": TableSchema("District master", ("id", "source_district_id", "state_id", "name")),
    "crime_heads": TableSchema("Major crime classification", ("id", "name")),
    "crime_sub_heads": TableSchema("Minor crime classification", ("id", "crime_head_id", "name")),
    "case_statuses": TableSchema("Investigation/case status", ("id", "name")),
    "persons": TableSchema("Normalized persons", ("id", "canonical_name", "normalized_name", "age_years", "gender")),
    "case_parties": TableSchema("Person role in an FIR", ("id", "fir_id", "person_id", "role", "source_record_id")),
    "fir_sections": TableSchema("FIR to statutory section association", ("fir_id", "section_id")),
    "statutory_sections": TableSchema("Act and section definitions", ("id", "act_code", "section_code", "description")),
    "arrests": TableSchema("Arrest/surrender events", ("id", "source_arrest_id", "fir_id", "arrested_at", "police_station_id")),
    "charge_sheets": TableSchema("Charge sheet filings", ("id", "source_charge_sheet_id", "fir_id", "filed_at", "charge_sheet_type")),
}


def schema_prompt(tables: list[str] | None = None) -> str:
    selected = tables or list(ALLOWED_SCHEMA)
    return "\n".join(f"{name}: {ALLOWED_SCHEMA[name].description}; columns: {', '.join(ALLOWED_SCHEMA[name].columns)}" for name in selected if name in ALLOWED_SCHEMA)
