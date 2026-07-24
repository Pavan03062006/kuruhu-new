import uuid

import jwt
import pytest
from pydantic import ValidationError

from app.modules.auth.schemas import PasswordPair
from app.modules.auth.security import create_access_token, decode_token, hash_password, verify_password


def test_argon2_hash_and_verify() -> None:
    encoded = hash_password("Strong-Secret-2026")
    assert "Strong-Secret-2026" not in encoded
    assert verify_password("Strong-Secret-2026", encoded)
    assert not verify_password("incorrect", encoded)


def test_access_token_validation() -> None:
    subject = uuid.uuid4()
    claims = decode_token(create_access_token(subject, ["analyst"], ["firs:view"]), "access")
    assert claims["sub"] == str(subject)
    assert claims["permissions"] == ["firs:view"]
    with pytest.raises(jwt.InvalidTokenError):
        decode_token(create_access_token(subject, [], []), "refresh")


def test_password_strength() -> None:
    with pytest.raises(ValidationError):
        PasswordPair(current_password="old1", new_password="alllowercase12")
