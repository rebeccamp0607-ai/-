"use client";

import { useGameStore } from "@/lib/store";
import type { WorldSchema } from "@/lib/api";

const OFFICIAL_WORLDS: WorldSchema[] = [
  {
    id: "universe_001",
    name: "现实镜像",
    is_official: true,
    status: "ready",
    lore: {
      world_name: "当代都市",
      power_structure: "资本与关系网络",
      economy_unit: "人民币 / 影响力",
      player_role: "普通职场人",
      conflict_source: "阶层固化与个人突破",
      aesthetic: "都市现实主义",
    },
    shen_mappings: [],
    preview_scene: "2026年，一线城市。你的offer刚到期，房租又涨了。桌上摆着三封邮件：一封是猎头，一封是前老板，一封——不认识的发件人。",
  },
  {
    id: "universe_002",
    name: "修仙长生",
    is_official: true,
    status: "ready",
    lore: {
      world_name: "灵气复苏大陆",
      power_structure: "宗门体系",
      economy_unit: "灵石 / 丹药",
      player_role: "资质平平的宗门弟子",
      conflict_source: "资源争夺与天道轮回",
      aesthetic: "东方玄幻",
    },
    shen_mappings: [],
    preview_scene: "入门考核三年，你的资质依然是中等。师兄们已经筑基，你还在练气期。掌门让你去守藏阁——那里有一本无人敢碰的禁书。",
  },
  {
    id: "universe_003",
    name: "赛博废土",
    is_official: true,
    status: "ready",
    lore: {
      world_name: "新上海废土区",
      power_structure: "企业联合政府",
      economy_unit: "数据币 / 义体零件",
      player_role: "底层数据黑客",
      conflict_source: "人性与机械化的边界",
      aesthetic: "赛博朋克",
    },
    shen_mappings: [],
    preview_scene: "你的神经接口欠费三天了。企业区的安保AI已经标记了你的生物特征。巷子里有人在卖一块据说来自核心区的芯片——里面存着什么？",
  },
];

export default function WorldSelectScreen() {
  const { setScreen, setWorld } = useGameStore();

  function selectWorld(w: WorldSchema) {
    setWorld(w);
    setScreen("game-day");
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-16 max-w-sm mx-auto">
      <button onClick={() => setScreen("home")} className="text-white/40 text-sm mb-6 self-start active:text-white">← 返回</button>
      <h2 className="text-2xl font-bold text-white/90 mb-1">选择世界</h2>
      <p className="text-sm text-white/40 mb-6">或进入创世神模式，构建专属宇宙</p>

      <div className="flex flex-col gap-4 mb-6">
        {OFFICIAL_WORLDS.map((w) => (
          <button
            key={w.id}
            onClick={() => selectWorld(w)}
            className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 active:bg-white/10 active:scale-[0.98] transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-white">{w.name}</div>
                <div className="text-xs text-white/40">{w.lore.aesthetic}</div>
              </div>
              <div className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-lg">官方</div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{w.preview_scene}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded">
                货币：{w.lore.economy_unit}
              </span>
              <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded">
                身份：{w.lore.player_role}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setScreen("genesis-input")}
        className="w-full py-4 rounded-2xl border border-purple-500/40 bg-purple-900/30 text-purple-200 font-bold active:scale-95 transition-transform"
      >
        ✦ 创世神模式：自定义世界
      </button>
    </div>
  );
}
