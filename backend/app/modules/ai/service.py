import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai import AiConversation, AiQuery, AiQueryAudit
from app.modules.ai.schemas import AiResult, HistoryItem
from app.modules.ai.workflow import investigator_graph


def now() -> datetime:
    return datetime.now(UTC)


async def _conversation(session: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID | None, question: str) -> AiConversation:
    conversation = None
    if conversation_id:
        conversation = await session.scalar(select(AiConversation).where(AiConversation.id == conversation_id, AiConversation.user_id == user_id))
        if conversation is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    if conversation is None:
        stamp = now()
        conversation = AiConversation(user_id=user_id, title=question[:80], context={}, created_at=stamp, updated_at=stamp)
        session.add(conversation)
        await session.flush()
    return conversation


def _result(record: AiQuery) -> AiResult:
    explanation = record.explanation or {}
    return AiResult(
        id=record.id, conversation_id=record.conversation_id, question=record.natural_language_query,
        answer=record.answer or "", sql=record.generated_sql or "", parameters=record.parameters or {},
        tables=explanation.get("tables", []), columns=explanation.get("columns", []), filters=explanation.get("filters", []),
        row_count=record.row_count, execution_ms=record.execution_ms or 0, rows=record.result_preview or [],
        fir_references=explanation.get("fir_references", []), stations=explanation.get("stations", []),
        districts=explanation.get("districts", []), provenance=explanation.get("provenance", ""),
        reason=explanation.get("reason", ""), visualization=record.visualization or {}, created_at=record.created_at,
    )


async def run_query(session: AsyncSession, user_id: uuid.UUID, question: str, conversation_id: uuid.UUID | None) -> AiResult:
    conversation = await _conversation(session, user_id, conversation_id, question)
    created = now()
    record = AiQuery(conversation_id=conversation.id, user_id=user_id, natural_language_query=question, parameters={},
                     explanation={}, visualization={}, result_preview=[], row_count=0, status="running", created_at=created)
    session.add(record)
    await session.flush()
    try:
        state: dict[str, Any] = await investigator_graph.ainvoke({"question": question, "context": conversation.context or {}})
        validated = state["validated"]
        source = state["citations"]
        reason = str(state["generated"].get("reason", "Validated against the approved PRAMAAN schema."))
        record.generated_sql = validated.sql
        record.parameters = validated.parameters
        record.answer = state["answer"]
        record.explanation = {**source, "tables": validated.tables, "columns": validated.columns, "filters": validated.filters, "reason": reason}
        record.visualization = state["visualization"]
        record.result_preview = state["rows"]
        record.row_count = len(state["rows"])
        record.execution_ms = state["execution_ms"]
        record.status = "completed"
        conversation.context = {"previous_question": question, "previous_tables": validated.tables, "previous_filters": validated.filters}
        conversation.updated_at = now()
        session.add(AiQueryAudit(query_id=record.id, user_id=user_id, occurred_at=now(), generated_sql=validated.sql,
                                 execution_ms=record.execution_ms, tables_accessed=validated.tables,
                                 returned_rows=record.row_count, succeeded=True, metadata_json={"conversation_id": str(conversation.id)}))
        await session.flush()
        return _result(record)
    except Exception as error:
        record.status = "failed"
        record.error_code = type(error).__name__[:64]
        session.add(AiQueryAudit(query_id=record.id, user_id=user_id, occurred_at=now(), generated_sql=record.generated_sql,
                                 execution_ms=None, tables_accessed=[], returned_rows=0, succeeded=False,
                                 metadata_json={"conversation_id": str(conversation.id), "error": str(error)[:500]}))
        await session.commit()
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "The investigator could not safely answer that request") from error


async def history(session: AsyncSession, user_id: uuid.UUID) -> list[HistoryItem]:
    count = func.count(AiQuery.id).label("query_count")
    statement = (select(AiConversation, count).outerjoin(AiQuery).where(AiConversation.user_id == user_id)
                 .group_by(AiConversation.id).order_by(AiConversation.is_pinned.desc(), AiConversation.updated_at.desc()))
    return [HistoryItem(id=item.id, title=item.title, is_pinned=item.is_pinned, created_at=item.created_at,
                        updated_at=item.updated_at, query_count=query_count) for item, query_count in (await session.execute(statement)).all()]


async def get_query(session: AsyncSession, user_id: uuid.UUID, query_id: uuid.UUID) -> AiResult:
    record = await session.scalar(select(AiQuery).where(AiQuery.id == query_id, AiQuery.user_id == user_id, AiQuery.status == "completed"))
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Query not found")
    return _result(record)


async def latest_query(session: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID) -> AiResult:
    record = await session.scalar(select(AiQuery).where(AiQuery.conversation_id == conversation_id, AiQuery.user_id == user_id,
                                                        AiQuery.status == "completed").order_by(AiQuery.created_at.desc()).limit(1))
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation has no completed queries")
    return _result(record)


async def remove_history(session: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID) -> None:
    result = await session.execute(delete(AiConversation).where(AiConversation.id == conversation_id, AiConversation.user_id == user_id))
    if not result.rowcount:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")


async def pin_history(session: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID, pinned: bool) -> None:
    item = await session.scalar(select(AiConversation).where(AiConversation.id == conversation_id, AiConversation.user_id == user_id))
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    item.is_pinned = pinned
    item.updated_at = now()
