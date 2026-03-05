import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const query     = ref('')
  const lastQuery = ref('')
  const results   = ref([])
  const submitted = ref(false)

  function save({ query: q, lastQuery: lq, results: r, submitted: s }) {
    query.value     = q
    lastQuery.value = lq
    results.value   = r
    submitted.value = s
  }

  function clear() {
    query.value     = ''
    lastQuery.value = ''
    results.value   = []
    submitted.value = false
  }

  return { query, lastQuery, results, submitted, save, clear }
})
