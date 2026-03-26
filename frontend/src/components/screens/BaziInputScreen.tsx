"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { parseBazi } from "@/lib/api";

const ELEMENT_LABEL: Record<string, string> = {
  fire: "🔥 火", water: "💧 水", wood: "🌿 木", metal: "⚡ 金", earth: "🌍 土",
};

export default function BaziInputScreen() {
  const { setScreen, setBazi } = useGameStore();
  const [form, setForm] = useState({ year: 1990, month: 6, day: 15, hour: 10, gender: "male" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof parseBazi>> | null>(null);

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: key === "gender" ? e.target.value : Number(e.target.value) }));

  async function handleParse() {
    setLoading(true);
    setError("");
    try {
      const res = await parseBazi(form);
      setResult(res);
      setBazi(res);
    } catch (e: any) {
      setError(e.message || "解析失败，请检查服务器是否启动");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const { chart } = result;
    return (
      <div className="min-h-screen flex flex-col p-6 pt-16 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-white/90 mb-1">你的命盘</h2>
        <p className="text-sm text-white/40 mb-6">{chart.pattern_name}</p>

        {/* 四柱 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "年柱", p: chart.year_pillar },
            { label: "月柱", p: chart.month_pillar },
            { label: "日主", p: chart.day_pillar },
            { label: "时柱", p: chart.hour_pillar },
          ].map(({ label, p }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <div className="text-[10px] text-white/40 mb-1">{label}</div>
              <div className="text-2xl font-bold text-white">{p.stem}</div>
              <div className="text-lg text-white/70">{p.branch}</div>
              <div className="text-[10px] text-white/40 mt-1">{p.ten_god}</div>
            </div>
          ))}
        </div>

        {/* 五行分布 */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <div className="text-sm text-white/50 mb-3">五行分布</div>
          {Object.entries(result.personality_profile).map(([elem, val]) => (
            <div key={elem} className="flex items-center gap-2 mb-2">
              <div className="text-xs text-white/60 w-8">{ELEMENT_LABEL[elem]?.split(" ")[1] ?? elem}</div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400/80 transition-all"
                  style={{ width: `${Math.round((val as number) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-white/40 w-8 text-right">{Math.round((val as number) * 100)}%</div>
            </div>
          ))}
        </div>

        {/* 大运 */}
        <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
          <div className="text-sm text-white/50 mb-1">当前大运</div>
          <div className="text-white font-bold">{result.current_dayun.liunian}</div>
          <div className="text-xs text-white/40 mt-1">五行：{ELEMENT_LABEL[result.current_dayun.element] ?? result.current_dayun.element}</div>
        </div>

        <button
          onClick={() => setScreen("world-select")}
          className="w-full py-4 rounded-2xl bg-amber-600/80 text-white font-bold text-lg active:scale-95 transition-transform"
        >
          选择世界，开始推演 →
        </button>
        <button onClick={() => setResult(null)} className="mt-3 text-center text-sm text-white/30 active:text-white/60">
          重新输入
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-16 max-w-sm mx-auto">
      <button onClick={() => setScreen("home")} className="text-white/40 text-sm mb-6 self-start active:text-white">← 返回</button>
      <h2 className="text-2xl font-bold text-white/90 mb-2">输入你的生辰</h2>
      <p className="text-sm text-white/40 mb-8">AI 将据此推算你的五行命盘</p>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "year", label: "出生年", min: 1920, max: 2010, placeholder: "1990" },
            { key: "month", label: "月", min: 1, max: 12, placeholder: "6" },
            { key: "day", label: "日", min: 1, max: 31, placeholder: "15" },
          ].map(({ key, label, min, max, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-white/40 mb-1 block">{label}</label>
              <input
                type="number"
                min={min}
                max={max}
                value={form[key as keyof typeof form]}
                onChange={field(key as keyof typeof form)}
                placeholder={placeholder}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-amber-400/60"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-white/40 mb-1 block">出生时辰（小时，0-23）</label>
          <input
            type="number"
            min={0}
            max={23}
            value={form.hour}
            onChange={field("hour")}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-amber-400/60"
          />
          <p className="text-xs text-white/25 mt-1">如不确定，可填 6（卯时）</p>
        </div>

        <div>
          <label className="text-xs text-white/40 mb-2 block">性别</label>
          <div className="grid grid-cols-2 gap-3">
            {[["male", "男 ♂"], ["female", "女 ♀"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setForm((f) => ({ ...f, gender: val }))}
                className={`py-3 rounded-xl border font-bold transition-all active:scale-95 ${
                  form.gender === val
                    ? "bg-amber-600/80 border-amber-400/60 text-white"
                    : "bg-white/5 border-white/15 text-white/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleParse}
        disabled={loading}
        className="mt-8 w-full py-4 rounded-2xl bg-amber-600/80 text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? "正在推算命盘…" : "推算八字 →"}
      </button>
    </div>
  );
}
