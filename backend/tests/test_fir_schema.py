from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.schemas import FirCreate


def valid_fir() -> dict[str, object]:
    return {"source_case_master_id": 1, "crime_number": "100090190202300001", "registered_at": datetime.now(UTC), "police_station_id": 190, "source_file": "CaseMaster.csv", "source_row_number": 2, "source_payload": {"CaseMasterID": "1"}}


def test_fir_schema_accepts_valid_source_row() -> None:
    assert FirCreate.model_validate(valid_fir()).source_case_master_id == 1


def test_fir_schema_rejects_invalid_coordinate() -> None:
    data = valid_fir()
    data["latitude"] = 999
    with pytest.raises(ValidationError):
        FirCreate.model_validate(data)
