// Typed environment variables. Fill in .env.local once Supabase project is created.
// For WeChat MiniProgram: VITE_ vars are inlined at build time via vite.config.ts define.
export const ENV = {
  SUPABASE_URL:      (import.meta.env.VITE_SUPABASE_URL      as string) ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? 'placeholder-anon-key',
  CLAUDE_API_KEY:    (import.meta.env.VITE_CLAUDE_API_KEY    as string) ?? '',
  CLAUDE_MODEL:      (import.meta.env.VITE_CLAUDE_MODEL      as string) ?? 'claude-sonnet-4-6',
  CLAUDE_BASE_URL:   'https://api.anthropic.com/v1',
} as const
