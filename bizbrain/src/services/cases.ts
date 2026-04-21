import { supabase } from './supabase'
import type { Case, Question } from '../types/case'

export async function fetchCaseByMapPosition(position: number): Promise<Case | null> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('map_position', position)
    .eq('is_published', true)
    .single()
  if (error) { console.error('fetchCaseByMapPosition', error); return null }
  return data as Case
}

export async function fetchCaseById(id: number): Promise<Case | null> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error('fetchCaseById', error); return null }
  return data as Case
}

export async function fetchQuestionsForCase(caseId: number): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('case_id', caseId)
    .order('layer', { ascending: true })
  if (error) { console.error('fetchQuestionsForCase', error); return [] }
  return (data ?? []) as Question[]
}
