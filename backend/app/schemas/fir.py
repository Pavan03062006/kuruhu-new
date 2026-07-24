from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FirCreate(BaseModel):
    source_case_master_id: int
    crime_number: str = Field(min_length=1, max_length=64)
    case_number: str | None = Field(default=None, max_length=64)
    registered_at: datetime
    police_station_id: int
    category_id: int | None = None
    gravity_id: int | None = None
    crime_head_id: int | None = None
    crime_sub_head_id: int | None = None
    status_id: int | None = None
    incident_from: datetime | None = None
    incident_to: datetime | None = None
    latitude: Decimal | None = Field(default=None, gt=-90, lt=90)
    longitude: Decimal | None = Field(default=None, gt=-180, lt=180)
    brief_facts: str | None = None
    source_file: str
    source_row_number: int = Field(ge=2)
    source_payload: dict[str, object]


class FirRead(FirCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
