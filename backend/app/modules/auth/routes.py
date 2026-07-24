import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.db.session import get_db_session
from app.models.auth import AuditEvent, LoginAttempt, PasswordResetToken, Permission, RefreshToken, Role, User, UserProfile
from app.modules.auth.dependencies import current_user, login_rate_limit, require_csrf, require_permission
from app.modules.auth.schemas import ForgotPasswordRequest, LoginRequest, OtpRequest, PasswordPair, PermissionRead, ResetPasswordRequest, RoleRead, RoleUpdate, UserCreate, UserRead, UserUpdate
from app.modules.auth.security import create_access_token, create_refresh_token, decode_token, hash_password, random_token, sha256, verify_password

router = APIRouter(tags=["authentication"])
settings = get_settings()


def context(request: Request) -> tuple[str | None, str | None, uuid.UUID | None]:
    ip = request.client.host if request.client else None
    request_id: uuid.UUID | None = getattr(request.state, "request_id", None)
    return ip, request.headers.get("user-agent"), request_id


def permissions_for(user: User) -> tuple[list[str], list[str]]:
    roles = sorted({role.code for role in user.roles})
    permissions = sorted({permission.code for role in user.roles for permission in role.permissions})
    return roles, permissions


def user_read(user: User) -> UserRead:
    roles, permissions = permissions_for(user)
    return UserRead(id=user.id, login_identifier=user.login_identifier, mobile_number=user.mobile_number, psn=user.psn, is_active=user.is_active, last_login_at=user.last_login_at, roles=roles, permissions=permissions, display_name=user.profile.display_name if user.profile else None)


def set_auth_cookies(response: Response, access: str, refresh: str, csrf: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=settings.auth_cookie_secure, samesite="strict", path="/", max_age=settings.access_token_minutes * 60)
    response.set_cookie("refresh_token", refresh, httponly=True, secure=settings.auth_cookie_secure, samesite="strict", path="/", max_age=settings.refresh_token_days * 86400)
    response.set_cookie("csrf_token", csrf, httponly=False, secure=settings.auth_cookie_secure, samesite="strict", path="/", max_age=settings.refresh_token_days * 86400)


async def audit(session: AsyncSession, request: Request, action: str, result: str, user_id: uuid.UUID | None = None, metadata: dict[str, object] | None = None) -> None:
    ip, agent, request_id = context(request)
    session.add(AuditEvent(occurred_at=datetime.now(UTC), user_id=user_id, action=action, result=result, ip_address=ip, user_agent=agent, request_id=request_id, metadata_json=metadata or {}))


@router.post("/auth/request-otp", status_code=status.HTTP_202_ACCEPTED)
async def request_otp(payload: OtpRequest, request: Request, _: Annotated[None, Depends(login_rate_limit)]) -> dict[str, str]:
    code = f"{secrets.randbelow(1_000_000):06d}"
    await request.app.state.redis.set(f"auth:otp:{sha256(payload.identifier)}", sha256(code), ex=300)
    result = {"message": "If the mobile number is registered, an OTP has been dispatched."}
    if settings.environment == "development":
        result["development_code"] = code
    return result


@router.post("/auth/login", response_model=UserRead)
async def login(payload: LoginRequest, request: Request, response: Response, session: Annotated[AsyncSession, Depends(get_db_session)], _: Annotated[None, Depends(login_rate_limit)]) -> UserRead:
    now = datetime.now(UTC)
    identifier = payload.identifier.strip()
    statement = select(User).where(User.login_identifier == identifier).options(selectinload(User.roles).selectinload(Role.permissions), selectinload(User.profile))
    user = await session.scalar(statement)
    ip, _user_agent, request_id = context(request)
    login_attempt = LoginAttempt(identifier_hash=sha256(identifier.lower()), occurred_at=now, succeeded=False, ip_address=ip, request_id=request_id)
    session.add(login_attempt)
    valid_credential = False
    if user is not None and payload.mode == "psn_pin":
        valid_credential = verify_password(payload.credential, user.password_hash)
    elif user is not None and payload.mode == "mobile_otp":
        expected = await request.app.state.redis.get(f"auth:otp:{sha256(identifier)}")
        valid_credential = bool(expected and secrets.compare_digest(expected, sha256(payload.credential)))
        if valid_credential:
            await request.app.state.redis.delete(f"auth:otp:{sha256(identifier)}")
    if user is None or not valid_credential:
        if user:
            user.failed_login_count += 1
            if user.failed_login_count >= settings.login_max_failures:
                user.locked_until = now + timedelta(minutes=settings.login_lockout_minutes)
                await audit(session, request, "ACCOUNT_LOCK", "SUCCESS", user.id)
        await audit(session, request, "LOGIN", "FAILURE", user.id if user else None)
        await session.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.is_active or (user.locked_until and user.locked_until > now):
        await audit(session, request, "LOGIN", "BLOCKED", user.id)
        await session.commit()
        raise HTTPException(status.HTTP_423_LOCKED, "Account unavailable")
    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = now
    roles, permissions = permissions_for(user)
    access = create_access_token(user.id, roles, permissions)
    refresh, token_id, family_id, expires = create_refresh_token(user.id)
    session.add(RefreshToken(id=token_id, family_id=family_id, user_id=user.id, token_hash=sha256(refresh), issued_at=now, expires_at=expires, created_ip=ip, user_agent=request.headers.get("user-agent")))
    login_attempt.succeeded = True
    await audit(session, request, "LOGIN", "SUCCESS", user.id)
    set_auth_cookies(response, access, refresh, secrets.token_urlsafe(32))
    return user_read(user)


@router.post("/auth/refresh", response_model=UserRead, dependencies=[Depends(require_csrf)])
async def refresh(request: Request, response: Response, session: Annotated[AsyncSession, Depends(get_db_session)]) -> UserRead:
    raw = request.cookies.get("refresh_token")
    if not raw:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token required")
    try:
        claims = decode_token(raw, "refresh")
        token_id, user_id, family_id = uuid.UUID(claims["jti"]), uuid.UUID(claims["sub"]), uuid.UUID(claims["family"])
    except (jwt.InvalidTokenError, ValueError) as error:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token") from error
    stored = await session.get(RefreshToken, token_id)
    now = datetime.now(UTC)
    if stored is None or not secrets.compare_digest(stored.token_hash, sha256(raw)) or stored.revoked_at or stored.expires_at <= now:
        await session.execute(update(RefreshToken).where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None)).values(revoked_at=now))
        await audit(session, request, "TOKEN_REUSE", "BLOCKED", user_id)
        await session.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token rejected")
    user = await session.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)).options(selectinload(User.roles).selectinload(Role.permissions), selectinload(User.profile)))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Account unavailable")
    roles, permissions = permissions_for(user)
    new_refresh, new_id, _, expires = create_refresh_token(user.id, family_id)
    stored.revoked_at, stored.replaced_by_id = now, new_id
    ip, agent, _ = context(request)
    session.add(RefreshToken(id=new_id, family_id=family_id, user_id=user.id, token_hash=sha256(new_refresh), issued_at=now, expires_at=expires, created_ip=ip, user_agent=agent))
    await audit(session, request, "TOKEN_REFRESH", "SUCCESS", user.id)
    set_auth_cookies(response, create_access_token(user.id, roles, permissions), new_refresh, secrets.token_urlsafe(32))
    return user_read(user)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
async def logout(request: Request, response: Response, session: Annotated[AsyncSession, Depends(get_db_session)]) -> None:
    raw = request.cookies.get("refresh_token")
    user_id: uuid.UUID | None = None
    if raw:
        try:
            claims = decode_token(raw, "refresh")
            token = await session.get(RefreshToken, uuid.UUID(claims["jti"]))
            user_id = uuid.UUID(claims["sub"])
            if token:
                token.revoked_at = datetime.now(UTC)
        except (jwt.InvalidTokenError, ValueError):
            pass
    await audit(session, request, "LOGOUT", "SUCCESS", user_id)
    for name in ("access_token", "refresh_token", "csrf_token"):
        response.delete_cookie(name, path="/")


@router.post("/auth/change-password", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
async def change_password(payload: PasswordPair, request: Request, user: Annotated[User, Depends(current_user)], session: Annotated[AsyncSession, Depends(get_db_session)]) -> None:
    if not verify_password(payload.current_password, user.password_hash):
        await audit(session, request, "PASSWORD_CHANGE", "FAILURE", user.id)
        await session.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    user.password_changed_at = datetime.now(UTC)
    await session.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=datetime.now(UTC)))
    await audit(session, request, "PASSWORD_CHANGE", "SUCCESS", user.id)


@router.post("/auth/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(payload: ForgotPasswordRequest, request: Request, session: Annotated[AsyncSession, Depends(get_db_session)]) -> dict[str, str]:
    user = await session.scalar(select(User).where(User.login_identifier == payload.identifier.strip(), User.is_active.is_(True)))
    if user:
        raw = random_token()
        session.add(PasswordResetToken(id=uuid.uuid4(), user_id=user.id, token_hash=sha256(raw), expires_at=datetime.now(UTC) + timedelta(minutes=settings.password_reset_minutes)))
        await audit(session, request, "PASSWORD_RESET_REQUEST", "ACCEPTED", user.id, {"delivery": "secure-channel-required"})
    return {"message": "If the account exists, reset instructions have been dispatched."}


@router.post("/auth/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(payload: ResetPasswordRequest, request: Request, session: Annotated[AsyncSession, Depends(get_db_session)]) -> None:
    now = datetime.now(UTC)
    token = await session.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == sha256(payload.token), PasswordResetToken.used_at.is_(None), PasswordResetToken.expires_at > now))
    if token is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")
    user = await session.get(User, token.user_id)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid reset token")
    user.password_hash, user.password_changed_at, token.used_at = hash_password(payload.new_password), now, now
    await session.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=now))
    await audit(session, request, "PASSWORD_RESET", "SUCCESS", user.id)


@router.get("/users/me", response_model=UserRead)
async def me(user: Annotated[User, Depends(current_user)]) -> UserRead:
    return user_read(user)


@router.get("/roles", response_model=list[RoleRead])
async def roles(_: Annotated[User, Depends(current_user)], session: Annotated[AsyncSession, Depends(get_db_session)]) -> list[RoleRead]:
    items = list(await session.scalars(select(Role).options(selectinload(Role.permissions)).order_by(Role.name)))
    return [RoleRead(code=item.code, name=item.name, permissions=sorted(permission.code for permission in item.permissions)) for item in items]


@router.get("/permissions", response_model=list[PermissionRead])
async def permissions(_: Annotated[User, Depends(current_user)], session: Annotated[AsyncSession, Depends(get_db_session)]) -> list[PermissionRead]:
    return [PermissionRead(code=item.code, name=item.name) for item in await session.scalars(select(Permission).order_by(Permission.code))]


@router.patch("/roles/{role_code}", response_model=RoleRead, dependencies=[Depends(require_csrf)])
async def update_role(role_code: str, payload: RoleUpdate, request: Request, _: Annotated[User, Depends(require_permission("roles:manage"))], session: Annotated[AsyncSession, Depends(get_db_session)]) -> RoleRead:
    role = await session.scalar(select(Role).where(Role.code == role_code).options(selectinload(Role.permissions)))
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role not found")
    role.permissions = list(await session.scalars(select(Permission).where(Permission.code.in_(payload.permission_codes))))
    await audit(session, request, "ROLE_CHANGE", "SUCCESS", metadata={"role": role_code, "permissions": payload.permission_codes})
    return RoleRead(code=role.code, name=role.name, permissions=sorted(permission.code for permission in role.permissions))


@router.get("/users", response_model=list[UserRead])
async def list_users(_: Annotated[User, Depends(require_permission("users:manage"))], session: Annotated[AsyncSession, Depends(get_db_session)]) -> list[UserRead]:
    users = list(await session.scalars(select(User).options(selectinload(User.roles).selectinload(Role.permissions), selectinload(User.profile)).limit(500)))
    return [user_read(user) for user in users]


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_csrf)])
async def create_user(payload: UserCreate, request: Request, _: Annotated[User, Depends(require_permission("users:manage"))], session: Annotated[AsyncSession, Depends(get_db_session)]) -> UserRead:
    if not payload.mobile_number and not payload.psn:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Mobile number or PSN is required")
    roles = list(await session.scalars(select(Role).where(Role.code.in_(payload.role_codes)).options(selectinload(Role.permissions))))
    user = User(login_identifier=payload.login_identifier.strip(), mobile_number=payload.mobile_number, psn=payload.psn, password_hash=hash_password(payload.password), roles=roles, profile=UserProfile(display_name=payload.display_name))
    session.add(user)
    await session.flush()
    await audit(session, request, "USER_CREATE", "SUCCESS", user.id)
    return user_read(user)


@router.patch("/users/{user_id}", response_model=UserRead, dependencies=[Depends(require_csrf)])
async def update_user(user_id: uuid.UUID, payload: UserUpdate, request: Request, _: Annotated[User, Depends(require_permission("users:manage"))], session: Annotated[AsyncSession, Depends(get_db_session)]) -> UserRead:
    user = await session.scalar(select(User).where(User.id == user_id).options(selectinload(User.roles).selectinload(Role.permissions), selectinload(User.profile)))
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.display_name is not None and user.profile:
        user.profile.display_name = payload.display_name
    if payload.role_codes is not None:
        user.roles = list(await session.scalars(select(Role).where(Role.code.in_(payload.role_codes)).options(selectinload(Role.permissions))))
        await audit(session, request, "ROLE_CHANGE", "SUCCESS", user.id, {"roles": payload.role_codes})
    return user_read(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
async def deactivate_user(user_id: uuid.UUID, request: Request, _: Annotated[User, Depends(require_permission("users:manage"))], session: Annotated[AsyncSession, Depends(get_db_session)]) -> None:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    user.is_active = False
    await session.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=datetime.now(UTC)))
    await audit(session, request, "USER_DEACTIVATE", "SUCCESS", user.id)
