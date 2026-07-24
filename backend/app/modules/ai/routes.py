import json
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.auth import User
from app.modules.ai.schemas import AiQueryRequest, AiResult, HistoryItem, PinRequest
from app.modules.ai.service import get_query, history, latest_query, pin_history, remove_history, run_query
from app.modules.auth.dependencies import require_csrf, require_permission

router = APIRouter(prefix="/ai", tags=["ai-investigator"])
AiUser = Annotated[User, Depends(require_permission("ai:access"))]
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post("/query", response_model=AiResult, dependencies=[Depends(require_csrf)])
async def query(payload: AiQueryRequest, user: AiUser, session: DbSession) -> AiResult:
    return await run_query(session, user.id, payload.message, payload.conversation_id)


@router.post("/chat", dependencies=[Depends(require_csrf)])
async def chat(payload: AiQueryRequest, user: AiUser, session: DbSession) -> StreamingResponse:
    result = await run_query(session, user.id, payload.message, payload.conversation_id)

    async def events():
        for stage in ("intent", "schema", "validation", "execution", "explainability"):
            yield f"event: status\ndata: {json.dumps({'stage': stage})}\n\n"
        words = result.answer.split()
        for offset in range(0, len(words), 12):
            yield f"event: token\ndata: {json.dumps({'text': ' '.join(words[offset:offset + 12]) + ' '})}\n\n"
        yield f"event: result\ndata: {result.model_dump_json()}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/history", response_model=list[HistoryItem])
async def list_history(user: AiUser, session: DbSession) -> list[HistoryItem]:
    return await history(session, user.id)


@router.get("/history/{conversation_id}", response_model=AiResult)
async def open_history(conversation_id: uuid.UUID, user: AiUser, session: DbSession) -> AiResult:
    return await latest_query(session, user.id, conversation_id)


@router.get("/query/{query_id}", response_model=AiResult)
async def query_detail(query_id: uuid.UUID, user: AiUser, session: DbSession) -> AiResult:
    return await get_query(session, user.id, query_id)


@router.delete("/history/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
async def delete_history(conversation_id: uuid.UUID, user: AiUser, session: DbSession) -> Response:
    await remove_history(session, user.id, conversation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/history/{conversation_id}/pin", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
async def set_pin(conversation_id: uuid.UUID, payload: PinRequest, user: AiUser, session: DbSession) -> Response:
    await pin_history(session, user.id, conversation_id, payload.is_pinned)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
