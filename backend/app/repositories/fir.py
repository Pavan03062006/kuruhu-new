from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Fir
from app.repositories.base import Repository


class FirRepository(Repository[Fir]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Fir, session)

    async def by_crime_number(self, crime_number: str) -> Fir | None:
        statement = select(Fir).where(Fir.crime_number == crime_number).options(selectinload(Fir.parties))
        return await self.session.scalar(statement)

    async def by_station_and_date_range(self, station_id: int, start: datetime, end: datetime, *, limit: int = 500) -> list[Fir]:
        statement = select(Fir).where(Fir.police_station_id == station_id, Fir.registered_at >= start, Fir.registered_at < end).order_by(Fir.registered_at.desc()).limit(min(limit, 500))
        return list(await self.session.scalars(statement))
