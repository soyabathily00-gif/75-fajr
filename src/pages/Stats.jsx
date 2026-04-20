import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DAILY_RULES } from '../lib/rules'

const ORDER = ['Soya', 'Imran', 'Souleman']
const CHALLENGE_START = '2026-04-20'

const MILESTONES = [
  { label: 'Fondation', end: 19 },
  { label: 'Élan',      end: 38 },
  { label: 'Maîtrise',  end: 57 },
  { label: 'Victoire',  end: 75 },
]

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getToday() {
  return localDate()
}

function getDayNumber() {
  const diff = Math.floor((new Date(getToday()) - new Date(CHALLENGE_START)) / 86400000)
  return Math.max(1, Math.min(75, diff + 1))
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
    const ds = localDate(d)
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

  const dayNumber = getDayNumber()

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const since = new Date()
    since.setDate(since.getDate() - 75)
    const sinceDate = localDate(since)

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
    const totalRun  = (runsRes.data ?? []).reduce((s, r) => s + r.km_run, 0)
    setKmStats({ owed: totalOwed, run: totalRun })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="w-8 h-8 border-4 border-rim border-t-ink-2 rounded-full animate-spin" />
      </div>
    )
  }

  const kmRemaining = Math.max(0, kmStats.owed - kmStats.run)
  const kmPct = kmStats.owed > 0 ? Math.round((kmStats.run / kmStats.owed) * 100) : 100

  return (
    <div className="min-h-screen bg-app-bg pb-24">
      <div className="bg-surface px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-ink">Statistiques</h1>
        <p className="text-sm text-ink-2">75 jours · 3 membres</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* Milestones */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-rim">
            <span className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Jalons — 75 jours
            </span>
          </div>
          <div className="divide-y divide-rim">
            {MILESTONES.map((m, i) => {
              const start = i === 0 ? 1 : MILESTONES[i - 1].end + 1
              const isUnlocked = dayNumber >= m.end
              const isCurrent  = dayNumber >= start && dayNumber < m.end
              return (
                <div key={m.label} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isUnlocked ? 'bg-ink' : isCurrent ? 'border-2 border-rim' : 'bg-surface-2'
                  }`}>
                    {isUnlocked ? (
                      <svg className="w-4 h-4 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: user.avatar_color }} />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isUnlocked || isCurrent ? 'text-ink' : 'text-ink-3'}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-ink-2">
                      J{start}–{m.end === 75 ? 75 : m.end}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isUnlocked ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : isCurrent ? 'bg-surface-2 text-ink-2'
                    : 'bg-surface-2 text-ink-3'
                  }`}>
                    {isUnlocked ? 'Débloqué' : isCurrent ? `J${dayNumber}` : 'Verrouillé'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Member performance */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-rim">
            <span className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Performance individuelle
            </span>
          </div>
          {members.map((member, i) => {
            const s = memberStats[member.id] ?? { streak: 0, perfectDays: 0 }
            return (
              <div key={member.id} className={`flex items-center gap-3 px-4 py-4 ${i < members.length - 1 ? 'border-b border-rim' : ''}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: member.avatar_color }}>
                  {member.name[0]}
                </div>
                <p className="flex-1 font-semibold text-ink text-sm">{member.name}</p>
                <div className="flex gap-5 text-right">
                  <div>
                    <p className="text-xl font-black text-ink">{s.perfectDays}</p>
                    <p className="text-[10px] text-ink-2 leading-tight">jours<br/>parfaits</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-ink flex items-center gap-1 justify-end">
                      {s.streak > 0 && (
                        <svg className="w-4 h-4 text-orange-400 inline" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0C17 7.5 12 2 12 2Z" />
                        </svg>
                      )}
                      {s.streak}
                    </p>
                    <p className="text-[10px] text-ink-2 leading-tight">streak<br/>actuel</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Group km */}
        <div className="bg-surface rounded-2xl shadow-sm p-4">
          <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-4">
            Pénalités groupe
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-500">{kmStats.owed}</p>
              <p className="text-xs text-ink-2 mt-0.5">km dus</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-500">{kmStats.run}</p>
              <p className="text-xs text-ink-2 mt-0.5">km courus</p>
            </div>
            <div className="bg-surface-2 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ink">{kmRemaining}</p>
              <p className="text-xs text-ink-2 mt-0.5">restants</p>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${kmPct}%` }} />
          </div>
          <p className="text-xs text-ink-2 text-center mt-2">
            {kmStats.owed === 0 ? 'Aucune pénalité' : `${kmPct}% des pénalités rattrapées`}
          </p>
        </div>
      </div>
    </div>
  )
}
