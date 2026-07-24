import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from app.core.config import get_settings

settings = get_settings()
password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    try:
        return password_hasher.verify(encoded, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def create_access_token(user_id: uuid.UUID, roles: list[str], permissions: list[str]) -> str:
    now = datetime.now(UTC)
    claims: dict[str, Any] = {"sub": str(user_id), "typ": "access", "roles": roles, "permissions": permissions, "iat": now, "nbf": now, "exp": now + timedelta(minutes=settings.access_token_minutes), "iss": settings.jwt_issuer, "aud": settings.jwt_audience, "jti": str(uuid.uuid4())}
    return jwt.encode(claims, settings.jwt_secret_key, algorithm="HS256")


def create_refresh_token(user_id: uuid.UUID, family_id: uuid.UUID | None = None) -> tuple[str, uuid.UUID, uuid.UUID, datetime]:
    now = datetime.now(UTC)
    token_id = uuid.uuid4()
    family = family_id or uuid.uuid4()
    expires = now + timedelta(days=settings.refresh_token_days)
    claims = {"sub": str(user_id), "typ": "refresh", "family": str(family), "iat": now, "nbf": now, "exp": expires, "iss": settings.jwt_issuer, "aud": settings.jwt_audience, "jti": str(token_id)}
    return jwt.encode(claims, settings.jwt_secret_key, algorithm="HS256"), token_id, family, expires


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    claims = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"], issuer=settings.jwt_issuer, audience=settings.jwt_audience, options={"require": ["sub", "typ", "exp", "iat", "jti"]})
    if claims.get("typ") != expected_type:
        raise jwt.InvalidTokenError("incorrect token type")
    return claims


def random_token() -> str:
    return secrets.token_urlsafe(48)
