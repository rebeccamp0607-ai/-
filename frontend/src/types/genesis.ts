/**
 * Project MING v6.0 — 创世引擎类型定义
 * Genesis Engine Type System
 */

import type { TenGod, Element } from "./five-elements";

// ─────────────────────────────────────────────
// 世界规则 Schema
// ─────────────────────────────────────────────

export interface WorldSchema {
  id: string;
  name: string;
  isOfficial: boolean;
  creatorId?: string;

  /** 核心世界设定 */
  lore: {
    worldName: string;
    powerStructure: string;  // 谁统治世界
    economyUnit: string;     // 货币/资源
    playerRole: string;      // 玩家初始身份
    conflictSource: string;  // 核心矛盾
    aesthetic: string;       // 美术风格关键词
  };

  /** 十神 → 世界规则映射 */
  shenMappings: ShenWorldMapping[];

  /** 世界专属 NPC 规则 */
  npcArchetypes: NPCArchetype[];

  /** 世界专属事件池 */
  eventPool: WorldEvent[];

  /** 热度统计（创世工坊用） */
  stats: {
    plays: number;
    rating: number;  // 0.0 ~ 5.0
    createdAt: string;
  };
}

/** 单个十神的世界映射规则 */
export interface ShenWorldMapping {
  tenGod: TenGod;
  worldConcept: string;   // e.g. 正官 → "猫皇律法"
  worldSymbol: string;    // e.g. "⚖️ 猫皇律法"
  triggeredBy: string[];  // 触发该映射的世界内事件关键词
}

// ─────────────────────────────────────────────
// NPC 原型 (NPC Archetypes)
// ─────────────────────────────────────────────

export interface NPCArchetype {
  role: string;          // e.g. "猫皇使者"
  tenGodBasis: TenGod;   // 基于哪个十神生成
  disposition: "ally" | "neutral" | "hostile" | "chaotic";
  primaryElement: Element;
  dialogueStyle: string; // e.g. "傲慢、居高临下，偶尔施恩"
}

// ─────────────────────────────────────────────
// 世界事件 (World Events)
// ─────────────────────────────────────────────

export type EventCategory =
  | "crisis"      // 危机（七杀触发）
  | "opportunity" // 机遇（偏财触发）
  | "social"      // 社交（食神触发）
  | "authority"   // 权威冲突（正官触发）
  | "resource"    // 资源争夺（劫财触发）
  | "dream";      // 梦境专属

export interface WorldEvent {
  id: string;
  category: EventCategory;
  title: string;
  bodyTemplate: string;  // 支持 {{variable}} 插值
  options: EventOption[];
  dayRange?: [number, number]; // 仅在特定天数触发
  elementCondition?: Element;  // 仅在特定五行旺盛时触发
}

export interface EventOption {
  label: string;
  tenGodAligned: TenGod;  // 该选项激活哪个十神
  sanDelta: number;
  cognitionDelta: number;
  consequence: string;    // 后果描述模板
  hiddenUnlock?: string;  // San > 80 时解锁的隐藏信息
}

// ─────────────────────────────────────────────
// 创世编译结果
// ─────────────────────────────────────────────

export interface GenesisCompileResult {
  worldId: string;
  worldSchema: WorldSchema;
  shenMappings: Record<TenGod, string>;
  previewScene: string;
  status: "ready" | "compiling" | "error";
}

// ─────────────────────────────────────────────
// 创世工坊
// ─────────────────────────────────────────────

export interface WorkshopWorld {
  world: WorldSchema;
  creatorName: string;
  creatorKarma: number;
  rank: number;
  isFeatured: boolean;
}
