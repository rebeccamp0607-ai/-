export interface AssessmentQuestion {
  id: number
  scenario: string
  text: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
}

// 5 scenario-based questions. A=猎手型, B=工程师型, C=执行者型, D=白纸型
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    scenario: '机会判断',
    text: '你听说一个朋友用闲置车位做租赁，月收入3000元。你的第一反应是？',
    options: [
      { key: 'A', text: '马上问他怎么操作，我也想做' },
      { key: 'B', text: '先算算：我所在区域有多少闲置车位，需求有多大' },
      { key: 'C', text: '感觉不错，但我没时间折腾这种小事' },
      { key: 'D', text: '我没想过这是一门生意，有点好奇' },
    ],
  },
  {
    id: 2,
    scenario: '数据解读',
    text: '你看到一则新闻：某奶茶品牌半年内关了200家门店。你认为最可能的原因是？',
    options: [
      { key: 'A', text: '市场竞争太激烈，他们跑得不够快' },
      { key: 'B', text: '先看他们的财务数据和选址逻辑，再下判断' },
      { key: 'C', text: '管理跟不上扩张速度' },
      { key: 'D', text: '我不太懂，可能有很多原因吧' },
    ],
  },
  {
    id: 3,
    scenario: '风险决策',
    text: '你有10万元积蓄，朋友拉你入股一家刚开业的网红餐厅，预计半年回本。你会？',
    options: [
      { key: 'A', text: '餐厅看起来很火，先入股再说' },
      { key: 'B', text: '要求看他们的财务预测模型和竞品分析' },
      { key: 'C', text: '我对投资没兴趣，不如把精力放在本职工作' },
      { key: 'D', text: '听起来机会不错，但我不知道该怎么判断' },
    ],
  },
  {
    id: 4,
    scenario: '竞争分析',
    text: '你准备开一家咖啡店。商场里已有星巴克和瑞幸，你会怎么定位？',
    options: [
      { key: 'A', text: '找一个他们没有占领的细分人群或场景' },
      { key: 'B', text: '做详细的选址数据分析，找人流+竞争密度最优的位置' },
      { key: 'C', text: '先开起来，边做边调整' },
      { key: 'D', text: '我觉得挺难的，他们太强大了' },
    ],
  },
  {
    id: 5,
    scenario: '战略思考',
    text: '你负责一个APP，月活从50万降到40万。你的优先行动是？',
    options: [
      { key: 'A', text: '快速测试几个新功能，看哪个能拉回用户' },
      { key: 'B', text: '分析流失漏斗：用户在哪个环节流失最多' },
      { key: 'C', text: '加大推广预算，先把流量拉上来再说' },
      { key: 'D', text: '找用户聊聊，听听他们怎么说' },
    ],
  },
]
