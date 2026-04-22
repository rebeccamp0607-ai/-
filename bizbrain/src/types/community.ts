export interface Post {
  id: string
  user_id: string
  content: string
  category: string
  image_url?: string
  likes: number
  case_id?: number
  created_at: string
  users?: { username: string; avatar_url?: string }
}

export interface Comment {
  id: string
  post_id?: string
  case_id?: number
  user_id: string
  content: string
  likes: number
  created_at: string
  users?: { username: string; avatar_url?: string }
}
