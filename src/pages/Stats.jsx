import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DAILY_RULES } from '../lib/rules'

const ORDER = ['Soya', 'Imran', 'Souleman']

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function computeStreak(logs) {
  const TOTAL = DAILY_RULES.length
  const IDS = new Set(DAILY_RULES.map(r => r.id))
  const dayCount = {}
  for (const { log_date, rule_id } of logs) {
    if (!IDS.has(rule_id)) continue
    dayCount[log_date] = (dayCount[log_date] ?? 0) + 1
  }
  const full = ds => (dayCount[ds] ?? 0) >= TOTAL
  const today = getToday()
  const d = new Date()
  if (!full(today)) d.setDate(d.getDate() - 1)
  let streak = 0
  while (true) {
    const ds = d.toISOString().split('T')[0]
    if (full(ds)) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}

function computePerfectDays(logs) {
  const TOTAL = DAILY_RULES.length
  const IDS = new Set(DAILY_RULES.map(r => r.id))
  const dayCount = {}
  for (const { log_date, rule_id } of logs) {
    if (!IDS.has(rule_id)) continue
    dayCount[log_date] = (dayCount[log_date] ?? 0) + 1
  }
  return Object.values(dayCount).filter(n => n >= TOTAL).length
}

export default function Stats({ user }) {
  const [members, setMembers] = useState([])
  const [memberStats, setMemberStats] = useState({})
  const [kmStats, setKmStats] = useState({ owed: 0, run: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const since = new Date()
    since.setDate(since.getDate() - 75)
    const sinceDate = since.toISOString().split('T')[0]

    const [usersRes, logsRes, penaltiesRes, runsRes] = await Promise.all([
      supabase.from('users').select('id, name, avatar_color'),
      supabase.from('daily_logs').select('user_id, log_date, rule_id').eq('completed', true).gte('log_date', sinceDate),
      supabase.from('penalties').select('km_owed'),
      supabase.from('penalty_runs').select('km_run'),
    ])

    const sorted = (usersRes.data ?? []).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name))
    setMembers(sorted)

    const logsByUser = {}
    for (const row of logsRes.data ?? []) {
      if (!logsByUser[row.user_id]) logsByUser[row.user_id] = []
      logsByUser[row.user_id].push(row)
    }

    const stats = {}
    for (const m of sorted) {
      const logs = logsByUser[m.id] ?? []
      stats[m.id] = { streak: computeStreak(logs), perfectDays: computePerfectDays(logs) }
    }
    setMemberStats(stats)

    const totalOwed = (penaltiesRes.data ?? []).reduce((s, p) => s + p.km_owed, 0)
    const totalRun = (runsRes.data ?? []).reduce((s, r) => s + r.km_run, 0)
    setKmStats({ owed: totalOwed, run: totalRun })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  const kmRemaining = Math.max(0, kmStats.owed - kmStats.run)
  const kmPct = kmStats.owed > 0 ? Math.round((kmStats.run / kmStats.owed) * 100) : 100

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-400">75 jours · 3 membres</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Member performance */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Performance individuelle
            </span>
          </div>
          {members.map((member, i) => {
            const s = memberStats[member.id] ?? { streak: 0, perfectDays: 0 }
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-4 py-4 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: member.avatar_color }}
                >
                  {member.name[0]}
                </div>
                <p className="flex-1 font-semibold text-gray-900 text-sm">{member.name}</p>
                <div className="flex gap-5 text-right">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{s.perfectDays}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">jours<br/>parfaits</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {s.streak > 0 ? '🔥' : ''}{s.streak}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">streak<br/>actuel</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Group km */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            🏃 Pénalités groupe
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{kmStats.owed}</p>
              <p className="text-xs text-gray-500 mt-0.5">km dus</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{kmStats.run}</p>
              <p className="text-xs text-gray-500 mt-0.5">km courus</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{kmRemaining}</p>
              <p className="text-xs text-gray-500 mt-0.5">restants</p>
            </div>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${kmPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {kmStats.owed === 0 ? 'Aucune pénalité — parfait ! 🎉' : `${kmPct}% des pénalités rattrapées`}
          </p>
        </div>
      </div>
    </div>
  )
}
