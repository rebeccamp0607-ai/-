"use client";

import { useGameStore } from "@/lib/store";

const ELEMENT_COLOR: Record<string, string> = {
  fire:  "text-orange-400",
  water: "text-blue-400",
  wood:  "text-green-400",
  metal: "text-yellow-300",
  earth: "text-amber-600",
};

const ELEMENT_CN: Record<string, string> = {
  fire: "火", water: "水", wood: "木", metal: "金", earth: "土",
};

export default function StatusBar() {
  const { day, san, cognitionPoints, bazi, world } = useGameStore();
  const elem = bazi?.dominant_element ?? "water";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* 左：世界 + 天数 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 leading-none">
            {world?.lore.world_name ?? "—"}
          </span>
          <span className="text-sm font-bold text-white/80">Day {day}</span>
        </div>

        {/* 中：San 条 */}
        <div className="flex flex-col items-center flex-1 mx-4">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] text-white/50">心力</span>
            <span className={`text-[10px] font-bold ${san < 40 ? "text-red-400 animate-pulse" : "text-white/70"}`}>
              {san}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                san > 60 ? "bg-teal-400" : san > 30 ? "bg-yellow-400" : "bg-red-500"
              }`}
              style={{ width: `${san}%` }}
            />
          </div>
        </div>

        {/* 右：认知点 + 日主 */}
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-bold ${ELEMENT_COLOR[elem]}`}>
            {ELEMENT_CN[elem]}命
          </span>
          <span className="text-sm font-bold text-white/80">
            {cognitionPoints} <span className="text-[10px] text-white/40">认知</span>
          </span>
        </div>
      </div>
    </div>
  );
}
