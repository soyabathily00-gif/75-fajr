import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const { user, login, logout } = useAuth()

  if (!user) return <Login onLogin={login} />
  return <Dashboard user={user} onLogout={logout} />
}

export default App
