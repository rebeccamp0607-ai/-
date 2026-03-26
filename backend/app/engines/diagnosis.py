"""
Project MING v6.0 — 命运诊断引擎
The Life Diagnosis Engine

结算本局游戏，生成《命运诊断书》，提炼现实映射建议。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from collections import Counter

from app.engines.five_elements import Element, TenGod


@dataclass
class BlindSpotAnalysis:
    element: str
    description: str
    occurrences: int


@dataclass
class HighlightMoment:
    day: int
    description: str
    ten_god_activated: str


@dataclass
class RealityMapping:
    game_pattern: str
    reality_suggestion: str
    priority: str  # "high" | "medium" | "low"
    calendar_event: str | None = None


@dataclass
class DiagnosisReport:
    session_id: str
    world_id: str
    pattern_name: str
    total_days: int

    blind_spot_analysis: list[BlindSpotAnalysis] = field(default_factory=list)
    highlight_moments: list[HighlightMoment] = field(default_factory=list)
    reality_mappings: list[RealityMapping] = field(default_factory=list)

    final_san: int = 0
    final_cognition: int = 0
    final_karma: int = 0


class DiagnosisEngine:
    """
    命运诊断引擎。

    分析整局决策记录，识别行为模式的盲点，
    生成可导出到现实的行动建议。
    """

    ELEMENT_BLIND_SPOTS: dict[str, str] = {
        "fire":  "你在[火]旺时期（夏季/丙丁年）容易冲动决策，建议在高能量状态下多设冷静期。",
        "water": "你在[水]旺时期容易过度分析导致错失时机，建议训练「够好就行」的执行力。",
        "wood":  "你在[木]旺时期容易扩张过速，建议在增长期同步关注现金流与风险。",
        "metal": "你在[金]旺时期容易固执于既定判断，建议刻意练习接纳不同视角。",
        "earth": "你在[土]旺时期容易过度稳健错失机遇，建议设定定期的「冒险配额」。",
    }

    TEN_GOD_SUGGESTIONS: dict[str, RealityMapping] = {
        "七杀": RealityMapping(
            game_pattern="频繁触发[七杀]事件，冲突模式高",
            reality_suggestion="现实中可能面临同类压力，建议系统学习冲突管理与谈判技巧",
            priority="high",
            calendar_event="学习非暴力沟通基础",
        ),
        "伤官": RealityMapping(
            game_pattern="[伤官]能量旺盛，规则抗拒倾向",
            reality_suggestion="创意与反叛性是资产，关键是找到合法渠道释放，而非硬碰规则",
            priority="medium",
            calendar_event="探索副业或创意项目",
        ),
        "偏财": RealityMapping(
            game_pattern="[偏财]触发频繁，机遇敏感但风险控制弱",
            reality_suggestion="投资前建立「三不碰」原则，将直觉变为系统性判断",
            priority="high",
            calendar_event="学习财务基础与风险管理",
        ),
        "正印": RealityMapping(
            game_pattern="[正印]主导，退守直觉倾向",
            reality_suggestion="直觉是优势，但避免以「感觉不对」为由放弃实际验证",
            priority="low",
        ),
    }

    def generate_report(
        self,
        session_id: str,
        world_id: str,
        pattern_name: str,
        decision_history: list[dict],
        final_resources: dict,
    ) -> DiagnosisReport:
        """生成完整的命运诊断书。"""
        report = DiagnosisReport(
            session_id=session_id,
            world_id=world_id,
            pattern_name=pattern_name,
            total_days=len(decision_history),
            final_san=final_resources.get("san", 0),
            final_cognition=final_resources.get("cognition_points", 0),
            final_karma=final_resources.get("karma", 0),
        )

        # 统计各五行的决策频率
        element_counts = Counter(
            d.get("dominant_element") for d in decision_history
            if d.get("dominant_element")
        )
        most_common_elem, count = element_counts.most_common(1)[0] if element_counts else (None, 0)

        if most_common_elem and most_common_elem in self.ELEMENT_BLIND_SPOTS:
            report.blind_spot_analysis.append(
                BlindSpotAnalysis(
                    element=most_common_elem,
                    description=self.ELEMENT_BLIND_SPOTS[most_common_elem],
                    occurrences=count,
                )
            )

        # 识别高光时刻（regret_score < 0.2 的决策）
        for record in decision_history:
            if record.get("regret_score", 1.0) < 0.2 and record.get("cognition_delta", 0) > 5:
                report.highlight_moments.append(
                    HighlightMoment(
                        day=record.get("day", 0),
                        description=record.get("scene_summary", "关键决策"),
                        ten_god_activated=record.get("dominant_element", ""),
                    )
                )

        # 生成现实映射建议
        ten_god_counts = Counter(
            d.get("dominant_ten_god") for d in decision_history
            if d.get("dominant_ten_god")
        )
        for tg, _ in ten_god_counts.most_common(3):
            if tg in self.TEN_GOD_SUGGESTIONS:
                report.reality_mappings.append(self.TEN_GOD_SUGGESTIONS[tg])

        return report

    def format_as_text(self, report: DiagnosisReport) -> str:
        """将诊断书格式化为可读文本（用于 Notion/Obsidian 导出）。"""
        lines = [
            "═" * 50,
            f"    本局命运诊断书 · {report.world_id[:12]}",
            "═" * 50,
            f"格局识别：{report.pattern_name}",
            f"本局历时：{report.total_days} 天（游戏内）",
            "",
            "── 核心决策盲点 ──",
        ]
        for bs in report.blind_spot_analysis:
            lines.append(f"  ▸ [{bs.element}]: {bs.description}")
            lines.append(f"    触发次数：{bs.occurrences}")

        lines += ["", "── 本局高光时刻 ──"]
        for hm in report.highlight_moments:
            lines.append(f"  ▸ Day_{hm.day}: {hm.description}")

        lines += ["", "── 现实映射建议 ──"]
        for rm in report.reality_mappings:
            priority_mark = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rm.priority, "")
            lines.append(f"  {priority_mark} {rm.reality_suggestion}")
            if rm.calendar_event:
                lines.append(f"    → 日历提醒：{rm.calendar_event}")

        lines += [
            "",
            f"最终状态：San={report.final_san} / 认知点={report.final_cognition} / 业力={report.final_karma}",
            "═" * 50,
        ]
        return "\n".join(lines)
