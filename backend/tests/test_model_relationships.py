from app.db.base import Base
from app import models  # noqa: F401


def test_fir_foreign_keys_are_declared() -> None:
    firs = Base.metadata.tables["firs"]
    targets = {foreign_key.target_fullname for foreign_key in firs.foreign_keys}
    assert {"police_units.id", "officers.id", "case_statuses.id"} <= targets


def test_case_party_source_identity_is_unique() -> None:
    parties = Base.metadata.tables["case_parties"]
    unique_columns = [{column.name for column in constraint.columns} for constraint in parties.constraints if constraint.__class__.__name__ == "UniqueConstraint"]
    assert {"source_table", "source_record_id"} in unique_columns
