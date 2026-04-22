export interface VocabEntry {
  id: number
  term: string
  category: string
  plain_explanation: string
  formal_definition: string
  example: string
  use_cases: string[]
  misconceptions?: string
  related_terms: string[]
}
