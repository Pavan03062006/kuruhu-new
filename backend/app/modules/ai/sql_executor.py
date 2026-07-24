import time
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import text
from app.db.session import engine

from app.core.config import get_settings
from app.modules.ai.sql_validator import ValidatedQuery


def json_value(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


async def execute_read_only(query: ValidatedQuery) -> tuple[list[dict[str, Any]], int]:
    settings = get_settings()
    started = time.perf_counter()
    async with engine.connect() as connection, connection.begin():
        await connection.execute(text("SET TRANSACTION READ ONLY"))
        await connection.execute(text(f"SET LOCAL statement_timeout = {settings.ai_query_timeout_ms}"))
        result = await connection.execute(text(query.sql), query.parameters)
        rows = [{key: json_value(value) for key, value in row.items()} for row in result.mappings().all()]
    return rows, round((time.perf_counter() - started) * 1000)
