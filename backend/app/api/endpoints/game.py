"""游戏循环 API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.engines.genesis_engine import GenesisEngine

router = APIRouter()
_genesis = GenesisEngine()


class SessionStartRequest(BaseModel):
    user_id: str
    bazi_chart_id: str
    world_id: str
    mode: str  # "sim" (模拟人生) | "rogue" (无限轮回)


class FreeWillInputRequest(BaseModel):
    session_id: str
    scene_id: str
    scene_summary: str  # 当前场景描述（由前端传入）
    player_input: str   # 自然语言 C 选项


class DreamscapeRequest(BaseModel):
    session_id: str
    obsession_log: list[str] = []
    san: float = 100.0


@router.post("/session/start")
async def start_session(req: SessionStartRequest) -> dict:
    """开始新游戏局，初始化命盘×世界观×模式。"""
    return {
        "session_id": f"sess_{req.user_id[:8]}_{req.world_id[:8]}",
        "status": "initialized",
        "opening_scene": "请调用 /genesis/compile 生成世界后获取开场叙事",
        "san": 100,
        "cognition_points": 0,
        "day": 1,
    }


@router.post("/turn/free-will")
async def submit_free_will(req: FreeWillInputRequest) -> dict:
    """
    提交自由意志输入（玩家自定义 C 选项）。
    AI 实时判定：合理性评分 → 成功概率 → 后果叙事。
    """
    result = await _genesis.judge_free_will(
        scene_summary=req.scene_summary,
        player_input=req.player_input,
    )
    return {
        "scene_id": req.scene_id,
        "player_input": req.player_input,
        **result,
    }


@router.post("/night/dreamscape")
async def enter_dreamscape(req: DreamscapeRequest) -> dict:
    """
    夜间梦境副本入口。
    触发条件：San < 40%，根据白天执念生成梦境类型与叙事。
    """
    from app.engines.dreamscape import DreamscapeEngine
    from app.engines.five_elements import TenGod

    engine = DreamscapeEngine()
    dream_type = engine.determine_dream_type(
        obsession_log=req.obsession_log,
        san=req.san / 100.0,
        dominant_ten_god=TenGod.QISHA,  # 简化：实际应从 session 读取
    )
    narrative = await engine.generate_dream_narrative(
        dream_type=dream_type,
        obsession_log=req.obsession_log,
        world_id=req.session_id,
    )
    fragment_dropped = engine.check_fragment_drop(dream_type)
    san_reward = engine.compute_san_reward(dream_type, success=True)

    return {
        "session_id": req.session_id,
        "dream_type": dream_type.value,
        "dream_narrative": narrative,
        "san_reward": san_reward,
        "fragment_dropped": fragment_dropped,
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
