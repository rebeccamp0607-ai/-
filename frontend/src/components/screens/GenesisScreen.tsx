"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { compileWorld } from "@/lib/api";

const EXAMPLES = [
  "被猫统治的蒸汽朋克世界，货币是小鱼干，我是流浪铲屎官",
  "克苏鲁版大明朝，触手神明是皇帝，我是钦天监小官",
  "外卖骑手是这个星球最强战士，快递驿站是宗门，我是新人骑手",
  "植物统治世界，阳光是权力，我是一株刚发芽的蒲公英",
];

export default function GenesisScreen() {
  const { setScreen, setWorld, bazi } = useGameStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompile() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const world = await compileWorld(prompt, bazi?.chart.id);
      setWorld(world);
      setScreen("game-day");
    } catch (e: any) {
      setError(e.message || "创世失败，请检查服务器是否启动");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-16 max-w-sm mx-auto">
      <button onClick={() => setScreen("home")} className="text-white/40 text-sm mb-6 self-start active:text-white">← 返回</button>
      <h2 className="text-2xl font-bold text-white/90 mb-1">创世神模式</h2>
      <p className="text-sm text-white/40 mb-6">用任意语言描述你的世界，AI 实时构建</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="描述你想要的世界…"
        rows={4}
        className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-400/60 resize-none text-sm leading-relaxed"
      />

      <div className="mt-4 mb-8">
        <div className="text-xs text-white/30 mb-3">或试试这些创意：</div>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-left text-xs text-white/50 bg-white/5 rounded-xl px-3 py-2 border border-white/10 active:bg-white/10 leading-relaxed"
            >
              「{ex}」
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleCompile}
        disabled={loading || !prompt.trim()}
        className="w-full py-4 rounded-2xl bg-purple-700/80 text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span> AI 正在构建世界…
          </span>
        ) : "召唤世界 →"}
      </button>

      {loading && (
        <div className="mt-4 text-center text-xs text-white/30 animate-pulse">
          正在编译世界法则，映射十神规则，生成开场叙事…<br />约需 15-30 秒
        </div>
      )}
    </div>
  );
}
