import { supabase } from './supabase'

export async function fetchCompletedChallenges(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('case_id')
    .eq('user_id', userId)
    .eq('completed', true)
  if (error) { console.error('fetchCompletedChallenges', error); return [] }
  return (data ?? []).map((r: any) => r.case_id)
}

export async function markChallengeComplete(userId: string, caseId: number, xpEarned: number): Promise<void> {
  await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      case_id: caseId,
      completed: true,
      completed_at: new Date().toISOString(),
      xp_earned: xpEarned,
    }, { onConflict: 'user_id,case_id' })
}

export async function saveUserAnswer(params: {
  userId: string
  caseId: number
  questionLayer: number
  answerText: string
  aiFeedback: string
}): Promise<void> {
  await supabase.from('user_answers').insert({
    user_id: params.userId,
    case_id: params.caseId,
    question_layer: params.questionLayer,
    answer_text: params.answerText,
    ai_feedback: params.aiFeedback,
  })
}
