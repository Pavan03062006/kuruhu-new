from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class Repository(Generic[ModelT]):
    def __init__(self, model: type[ModelT], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get(self, record_id: int) -> ModelT | None:
        return await self.session.get(self.model, record_id)

    async def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity: ModelT) -> None:
        await self.session.delete(entity)

    async def list(self, *, offset: int = 0, limit: int = 100) -> list[ModelT]:
        safe_limit = min(max(limit, 1), 500)
        result = await self.session.scalars(select(self.model).offset(max(offset, 0)).limit(safe_limit))
        return list(result)
