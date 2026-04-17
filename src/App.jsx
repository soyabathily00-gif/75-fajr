import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'

function App() {
  const { user, login, logout } = useAuth()

  if (!user) {
    return <Login onLogin={login} />
  }

  // Dashboard placeholder — will be replaced
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow"
        style={{ backgroundColor: user.avatar_color }}
      >
        {user.name[0]}
      </div>
      <p className="text-gray-800 font-semibold text-lg">Welcome, {user.name}</p>
      <button
        onClick={logout}
        className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}

export default App
