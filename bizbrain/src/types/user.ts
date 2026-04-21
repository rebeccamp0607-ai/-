export type ThinkingType = '猎手型' | '工程师型' | '执行者型' | '白纸型'
export type Rank = '学徒' | '分析师' | '顾问' | '战略家' | '商业家'

export interface User {
  id: string
  username: string
  avatar_url?: string
  thinking_type?: ThinkingType
  rank: Rank
  total_xp: number
  streak_days: number
  last_active?: string
  created_at: string
}

export const RANK_THRESHOLDS: Record<Rank, number> = {
  '学徒':  0,
  '分析师': 300,
  '顾问':  800,
  '战略家': 1800,
  '商业家': 4000,
}

export function computeRank(totalXP: number): Rank {
  if (totalXP >= 4000) return '商业家'
  if (totalXP >= 1800) return '战略家'
  if (totalXP >= 800)  return '顾问'
  if (totalXP >= 300)  return '分析师'
  return '学徒'
}
