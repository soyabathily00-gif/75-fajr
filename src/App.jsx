import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Group from './pages/Group'
import Penalties from './pages/Penalties'
import Stats from './pages/Stats'
import BottomNav from './components/BottomNav'

function App() {
  const { user, login, logout } = useAuth()

  if (!user) return <Login onLogin={login} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={logout} />} />
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
