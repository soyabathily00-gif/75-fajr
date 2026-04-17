import { useState } from 'react'

const STORAGE_KEY = '75fajr_user'

export function useAuth() {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  function login(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUserState(userData)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUserState(null)
  }

  return { user, login, logout }
}
