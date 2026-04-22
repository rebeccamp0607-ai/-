import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, ThinkingType, Rank } from '../types/user'
import { computeRank } from '../types/user'
import { supabase } from '../services/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const thinkingType = computed(() => user.value?.thinking_type ?? null)
  const rank = computed(() => user.value?.rank ?? '学徒' as Rank)
  const totalXP = computed(() => user.value?.total_xp ?? 0)
  const isLoggedIn = computed(() => user.value !== null)

  async function fetchProfile(): Promise<void> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    if (data) user.value = data as User
  }

  async function updateThinkingType(type: ThinkingType): Promise<void> {
    if (!user.value) return
    const { error } = await supabase
      .from('users')
      .update({ thinking_type: type })
      .eq('id', user.value.id)
    if (!error) user.value.thinking_type = type
  }

  async function addXP(amount: number): Promise<void> {
    if (!user.value) return
    const newXP = (user.value.total_xp ?? 0) + amount
    const newRank = computeRank(newXP)
    await supabase
      .from('users')
      .update({ total_xp: newXP, rank: newRank })
      .eq('id', user.value.id)
    user.value.total_xp = newXP
    user.value.rank = newRank
  }

  function setUserLocal(u: User): void {
    user.value = u
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user, isLoading, thinkingType, rank, totalXP, isLoggedIn,
    fetchProfile, updateThinkingType, addXP, setUserLocal, signOut,
  }
})
