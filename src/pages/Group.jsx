import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DAILY_RULES } from '../lib/rules'
import MemberCard from '../components/MemberCard'
import MemberDetailSheet from '../components/MemberDetailSheet'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d.toISOString().split('T')[0]
}

function getISOWeek() {
  const d = new Date()
  const dayNum = d.getDay() || 7
  d.setDate(d.getDate() + 4 - dayNum)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return {
    week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7),
    year: d.getFullYear(),
  }
}

function computeStreak(completedLogs) {
  const TOTAL = DAILY_RULES.length
  const DAILY_IDS = new Set(DAILY_RULES.map(r => r.id))

  const dayCount = {}
  for (const { log_date, rule_id } of completedLogs) {
    if (!DAILY_IDS.has(rule_id)) continue
    dayCount[log_date] = (dayCount[log_date] ?? 0) + 1
  }

  const isFullDay = ds => (dayCount[ds] ?? 0) >= TOTAL
  const today = getToday()

  const d = new Date()
  if (!isFullDay(today)) d.setDate(d.getDate() - 1)

  let streak = 0
  while (true) {
    const ds = d.toISOString().split('T')[0]
    if (isFullDay(ds)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  return streak
}

const ORDER = ['Soya', 'Imran', 'Souleman']

export default function Group({ user }) {
  const [members, setMembers] = useState([])
  const [todayLogs, setTodayLogs] = useState({})   // { userId: { ruleId: { completed, photo_url } } }
  const [weeklyLogs, setWeeklyLogs] = useState({}) // { userId: { ruleId: count } }
  const [streaks, setStreaks] = useState({})
  const [challenge, setChallenge] = useState(null)
  const [challengeText, setChallengeText] = useState('')
  const [editingChallenge, setEditingChallenge] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  const TODAY = getToday()
  const isAfterNoon = new Date().getHours() >= 12

  useEffect(() => {
    loadAll()

    const channel = supabase
      .channel('group-daily-logs')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'daily_logs',
        filter: `log_date=eq.${TODAY}`,
      }, ({ new: row }) => {
        if (!row) return
        setTodayLogs(prev => ({
          ...prev,
          [row.user_id]: {
            ...prev[row.user_id],
            [row.rule_id]: { completed: row.completed, photo_url: row.photo_url },
          },
        }))
      })
      .subscribe()

    channelRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [])

  async function loadAll() {
    const weekStart = getWeekStart()
    const { week, year } = getISOWeek()
    const since = new Date()
    since.setDate(since.getDate() - 75)
    const streakSince = since.toISOString().split('T')[0]

    const [usersRes, todayRes, historyRes, challengeRes] = await Promise.all([
      supabase.from('users').select('id, name, avatar_color, wake_time'),
      supabase.from('daily_logs').select('user_id, rule_id, completed, photo_url').eq('log_date', TODAY),
      supabase.from('daily_logs').select('user_id, log_date, rule_id').eq('completed', true).gte('log_date', streakSince),
      supabase.from('weekly_challenges').select('*').eq('week_number', week).eq('year', year).maybeSingle(),
    ])

    const sorted = (usersRes.data ?? []).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name))
    setMembers(sorted)

    const todayMap = {}
    for (const row of todayRes.data ?? []) {
      if (!todayMap[row.user_id]) todayMap[row.user_id] = {}
      todayMap[row.user_id][row.rule_id] = { completed: row.completed, photo_url: row.photo_url }
    }
    setTodayLogs(todayMap)

    const weeklyMap = {}
    const streakByUser = {}
    for (const row of historyRes.data ?? []) {
      if (!streakByUser[row.user_id]) streakByUser[row.user_id] = []
      streakByUser[row.user_id].push(row)
      if (row.log_date >= weekStart) {
        if (!weeklyMap[row.user_id]) weeklyMap[row.user_id] = {}
        weeklyMap[row.user_id][row.rule_id] = (weeklyMap[row.user_id][row.rule_id] ?? 0) + 1
      }
    }
    setWeeklyLogs(weeklyMap)
    setStreaks(Object.fromEntries(sorted.map(u => [u.id, computeStreak(streakByUser[u.id] ?? [])])))

    setChallenge(challengeRes.data)
    setChallengeText(challengeRes.data?.description ?? '')
    setLoading(false)
  }

  async function saveChallenge() {
    const { week, year } = getISOWeek()
    const { data } = await supabase
      .from('weekly_challenges')
      .upsert(
        { week_number: week, year, description: challengeText.trim(), created_by: user.id },
        { onConflict: 'week_number,year' }
      )
      .select()
      .single()
    setChallenge(data)
    setEditingChallenge(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Groupe</h1>
        <p className="text-sm text-gray-400 capitalize">{dateLabel}</p>
      </div>

      {/* Member cards */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          {members.map(member => {
            const mLogs = todayLogs[member.id] ?? {}
            const count = DAILY_RULES.filter(r => mLogs[r.id]?.completed).length
            return (
              <MemberCard
                key={member.id}
                member={member}
                todayCount={count}
                totalDaily={DAILY_RULES.length}
                streak={streaks[member.id] ?? 0}
                isAfterNoon={isAfterNoon}
                onClick={() => setSelectedMember(member)}
              />
            )
          })}
        </div>
      </div>

      {/* Walk photos of the day */}
      {(() => {
        const walkPhotos = members.flatMap(m => {
          const mLogs = todayLogs[m.id] ?? {}
          return ['R01', 'R13']
            .map(id => mLogs[id]?.photo_url ? { url: mLogs[id].photo_url, member: m } : null)
            .filter(Boolean)
        })
        if (walkPhotos.length === 0) return null
        return (
          <div className="px-4 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
              📸 Photos de marche du jour
            </p>
            <div className="flex flex-col gap-2">
              {walkPhotos.map(({ url, member }, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shadow-sm">
                  <img src={url} className="w-full h-52 object-cover" alt="marche" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.name[0]}
                    </div>
                    <span className="text-white text-xs font-medium">{member.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Weekly challenge */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Défi de la semaine
              </span>
            </div>
            {user.name === 'Souleman' && !editingChallenge && (
              <button
                onClick={() => setEditingChallenge(true)}
                className="text-xs text-blue-500 font-medium px-2.5 py-1 rounded-lg bg-blue-50 active:scale-95 transition-transform"
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {editingChallenge ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={challengeText}
                onChange={e => setChallengeText(e.target.value)}
                placeholder="Décris le défi de la semaine..."
                className="w-full text-sm text-gray-700 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-gray-400"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingChallenge(false); setChallengeText(challenge?.description ?? '') }}
                  className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl active:scale-95 transition-transform"
                >
                  Annuler
                </button>
                <button
                  onClick={saveChallenge}
                  disabled={!challengeText.trim()}
                  className="flex-1 py-2.5 text-sm text-white bg-gray-900 rounded-xl disabled:opacity-30 active:scale-95 transition-transform"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : challenge ? (
            <p className="text-gray-700 text-sm leading-relaxed">{challenge.description}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">
              {user.name === 'Souleman'
                ? 'Clique sur "Modifier" pour définir le défi.'
                : 'Aucun défi défini pour cette semaine.'}
            </p>
          )}
        </div>
      </div>

      {/* Member detail sheet */}
      {selectedMember && (
        <MemberDetailSheet
          member={selectedMember}
          logs={todayLogs[selectedMember.id] ?? {}}
          weeklyLogs={weeklyLogs[selectedMember.id] ?? {}}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}
