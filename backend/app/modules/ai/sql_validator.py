from dataclasses import dataclass
import re
from typing import Any

from sqlglot import exp, parse

from app.core.config import get_settings
from app.modules.ai.schema_loader import ALLOWED_SCHEMA


class UnsafeQueryError(ValueError):
    pass


@dataclass(frozen=True)
class ValidatedQuery:
    sql: str
    parameters: dict[str, Any]
    tables: list[str]
    columns: list[str]
    filters: list[str]


def validate_sql(sql: str, supplied_parameters: dict[str, Any] | None = None) -> ValidatedQuery:
    if not sql.strip() or ";" in sql.strip().rstrip(";") or "--" in sql or "/*" in sql:
        raise UnsafeQueryError("SQL comments and multiple statements are not allowed")
    statements = parse(sql.rstrip(";"), read="postgres")
    if len(statements) != 1 or not isinstance(statements[0], exp.Select):
        raise UnsafeQueryError("Only a single SELECT statement is allowed")
    tree = statements[0]
    forbidden = (exp.Insert, exp.Update, exp.Delete, exp.Drop, exp.Alter, exp.Create, exp.Command, exp.Merge, exp.Transaction)
    if any(tree.find(kind) is not None for kind in forbidden):
        raise UnsafeQueryError("Mutating or administrative SQL is prohibited")
    tables = sorted({table.name.lower() for table in tree.find_all(exp.Table)})
    unknown = set(tables) - set(ALLOWED_SCHEMA)
    if unknown or not tables:
        raise UnsafeQueryError(f"Query references unavailable tables: {sorted(unknown)}")
    allowed_columns = {column for table in tables for column in ALLOWED_SCHEMA[table].columns}
    columns = sorted({column.name.lower() for column in tree.find_all(exp.Column)})
    unknown_columns = {column for column in columns if column != "*" and column not in allowed_columns}
    if unknown_columns:
        raise UnsafeQueryError(f"Query references unavailable columns: {sorted(unknown_columns)}")
    parameters = dict(supplied_parameters or {})
    counter = 0
    for literal in list(tree.find_all(exp.Literal)):
        if isinstance(literal.parent, exp.Limit):
            continue
        counter += 1
        name = f"p{counter}"
        parameters[name] = literal.to_py()
        literal.replace(exp.Placeholder(this=name))
    maximum = get_settings().ai_max_rows
    limit = tree.args.get("limit")
    if limit is None:
        tree = tree.limit(maximum)
    else:
        expression = limit.expression
        if isinstance(expression, exp.Literal) and int(expression.this) > maximum:
            tree.set("limit", exp.Limit(expression=exp.Literal.number(maximum)))
    where = tree.args.get("where")
    filters = [where.this.sql(dialect="postgres")] if where else []
    rendered = tree.sql(dialect="postgres")
    rendered = re.sub(r"%\((\w+)\)s", r":\1", rendered)
    rendered = re.sub(r"\$(\w+)", r":\1", rendered)
    return ValidatedQuery(rendered, parameters, tables, columns, filters)
