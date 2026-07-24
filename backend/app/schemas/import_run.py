import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImportRunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    dataset_name: str
    dataset_sha256: str
    schema_version: str
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    rows_read: int
    rows_imported: int
    rows_rejected: int
    statistics: dict[str, object]
