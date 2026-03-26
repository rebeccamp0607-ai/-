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
        """
        使用 GPT-4o 生成梦境叙事（200-300字）。

        叙事要求：
        - 将执念转化为梦境意象
        - 带有超现实感
        - 结尾给出通关条件
        """
        # TODO: 接入真实 AI 调用
        obsession_text = "、".join(obsession_log) if obsession_log else "未解的日常压力"

        dream_descriptions = {
            DreamType.BOSS_FIGHT:   "你面对一个巨大的、面孔模糊的Boss，手中握着你平日不敢说出口的话语……",
            DreamType.LABYRINTH:    "迷宫的每一个路口都闪烁着金光，那是你曾经错过的机会……",
            DreamType.TIME_MACHINE: "时光机的仪表盘指向那个你最后悔的瞬间……",
            DreamType.MIRROR_WORLD: "镜子里的那个你，眼神与你截然相反，他/她想对你说些什么……",
            DreamType.FREE_FALL:    "你从云端坠落，却发现下方没有地面，只有无尽的……",
            DreamType.VOID:         "黑暗中，只有一丝微弱的光……",
        }

        return (
            f"【梦境降临】\n\n"
            f"今日执念：{obsession_text}\n\n"
            f"{dream_descriptions[dream_type]}\n\n"
            f"【通关目标：直面内心，选择你的应对方式。】"
        )
