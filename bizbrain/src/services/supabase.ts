import { createClient } from '@supabase/supabase-js'
import { ENV } from '../env'

// Custom storage adapter: WeChat MiniProgram has no localStorage,
// so we use uni-app's cross-platform storage API instead.
const uniStorage = {
  getItem: (key: string): string | null => {
    try { return uni.getStorageSync(key) || null } catch { return null }
  },
  setItem: (key: string, value: string): void => {
    try { uni.setStorageSync(key, value) } catch {}
  },
  removeItem: (key: string): void => {
    try { uni.removeStorageSync(key) } catch {}
  },
}

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: uniStorage,
  },
})
