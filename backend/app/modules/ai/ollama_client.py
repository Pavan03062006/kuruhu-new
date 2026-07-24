import json
from typing import Any

import httpx

from app.core.config import get_settings


async def generate(prompt: str, *, json_output: bool = False) -> str:
    settings = get_settings()
    payload: dict[str, Any] = {"model": settings.ollama_model, "prompt": prompt, "stream": False, "options": {"temperature": 0}}
    if json_output:
        payload["format"] = "json"
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(f"{settings.ollama_url.rstrip('/')}/api/generate", json=payload)
        response.raise_for_status()
        content = response.json()["response"]
    if json_output:
        json.loads(content)
    return content
