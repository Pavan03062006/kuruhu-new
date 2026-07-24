import secrets
import uuid
from collections.abc import Awaitable, Callable
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from redis.exceptions import RedisError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.db.session import get_db_session
from app.models.auth import Role, User
from app.modules.auth.security import decode_token


async def current_user(request: Request, session: Annotated[AsyncSession, Depends(get_db_session)], access_token: Annotated[str | None, Cookie()] = None) -> User:
    authorization = request.headers.get("Authorization", "")
    token = authorization.removeprefix("Bearer ").strip() or access_token
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    try:
        claims = decode_token(token, "access")
        user_id = uuid.UUID(claims["sub"])
    except (jwt.InvalidTokenError, ValueError) as error:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session") from error
    statement = select(User).where(User.id == user_id, User.is_active.is_(True)).options(selectinload(User.roles).selectinload(Role.permissions), selectinload(User.profile))
    user = await session.scalar(statement)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")
    request.state.user_id = user.id
    return user


def require_permission(permission: str) -> Callable[..., Awaitable[User]]:
    async def dependency(user: Annotated[User, Depends(current_user)]) -> User:
        granted = {item.code for role in user.roles for item in role.permissions}
        if permission not in granted:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission denied")
        return user
    return dependency


async def require_csrf(request: Request, csrf_token: Annotated[str | None, Cookie()] = None, x_csrf_token: Annotated[str | None, Header()] = None) -> None:
    if not csrf_token or not x_csrf_token or not secrets.compare_digest(csrf_token, x_csrf_token):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF validation failed")


async def login_rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "unknown"
    key = f"auth:login:{client}"
    redis = request.app.state.redis
    try:
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, 60)
    except RedisError:
        if get_settings().environment == "development":
            return
        raise
    if count > 10:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many authentication attempts")
