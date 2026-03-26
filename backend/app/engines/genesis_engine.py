"""
Project MING v6.0 — 创世引擎
The Genesis Engine (Omni-World Generator)

接受自然语言创世指令，通过 AI 编译为世界规则，
并将十神映射到该世界观的具体概念。
"""

from __future__ import annotations

import json
import uuid
from pydantic import BaseModel

from app.engines.five_elements import TenGod
from app.core.ai_client import chat, chat_json
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
# Prompt 模板
# ─────────────────────────────────────────────

LORE_PARSE_PROMPT = """
玩家想创建一个新世界，描述如下：

"{prompt}"

请从这段描述中提取世界设定，输出以下 JSON（缺少的信息请合理推断补全）：
{{
  "world_name": "世界的名字（简洁，2-6字）",
  "power_structure": "谁或什么统治这个世界（10-20字）",
  "economy_unit": "主要货币或资源单位（2-8字）",
  "player_role": "玩家的初始身份（4-12字）",
  "conflict_source": "世界的核心矛盾或张力（10-25字）",
  "aesthetic": "美术风格关键词（3-8字，如：蒸汽朋克、东方玄幻、赛博朋克）"
}}
"""

SHEN_MAPPING_PROMPT = """
你是 Project MING 的创世引擎，需要将命理概念映射到玩家创建的世界中。

世界设定：
- 世界名：{world_name}
- 权力结构：{power_structure}
- 货币/资源：{economy_unit}
- 玩家身份：{player_role}
- 核心矛盾：{conflict_source}
- 风格：{aesthetic}

请将以下十个命理概念（十神）映射为这个世界中的具体概念，要求：
1. 每个映射必须符合世界设定逻辑，带有世界特色
2. 映射要生动、具体，让玩家一眼就能代入
3. 输出 JSON 格式

{{
  "正官":  "（对应世界中的权威/规则机构）",
  "七杀":  "（对应世界中的冲突/危机来源）",
  "正财":  "（对应世界中的主流财富/资源）",
  "偏财":  "（对应世界中的投机/机遇资源）",
  "食神":  "（对应世界中的创造/享乐活动）",
  "伤官":  "（对应世界中的反叛/变革力量）",
  "比肩":  "（对应世界中的同类/盟友群体）",
  "劫财":  "（对应世界中的竞争对手/掠夺者）",
  "正印":  "（对应世界中的知识/传承体系）",
  "偏印":  "（对应世界中的神秘/偏门力量）"
}}
"""

OPENING_SCENE_PROMPT = """
你是一位顶级叙事大师（Dungeon Master），现在要为玩家开启一段全新的命运冒险。

世界设定：
- 世界：{world_name}（{aesthetic}风格）
- 权力结构：{power_structure}
- 货币/资源：{economy_unit}
- 玩家身份：{player_role}
- 核心矛盾：{conflict_source}

请写一段引人入胜的开场叙事（300-450字），要求：
1. 第一人称"你"带入玩家视角
2. 立刻展现世界的独特感和核心矛盾
3. 埋下第一个危机或诱惑
4. 结尾给出第一个二选一的抉择（格式：【选择A】xxx / 【选择B】xxx）
5. 语言风格匹配{aesthetic}的氛围
"""

FREE_WILL_JUDGE_PROMPT = """
你是 Project MING 的裁判 AI（Dungeon Master）。

当前场景：{scene_summary}

玩家没有选择预设选项，而是提出了自己的方案：
"{player_input}"

请评估该方案的可行性，输出 JSON：
{{
  "feasibility_score": 0.0-1.0（0=完全不合理，1=完全合理）,
  "success_probability": 0.0-1.0（成功概率，受可行性和风险影响）,
  "outcome_narrative": "200字内的结果叙事，生动描述该方案的后果",
  "san_delta": -20到+15的整数（心力变化）,
  "cognition_delta": -10到+30的整数（认知点变化）,
  "obsession": "如果失败，产生什么执念（10字内，用于触发梦境）；成功则为空字符串"
}}

注意：方案越有创意、越符合世界设定，可行性越高；越冒险、越破坏规则，成功率越低但奖励越高。
"""


# ─────────────────────────────────────────────
# 创世引擎主类
# ─────────────────────────────────────────────

class GenesisEngine:
    """
    创世引擎：将自然语言创世指令编译为完整世界规则。
    使用 OpenAI 兼容接口（SiliconFlow / DeepSeek）。
    """

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
        """编译自然语言创世指令为完整世界规则。"""
        world_id = str(uuid.uuid4())

        lore = await self._parse_world_lore(prompt)
        shen_mappings = await self._compile_shen_mappings(lore)
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

    async def judge_free_will(
        self,
        scene_summary: str,
        player_input: str,
    ) -> dict:
        """裁判玩家自由意志输入，返回结果判定。"""
        prompt = FREE_WILL_JUDGE_PROMPT.format(
            scene_summary=scene_summary,
            player_input=player_input,
        )
        raw = await chat_json(prompt, model=settings.AI_MODEL_STRONG)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "feasibility_score": 0.5,
                "success_probability": 0.5,
                "outcome_narrative": raw,
                "san_delta": 0,
                "cognition_delta": 0,
                "obsession": "",
            }

    async def vectorize_and_store(self, world_id: str) -> None:
        """后台任务：将世界观向量化并存入 Pinecone（MVP 阶段跳过）。"""
        pass

    # ─────────────────────────────────────────
    # 内部方法
    # ─────────────────────────────────────────

    async def _parse_world_lore(self, prompt: str) -> WorldLore:
        """使用 AI 从自然语言中提取世界设定结构。"""
        ai_prompt = LORE_PARSE_PROMPT.format(prompt=prompt)
        raw = await chat_json(ai_prompt, model=settings.AI_MODEL_STRONG)
        try:
            data = json.loads(raw)
            return WorldLore(**data)
        except Exception:
            # 降级：直接从 prompt 截取
            return WorldLore(
                world_name=prompt[:8] + "界",
                power_structure="未知势力",
                economy_unit="通用货币",
                player_role="异乡人",
                conflict_source="混沌与秩序的博弈",
                aesthetic="奇幻",
            )

    async def _compile_shen_mappings(self, lore: WorldLore) -> list[ShenMapping]:
        """使用 AI 将十神映射到世界概念。"""
        ai_prompt = SHEN_MAPPING_PROMPT.format(
            world_name=lore.world_name,
            power_structure=lore.power_structure,
            economy_unit=lore.economy_unit,
            player_role=lore.player_role,
            conflict_source=lore.conflict_source,
            aesthetic=lore.aesthetic,
        )
        raw = await chat_json(ai_prompt, model=settings.AI_MODEL_STRONG)
        try:
            data = json.loads(raw)
        except Exception:
            data = {}

        ten_god_symbols = {
            "正官": "⚖️", "七杀": "⚔️", "正财": "💰", "偏财": "🎲",
            "食神": "🎨", "伤官": "🔥", "比肩": "🤝", "劫财": "⚡",
            "正印": "📜", "偏印": "🌀",
        }

        result = []
        for tg in ["正官", "七杀", "正财", "偏财", "食神", "伤官", "比肩", "劫财", "正印", "偏印"]:
            concept = data.get(tg, f"{tg}之力")
            symbol = ten_god_symbols.get(tg, "●")
            result.append(ShenMapping(
                ten_god=tg,
                world_concept=concept,
                world_symbol=f"{symbol} {concept}",
            ))
        return result

    async def _generate_opening_scene(self, lore: WorldLore) -> str:
        """使用 AI 生成开场叙事。"""
        ai_prompt = OPENING_SCENE_PROMPT.format(
            world_name=lore.world_name,
            aesthetic=lore.aesthetic,
            power_structure=lore.power_structure,
            economy_unit=lore.economy_unit,
            player_role=lore.player_role,
            conflict_source=lore.conflict_source,
        )
        return await chat(
            ai_prompt,
            system="你是顶级叙事大师，专注于沉浸式世界构建。直接输出叙事内容，不要有任何前缀说明。",
            model=settings.AI_MODEL_STRONG,
            temperature=0.9,
            max_tokens=800,
        )
