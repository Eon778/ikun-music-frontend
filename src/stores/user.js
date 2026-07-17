import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const userId = ref(localStorage.getItem('userId'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setUser(userData) {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function setUserId(id) {
    userId.value = id
    if (id) {
      localStorage.setItem('userId', id)
    } else {
      localStorage.removeItem('userId')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    userId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
  }

  function initUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
    const savedUserId = localStorage.getItem('userId')
    if (savedUserId) {
      userId.value = savedUserId
    }
  }

  return {
    user,
    token,
    userId,
    isLoggedIn,
    setUser,
    setToken,
    setUserId,
    logout,
    initUser
  }
})