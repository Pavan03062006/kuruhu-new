from app.modules.ai.schema_loader import schema_prompt


def sql_prompt(query: str, context: dict[str, object], tables: list[str]) -> str:
    return f"""You are PRAMAAN's PostgreSQL query planner. Return JSON only with keys sql, parameters, reason.
Use exactly one read-only SELECT. Use named placeholders such as :district instead of embedding user values.
Never use data-changing SQL, comments, system catalogs, unlisted tables, or invented columns. Limit detailed results to 500 rows.
Conversation context: {context}
Investigator request: {query}
Allowed schema:
{schema_prompt(tables)}"""


def explanation_prompt(question: str, sql: str, row_count: int, preview: list[dict[str, object]]) -> str:
    return f"Explain this verified result in concise professional English. Do not invent facts. Question: {question}\nSQL: {sql}\nRows: {row_count}\nPreview: {preview[:10]}"
