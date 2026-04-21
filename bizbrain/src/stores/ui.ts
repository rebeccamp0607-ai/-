import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isLoading  = ref(false)
  const toastMsg   = ref('')
  const toastType  = ref<'success' | 'error' | 'info'>('info')
  const toastVisible = ref(false)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info', duration = 2000): void {
    toastMsg.value = msg
    toastType.value = type
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, duration)
  }

  function setLoading(v: boolean): void { isLoading.value = v }

  return { isLoading, toastMsg, toastType, toastVisible, showToast, setLoading }
})
