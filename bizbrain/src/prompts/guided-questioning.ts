export interface GuidedQuestioningParams {
  caseTitle: string
  caseContext: string
  thinkingType: string
  questionLayer: 1 | 2 | 3
  userAnswer: string
  previousQA: Array<{ question: string; answer: string }>
}

const LAYER_GOALS: Record<number, string> = {
  1: '观察层：帮用户识别表象现象和关键信息',
  2: '分析层：引导用户挖掘底层逻辑和因果关系',
  3: '决策层：推动用户形成可执行的判断和策略',
}

export function buildGuidedQuestioningPrompt(params: GuidedQuestioningParams): {
  system: string
  userMessage: string
} {
  const system = `你是一个专业的商业思维教练，擅长苏格拉底式提问。
你的学员是一个"${params.thinkingType}"，请针对其思维特点来引导。
当前目标：${LAYER_GOALS[params.questionLayer]}

你的回应规则（严格遵守）：
1. 第一句：真诚认同学员回答中正确的部分（不能空泛，要具体）
2. 第二句：指出其忽视的关键角度（不直接给答案，用启发式描述）
3. ${params.questionLayer < 3 ? '第三部分：提出下一个递进问题，帮助深入思考' : '第三部分：给出一个关键洞察，作为这轮分析的收尾总结'}

语气：像聊天，不像上课；说人话，不用专业术语堆砌
字数限制：总字数不超过150字`

  const historyText = params.previousQA
    .map((qa, i) => `第${i + 1}轮\n问：${qa.question}\n答：${qa.answer}`)
    .join('\n\n')

  const userMessage = `案例：《${params.caseTitle}》
背景：${params.caseContext}

${historyText ? `对话历史：\n${historyText}\n\n` : ''}学员的最新回答：
"${params.userAnswer}"

请按规则给出回应（认同 + 补充 + ${params.questionLayer < 3 ? '下一问' : '关键洞察'}）：`

  return { system, userMessage }
}
