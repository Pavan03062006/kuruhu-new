import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AiConversation(Base):
    __tablename__ = "ai_conversations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    context: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class AiQuery(Base):
    __tablename__ = "ai_queries"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    natural_language_query: Mapped[str] = mapped_column(Text)
    generated_sql: Mapped[str | None] = mapped_column(Text)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    answer: Mapped[str | None] = mapped_column(Text)
    explanation: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    visualization: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    result_preview: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    row_count: Mapped[int] = mapped_column(BigInteger, default=0)
    execution_ms: Mapped[int | None] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(32), index=True)
    error_code: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class AiQueryAudit(Base):
    __tablename__ = "ai_query_audits"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    query_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ai_queries.id", ondelete="CASCADE"), unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    generated_sql: Mapped[str | None] = mapped_column(Text)
    execution_ms: Mapped[int | None] = mapped_column(BigInteger)
    tables_accessed: Mapped[list[str]] = mapped_column(JSON, default=list)
    returned_rows: Mapped[int] = mapped_column(BigInteger, default=0)
    succeeded: Mapped[bool] = mapped_column(Boolean)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict)
