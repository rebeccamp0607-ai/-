"""
Project MING v6.0 — AI 客户端
统一封装 OpenAI 兼容接口（SiliconFlow / DeepSeek / OpenAI 均可用）。
"""

from __future__ import annotations

from openai import AsyncOpenAI
from app.core.config import settings


def get_ai_client() -> AsyncOpenAI:
    """返回配置好的 AI 客户端（OpenAI 兼容）。"""
    return AsyncOpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_BASE_URL,
    )


async def chat(
    prompt: str,
    system: str = "你是 Project MING 的核心 AI，精通东方命理与叙事创作。",
    model: str | None = None,
    temperature: float = 0.85,
    max_tokens: int = 1024,
) -> str:
    """单次 chat 调用，返回文本内容。"""
    client = get_ai_client()
    chosen_model = model or settings.AI_MODEL_STRONG
    response = await client.chat.completions.create(
        model=chosen_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content or ""


async def chat_json(
    prompt: str,
    system: str = "你是 Project MING 的核心 AI。请严格按要求输出 JSON，不要添加任何额外说明。",
    model: str | None = None,
) -> str:
    """要求 AI 输出 JSON 格式的 chat 调用。"""
    client = get_ai_client()
    chosen_model = model or settings.AI_MODEL_STRONG
    response = await client.chat.completions.create(
        model=chosen_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2048,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content or "{}"
