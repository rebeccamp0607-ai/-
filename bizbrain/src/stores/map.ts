import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchCompletedChallenges } from '../services/progress'

export type NodeState = 'completed' | 'active' | 'locked'

export const useMapStore = defineStore('map', () => {
  const completedIds = ref<Set<number>>(new Set())
  const isLoaded = ref(false)

  async function loadProgress(userId: string): Promise<void> {
    const ids = await fetchCompletedChallenges(userId)
    completedIds.value = new Set(ids)
    isLoaded.value = true
  }

  function nodeState(mapPosition: number): NodeState {
    if (completedIds.value.has(mapPosition)) return 'completed'
    const maxCompleted = completedIds.value.size === 0 ? 0 : Math.max(...completedIds.value)
    if (mapPosition === maxCompleted + 1) return 'active'
    return 'locked'
  }

  function markComplete(mapPosition: number): void {
    completedIds.value.add(mapPosition)
  }

  return { completedIds, isLoaded, loadProgress, nodeState, markComplete }
})
