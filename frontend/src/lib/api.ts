/**
 * Project MING v6.0 — API Client
 * 统一封装所有后端 API 调用
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── 八字解析 ────────────────────────────────────────

export interface BaziChart {
  id: string;
  self_element: string;
  dominant_ten_god: string;
  pattern_name: string;
  element_strengths: Record<string, number>;
  year_pillar:  { stem: string; branch: string; ten_god: string };
  month_pillar: { stem: string; branch: string; ten_god: string };
  day_pillar:   { stem: string; branch: string; ten_god: string };
  hour_pillar:  { stem: string; branch: string; ten_god: string };
}

export interface BaziResponse {
  chart: BaziChart;
  dominant_element: string;
  personality_profile: Record<string, number>;
  current_dayun: { stem: string; branch: string; element: string; liunian: string };
}

export function parseBazi(params: {
  year: number; month: number; day: number; hour: number; gender: string;
}): Promise<BaziResponse> {
  return request("/bazi/parse", {
    method: "POST",
    body: JSON.stringify({ ...params, solar: true }),
  });
}

// ── 创世引擎 ────────────────────────────────────────

export interface WorldSchema {
  id: string;
  name: string;
  lore: {
    world_name: string;
    power_structure: string;
    economy_unit: string;
    player_role: string;
    conflict_source: string;
    aesthetic: string;
  };
  shen_mappings: { ten_god: string; world_concept: string; world_symbol: string }[];
  preview_scene: string;
  status: string;
}

export function compileWorld(prompt: string, baziChartId?: string): Promise<WorldSchema> {
  return request("/genesis/compile", {
    method: "POST",
    body: JSON.stringify({ natural_language: prompt, bazi_chart_id: baziChartId }),
  });
}

export function getPresets(): Promise<{ universes: { id: string; name: string; description: string }[] }> {
  return request("/genesis/presets");
}

// ── 游戏循环 ────────────────────────────────────────

export function submitFreeWill(params: {
  session_id: string;
  scene_id: string;
  scene_summary: string;
  player_input: string;
}): Promise<{
  feasibility_score: number;
  success_probability: number;
  outcome_narrative: string;
  san_delta: number;
  cognition_delta: number;
  obsession: string;
}> {
  return request("/game/turn/free-will", { method: "POST", body: JSON.stringify(params) });
}

export function enterDreamscape(params: {
  session_id: string;
  obsession_log: string[];
  san: number;
}): Promise<{
  dream_type: string;
  dream_narrative: string;
  san_reward: number;
  fragment_dropped: boolean;
}> {
  return request("/game/night/dreamscape", { method: "POST", body: JSON.stringify(params) });
}
