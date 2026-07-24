import uuid
from datetime import UTC, datetime

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.db.session import session_factory
from app.models.auth import AuditEvent


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming = request.headers.get("x-request-id")
        try:
            request_id = uuid.UUID(incoming) if incoming else uuid.uuid4()
        except ValueError:
            request_id = uuid.uuid4()
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = str(request_id)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        response.headers["Cache-Control"] = "no-store"
        if response.status_code == 403 and request.url.path.startswith("/api/"):
            async with session_factory() as session:
                session.add(AuditEvent(occurred_at=datetime.now(UTC), user_id=getattr(request.state, "user_id", None), action="PERMISSION_DENIED", result="BLOCKED", ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"), request_id=request_id, metadata_json={"path": request.url.path, "method": request.method}))
                await session.commit()
        return response
