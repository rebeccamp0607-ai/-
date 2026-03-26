"use client";

import { useGameStore } from "@/lib/store";

export default function HomeScreen() {
  const { setScreen } = useGameStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pb-12">
      {/* 顶部 Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        <div className="text-center">
          <div className="text-8xl font-bold tracking-widest text-white/90 mb-2">命</div>
          <div className="text-2xl font-light tracking-[0.3em] text-white/60">PROJECT MING</div>
          <div className="mt-3 text-sm text-white/30">在三千世界里试错，在唯一现实中觉醒</div>
        </div>

        {/* 入口按钮 */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => setScreen("bazi-input")}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-800/80 to-amber-600/60 border border-amber-500/30 text-left active:scale-95 transition-transform"
          >
            <div className="text-lg font-bold text-amber-100">模拟人生</div>
            <div className="text-xs text-amber-200/60 mt-0.5">输入真实八字，推演现实困境</div>
          </button>

          <button
            onClick={() => setScreen("world-select")}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-900/80 to-teal-700/60 border border-teal-500/30 text-left active:scale-95 transition-transform"
          >
            <div className="text-lg font-bold text-teal-100">无限轮回</div>
            <div className="text-xs text-teal-200/60 mt-0.5">随机八字，挑战无数世界</div>
          </button>

          <button
            onClick={() => setScreen("genesis-input")}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-900/80 to-purple-700/60 border border-purple-500/30 text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-purple-100">创世神模式</div>
              <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">NEW</span>
            </div>
            <div className="text-xs text-purple-200/60 mt-0.5">输入任意世界观，AI 实时构建</div>
          </button>
        </div>
      </div>

      <div className="text-[10px] text-white/20">v6.0 · The Awakening Protocol</div>
    </div>
  );
}
