"use client";

/**
 * Project MING v6.0 — 主入口页面
 * 展示三大支柱选择界面
 */

import { useState } from "react";

const PILLARS = [
  {
    id: "infinite-flow",
    title: "无限流",
    subtitle: "Infinite Flow",
    description: "输入创世指令，构建属于你的三千世界",
    icon: "∞",
    color: "from-amber-900 to-amber-600",
  },
  {
    id: "reality-mapping",
    title: "现实映射",
    subtitle: "Reality Mapping",
    description: "以真实八字为锚，推演现实困境的解法",
    icon: "命",
    color: "from-teal-900 to-teal-600",
  },
  {
    id: "fate-community",
    title: "命运共同体",
    subtitle: "Fate Community",
    description: "遇见平行宇宙里，另一个选择不同的你",
    icon: "∥",
    color: "from-purple-900 to-purple-600",
  },
] as const;

export default function HomePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 标题 */}
      <header className="text-center mb-16">
        <h1 className="text-6xl font-bold tracking-widest mb-4">
          Project MING
          <span className="text-2xl ml-3 opacity-60">命</span>
        </h1>
        <p className="text-xl opacity-70 tracking-wide">
          在三千世界里试错，在唯一现实中觉醒。
        </p>
        <div className="mt-2 text-sm opacity-40">v6.0 · The Awakening Protocol</div>
      </header>

      {/* 三大支柱入口 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {PILLARS.map((pillar) => (
          <button
            key={pillar.id}
            className={`
              relative overflow-hidden rounded-2xl p-8 text-left
              bg-gradient-to-br ${pillar.color}
              border border-white/10
              transition-all duration-300
              ${hovered === pillar.id ? "scale-105 shadow-2xl" : "scale-100 shadow-lg"}
            `}
            onMouseEnter={() => setHovered(pillar.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="text-5xl mb-4 opacity-80">{pillar.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{pillar.title}</h2>
            <p className="text-sm opacity-60 mb-3">{pillar.subtitle}</p>
            <p className="text-sm opacity-80 leading-relaxed">{pillar.description}</p>

            {hovered === pillar.id && (
              <div className="absolute bottom-4 right-4 text-xs opacity-60">
                进入 →
              </div>
            )}
          </button>
        ))}
      </section>

      {/* 底部 */}
      <footer className="mt-16 text-center text-xs opacity-30">
        Project MING v6.0 · MVP Alpha · 内测阶段
      </footer>
    </main>
  );
}
