/**
 * Project MING v6.0 — 五行引擎核心类型定义
 * The 5-Elements Engine Type System
 */

// ─────────────────────────────────────────────
// 基础枚举
// ─────────────────────────────────────────────

export type Element = "metal" | "wood" | "water" | "fire" | "earth";
export type Gender = "male" | "female";
export type GameMode = "sim" | "rogue";

/** 天干 (Heavenly Stems) */
export type HeavenlyStem =
  | "甲" | "乙" | "丙" | "丁" | "戊"
  | "己" | "庚" | "辛" | "壬" | "癸";

/** 地支 (Earthly Branches) */
export type EarthlyBranch =
  | "子" | "丑" | "寅" | "卯" | "辰" | "巳"
  | "午" | "未" | "申" | "酉" | "戌" | "亥";

/** 十神 (Ten Gods / Ten Deities) */
export type TenGod =
  | "比肩" | "劫财"   // 比劫系 (Peers)
  | "食神" | "伤官"   // 食伤系 (Output)
  | "正财" | "偏财"   // 财星系 (Wealth)
  | "正官" | "七杀"   // 官杀系 (Authority)
  | "正印" | "偏印";  // 印绶系 (Resource)

// ─────────────────────────────────────────────
// 五行生克矩阵
// ─────────────────────────────────────────────

/** 五行相生关系 */
export const GENERATES: Record<Element, Element> = {
  metal: "water",
  water: "wood",
  wood:  "fire",
  fire:  "earth",
  earth: "metal",
};

/** 五行相克关系 */
export const CONTROLS: Record<Element, Element> = {
  metal: "wood",
  wood:  "earth",
  earth: "water",
  water: "fire",
  fire:  "metal",
};

/** 天干五行映射 */
export const STEM_ELEMENT: Record<HeavenlyStem, Element> = {
  甲: "wood",  乙: "wood",
  丙: "fire",  丁: "fire",
  戊: "earth", 己: "earth",
  庚: "metal", 辛: "metal",
  壬: "water", 癸: "water",
};

// ─────────────────────────────────────────────
// 命盘 (BaziChart)
// ─────────────────────────────────────────────

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  tenGod: TenGod;
  element: Element;
  strength: number; // 0.0 ~ 1.0，动态强度
}

export interface BaziChart {
  id: string;
  gender: Gender;
  yearPillar:  Pillar;
  monthPillar: Pillar;
  dayPillar:   Pillar;  // 日主 (Self Element)
  hourPillar:  Pillar;
  selfElement: Element;
  dominantTenGod: TenGod;
}

// ─────────────────────────────────────────────
// 大运流年 (Luck Cycles)
// ─────────────────────────────────────────────

export interface DaYun {
  index: number;        // 第几步大运 (0-based)
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: Element;
  startAge: number;
  endAge: number;
  field: ElementField;  // 大运提供的"场"
}

/** 大运叠加的"场"效应 */
export interface ElementField {
  amplified: Element[];   // 被放大的五行
  suppressed: Element[];  // 被压制的五行
  triggerChance: number;  // 0.0 ~ 1.0，事件触发频率
}

// ─────────────────────────────────────────────
// 五行人格向量 (Personality Vector)
// ─────────────────────────────────────────────

export interface PersonalityVector {
  /** 五行分值 (归一化，总和 = 1.0) */
  scores: Record<Element, number>;
  /** 主导十神 */
  dominantTenGod: TenGod;
  /** 格局名称 (e.g. 伤官配印格) */
  patternName: string;
  /** 核心特质描述 */
  traits: string[];
  /** 决策盲点 */
  blindSpots: string[];
}

// ─────────────────────────────────────────────
// 神煞激活状态 (Shen Activation State)
// ─────────────────────────────────────────────

export interface ShenState {
  tenGod: TenGod;
  name: string;           // 显示名 (e.g. "伤官君")
  currentStrength: number; // 0.0 ~ 2.0 (1.0 = 基准)
  isActivated: boolean;
  activationTrigger: string;
  councilOpinion: string;  // 众神议会发言内容（AI 生成）
}

// ─────────────────────────────────────────────
// 玩家资源状态 (Player Resource State)
// ─────────────────────────────────────────────

export interface PlayerResources {
  san: number;              // 0 ~ 100，San 值 (心力)
  cognitionPoints: number;  // 认知点
  karma: number;            // 业力
  subconsciousFragments: number; // 潜意识碎片
  undoTokensUsed: number;   // 后悔药已使用次数 (上限 3)
}

// ─────────────────────────────────────────────
// 游戏会话 (Game Session)
// ─────────────────────────────────────────────

export interface GameSession {
  id: string;
  userId: string;
  baziChart: BaziChart;
  worldId: string;
  mode: GameMode;
  currentDay: number;
  resources: PlayerResources;
  activeShenStates: ShenState[];
  currentDaYun: DaYun;
  decisionHistory: DecisionRecord[];
  obsessionLog: string[];  // 白天未解决的执念（用于生成梦境）
  status: "active" | "dreaming" | "settled";
}

// ─────────────────────────────────────────────
// 决策记录 (Decision Record)
// ─────────────────────────────────────────────

export interface DecisionRecord {
  day: number;
  sceneId: string;
  sceneSummary: string;
  chosenOption: string;
  isFreeWill: boolean;      // 是否自由意志 C 选项
  outcome: string;
  sanDelta: number;
  cognitionDelta: number;
  dominantElement: Element; // 本次决策激活的主导五行
  regretScore: number;      // 0.0 ~ 1.0，后悔程度（AI 评估）
}

// ─────────────────────────────────────────────
// 命运诊断书 (Diagnosis Report)
// ─────────────────────────────────────────────

export interface DiagnosisReport {
  sessionId: string;
  worldId: string;
  patternName: string;
  totalDays: number;

  blindSpotAnalysis: {
    element: Element;
    description: string;
    occurrences: number;
  }[];

  highlightMoments: {
    day: number;
    description: string;
    tenGodActivated: TenGod;
  }[];

  realityMappings: {
    gamePattern: string;
    realitySuggestion: string;
    priority: "high" | "medium" | "low";
    calendarEvent?: string;
  }[];

  finalStats: PlayerResources;
}
