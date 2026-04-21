import type { ThinkingType } from '../types/user'

export interface ThinkingTypeInfo {
  type: ThinkingType
  emoji: string
  name: string
  color: string
  traits: string[]
  blindSpot: string
  encouragement: string
  recommendedStart: string
}

export const THINKING_TYPES: Record<ThinkingType, ThinkingTypeInfo> = {
  '猎手型': {
    type: '猎手型',
    emoji: '🔍',
    name: '机会猎手',
    color: '#ff8c42',
    traits: ['对新事物敏感，直觉强', '行动快，不怕试错', '擅长发现别人忽视的机会'],
    blindSpot: '容易冲动行事，缺乏系统性分析框架',
    encouragement: '你的直觉是宝贵的资产，现在补上分析框架，你会更强！',
    recommendedStart: '从中级案例拆解开始',
  },
  '工程师型': {
    type: '工程师型',
    emoji: '📊',
    name: '数据驱动者',
    color: '#4da6ff',
    traits: ['喜欢数据和逻辑', '分析严密，结论可靠', '擅长发现规律和异常'],
    blindSpot: '有时过度分析，缺乏全局视野和快速决策能力',
    encouragement: '你的逻辑思维是大多数人没有的优势，再学会"够用就好"的决策艺术！',
    recommendedStart: '从框架体系模块开始',
  },
  '执行者型': {
    type: '执行者型',
    emoji: '🎯',
    name: '行动派',
    color: '#ff6b9d',
    traits: ['执行力强，落地能力好', '擅长把想法变成现实', '有强烈的结果导向'],
    blindSpot: '很少往上想战略层，容易陷入战术细节',
    encouragement: '执行力是很多人一辈子学不会的能力，你只需要再加一点战略视野！',
    recommendedStart: '从战略思维专题开始',
  },
  '白纸型': {
    type: '白纸型',
    emoji: '🌱',
    name: '好奇新人',
    color: '#a8e6cf',
    traits: ['对商业世界充满好奇', '没有固有偏见，可塑性强', '愿意从零开始学习'],
    blindSpot: '缺乏基础框架，不知道从哪里开始',
    encouragement: '白纸是最好的起点，每一个商业大咖都是从这里开始的！',
    recommendedStart: '从新手村第一关开始',
  },
}
