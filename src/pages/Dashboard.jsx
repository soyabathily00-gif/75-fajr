import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RULES, DAILY_RULES, CATEGORIES, CATEGORY_EMOJI, getRulesByCategory } from '../lib/rules'
import ChecklistItem from '../components/ChecklistItem'
import PhotoUploader from '../components/PhotoUploader'

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const START_DATE_KEY = '75fajr_start_date'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getDayNumber() {
  let start = localStorage.getItem(START_DATE_KEY)
  if (!start) {
    start = getToday()
    localStorage.setItem(START_DATE_KEY, start)
  }
  const diff = Math.floor((new Date(getToday()) - new Date(start)) / 86400000)
  return Math.max(1, Math.min(75, diff + 1))
}

export default function Dashboard({ user, onLogout }) {
  const [logs, setLogs] = useState({})         // { ruleId: { completed, photo_url } }
  const [weeklyLogs, setWeeklyLogs] = useState({}) // { ruleId: count }
  const [loading, setLoading] = useState(true)
  const [photoRule, setPhotoRule] = useState(null)
  const [celebrated, setCelebrated] = useState(false)

  const TODAY = getToday()
  const dayNumber = getDayNumber()
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const dailyCompleted = DAILY_RULES.filter(r => logs[r.id]?.completed).length
  const allDailyDone = dailyCompleted === DAILY_RULES.length
  const progress = DAILY_RULES.length > 0 ? dailyCompleted / DAILY_RULES.length : 0

  useEffect(() => {
    loadLogs()
  }, [user.id])

  async function loadLogs() {
    const [todayRes, weekRes] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('rule_id, completed, photo_url')
        .eq('user_id', user.id)
        .eq('log_date', TODAY),
      supabase
        .from('daily_logs')
        .select('rule_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('log_date', getWeekStart()),
    ])

    const todayMap = {}
    for (const row of todayRes.data ?? []) {
      todayMap[row.rule_id] = { completed: row.completed, photo_url: row.photo_url }
    }
    setLogs(todayMap)

    const weekMap = {}
    for (const row of weekRes.data ?? []) {
      weekMap[row.rule_id] = (weekMap[row.rule_id] ?? 0) + 1
    }
    setWeeklyLogs(weekMap)
    setLoading(false)
  }

  async function handleToggle(rule) {
    const currentlyDone = logs[rule.id]?.completed ?? false

    if (!currentlyDone && rule.needsPhoto) {
      setPhotoRule(rule)
      return
    }

    await upsertLog(rule, !currentlyDone, null)
  }

  async function upsertLog(rule, completed, photoUrl) {
    const payload = {
      user_id: user.id,
      log_date: TODAY,
      rule_id: rule.id,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }
    if (photoUrl !== null) payload.photo_url = photoUrl

    await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,log_date,rule_id' })

    setLogs(prev => ({
      ...prev,
      [rule.id]: {
        completed,
        photo_url: photoUrl ?? prev[rule.id]?.photo_url ?? null,
      },
    }))

    if (rule.type === 'weekly') {
      setWeeklyLogs(prev => ({
        ...prev,
        [rule.id]: Math.max(0, (prev[rule.id] ?? 0) + (completed ? 1 : -1)),
      }))
    }

    if (completed) {
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        action_type: photoUrl ? 'photo_uploaded' : 'rule_checked',
        rule_id: rule.id,
        meta: photoUrl ? { photo_url: photoUrl } : null,
      })
    }
  }

  async function handlePhotoComplete(photoUrl) {
    await upsertLog(photoRule, true, photoUrl)
    setPhotoRule(null)
  }

  async function handleDayComplete() {
    if (!allDailyDone || celebrated) return
    setCelebrated(true)
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action_type: 'rule_checked',
      rule_id: null,
      meta: { event: 'day_complete', day: dayNumber },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Day info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">
              75 Fajr
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-gray-900 leading-none">{dayNumber}</span>
              <span className="text-lg text-gray-400 font-normal">/ 75</span>
            </div>
            <p className="text-sm text-gray-400 mt-1 capitalize truncate">{dateLabel}</p>
          </div>

          {/* Circular progress */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" width="80" height="80" className="-rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth="9" />
                <circle
                  cx="50" cy="50" r={RADIUS}
                  fill="none"
                  stroke={allDailyDone ? '#22c55e' : user.avatar_color}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900 leading-none">{dailyCompleted}</span>
                <span className="text-xs text-gray-400 leading-none mt-0.5">/{DAILY_RULES.length}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">règles</p>
          </div>

          {/* Avatar / logout */}
          <button
            onClick={onLogout}
            className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            style={{ backgroundColor: user.avatar_color }}
          >
            <span className="text-white font-bold text-base">{user.name[0]}</span>
          </button>
        </div>
      </div>

      {/* Rules grouped by category */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {CATEGORIES.map(category => {
          const rules = getRulesByCategory(category)
          return (
            <div key={category} className="bg-white rounded-2xl px-4 pt-3 pb-1 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <span className="text-base">{CATEGORY_EMOJI[category]}</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {rules.map(rule => (
                  <ChecklistItem
                    key={rule.id}
                    rule={rule}
                    checked={logs[rule.id]?.completed ?? false}
                    weeklyCount={weeklyLogs[rule.id] ?? 0}
                    onToggle={() => handleToggle(rule)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent">
        <button
          onClick={handleDayComplete}
          disabled={!allDailyDone}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
            allDailyDone && !celebrated
              ? 'bg-green-500 text-white shadow-lg shadow-green-200/60 active:scale-95'
              : allDailyDone && celebrated
              ? 'bg-green-100 text-green-600 cursor-default'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {celebrated
            ? '✅ Journée validée — Barakallah !'
            : allDailyDone
            ? '🎉 Ma journée est complète !'
            : `Ma journée est complète · ${dailyCompleted}/${DAILY_RULES.length}`}
        </button>
      </div>

      {/* Photo upload modal */}
      {photoRule && (
        <PhotoUploader
          rule={photoRule}
          user={user}
          date={TODAY}
          onComplete={handlePhotoComplete}
          onCancel={() => setPhotoRule(null)}
        />
      )}
    </div>
  )
}
