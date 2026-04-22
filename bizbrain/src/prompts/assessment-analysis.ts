export interface AnswerInput {
  questionId: number
  questionText: string
  choice: 'A' | 'B' | 'C' | 'D'
  choiceText: string
}

export interface AssessmentResult {
  type: '猎手型' | '工程师型' | '执行者型' | '白纸型'
  typeEmoji: string
  traits: [string, string, string]
  blindSpot: string
  encouragement: string
  recommendedStart: string
}

const TYPE_DEFINITIONS = `
四种思维类型：
- 猎手型：机会导向，直觉强，行动快，但分析深度不足，容易冲动
- 工程师型：数据驱动，逻辑严密，但执行偏慢，对不确定性抵触
- 执行者型：行动力强，落地能力好，但缺乏战略视野，难以看全局
- 白纸型：完全初学者，没有固有思维定势，可塑性强，但缺乏基础框架
`

export function buildAssessmentPrompt(answers: AnswerInput[]): { system: string; userMessage: string } {
  const system = `你是一个商业思维评估专家。根据用户的5道情景选择题，判断其思维类型并给出有洞察力的分析。
${TYPE_DEFINITIONS}
必须严格以JSON格式输出，结构如下（不要输出任何JSON以外的内容）：
{
  "type": "猎手型|工程师型|执行者型|白纸型",
  "typeEmoji": "🔍|📊|🎯|🌱",
  "traits": ["特征1（15字内）", "特征2（15字内）", "特征3（15字内）"],
  "blindSpot": "最主要的盲区（1句话，20字内）",
  "encouragement": "鼓励性寄语（2句话，温暖且有针对性）",
  "recommendedStart": "推荐起点（10字内）"
}`

  const answersText = answers
    .map((a, i) => `Q${i + 1}: ${a.questionText}\n选择: ${a.choice}. ${a.choiceText}`)
    .join('\n\n')

  return {
    system,
    userMessage: `以下是用户的5道题作答：\n\n${answersText}\n\n请分析其商业思维类型并严格按JSON格式输出：`,
  }
}
