import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AiQueryRequest(BaseModel):
    message: str = Field(min_length=2, max_length=4000)
    conversation_id: uuid.UUID | None = None


class AiResult(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    question: str
    answer: str
    sql: str
    parameters: dict[str, Any]
    tables: list[str]
    columns: list[str]
    filters: list[str]
    row_count: int
    execution_ms: int
    rows: list[dict[str, Any]]
    fir_references: list[str]
    stations: list[str]
    districts: list[str]
    provenance: str
    reason: str
    visualization: dict[str, Any]
    created_at: datetime


class HistoryItem(BaseModel):
    id: uuid.UUID
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    query_count: int


class PinRequest(BaseModel):
    is_pinned: bool
