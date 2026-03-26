"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { submitFreeWill } from "@/lib/api";

// 事件库（根据不同世界动态渲染）
function getEvents(worldId: string, day: number) {
  const pools: Record<string, typeof EVENTS_001> = {
    universe_001: EVENTS_001,
    universe_002: EVENTS_002,
    universe_003: EVENTS_003,
  };
  const pool = pools[worldId] ?? EVENTS_001;
  return pool[(day - 1) % pool.length];
}

const EVENTS_001 = [
  {
    id: "e001",
    title: "猎头突然联系你",
    body: "一个陌生号码发来微信：「我们有个机会想和你聊聊，薪资翻倍，但要在72小时内决定。」你的现任工作刚做了8个月，试用期刚过。",
    options: [
      { label: "约见面谈", sanDelta: 5, cognitionDelta: 8, consequence: "你赴约了。对方开价确实诱人，但需要你立刻辞职……" },
      { label: "婉拒，专注当下", sanDelta: 3, cognitionDelta: 5, consequence: "你回绝了。两周后听说那个职位给了别人，而那家公司三个月后上市……" },
    ],
    tenGod: "偏财",
  },
  {
    id: "e002",
    title: "同事当众甩锅",
    body: "会议室里，你的同事把项目延误的责任全推到了你身上。领导看着你。所有人都在等你的反应。",
    options: [
      { label: "当场澄清事实", sanDelta: 10, cognitionDelta: 12, consequence: "你开口了，有条有理地陈述了时间线。气氛很僵，但事实摆在那里……" },
      { label: "沉默，会后再处理", sanDelta: -8, cognitionDelta: 3, consequence: "你选择了忍耐。那晚，愤怒在你体内滚烫……" },
    ],
    tenGod: "七杀",
  },
  {
    id: "e003",
    title: "老友借钱",
    body: "认识十年的朋友说家里急用，需要借你五万。他的语气很正常，但你知道他最近在做一个「稳赚不赔」的项目。",
    options: [
      { label: "借，朋友义气", sanDelta: -5, cognitionDelta: -8, consequence: "你转了钱。三个月后他说资金链断了……" },
      { label: "拒绝，保护自己", sanDelta: 8, cognitionDelta: 10, consequence: "你说了实话。对方沉默了，你也沉默了。关系开始微妙……" },
    ],
    tenGod: "劫财",
  },
];

const EVENTS_002 = [
  {
    id: "e101",
    title: "禁书的诱惑",
    body: "守藏阁最深处，有一本封印的古籍散发着妖异的光芒。师父说过：「任何人不得触碰。」但你感到它在召唤你。夜深了，守阁的老前辈去茅房了。",
    options: [
      { label: "趁机翻看一页", sanDelta: 10, cognitionDelta: 20, consequence: "你的神识被卷入书中。里面记载的，是一门被宗门封禁三百年的功法……" },
      { label: "遵守门规，离开", sanDelta: 5, cognitionDelta: 3, consequence: "你忍住了。回到住所，却久久无法入眠。那光芒在梦里追着你……" },
    ],
    tenGod: "偏印",
  },
  {
    id: "e102",
    title: "师兄的丹药",
    body: "大师兄修炼遇瓶颈，找你帮他从外门采购一种灵草，顺带让你「试试」一颗来路不明的突破丹——声称是他自己炼的。",
    options: [
      { label: "服下丹药", sanDelta: -10, cognitionDelta: 15, consequence: "一股热流窜遍全身。你的修为……在上涨？但随后，你感到丹田灼烧……" },
      { label: "婉言谢绝", sanDelta: 5, cognitionDelta: 5, consequence: "你拒绝了。三天后，大师兄的另一个弟子服了同款丹药，走火入魔……" },
    ],
    tenGod: "七杀",
  },
];

const EVENTS_003 = [
  {
    id: "e201",
    title: "黑市芯片",
    body: "一个戴着遮脸面罩的人在你常去的数据交易站留下了一块芯片，说是「送给识货的人」。初步扫描显示：里面是一段加密的核心区门禁代码。价值不可估量，风险同样不可估量。",
    options: [
      { label: "深度解密，摸清内容", sanDelta: -5, cognitionDelta: 20, consequence: "你花了三天破解。里面的东西让你目瞪口呆：企业联政府正在秘密编译一个针对低配义体人的清除程序……" },
      { label: "原封不动卖掉", sanDelta: 5, cognitionDelta: 8, consequence: "你卖了 1200 数据币，买了新的神经接口。两周后新闻播报：有黑客入侵了核心区……" },
    ],
    tenGod: "偏财",
  },
  {
    id: "e202",
    title: "企业安保的注意",
    body: "你的神经接口欠费三天后，企业区AI已标记你为「低信用个体」。一个穿制服的安保走向你，扫了一眼你的生物特征，手放在了枪托上。",
    options: [
      { label: "配合检查，低调处理", sanDelta: -8, cognitionDelta: 3, consequence: "你举起双手。他们搜了你的背包，发现了那块芯片……" },
      { label: "立刻跑路，进入暗网", sanDelta: 5, cognitionDelta: 10, consequence: "你转身钻进了巷子。神经接口超载预警，但你跑掉了……" },
    ],
    tenGod: "七杀",
  },
];

const TEN_GOD_COLOR: Record<string, string> = {
  "偏财": "text-yellow-400", "七杀": "text-red-400", "劫财": "text-orange-400",
  "偏印": "text-purple-400", "伤官": "text-pink-400", "正官": "text-blue-400",
  "食神": "text-green-400", "比肩": "text-teal-400", "正印": "text-indigo-400", "正财": "text-emerald-400",
};

export default function GameDayScreen() {
  const { world, day, san, cognitionPoints, sessionId, bazi, incrementDay, adjustSan, adjustCognition, addObsession, setScreen } = useGameStore();
  const [outcome, setOutcome] = useState<string | null>(null);
  const [chosenLabel, setChosenLabel] = useState<string | null>(null);
  const [freeWillMode, setFreeWillMode] = useState(false);
  const [freeInput, setFreeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const event = world ? getEvents(world.id, day) : null;

  function chooseOption(opt: (typeof EVENTS_001)[0]["options"][0]) {
    setChosenLabel(opt.label);
    setOutcome(opt.consequence);
    adjustSan(opt.sanDelta);
    adjustCognition(opt.cognitionDelta);
    if (opt.sanDelta < 0) addObsession(event?.title ?? "压力事件");
  }

  async function submitFree() {
    if (!freeInput.trim() || !event) return;
    setLoading(true);
    try {
      const res = await submitFreeWill({
        session_id: sessionId,
        scene_id: event.id,
        scene_summary: `${event.title}：${event.body}`,
        player_input: freeInput,
      });
      setChosenLabel(`[自由意志] ${freeInput}`);
      setOutcome(`可行性 ${Math.round(res.feasibility_score * 100)}% · 成功率 ${Math.round(res.success_probability * 100)}%\n\n${res.outcome_narrative}`);
      adjustSan(res.san_delta);
      adjustCognition(res.cognition_delta);
      if (res.obsession) addObsession(res.obsession);
    } catch {
      setOutcome("AI 裁判失败，请检查服务器连接");
    } finally {
      setLoading(false);
      setFreeWillMode(false);
    }
  }

  function nextDay() {
    incrementDay();
    setOutcome(null);
    setChosenLabel(null);
    setFreeInput("");
    setFreeWillMode(false);
    if (san < 40) setScreen("game-night");
  }

  if (!world || !event) return null;

  const shenMap = world.shen_mappings.find((m) => m.ten_god === event.tenGod);

  return (
    <div className="min-h-screen flex flex-col max-w-sm mx-auto">
      {/* 顶部信息条 */}
      <div className="pt-16 px-4 pb-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{world.lore.world_name}</span>
          <span className={TEN_GOD_COLOR[event.tenGod] ?? "text-white/60"}>{event.tenGod} 触发</span>
        </div>
        {shenMap && (
          <div className="text-[10px] text-white/30 mt-0.5">{shenMap.world_symbol}</div>
        )}
      </div>

      {/* 事件卡 */}
      <div className="flex-1 px-4 pb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-white text-lg mb-3">{event.title}</h3>
          <p className="text-sm text-white/70 leading-relaxed">{event.body}</p>
        </div>

        {/* 结果展示 */}
        {outcome && (
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 mb-4">
            <div className="text-xs text-amber-400/70 mb-2">你选择了：{chosenLabel}</div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{outcome}</p>
            <button
              onClick={nextDay}
              className="mt-4 w-full py-3 rounded-xl bg-white/10 text-white font-bold active:scale-95 transition-transform"
            >
              {san < 40 ? "夜幕降临，进入梦境 🌙" : `继续 · Day ${day + 1} →`}
            </button>
          </div>
        )}

        {/* 选项 */}
        {!outcome && !freeWillMode && (
          <div className="flex flex-col gap-3">
            {event.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => chooseOption(opt)}
                className="w-full text-left bg-white/8 border border-white/15 rounded-2xl p-4 active:bg-white/15 active:scale-[0.98] transition-all"
              >
                <div className="font-bold text-white mb-1">{opt.label}</div>
              </button>
            ))}
            <button
              onClick={() => setFreeWillMode(true)}
              className="w-full py-3 rounded-2xl border border-purple-500/30 text-purple-300/70 text-sm active:bg-purple-900/20 transition-all"
            >
              ✦ 我有自己的想法（自由意志）
            </button>
          </div>
        )}

        {/* 自由意志输入 */}
        {!outcome && freeWillMode && (
          <div className="flex flex-col gap-3">
            <textarea
              value={freeInput}
              onChange={(e) => setFreeInput(e.target.value)}
              placeholder="描述你的想法…（AI 会实时判定可行性和结果）"
              rows={3}
              className="w-full bg-white/5 border border-purple-400/30 rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:outline-none text-sm leading-relaxed resize-none"
            />
            <button
              onClick={submitFree}
              disabled={loading || !freeInput.trim()}
              className="w-full py-3 rounded-2xl bg-purple-700/70 text-white font-bold active:scale-95 transition-transform disabled:opacity-40"
            >
              {loading ? "AI 正在裁判…" : "提交给命运裁判 →"}
            </button>
            <button onClick={() => setFreeWillMode(false)} className="text-center text-sm text-white/30">返回选项</button>
          </div>
        )}
      </div>
    </div>
  );
}
