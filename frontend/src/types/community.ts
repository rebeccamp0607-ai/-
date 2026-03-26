/**
 * Project MING v6.0 — 阿卡西记录 · 社区类型定义
 * Akashic Records Community Type System
 */

import type { DecisionRecord, PlayerResources } from "./five-elements";

// ─────────────────────────────────────────────
// 平行时空 (Parallel Destiny)
// ─────────────────────────────────────────────

export interface ParallelDestiny {
  universeId: string;          // e.g. "Universe #234"
  similarityScore: number;     // 0.85 ~ 1.0
  sharedPatternName: string;   // 相同的格局名
  pivotDecision: {
    day: number;
    sceneSummary: string;
    theirChoice: string;       // 他们的选择
    yourChoice: string;        // 你的选择
  };
  theirOutcome: {
    summary: string;           // e.g. "成了乱世枭雄，但英年早逝"
    finalResources: PlayerResources;
    tone: "triumph" | "tragedy" | "ambiguous";
  };
  biography?: string;          // 可选：完整传记（需消耗认知点解锁）
  messageCount: number;        // 其他玩家的留言数
}

// ─────────────────────────────────────────────
// 命运求助 (Destiny SOS)
// ─────────────────────────────────────────────

export interface SOSSignal {
  id: string;
  creatorId: string;
  sessionId: string;
  nodeId: string;
  contextSummary: string;
  options: string[];
  voteCounts: Record<string, number>;
  totalVotes: number;
  mentorTakeoverAvailable: boolean;
  status: "open" | "resolved" | "expired";
  expiresAt: string;
  resolvedChoice?: string;
}

export interface SOSVote {
  sosId: string;
  voterId: string;
  chosenOption: string;
  reasoning?: string;   // 可选：投票理由
  karmaSpent: number;   // 投票消耗的业力
}

export interface MentorTakeover {
  sosId: string;
  mentorId: string;
  mentorKarma: number;
  cognitionCost: number;  // 消耗认知点
  duration: number;       // 代打时长（分钟）
  reportIncluded: boolean;
}

// ─────────────────────────────────────────────
// 用户社区档案 (Community Profile)
// ─────────────────────────────────────────────

export interface CommunityProfile {
  userId: string;
  displayName: string;
  karma: number;
  cognitionPoints: number;
  title: string;            // e.g. "造物主" | "导师" | "平行旅者"
  badges: Badge[];
  worldsCreated: number;
  sosHelped: number;
  parallelVisits: number;   // 查看过多少平行时空
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  rarity: "common" | "rare" | "legendary";
}
