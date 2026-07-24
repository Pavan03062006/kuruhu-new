# PRAMAAN database architecture

## Authority and scope

The SCRB field names and relationships represented by the supplied 27-table export are the source contract. The cleaned 50k dataset is a synthetic proxy used only to validate mapping and importer behavior. PRAMAAN does not reinterpret proxy values as official production data.

When source and target differ, the official SCRB meaning wins. Original IDs, file names, row numbers, and JSON payloads are retained so every imported record can be reconciled with its source.

## Mapping decisions

| SCRB source | PRAMAAN target | Decision |
|---|---|---|
| `CaseMaster` | `firs` | Internal identity key; unique `source_case_master_id` retains the SCRB key. `CrimeNo` remains text to avoid numeric truncation. |
| `Unit` + `UnitType` | `police_units` + `unit_types` | One self-referencing hierarchy represents state/division/district/station units. A “Police Station” is a typed unit, not a separate duplicated master. |
| `District`, `State` | `districts`, `states` | Normalized geography with source IDs and foreign keys. |
| `Employee` | `officers` | `KGID` is a unique alternate identifier; rank/designation/unit stay normalized. |
| `Accused`, `Victim`, `ComplainantDetails` | `persons` + `case_parties` | Common person entity plus explicit role. Each source row initially creates one person; entity resolution is deliberately deferred to a governed future process. |
| `PersonID` | `case_parties.source_person_id` | Preserved as source data; it is not assumed globally reliable enough to become the database primary key. |
| `Act`, `Section` | `acts`, `statutory_sections` | Act and section codes remain strings; section uniqueness is `(act_code, section_code)`. |
| `ActSectionAssociation` | `fir_sections` | Many-to-many statutory classification with source ordering. |
| Major/minor crime heads | `crime_heads`, `crime_sub_heads` | Retains SCRB hierarchy and supports analytical grouping. |
| `Inv_OccuranceTime` | `occurrences` | Separate event/time representation; the misspelling remains confined to the importer. |
| `ArrestSurrender` + junction | `arrests` + `arrest_parties` | Models an arrest event independently from accused participation. |
| `ChargesheetDetails` | `charge_sheets` | Filing event linked to FIR and filing officer. |
| `Victim_orphaned_records` | `data_import_rejections` | Quarantined; never silently dropped or linked by guesswork. |

Proxy-only normalization (gender `M/F/T/O`, ISO dates, plausible ages, and removed sentinel coordinates) is revalidated by constraints. The database also accepts `U` for unknown gender because production sources may contain a legitimate absence.

Full-proxy validation produced no blocking structural errors. It did identify 750 `CaseMaster` officer references and 474 arrest IO references outside the supplied 5,000-row employee proxy, plus 2,298 arrest-accused junction references outside the supplied accused proxy. Optional officer links import as null while retaining the raw ID in source payloads. Unresolved arrest-party links and the 979 already-quarantined victims are written to the rejection ledger. These proxy gaps do not relax official production foreign keys.

## Table groups

- Reference: states, districts, unit types, police units, categories, statuses, gravity, crime heads, occupations, religions, castes, ranks, designations, acts, sections, courts.
- Core case: FIRs, occurrences, sections, charge sheets, arrests.
- People and network: persons, parties, aliases, contacts, addresses, organizations, arrest-party links.
- Investigation-ready extensions: vehicles, weapons, evidence, notes, attachments. These are empty until an official source or application workflow supplies them.
- Governance: import runs, rejections, source records, audit logs.

## Query and index strategy

The operational indexes match common investigator access paths: station/date, crime head/date, status/station, FIR/crime number, statutory section/FIR, person/role, arrest/date, and chargesheet/date. GIN trigram indexes support names, aliases, and brief-fact discovery without committing the project to NL→SQL logic. Hashed contact and Aadhaar fields support exact lookup without storing plaintext search keys.

For large production volumes, range-partition `firs`, `audit_logs`, and event tables by year only after measured query plans justify it. Avoid premature partitioning of the 50k proxy.

## Security and retention

- Aadhaar, phone, chassis, engine, and weapon serial identifiers are stored as keyed hashes or encrypted values, never plaintext lookup columns.
- Application roles must receive least-privilege grants; migrations/import jobs use separate service identities.
- Audit logs are append-only at the application permission layer and should be exported to immutable retention storage.
- Source payload access must be separately authorized because it may contain fields not exposed by normalized APIs.
