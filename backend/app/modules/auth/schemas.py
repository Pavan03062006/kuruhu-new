import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def validate_strong_password(value: str) -> str:
    classes = [any(c.islower() for c in value), any(c.isupper() for c in value), any(c.isdigit() for c in value), any(not c.isalnum() for c in value)]
    if sum(classes) < 3:
        raise ValueError("password must use at least three character classes")
    return value


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=128)
    credential: str = Field(min_length=4, max_length=128)
    district: str | None = Field(default=None, max_length=128)
    language: str = Field(default="en", pattern="^(en|kn)$")
    mode: str = Field(pattern="^(mobile_otp|psn_pin)$")


class OtpRequest(BaseModel):
    identifier: str = Field(pattern="^[0-9]{10,15}$")


class PasswordPair(BaseModel):
    current_password: str = Field(min_length=4, max_length=128)
    new_password: str = Field(min_length=12, max_length=128)

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return validate_strong_password(value)


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=128)


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=32, max_length=2048)
    new_password: str = Field(min_length=12, max_length=128)

    _strong = field_validator("new_password")(validate_strong_password)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    login_identifier: str
    mobile_number: str | None
    psn: str | None
    is_active: bool
    last_login_at: datetime | None
    roles: list[str]
    permissions: list[str]
    display_name: str | None = None


class UserCreate(BaseModel):
    login_identifier: str = Field(min_length=3, max_length=128)
    mobile_number: str | None = Field(default=None, pattern="^[0-9]{10,15}$")
    psn: str | None = Field(default=None, min_length=3, max_length=64)
    password: str = Field(min_length=12, max_length=128)
    display_name: str = Field(min_length=2, max_length=255)
    role_codes: list[str] = Field(default_factory=list, max_length=10)

    _strong = field_validator("password")(validate_strong_password)


class UserUpdate(BaseModel):
    is_active: bool | None = None
    display_name: str | None = Field(default=None, min_length=2, max_length=255)
    role_codes: list[str] | None = Field(default=None, max_length=10)


class RoleRead(BaseModel):
    code: str
    name: str
    permissions: list[str]


class RoleUpdate(BaseModel):
    permission_codes: list[str] = Field(max_length=100)


class PermissionRead(BaseModel):
    code: str
    name: str
