/**
 * Project MING v6.0 — 全局游戏状态 (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BaziResponse, WorldSchema } from "./api";

export type Screen =
  | "home"
  | "bazi-input"
  | "world-select"
  | "genesis-input"
  | "world-loading"
  | "game-day"
  | "game-night"
  | "report";

interface GameState {
  // Navigation
  screen: Screen;
  setScreen: (s: Screen) => void;

  // 命盘
  bazi: BaziResponse | null;
  setBazi: (b: BaziResponse) => void;

  // 世界
  world: WorldSchema | null;
  setWorld: (w: WorldSchema) => void;

  // 游戏会话
  sessionId: string;
  day: number;
  san: number;
  cognitionPoints: number;
  obsessionLog: string[];

  // 游戏操作
  incrementDay: () => void;
  adjustSan: (delta: number) => void;
  adjustCognition: (delta: number) => void;
  addObsession: (obs: string) => void;
  clearObsessions: () => void;

  // 重置
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      screen: "home",
      setScreen: (screen) => set({ screen }),

      bazi: null,
      setBazi: (bazi) => set({ bazi }),

      world: null,
      setWorld: (world) => set({ world }),

      sessionId: `sess_${Date.now()}`,
      day: 1,
      san: 100,
      cognitionPoints: 0,
      obsessionLog: [],

      incrementDay: () => set((s) => ({ day: s.day + 1 })),
      adjustSan: (delta) =>
        set((s) => ({ san: Math.max(0, Math.min(100, s.san + delta)) })),
      adjustCognition: (delta) =>
        set((s) => ({ cognitionPoints: Math.max(0, s.cognitionPoints + delta) })),
      addObsession: (obs) =>
        set((s) => ({ obsessionLog: [...s.obsessionLog.slice(-4), obs] })),
      clearObsessions: () => set({ obsessionLog: [] }),

      resetGame: () =>
        set({
          screen: "home",
          bazi: null,
          world: null,
          sessionId: `sess_${Date.now()}`,
          day: 1,
          san: 100,
          cognitionPoints: 0,
          obsessionLog: [],
        }),
    }),
    { name: "ming-game-state" }
  )
);
