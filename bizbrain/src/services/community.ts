import { supabase } from './supabase'
import type { Post, Comment } from '../types/community'

export async function fetchPosts(limit = 20): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('fetchPosts', error); return [] }
  return (data ?? []) as Post[]
}

export async function createPost(userId: string, content: string, caseId?: number): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content, case_id: caseId ?? null })
    .select()
    .single()
  if (error) { console.error('createPost', error); return null }
  return data as Post
}

export async function fetchCaseComments(caseId: number): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(username, avatar_url)')
    .eq('case_id', caseId)
    .order('likes', { ascending: false })
    .limit(30)
  if (error) { console.error('fetchCaseComments', error); return [] }
  return (data ?? []) as Comment[]
}

export async function addCaseComment(userId: string, caseId: number, content: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, case_id: caseId, content })
    .select()
    .single()
  if (error) { console.error('addCaseComment', error); return null }
  return data as Comment
}
