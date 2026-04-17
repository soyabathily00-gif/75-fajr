import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import PinPad from '../components/PinPad'

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, avatar_color, wake_time, pin_hash')
      .then(({ data }) => {
        const order = ['Soya', 'Imran', 'Souleman']
        const sorted = (data ?? []).sort(
          (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
        )
        setUsers(sorted)
        setLoading(false)
      })
  }, [])

  const handlePinComplete = useCallback(
    (pin) => {
      if (!selectedUser) return

      if (pin === selectedUser.pin_hash) {
        // eslint-disable-next-line no-unused-vars
        const { pin_hash, ...safeUser } = selectedUser
        onLogin(safeUser)
      } else {
        setError('PIN incorrect')
        setShaking(true)
        setTimeout(() => {
          setShaking(false)
          setError('')
        }, 600)
      }
    },
    [selectedUser, onLogin]
  )

  function handleBack() {
    setSelectedUser(null)
    setError('')
    setShaking(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      {!selectedUser ? (
        <div className="flex flex-col items-center gap-10 w-full">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              75 Fajr
            </h1>
            <p className="mt-2 text-gray-400 text-sm tracking-wide uppercase">
              Who's checking in?
            </p>
          </div>

          {/* Avatar cards */}
          <div className="flex gap-4 justify-center flex-wrap">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="
                  flex flex-col items-center gap-3 py-6 px-5
                  bg-white rounded-3xl shadow-sm
                  hover:shadow-md active:scale-95
                  transition-all duration-150 w-28
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  select-none
                "
                style={{ '--tw-ring-color': user.avatar_color }}
              >
                {/* Avatar circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.name[0]}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {user.name}
                </span>
                {/* Wake time badge */}
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {user.wake_time}
                </span>
              </button>
            ))}
          </div>

        </div>
      ) : (
        <PinPad
          user={selectedUser}
          onComplete={handlePinComplete}
          onBack={handleBack}
          error={error}
          shaking={shaking}
        />
      )}
    </div>
  )
}
