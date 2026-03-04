import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('dct_user') || 'null'))

  const isLoggedIn = computed(() => !!user.value)

  function login(userData) {
    user.value = userData
    localStorage.setItem('dct_user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('dct_user')
  }

  return { user, isLoggedIn, login, logout }
})
