import pytest
from fastapi import HTTPException

from app.models.auth import Permission, Role, User
from app.modules.auth.dependencies import require_permission
from app.modules.auth.routes import permissions_for


def test_permissions_are_derived_from_roles() -> None:
    user = User(login_identifier="KGID-1", psn="KGID-1", password_hash="hash")
    user.roles = [Role(code="analyst", name="Analyst", permissions=[Permission(code="firs:view", name="View FIRs")])]
    roles, permissions = permissions_for(user)
    assert roles == ["analyst"]
    assert permissions == ["firs:view"]


@pytest.mark.asyncio
async def test_permission_dependency_allows_and_denies() -> None:
    user = User(login_identifier="KGID-2", psn="KGID-2", password_hash="hash")
    user.roles = [Role(code="auditor", name="Auditor", permissions=[Permission(code="audit:view", name="View Audit")])]
    assert await require_permission("audit:view")(user) is user
    with pytest.raises(HTTPException) as denied:
        await require_permission("users:manage")(user)
    assert denied.value.status_code == 403
