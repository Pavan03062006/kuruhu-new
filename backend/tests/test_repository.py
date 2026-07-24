from unittest.mock import AsyncMock

import pytest

from app.models import Fir
from app.repositories import Repository


@pytest.mark.asyncio
async def test_repository_get_delegates_to_session() -> None:
    session = AsyncMock()
    session.get.return_value = None
    repository = Repository(Fir, session)
    assert await repository.get(42) is None
    session.get.assert_awaited_once_with(Fir, 42)
