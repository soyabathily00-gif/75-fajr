import { useState, useEffect } from 'react'

const KEY = '75fajr_theme'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(KEY)
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return isDark
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}
