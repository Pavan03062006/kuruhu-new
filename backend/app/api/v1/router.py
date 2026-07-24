from fastapi import APIRouter

from app.modules.ai.routes import router as ai_router
from app.modules.auth.routes import router as auth_router
from app.modules.workspace.routes import router as workspace_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(ai_router)
api_router.include_router(workspace_router)


@api_router.get("/health", tags=["platform"])
async def api_health() -> dict[str, str]:
    return {"status": "ok", "api": "v1"}
