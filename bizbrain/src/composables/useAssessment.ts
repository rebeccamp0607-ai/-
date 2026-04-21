import { ref, computed } from 'vue'
import { callClaude } from '../services/claude'
import { buildAssessmentPrompt, type AssessmentResult } from '../prompts/assessment-analysis'
import { ASSESSMENT_QUESTIONS } from '../data/assessment-questions'
import { THINKING_TYPES } from '../data/thinking-types'
import type { ThinkingType } from '../types/user'

// Fallback: local scoring if Claude API key not yet configured
function localAnalyze(choices: string[]): AssessmentResult {
  const counts = { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>
  choices.forEach(c => { counts[c] = (counts[c] ?? 0) + 1 })
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  const typeMap: Record<string, ThinkingType> = { A: '猎手型', B: '工程师型', C: '执行者型', D: '白纸型' }
  const type = typeMap[dominant]
  const info = THINKING_TYPES[type]
  return {
    type,
    typeEmoji: info.emoji,
    traits: info.traits as [string, string, string],
    blindSpot: info.blindSpot,
    encouragement: info.encouragement,
    recommendedStart: info.recommendedStart,
  }
}

export function useAssessment() {
  const currentQ    = ref(0)
  const choices     = ref<Array<{ key: string; text: string }>>([])
  const isAnalyzing = ref(false)
  const result      = ref<AssessmentResult | null>(null)
  const error       = ref<string | null>(null)

  const isDone = computed(() => currentQ.value >= ASSESSMENT_QUESTIONS.length)
  const progress = computed(() => Math.round((currentQ.value / ASSESSMENT_QUESTIONS.length) * 100))

  function selectAnswer(key: 'A' | 'B' | 'C' | 'D', text: string): void {
    // Save to local storage immediately — guard against app close before analysis
    const existing = choices.value.map(c => c.key)
    uni.setStorageSync('biz_assessment_choices', JSON.stringify([...existing, key]))
    choices.value.push({ key, text })
    currentQ.value++
  }

  async function analyzeAnswers(): Promise<void> {
    isAnalyzing.value = true
    error.value = null
    try {
      const inputs = choices.value.map((c, i) => ({
        questionId: ASSESSMENT_QUESTIONS[i].id,
        questionText: ASSESSMENT_QUESTIONS[i].text,
        choice: c.key as 'A' | 'B' | 'C' | 'D',
        choiceText: c.text,
      }))
      const { system, userMessage } = buildAssessmentPrompt(inputs)
      const raw = await callClaude({
        system,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 512,
        temperature: 0.3,
      })
      result.value = JSON.parse(raw) as AssessmentResult
    } catch (e) {
      // Fall back to local scoring if Claude is unavailable
      result.value = localAnalyze(choices.value.map(c => c.key))
    } finally {
      isAnalyzing.value = false
    }
  }

  function reset(): void {
    currentQ.value = 0
    choices.value = []
    result.value = null
    error.value = null
    uni.removeStorageSync('biz_assessment_choices')
  }

  return { currentQ, choices, isDone, progress, isAnalyzing, result, error, selectAnswer, analyzeAnswers, reset }
}
