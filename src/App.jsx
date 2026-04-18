import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Group from './pages/Group'
import Penalties from './pages/Penalties'
import Stats from './pages/Stats'
import BottomNav from './components/BottomNav'

function App() {
  const { user, login, logout } = useAuth()
  const [dark, setDark] = useDarkMode()

  if (!user) return <Login onLogin={login} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={<Dashboard user={user} onLogout={logout} dark={dark} onToggleDark={() => setDark(d => !d)} />}
        />
        <Route path="/groupe" element={<Group user={user} />} />
        <Route path="/penalites" element={<Penalties user={user} />} />
        <Route path="/stats" element={<Stats user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNav user={user} />
    </BrowserRouter>
  )
}

export default App
