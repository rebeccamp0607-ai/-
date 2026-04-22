import { useChallengeStore } from '../stores/challenge'
import { useUserStore } from '../stores/user'
import { useMapStore } from '../stores/map'
import { callClaude } from '../services/claude'
import { buildGuidedQuestioningPrompt } from '../prompts/guided-questioning'
import { saveUserAnswer, markChallengeComplete } from '../services/progress'
import { fetchCaseByMapPosition, fetchQuestionsForCase } from '../services/cases'
import { SEED_CASES } from '../data/seed-cases'

export function useChallenge() {
  const store     = useChallengeStore()
  const userStore = useUserStore()
  const mapStore  = useMapStore()

  async function loadChallenge(mapPosition: number): Promise<void> {
    // Try Supabase first, fall back to seed data
    let caseData = await fetchCaseByMapPosition(mapPosition).catch(() => null)
    let questions = caseData ? await fetchQuestionsForCase(caseData.id).catch(() => []) : []

    if (!caseData) {
      // Use static seed data (works without Supabase configured)
      const seed = SEED_CASES[mapPosition - 1]
      if (!seed) { uni.showToast({ title: '关卡不存在', icon: 'none' }); return }
      caseData = { ...seed, id: mapPosition, created_at: '' } as any
      questions = seed._questions.map((q, i) => ({ ...q, id: i + 1, case_id: mapPosition }))
    }

    store.startChallenge(caseData as any, questions as any)
  }

  async function submitAnswerAndAdvance(userAnswer: string, layer: 1 | 2 | 3): Promise<void> {
    if (!store.activeCase) return
    store.submitAnswer(layer, userAnswer)
    store.isAiLoading = true

    const previousQA = store.userAnswers.slice(0, layer - 1).map((a, i) => ({
      question: store.questions[i]?.text ?? '',
      answer: a.content,
    }))

    const { system, userMessage } = buildGuidedQuestioningPrompt({
      caseTitle:     store.activeCase.title,
      caseContext:   store.activeCase.context,
      thinkingType:  userStore.thinkingType ?? '白纸型',
      questionLayer: layer,
      userAnswer,
      previousQA,
    })

    try {
      const response = await callClaude({
        system,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 300,
        temperature: 0.7,
      })
      store.setAiResponse(layer, response)

      // Persist answer to Supabase if user logged in
      if (userStore.user?.id) {
        saveUserAnswer({
          userId:        userStore.user.id,
          caseId:        store.activeCase.id,
          questionLayer: layer,
          answerText:    userAnswer,
          aiFeedback:    response,
        }).catch(console.error)
      }
    } catch {
      store.setAiResponse(layer, '你的回答很好！继续深入思考这个问题。')
    } finally {
      store.isAiLoading = false
    }

    store.advanceStep()
  }

  async function completeChallenge(): Promise<void> {
    if (!store.activeCase) return
    const xp = store.activeCase.xp_reward ?? 50
    store.xpEarned = xp

    await userStore.addXP(xp)
    mapStore.markComplete(store.activeCase.map_position)

    if (userStore.user?.id) {
      markChallengeComplete(userStore.user.id, store.activeCase.id, xp).catch(console.error)
    }

    store.advanceStep()
  }

  return { loadChallenge, submitAnswerAndAdvance, completeChallenge }
}
