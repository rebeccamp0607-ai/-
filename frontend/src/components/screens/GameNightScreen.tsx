"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { enterDreamscape } from "@/lib/api";

export default function GameNightScreen() {
  const { sessionId, san, obsessionLog, adjustSan, clearObsessions, setScreen } = useGameStore();
  const [dream, setDream] = useState<{
    dream_type: string;
    dream_narrative: string;
    san_reward: number;
    fragment_dropped: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chosen, setChosen] = useState<"direct" | "escape" | null>(null);

  useEffect(() => {
    enterDreamscape({ session_id: sessionId, obsession_log: obsessionLog, san })
      .then(setDream)
      .catch(() =>
        setDream({
          dream_type: "void",
          dream_narrative: "黑暗中，只有一丝微弱的光……\n\n你感到无边的疲惫，但也感到某种奇异的宁静。\n\n【直面】走向那道光 / 【逃避】蜷缩在黑暗里",
          san_reward: 15,
          fragment_dropped: false,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  function resolve(choice: "direct" | "escape") {
    setChosen(choice);
    const reward = choice === "direct" ? (dream?.san_reward ?? 20) : Math.floor((dream?.san_reward ?? 20) / 2);
    adjustSan(reward);
    clearObsessions();
  }

  function wakeUp() {
    setScreen("game-day");
  }

  const DREAM_TYPE_LABEL: Record<string, string> = {
    giant_boss:      "⚔️ 巨人Boss战",
    maze_treasure:   "🌀 财富迷宫",
    time_regression: "⏳ 时光回溯",
    mirror_dialogue: "🪞 镜像对话",
    void_descent:    "🕳️ 虚空坠落",
    void:            "☁️ 混沌虚空",
  };

  // 提取两个选择（从叙事末尾的 【直面】... / 【逃避】... 格式）
  const [narrative, directChoice, escapeChoice] = (() => {
    const text = dream?.dream_narrative ?? "";
    const match = text.match(/【直面】(.+?)\/\s*【逃避】(.+?)$/s);
    if (match) {
      return [
        text.slice(0, text.indexOf("【直面】")).trim(),
        match[1].trim(),
        match[2].trim(),
      ];
    }
    return [text, "走向光明", "留在黑暗"];
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#060612] to-[#0a0a20] max-w-sm mx-auto">
      {/* 夜晚氛围顶部 */}
      <div className="pt-16 px-6 pb-4 text-center">
        <div className="text-3xl mb-1">🌙</div>
        <div className="text-lg font-bold text-white/60">夜幕降临</div>
        {dream && (
          <div className="text-xs text-purple-300/50 mt-1">
            {DREAM_TYPE_LABEL[dream.dream_type] ?? "梦境"}
          </div>
        )}
      </div>

      {/* 梦境内容 */}
      <div className="flex-1 px-6 flex flex-col justify-between pb-8">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-4xl animate-pulse">✦</div>
            <div className="text-sm text-white/30 animate-pulse">正在潜入潜意识…</div>
          </div>
        ) : (
          <>
            <div className="bg-purple-950/30 border border-purple-500/15 rounded-2xl p-5 mb-6">
              <p className="text-sm text-white/75 leading-[1.9] whitespace-pre-line">{narrative}</p>
            </div>

            {!chosen ? (
              <div className="flex flex-col gap-3">
                <div className="text-xs text-white/30 text-center mb-1">你会如何选择？</div>
                <button
                  onClick={() => resolve("direct")}
                  className="w-full py-4 rounded-2xl bg-teal-800/50 border border-teal-500/30 text-teal-100 font-bold active:scale-95 transition-transform"
                >
                  【直面】{directChoice}
                </button>
                <button
                  onClick={() => resolve("escape")}
                  className="w-full py-4 rounded-2xl bg-slate-800/50 border border-slate-500/20 text-slate-300/70 font-bold active:scale-95 transition-transform"
                >
                  【逃避】{escapeChoice}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-teal-900/30 border border-teal-500/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{chosen === "direct" ? "✦" : "○"}</div>
                  <div className="text-sm text-teal-200/80">
                    {chosen === "direct" ? "你直面了内心。" : "你选择了暂时的逃避。"}
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    心力 +{chosen === "direct" ? dream?.san_reward : Math.floor((dream?.san_reward ?? 20) / 2)}
                  </div>
                  {dream?.fragment_dropped && chosen === "direct" && (
                    <div className="mt-2 text-xs text-purple-300/70">✦ 获得「潜意识碎片」×1</div>
                  )}
                </div>
                <button
                  onClick={wakeUp}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold active:scale-95 transition-transform"
                >
                  破晓，继续 →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
