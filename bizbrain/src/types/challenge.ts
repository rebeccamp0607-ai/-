export type ChallengeStep =
  | 'context'
  | 'q1-observe'
  | 'q2-analyze'
  | 'q3-decide'
  | 'breakdown'
  | 'anchors'
  | 'xp-reward'
  | 'community'

export interface UserAnswer {
  layer: 1 | 2 | 3
  content: string
  timestamp: number
}
