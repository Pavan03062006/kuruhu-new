import json
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.modules.ai.ollama_client import generate
from app.modules.ai.presenter import citations, visualization
from app.modules.ai.prompt_builder import explanation_prompt, sql_prompt
from app.modules.ai.schema_loader import ALLOWED_SCHEMA
from app.modules.ai.sql_executor import execute_read_only
from app.modules.ai.sql_validator import ValidatedQuery, validate_sql


class InvestigatorState(TypedDict, total=False):
    question: str
    context: dict[str, Any]
    intent: str
    candidate_tables: list[str]
    generated: dict[str, Any]
    validated: ValidatedQuery
    rows: list[dict[str, Any]]
    execution_ms: int
    answer: str
    citations: dict[str, Any]
    visualization: dict[str, Any]


def _select_schema(question: str) -> list[str]:
    words = question.lower()
    selected = [name for name in ALLOWED_SCHEMA if name.rstrip("s").replace("_", " ") in words]
    if any(term in words for term in ("district", "station", "unit")):
        selected += ["firs", "police_units", "districts"]
    if any(term in words for term in ("crime", "offence", "section")):
        selected += ["firs", "crime_heads", "crime_sub_heads", "fir_sections", "statutory_sections"]
    return list(dict.fromkeys(selected or ["firs", "police_units", "districts", "crime_heads", "case_statuses"]))


async def analyze_intent(state: InvestigatorState) -> dict[str, Any]:
    return {"intent": "fir_analytics"}


async def choose_schema(state: InvestigatorState) -> dict[str, Any]:
    return {"candidate_tables": _select_schema(state["question"])}


async def generate_sql(state: InvestigatorState) -> dict[str, Any]:
    raw = await generate(sql_prompt(state["question"], state.get("context", {}), state["candidate_tables"]), json_output=True)
    generated = json.loads(raw)
    if not isinstance(generated.get("sql"), str):
        raise ValueError("The model did not produce SQL")
    return {"generated": generated}


async def validate(state: InvestigatorState) -> dict[str, Any]:
    return {"validated": validate_sql(state["generated"]["sql"], state["generated"].get("parameters"))}


async def execute(state: InvestigatorState) -> dict[str, Any]:
    rows, duration = await execute_read_only(state["validated"])
    return {"rows": rows, "execution_ms": duration}


async def explain(state: InvestigatorState) -> dict[str, Any]:
    answer = await generate(explanation_prompt(state["question"], state["validated"].sql, len(state["rows"]), state["rows"]))
    return {"answer": answer.strip()}


async def present(state: InvestigatorState) -> dict[str, Any]:
    return {"citations": citations(state["rows"]), "visualization": visualization(state["rows"])}


builder = StateGraph(InvestigatorState)
builder.add_node("intent", analyze_intent)
builder.add_node("schema", choose_schema)
builder.add_node("sql_generation", generate_sql)
builder.add_node("validation", validate)
builder.add_node("execution", execute)
builder.add_node("explainability", explain)
builder.add_node("visualization", present)
builder.add_edge(START, "intent")
builder.add_edge("intent", "schema")
builder.add_edge("schema", "sql_generation")
builder.add_edge("sql_generation", "validation")
builder.add_edge("validation", "execution")
builder.add_edge("execution", "explainability")
builder.add_edge("explainability", "visualization")
builder.add_edge("visualization", END)
investigator_graph = builder.compile()
