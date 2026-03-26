"""
Project MING v6.0 — 五行引擎核心
The 5-Elements Engine Core

五行生克逻辑，动态计算五行强度，驱动十神激活。
"""

from __future__ import annotations

from enum import Enum
from dataclasses import dataclass, field


class Element(str, Enum):
    METAL = "metal"
    WOOD  = "wood"
    WATER = "water"
    FIRE  = "fire"
    EARTH = "earth"


class TenGod(str, Enum):
    # 比劫系 (Peers)
    BIJIAN  = "比肩"
    JIECAI  = "劫财"
    # 食伤系 (Output)
    SHISHEN = "食神"
    SHANGGUAN = "伤官"
    # 财星系 (Wealth)
    ZHENGCAI = "正财"
    PIANCAI  = "偏财"
    # 官杀系 (Authority)
    ZHENGGUAN = "正官"
    QISHA     = "七杀"
    # 印绶系 (Resource)
    ZHENGYIN = "正印"
    PIANYIN  = "偏印"


# ─────────────────────────────────────────────
# 五行生克矩阵
# ─────────────────────────────────────────────

GENERATES: dict[Element, Element] = {
    Element.METAL: Element.WATER,
    Element.WATER: Element.WOOD,
    Element.WOOD:  Element.FIRE,
    Element.FIRE:  Element.EARTH,
    Element.EARTH: Element.METAL,
}

CONTROLS: dict[Element, Element] = {
    Element.METAL: Element.WOOD,
    Element.WOOD:  Element.EARTH,
    Element.EARTH: Element.WATER,
    Element.WATER: Element.FIRE,
    Element.FIRE:  Element.METAL,
}

# 天干五行映射
STEM_ELEMENT: dict[str, Element] = {
    "甲": Element.WOOD,  "乙": Element.WOOD,
    "丙": Element.FIRE,  "丁": Element.FIRE,
    "戊": Element.EARTH, "己": Element.EARTH,
    "庚": Element.METAL, "辛": Element.METAL,
    "壬": Element.WATER, "癸": Element.WATER,
}

# 地支藏干（简化版，只取主气）
BRANCH_MAIN_STEM: dict[str, str] = {
    "子": "壬", "丑": "己", "寅": "甲", "卯": "乙",
    "辰": "戊", "巳": "丙", "午": "丁", "未": "己",
    "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬",
}


# ─────────────────────────────────────────────
# 五行强度计算器
# ─────────────────────────────────────────────

@dataclass
class ElementStrengths:
    """五行强度分布（归一化，总和 = 1.0）"""
    metal: float = 0.0
    wood:  float = 0.0
    water: float = 0.0
    fire:  float = 0.0
    earth: float = 0.0

    def as_dict(self) -> dict[Element, float]:
        return {
            Element.METAL: self.metal,
            Element.WOOD:  self.wood,
            Element.WATER: self.water,
            Element.FIRE:  self.fire,
            Element.EARTH: self.earth,
        }

    def dominant(self) -> Element:
        return max(self.as_dict(), key=lambda e: self.as_dict()[e])

    def weakest(self) -> Element:
        return min(self.as_dict(), key=lambda e: self.as_dict()[e])

    def normalize(self) -> "ElementStrengths":
        total = self.metal + self.wood + self.water + self.fire + self.earth
        if total == 0:
            return self
        factor = 1.0 / total
        return ElementStrengths(
            metal=self.metal * factor,
            wood=self.wood   * factor,
            water=self.water * factor,
            fire=self.fire   * factor,
            earth=self.earth * factor,
        )


class FiveElementsEngine:
    """
    五行引擎：计算命盘中五行分布，动态模拟生克互动。

    核心算法：
        1. 统计四柱中各五行的基础权重（月令加权）
        2. 叠加大运流年的"场"效应
        3. 动态调整：生者得1/3生气，克者损1/4元气
    """

    PILLAR_WEIGHTS = {
        "year":  0.15,
        "month": 0.35,  # 月令为重
        "day":   0.30,
        "hour":  0.20,
    }

    def compute_from_pillars(
        self,
        year_stem: str,
        year_branch: str,
        month_stem: str,
        month_branch: str,
        day_stem: str,
        day_branch: str,
        hour_stem: str,
        hour_branch: str,
    ) -> ElementStrengths:
        """从四柱天干地支计算基础五行强度。"""
        pillars = [
            ("year",  year_stem,  year_branch),
            ("month", month_stem, month_branch),
            ("day",   day_stem,   day_branch),
            ("hour",  hour_stem,  hour_branch),
        ]
        raw: dict[Element, float] = {e: 0.0 for e in Element}

        for pillar_name, stem, branch in pillars:
            w = self.PILLAR_WEIGHTS[pillar_name]
            stem_elem = STEM_ELEMENT.get(stem)
            if stem_elem:
                raw[stem_elem] += w

            branch_stem = BRANCH_MAIN_STEM.get(branch)
            if branch_stem:
                branch_elem = STEM_ELEMENT.get(branch_stem)
                if branch_elem:
                    raw[branch_elem] += w * 0.7  # 地支藏干权重略低

        strengths = ElementStrengths(
            metal=raw[Element.METAL],
            wood=raw[Element.WOOD],
            water=raw[Element.WATER],
            fire=raw[Element.FIRE],
            earth=raw[Element.EARTH],
        )
        return strengths.normalize()

    def apply_dayun_field(
        self,
        base: ElementStrengths,
        dayun_element: Element,
        amplify_factor: float = 0.2,
    ) -> ElementStrengths:
        """
        叠加大运的"场"效应。
        大运元素放大自身及相生下一元素，压制相克元素。
        """
        d = base.as_dict().copy()
        target_generated = GENERATES[dayun_element]
        target_controlled = CONTROLS[dayun_element]

        d[dayun_element]   = min(1.0, d[dayun_element] + amplify_factor)
        d[target_generated] = min(1.0, d[target_generated] + amplify_factor * 0.5)
        d[target_controlled] = max(0.0, d[target_controlled] - amplify_factor * 0.4)

        result = ElementStrengths(
            metal=d[Element.METAL],
            wood=d[Element.WOOD],
            water=d[Element.WATER],
            fire=d[Element.FIRE],
            earth=d[Element.EARTH],
        )
        return result.normalize()

    def compute_ten_god_activation(
        self,
        self_element: Element,
        strengths: ElementStrengths,
    ) -> dict[TenGod, float]:
        """
        根据日主元素与五行强度，计算各十神的当前激活强度。
        返回：十神 → 激活强度 (0.0 ~ 1.0)
        """
        d = strengths.as_dict()
        generates_me = [e for e, gen in GENERATES.items() if gen == self_element]
        i_generate   = GENERATES[self_element]
        controls_me  = [e for e, ctrl in CONTROLS.items() if ctrl == self_element]
        i_control    = CONTROLS[self_element]
        same_elem    = self_element

        activation: dict[TenGod, float] = {}

        # 比劫系：同类五行强度
        same_strength = d[same_elem]
        activation[TenGod.BIJIAN]  = same_strength * 0.6
        activation[TenGod.JIECAI]  = same_strength * 0.4

        # 食伤系：我生之物
        output_strength = d[i_generate]
        activation[TenGod.SHISHEN]   = output_strength * 0.55
        activation[TenGod.SHANGGUAN] = output_strength * 0.45

        # 财星系：我克之物
        wealth_strength = d[i_control]
        activation[TenGod.ZHENGCAI] = wealth_strength * 0.6
        activation[TenGod.PIANCAI]  = wealth_strength * 0.4

        # 官杀系：克我之物
        authority_strength = sum(d[e] for e in controls_me)
        activation[TenGod.ZHENGGUAN] = authority_strength * 0.55
        activation[TenGod.QISHA]     = authority_strength * 0.45

        # 印绶系：生我之物
        resource_strength = sum(d[e] for e in generates_me)
        activation[TenGod.ZHENGYIN] = resource_strength * 0.55
        activation[TenGod.PIANYIN]  = resource_strength * 0.45

        # 归一化到 0~1
        max_val = max(activation.values()) if activation else 1.0
        if max_val > 0:
            activation = {k: v / max_val for k, v in activation.items()}

        return activation

    def detect_pattern(
        self,
        self_element: Element,
        strengths: ElementStrengths,
        dominant_ten_god: TenGod,
    ) -> str:
        """识别命格格局名称。"""
        d = strengths.as_dict()
        self_strength = d[self_element]

        if self_strength >= 0.35:
            prefix = "身强"
        elif self_strength <= 0.15:
            prefix = "身弱"
        else:
            prefix = "中和"

        ten_god_name = dominant_ten_god.value
        return f"{ten_god_name}格（{prefix}）"
