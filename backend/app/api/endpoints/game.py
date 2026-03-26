"""游戏循环 API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SessionStartRequest(BaseModel):
    user_id: str
    bazi_chart_id: str
    world_id: str
    mode: str  # "sim" (模拟人生) | "rogue" (无限轮回)


class FreeWillInputRequest(BaseModel):
    session_id: str
    scene_id: str
    player_input: str  # 自然语言 C 选项


class DreamscapeRequest(BaseModel):
    session_id: str


@router.post("/session/start")
async def start_session(req: SessionStartRequest) -> dict:
    """开始新游戏局，初始化命盘×世界观×模式。"""
    return {
        "session_id": f"sess_{req.user_id[:8]}_{req.world_id}",
        "status": "initialized",
        "opening_scene": "待 AI 生成...",
        "san": 100,
        "cognition_points": 0,
        "day": 1,
    }


@router.post("/turn/free-will")
async def submit_free_will(req: FreeWillInputRequest) -> dict:
    """
    提交自由意志输入（玩家自定义 C 选项）。
    AI 判定：合理性评分 → 成功概率 → 后果叙事。
    """
    return {
        "scene_id": req.scene_id,
        "player_input": req.player_input,
        "feasibility_score": 0.0,   # AI 填充
        "success_probability": 0.0, # AI 填充
        "outcome_narrative": "待 AI 判定...",
        "san_delta": 0,
        "cognition_delta": 0,
    }


@router.post("/night/dreamscape")
async def enter_dreamscape(req: DreamscapeRequest) -> dict:
    """
    夜间梦境副本入口。
    触发条件：San < 40%，根据白天执念生成梦境类型。
    """
    return {
        "session_id": req.session_id,
        "dream_type": "pending",         # AI 根据执念分析后填充
        "dream_narrative": "正在潜入潜意识...",
        "san_reward": 0,
        "fragment_dropped": False,
    }


@router.post("/session/settle")
async def settle_session(session_id: str) -> dict:
    """结算本局，生成《命运诊断书》。"""
    return {
        "session_id": session_id,
        "diagnosis_report": {},  # DiagnosisReport 对象
        "export_ready": True,
        "karma_gained": 0,
    }
