"""
Project MING v6.0 — 八字解析器
Bazi Chart Parser

将公历/农历生辰转换为四柱八字，并生成命盘数据结构。
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel

from app.engines.five_elements import (
    Element,
    TenGod,
    FiveElementsEngine,
    ElementStrengths,
    STEM_ELEMENT,
    BRANCH_MAIN_STEM,
    GENERATES,
    CONTROLS,
)


# ─────────────────────────────────────────────
# 天干地支序列
# ─────────────────────────────────────────────

HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 60甲子起始基准（1924年甲子年）
BASE_YEAR = 1924
BASE_STEM_IDX = 0   # 甲
BASE_BRANCH_IDX = 0 # 子


# ─────────────────────────────────────────────
# 命盘数据模型
# ─────────────────────────────────────────────

class Pillar(BaseModel):
    stem: str
    branch: str
    ten_god: str
    element: str
    strength: float


class BaziChart(BaseModel):
    id: str
    gender: str
    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar
    self_element: str
    dominant_ten_god: str
    element_strengths: dict[str, float]
    pattern_name: str


# ─────────────────────────────────────────────
# 八字解析器
# ─────────────────────────────────────────────

class BaziParser:
    """
    八字解析器。

    注：当前使用简化算法，生产环境应接入专业命理库
    （如 lunardate + 精确节气数据）。
    """

    def __init__(self) -> None:
        self.engine = FiveElementsEngine()

    def parse(
        self,
        year: int,
        month: int,
        day: int,
        hour: int,
        gender: str,
        solar: bool = True,
    ) -> BaziChart:
        """解析生辰，返回完整命盘。"""
        y_stem, y_branch = self._year_pillar(year)
        m_stem, m_branch = self._month_pillar(year, month)
        d_stem, d_branch = self._day_pillar(year, month, day)
        h_stem, h_branch = self._hour_pillar(d_stem, hour)

        self_elem = STEM_ELEMENT[d_stem]

        strengths = self.engine.compute_from_pillars(
            y_stem, y_branch,
            m_stem, m_branch,
            d_stem, d_branch,
            h_stem, h_branch,
        )

        ten_god_activation = self.engine.compute_ten_god_activation(self_elem, strengths)
        dominant_tg = max(ten_god_activation, key=lambda k: ten_god_activation[k])

        pattern_name = self.engine.detect_pattern(self_elem, strengths, dominant_tg)

        def make_pillar(stem: str, branch: str) -> Pillar:
            elem = STEM_ELEMENT.get(stem, Element.EARTH)
            tg = self._compute_ten_god(self_elem, elem, gender)
            return Pillar(
                stem=stem,
                branch=branch,
                ten_god=tg.value,
                element=elem.value,
                strength=round(strengths.as_dict().get(elem, 0.0), 4),
            )

        return BaziChart(
            id=str(uuid.uuid4()),
            gender=gender,
            year_pillar=make_pillar(y_stem, y_branch),
            month_pillar=make_pillar(m_stem, m_branch),
            day_pillar=make_pillar(d_stem, d_branch),
            hour_pillar=make_pillar(h_stem, h_branch),
            self_element=self_elem.value,
            dominant_ten_god=dominant_tg.value,
            element_strengths={e.value: round(v, 4) for e, v in strengths.as_dict().items()},
            pattern_name=pattern_name,
        )

    def compute_personality_vector(self, chart: BaziChart) -> dict:
        """从命盘生成五行人格向量。"""
        dominant_elem = max(
            chart.element_strengths,
            key=lambda e: chart.element_strengths[e],
        )
        return {
            "dominant": dominant_elem,
            "scores": chart.element_strengths,
            "pattern": chart.pattern_name,
        }

    def get_current_dayun(self, chart: BaziChart) -> dict[str, str]:
        """获取当前大运（简化：返回流年大运信息）。"""
        current_year = datetime.now().year
        # 简化实现：实际需根据命主出生年月精确排运
        stem_idx = (current_year - BASE_YEAR) % 10
        branch_idx = (current_year - BASE_YEAR) % 12
        stem = HEAVENLY_STEMS[stem_idx]
        branch = EARTHLY_BRANCHES[branch_idx]
        elem = STEM_ELEMENT.get(stem, Element.EARTH)
        return {
            "stem": stem,
            "branch": branch,
            "element": elem.value,
            "liunian": f"{current_year}年 {stem}{branch}",
        }

    # ─────────────────────────────────────────
    # 内部计算方法
    # ─────────────────────────────────────────

    def _year_pillar(self, year: int) -> tuple[str, str]:
        offset = (year - BASE_YEAR) % 60
        stem = HEAVENLY_STEMS[(BASE_STEM_IDX + offset) % 10]
        branch = EARTHLY_BRANCHES[(BASE_BRANCH_IDX + offset) % 12]
        return stem, branch

    def _month_pillar(self, year: int, month: int) -> tuple[str, str]:
        # 简化：以月份直接映射地支（正月=寅）
        branch_idx = (month + 1) % 12
        branch = EARTHLY_BRANCHES[branch_idx]
        # 月干由年干推算（五虎遁年）
        y_stem_idx = (year - BASE_YEAR) % 10
        m_stem_idx = (y_stem_idx % 5) * 2 + (month - 1)
        stem = HEAVENLY_STEMS[m_stem_idx % 10]
        return stem, branch

    def _day_pillar(self, year: int, month: int, day: int) -> tuple[str, str]:
        # 使用简化公式推算日柱（Zeller变体）
        if month < 3:
            year -= 1
            month += 12
        c = year // 100
        y = year % 100
        # 万年历偏移（简化）
        offset = (4 * c + y + y // 4 + 26 * (month + 1) // 10 + day - 1) % 60
        stem = HEAVENLY_STEMS[offset % 10]
        branch = EARTHLY_BRANCHES[offset % 12]
        return stem, branch

    def _hour_pillar(self, day_stem: str, hour: int) -> tuple[str, str]:
        # 十二时辰：子时=0点，每2小时一辰
        branch_idx = (hour // 2) % 12
        branch = EARTHLY_BRANCHES[branch_idx]
        # 时干由日干推算（五鼠遁日）
        d_stem_idx = HEAVENLY_STEMS.index(day_stem)
        h_stem_idx = (d_stem_idx % 5) * 2 + branch_idx
        stem = HEAVENLY_STEMS[h_stem_idx % 10]
        return stem, branch

    def _compute_ten_god(
        self,
        self_elem: Element,
        target_elem: Element,
        gender: str,
    ) -> TenGod:
        """根据日主与目标五行计算十神。"""
        # 同类
        if target_elem == self_elem:
            return TenGod.BIJIAN  # 简化：不区分阴阳

        # 我生
        if GENERATES[self_elem] == target_elem:
            return TenGod.SHISHEN

        # 我克
        if CONTROLS[self_elem] == target_elem:
            return TenGod.ZHENGCAI

        # 克我
        if CONTROLS[target_elem] == self_elem:
            return TenGod.ZHENGGUAN

        # 生我
        if GENERATES[target_elem] == self_elem:
            return TenGod.ZHENGYIN

        return TenGod.BIJIAN
