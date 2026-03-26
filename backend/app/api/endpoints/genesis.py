"""创世引擎 API endpoints."""

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from app.engines.genesis_engine import GenesisEngine, WorldSchema

router = APIRouter()


class GenesisPromptRequest(BaseModel):
    natural_language: str
    bazi_chart_id: str | None = None  # 可选：绑定八字进行规则映射


class GenesisCompileResponse(BaseModel):
    world_id: str
    world_schema: WorldSchema
    shen_mappings: dict[str, str]  # 十神 → 世界规则的映射结果
    preview_scene: str             # AI 生成的开场描述（500字内）
    status: str


@router.post("/compile", response_model=GenesisCompileResponse)
async def compile_world(
    req: GenesisPromptRequest,
    background_tasks: BackgroundTasks,
) -> GenesisCompileResponse:
    """
    接受自然语言创世指令，实时编译为世界规则。

    示例输入：
        "我想玩一个被猫统治的蒸汽朋克世界，货币是'小鱼干'，
         人类是宠物，我的初始身份是'流浪铲屎官'。"
    """
    engine = GenesisEngine()
    result = await engine.compile(
        prompt=req.natural_language,
        bazi_chart_id=req.bazi_chart_id,
    )
    # 后台任务：将世界观向量化存入 Pinecone
    background_tasks.add_task(engine.vectorize_and_store, result.world_id)
    return result


@router.get("/presets")
async def list_preset_universes() -> dict[str, list[dict]]:
    """返回官方预设宇宙列表。"""
    return {
        "universes": [
            {
                "id": "universe_001",
                "name": "现实镜像",
                "description": "现代职场、商战、家庭伦理",
                "aesthetic": "都市现实主义",
            },
            {
                "id": "universe_002",
                "name": "修仙长生",
                "description": "灵气复苏、宗门博弈、飞升之路",
                "aesthetic": "东方玄幻",
            },
            {
                "id": "universe_003",
                "name": "赛博废土",
                "description": "机械飞升、资源掠夺、黑客文化",
                "aesthetic": "赛博朋克",
            },
        ]
    }
