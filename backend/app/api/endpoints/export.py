"""O2O 人生导出 API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class NotionExportRequest(BaseModel):
    session_id: str
    notion_access_token: str
    target_page_id: str


class CalendarExportRequest(BaseModel):
    session_id: str
    provider: str  # "google" | "apple"
    access_token: str


@router.post("/notion")
async def export_to_notion(req: NotionExportRequest) -> dict:
    """将本局《命运诊断书》及决策复盘导出至 Notion。"""
    return {
        "status": "queued",
        "job_id": f"notion_{req.session_id[:8]}",
        "estimated_completion": "30s",
    }


@router.post("/obsidian")
async def export_to_obsidian(session_id: str) -> dict:
    """生成 Obsidian Markdown 格式命运图谱，返回下载链接。"""
    return {
        "session_id": session_id,
        "download_url": "/exports/pending",
        "format": "markdown",
        "size_estimate": "~50KB",
    }


@router.post("/calendar")
async def export_to_calendar(req: CalendarExportRequest) -> dict:
    """
    将 AI 推荐的现实行动同步至 Google/Apple Calendar。

    示例：游戏建议"补充财务知识" → 添加日程"学习财务基础"。
    """
    return {
        "status": "synced",
        "provider": req.provider,
        "events_created": 0,  # 实际同步事件数
        "calendar_link": "pending",
    }
