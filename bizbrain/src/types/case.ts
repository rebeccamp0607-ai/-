import type { ThinkingType } from './user'

export type Difficulty = '入门' | '进阶' | '高阶'
export type Section = '新手村' | '框架岛' | '案例城' | '热点战场'

export interface Case {
  id: number
  title: string
  company?: string
  context: string
  industry: string
  framework: string
  difficulty: Difficulty
  thinking_types: ThinkingType[]
  section: Section
  map_position: number
  xp_reward: number
  is_published: boolean
  expert_breakdown: string
  key_anchors: string[]
  created_at: string
}

export interface Question {
  id: number
  case_id: number
  layer: 1 | 2 | 3
  text: string
  hint?: string
}
