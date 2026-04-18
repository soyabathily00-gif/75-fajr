import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TABS = [
  {
    path: '/dashboard',
    label: 'Journée',
    icon: (active) => (
      <path strokeLinecap="round" strokeLinejoin="round"
        d={active
          ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          : "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"}
      />
    ),
  },
  {
    path: '/groupe',
    label: 'Groupe',
    icon: () => (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
  {
    path: '/penalites',
    label: 'Pénalités',
    badge: true,
    icon: () => (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H13l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
      />
    ),
  },
  {
    path: '/stats',
    label: 'Stats',
    icon: () => (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
]

export default function BottomNav({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [kmOwed, setKmOwed] = useState(0)

  useEffect(() => {
    async function loadKm() {
      const [penaltiesRes, runsRes] = await Promise.all([
        supabase.from('penalties').select('km_owed'),
        supabase.from('penalty_runs').select('km_run').eq('user_id', user.id),
      ])
      const owed = (penaltiesRes.data ?? []).reduce((s, p) => s + p.km_owed, 0)
      const run  = (runsRes.data ?? []).reduce((s, r) => s + r.km_run, 0)
      setKmOwed(Math.max(0, owed - run))
    }
    loadKm()
  }, [user.id])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-xl border-t border-rim flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 active:scale-90 relative ${
              active ? 'text-ink' : 'text-ink-3'
            }`}
          >
            {/* Active indicator bar */}
            {active && (
              <span
                className="absolute top-0 left-3 right-3 h-[2px] rounded-full animate-fade-in"
                style={{ backgroundColor: user.avatar_color }}
              />
            )}
            <div className="relative">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={active ? user.avatar_color : 'currentColor'}
                strokeWidth={active ? 2 : 1.5}
              >
                {tab.icon(active)}
              </svg>
              {tab.badge && kmOwed > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {kmOwed > 99 ? '99+' : kmOwed}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-medium"
              style={active ? { color: user.avatar_color } : {}}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
      </div>
    </div>
  )
}
