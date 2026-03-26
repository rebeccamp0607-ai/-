"""阿卡西记录 - 社区功能 API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ParallelDestinyRequest(BaseModel):
    bazi_chart_id: str
    current_node_id: str
    top_k: int = 5


class SOSRequest(BaseModel):
    session_id: str
    node_id: str
    context_summary: str  # 当前困境简述（150字内）
    options: list[str]    # 候选选项列表


@router.post("/parallel-destinies")
async def find_parallel_destinies(req: ParallelDestinyRequest) -> dict:
    """
    基于命格向量相似度（Pinecone）匹配平行时空的玩家。
    相似度阈值：余弦相似度 > 0.85
    """
    return {
        "your_choice": "pending",
        "parallel_destinies": [],  # List[ParallelDestiny]
        "similarity_scores": [],
    }


@router.post("/sos")
async def create_sos(req: SOSRequest) -> dict:
    """发起命运求助信号，开放社区投票。"""
    return {
        "sos_id": f"sos_{req.session_id[:8]}",
        "status": "open",
        "vote_counts": {opt: 0 for opt in req.options},
        "expires_at": "24h",
    }


@router.get("/sos/{sos_id}/votes")
async def get_sos_votes(sos_id: str) -> dict:
    """获取 SOS 当前投票结果。"""
    return {
        "sos_id": sos_id,
        "total_votes": 0,
        "vote_counts": {},
        "mentor_takeover_available": False,
    }


@router.get("/workshop/trending")
async def get_trending_worlds() -> dict:
    """获取创世工坊热度榜单（前 20）。"""
    return {
        "worlds": [],
        "updated_at": "2026-03-26T00:00:00Z",
    }


@router.post("/workshop/publish")
async def publish_world(world_id: str, creator_id: str) -> dict:
    """将玩家设计的 Genesis Prompt 发布到创世工坊。"""
    return {
        "world_id": world_id,
        "status": "pending_review",
        "estimated_review_time": "2h",
    }
