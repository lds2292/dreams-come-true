import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDreamStore = defineStore('dream', () => {
  const selectedDream = ref(null)

  function select(dream) {
    selectedDream.value = dream
  }

  function clear() {
    selectedDream.value = null
  }

  return { selectedDream, select, clear }
})
