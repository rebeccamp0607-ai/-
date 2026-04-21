import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Case, Question } from '../types/case'
import type { ChallengeStep, UserAnswer } from '../types/challenge'

export const CHALLENGE_STEPS: ChallengeStep[] = [
  'context', 'q1-observe', 'q2-analyze', 'q3-decide',
  'breakdown', 'anchors', 'xp-reward', 'community',
]

export const useChallengeStore = defineStore('challenge', () => {
  const activeCase    = ref<Case | null>(null)
  const questions     = ref<Question[]>([])
  const currentStep   = ref<ChallengeStep>('context')
  const userAnswers   = ref<UserAnswer[]>([])
  const aiResponses   = ref<string[]>([])   // index 0=layer1, 1=layer2, 2=layer3
  const isAiLoading   = ref(false)
  const xpEarned      = ref(0)

  function startChallenge(caseData: Case, qs: Question[]): void {
    activeCase.value  = caseData
    questions.value   = qs
    currentStep.value = 'context'
    userAnswers.value = []
    aiResponses.value = []
    xpEarned.value    = 0
  }

  function submitAnswer(layer: 1 | 2 | 3, content: string): void {
    userAnswers.value.push({ layer, content, timestamp: Date.now() })
  }

  function setAiResponse(layer: 1 | 2 | 3, response: string): void {
    aiResponses.value[layer - 1] = response
  }

  function advanceStep(): void {
    const idx = CHALLENGE_STEPS.indexOf(currentStep.value)
    if (idx < CHALLENGE_STEPS.length - 1) {
      currentStep.value = CHALLENGE_STEPS[idx + 1]
    }
  }

  function reset(): void {
    activeCase.value  = null
    questions.value   = []
    currentStep.value = 'context'
    userAnswers.value = []
    aiResponses.value = []
    xpEarned.value    = 0
  }

  return {
    activeCase, questions, currentStep, userAnswers, aiResponses,
    isAiLoading, xpEarned,
    startChallenge, submitAnswer, setAiResponse, advanceStep, reset,
  }
})
