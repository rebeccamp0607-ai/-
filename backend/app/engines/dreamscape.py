"""
Project MING v6.0 — 梦境引擎
The Dreamscape Engine

根据玩家白天的执念和 San 值，生成夜间梦境副本类型。
"""

from __future__ import annotations

from enum import Enum
from dataclasses import dataclass

from app.engines.five_elements import TenGod, Element


class DreamType(str, Enum):
    BOSS_FIGHT    = "giant_boss"        # 攻击性宣泄
    LABYRINTH     = "maze_treasure"     # 重建控制感
    TIME_MACHINE  = "time_regression"   # 接受遗憾
    MIRROR_WORLD  = "mirror_dialogue"   # 自我对话
    FREE_FALL     = "void_descent"      # 失控恐惧
    VOID          = "void"              # San 极低时的无序梦境


OBSESSION_TO_DREAM: dict[str, DreamType] = {
    "被批评压制":   DreamType.BOSS_FIGHT,
    "投资失败":     DreamType.LABYRINTH,
    "错失机遇":     DreamType.TIME_MACHINE,
    "人际背叛":     DreamType.MIRROR_WORLD,
    "失去控制":     DreamType.FREE_FALL,
    "极度疲惫":     DreamType.VOID,
}

DREAM_SAN_REWARD: dict[DreamType, tuple[int, int]] = {
    DreamType.BOSS_FIGHT:   (15, 30),
    DreamType.LABYRINTH:    (20, 35),
    DreamType.TIME_MACHINE: (10, 25),
    DreamType.MIRROR_WORLD: (25, 40),
    DreamType.FREE_FALL:    (5,  20),
    DreamType.VOID:         (-5, 10),
}


@dataclass
class DreamResult:
    dream_type: DreamType
    narrative: str
    san_reward: int
    fragment_dropped: bool
    hidden_insight: str | None = None


class DreamscapeEngine:
    """
    梦境引擎：基于执念分析生成梦境副本。

    触发条件：San < 40%
    核心逻辑：
        1. 分析白天的执念日志（obsession_log）
        2. 匹配梦境类型
        3. AI 生成梦境叙事
        4. 计算 San 恢复奖励
        5. 概率掉落「潜意识碎片」
    """

    FRAGMENT_DROP_RATE: dict[DreamType, float] = {
        DreamType.BOSS_FIGHT:   0.20,
        DreamType.LABYRINTH:    0.25,
        DreamType.TIME_MACHINE: 0.30,
        DreamType.MIRROR_WORLD: 0.40,  # 自我对话最易触发碎片
        DreamType.FREE_FALL:    0.10,
        DreamType.VOID:         0.05,
    }

    def determine_dream_type(
        self,
        obsession_log: list[str],
        san: float,
        dominant_ten_god: TenGod,
    ) -> DreamType:
        """根据执念日志确定梦境类型。"""
        if san < 0.1:
            return DreamType.VOID

        for obsession in obsession_log:
            for keyword, dream_type in OBSESSION_TO_DREAM.items():
                if keyword in obsession:
                    return dream_type

        # 根据十神的默认倾向
        ten_god_defaults: dict[TenGod, DreamType] = {
            TenGod.QISHA:      DreamType.BOSS_FIGHT,
            TenGod.ZHENGGUAN:  DreamType.FREE_FALL,
            TenGod.SHANGGUAN:  DreamType.BOSS_FIGHT,
            TenGod.PIANCAI:    DreamType.LABYRINTH,
            TenGod.PIANYIN:    DreamType.MIRROR_WORLD,
            TenGod.ZHENGYIN:   DreamType.TIME_MACHINE,
        }
        return ten_god_defaults.get(dominant_ten_god, DreamType.LABYRINTH)

    def compute_san_reward(self, dream_type: DreamType, success: bool) -> int:
        """计算 San 值恢复量。成功通关奖励上限，失败奖励下限。"""
        low, high = DREAM_SAN_REWARD[dream_type]
        return high if success else low

    def check_fragment_drop(self, dream_type: DreamType) -> bool:
        """判断是否掉落潜意识碎片。"""
        import random
        return random.random() < self.FRAGMENT_DROP_RATE[dream_type]

    async def generate_dream_narrative(
        self,
        dream_type: DreamType,
        obsession_log: list[str],
        world_id: str,
    ) -> str:
        """使用 AI 生成梦境叙事（200-300字）。"""
        from app.core.ai_client import chat

        obsession_text = "、".join(obsession_log) if obsession_log else "未解的日常压力"

        dream_type_desc = {
            DreamType.BOSS_FIGHT:   "与一个代表压迫你的力量的巨型Boss对决（攻击性宣泄）",
            DreamType.LABYRINTH:    "在财富与机遇交织的迷宫中寻找出口（重建控制感）",
            DreamType.TIME_MACHINE: "回到你最后悔的那个关键时刻（接受遗憾）",
            DreamType.MIRROR_WORLD: "与镜中另一个自我对话（深度自我探索）",
            DreamType.FREE_FALL:    "从高处坠落，在虚空中寻找立足点（面对失控恐惧）",
            DreamType.VOID:         "在极度混沌的黑暗中寻找一丝光芒（极限状态）",
        }

        prompt = f"""你是梦境叙事大师。请为玩家生成一段沉浸式梦境叙事。

今日执念：{obsession_text}
梦境类型：{dream_type_desc[dream_type]}

要求：
1. 第二人称"你"带入，超现实感，意象丰富
2. 150-250字
3. 将执念转化为梦境中的具体意象和挑战
4. 结尾给出两个通关选择（格式：【直面】xxx / 【逃避】xxx）
"""
        return await chat(
            prompt,
            system="你是专注于心理意象的梦境叙事大师，语言诗意而震撼。直接输出叙事，不要前缀。",
            temperature=0.92,
            max_tokens=400,
        )
