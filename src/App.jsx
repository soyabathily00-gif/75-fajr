import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Group from './pages/Group'

function TabBar({ tab, setTab }) {
  const btn = (id, label, icon) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
        tab === id ? 'text-gray-900' : 'text-gray-400'
      }`}
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={tab === id ? 2 : 1.5}>
        {icon}
      </svg>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex safe-area-bottom">
      {btn('dashboard', 'Ma journée',
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      )}
      {btn('group', 'Groupe',
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      )}
    </div>
  )
}

function App() {
  const { user, login, logout } = useAuth()
  const [tab, setTab] = useState('dashboard')

  if (!user) return <Login onLogin={login} />

  return (
    <>
      {tab === 'dashboard'
        ? <Dashboard user={user} onLogout={logout} />
        : <Group user={user} />
      }
      <TabBar tab={tab} setTab={setTab} />
    </>
  )
}

export default App
