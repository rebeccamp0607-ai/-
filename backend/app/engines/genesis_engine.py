"""
Project MING v6.0 — 创世引擎
The Genesis Engine (Omni-World Generator)

接受自然语言创世指令，通过 AI 编译为世界规则，
并将十神映射到该世界观的具体概念。
"""

from __future__ import annotations

import uuid
from pydantic import BaseModel

from app.engines.five_elements import TenGod, Element, STEM_ELEMENT
from app.core.config import settings


# ─────────────────────────────────────────────
# 世界规则数据模型
# ─────────────────────────────────────────────

class WorldLore(BaseModel):
    world_name: str
    power_structure: str
    economy_unit: str
    player_role: str
    conflict_source: str
    aesthetic: str


class ShenMapping(BaseModel):
    ten_god: str
    world_concept: str
    world_symbol: str


class WorldSchema(BaseModel):
    id: str
    name: str
    is_official: bool
    creator_id: str | None = None
    lore: WorldLore
    shen_mappings: list[ShenMapping]
    preview_scene: str
    status: str = "ready"


# ─────────────────────────────────────────────
# 十神→世界映射提示词模板
# ─────────────────────────────────────────────

SHEN_MAPPING_TEMPLATE = """
你是 Project MING 的创世引擎。玩家描述了一个新世界：

{world_description}

请将以下十个命理概念（十神）映射到这个世界的具体概念：
比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印

要求：
1. 每个映射必须符合该世界的设定逻辑
2. 映射应该生动、具体，带有世界特色
3. 用中文输出，格式为 JSON

示例（猫统治的蒸汽朋克世界）：
{{
  "正官": "猫皇律法",
  "七杀": "捕狗大队",
  "正财": "小鱼干",
  "偏财": "猫薄荷期货",
  "食神": "逗猫棒艺术",
  "伤官": "人类权利运动",
  "比肩": "同类铲屎官",
  "劫财": "野猫帮",
  "正印": "古老喵典",
  "偏印": "神秘猫仙法术"
}}

现在为玩家的世界创建映射：
"""

OPENING_SCENE_TEMPLATE = """
你是一个顶级的叙事 AI（Dungeon Master）。

世界设定：{world_name}
权力结构：{power_structure}
货币单位：{economy_unit}
玩家身份：{player_role}
核心矛盾：{conflict_source}
美术风格：{aesthetic}

请为玩家写一段引人入胜的开场白（300-500字）。
要求：
- 立刻将玩家代入世界
- 引出核心矛盾
- 结尾给出第一个抉择
- 使用{aesthetic}风格的语言
"""


# ─────────────────────────────────────────────
# 创世引擎主类
# ─────────────────────────────────────────────

class GenesisEngine:
    """
    创世引擎：将自然语言创世指令编译为完整世界规则。

    使用 Gemini 1.5 Pro 处理超长上下文的世界观设定，
    使用 GPT-4o 生成开场叙事。
    """

    # 官方预设宇宙
    OFFICIAL_UNIVERSES: list[dict] = [
        {
            "id": "universe_001",
            "name": "现实镜像",
            "lore": {
                "world_name": "当代都市",
                "power_structure": "资本与关系网络",
                "economy_unit": "人民币/美元",
                "player_role": "普通职场人",
                "conflict_source": "阶层固化与个人突破",
                "aesthetic": "都市现实主义",
            },
        },
        {
            "id": "universe_002",
            "name": "修仙长生",
            "lore": {
                "world_name": "灵气复苏大陆",
                "power_structure": "宗门体系与散修联盟",
                "economy_unit": "灵石/丹药",
                "player_role": "资质平平的宗门弟子",
                "conflict_source": "资源争夺与天道轮回",
                "aesthetic": "东方玄幻",
            },
        },
        {
            "id": "universe_003",
            "name": "赛博废土",
            "lore": {
                "world_name": "新上海废土区",
                "power_structure": "企业联合政府",
                "economy_unit": "数据币/义体零件",
                "player_role": "底层数据黑客",
                "conflict_source": "人性与机械化的边界",
                "aesthetic": "赛博朋克",
            },
        },
    ]

    async def compile(
        self,
        prompt: str,
        bazi_chart_id: str | None = None,
    ) -> WorldSchema:
        """
        编译自然语言创世指令为世界规则。

        流程：
        1. Gemini 1.5 Pro 解析世界设定结构
        2. 生成十神→世界概念映射
        3. GPT-4o 生成开场叙事
        """
        world_id = str(uuid.uuid4())

        # Step 1: 解析世界设定
        lore = await self._parse_world_lore(prompt)

        # Step 2: 生成十神映射
        shen_mappings = await self._compile_shen_mappings(prompt, lore)

        # Step 3: 生成开场叙事
        preview_scene = await self._generate_opening_scene(lore)

        return WorldSchema(
            id=world_id,
            name=lore.world_name,
            is_official=False,
            creator_id=bazi_chart_id,
            lore=lore,
            shen_mappings=shen_mappings,
            preview_scene=preview_scene,
            status="ready",
        )

    async def vectorize_and_store(self, world_id: str) -> None:
        """后台任务：将世界观向量化并存入 Pinecone。"""
        # TODO: 实现 Pinecone 存储
        # 1. 将 WorldSchema 序列化为文本
        # 2. 调用 Embedding API 生成向量
        # 3. upsert 到 Pinecone index "ming-destiny-vectors"
        pass

    # ─────────────────────────────────────────
    # 内部方法（AI 调用占位符）
    # ─────────────────────────────────────────

    async def _parse_world_lore(self, prompt: str) -> WorldLore:
        """
        使用 Gemini 1.5 Pro 从自然语言中提取世界设定结构。
        当前为占位符实现，生产环境替换为真实 AI 调用。
        """
        # TODO: 调用 google.generativeai
        # model = genai.GenerativeModel("gemini-1.5-pro")
        # response = model.generate_content(WORLD_PARSE_PROMPT.format(prompt=prompt))
        # lore = WorldLore.model_validate_json(response.text)

        # 占位符：从 prompt 中提取关键词
        return WorldLore(
            world_name=f"创世世界·{prompt[:10]}…",
            power_structure="待 AI 解析",
            economy_unit="待 AI 解析",
            player_role="待 AI 解析",
            conflict_source="待 AI 解析",
            aesthetic="待 AI 解析",
        )

    async def _compile_shen_mappings(
        self, prompt: str, lore: WorldLore
    ) -> list[ShenMapping]:
        """
        使用 Gemini 1.5 Pro 将十神映射到世界概念。
        """
        # TODO: 真实 AI 调用
        # mapping_prompt = SHEN_MAPPING_TEMPLATE.format(world_description=prompt)
        # ...

        # 占位符：返回默认映射
        default_concepts = {
            TenGod.ZHENGGUAN:  ("律法秩序", "⚖️"),
            TenGod.QISHA:      ("危机冲突", "⚔️"),
            TenGod.ZHENGCAI:   ("主流货币", "💰"),
            TenGod.PIANCAI:    ("机遇资源", "🎲"),
            TenGod.SHISHEN:    ("创造表达", "🎨"),
            TenGod.SHANGGUAN:  ("反叛变革", "🔥"),
            TenGod.BIJIAN:     ("同盟伙伴", "🤝"),
            TenGod.JIECAI:     ("竞争对手", "⚡"),
            TenGod.ZHENGYIN:   ("知识传承", "📜"),
            TenGod.PIANYIN:    ("神秘力量", "🌀"),
        }
        return [
            ShenMapping(
                ten_god=tg.value,
                world_concept=concept,
                world_symbol=f"{symbol} {concept}",
            )
            for tg, (concept, symbol) in default_concepts.items()
        ]

    async def _generate_opening_scene(self, lore: WorldLore) -> str:
        """
        使用 GPT-4o 生成开场叙事（300-500字）。
        """
        # TODO: 真实 AI 调用
        # from openai import AsyncOpenAI
        # client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        # response = await client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=[{"role": "user", "content": prompt}],
        # )
        # return response.choices[0].message.content

        return (
            f"【{lore.world_name}】\n\n"
            f"你是一名{lore.player_role}，在这个由{lore.power_structure}主导的世界里，"
            f"以{lore.economy_unit}为纽带，每一步都踏在{lore.conflict_source}的边缘。\n\n"
            "命运的齿轮开始转动……\n\n"
            "【第一个抉择即将到来，请准备好你的决定。】"
        )
