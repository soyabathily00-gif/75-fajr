import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RULES, DAILY_RULES, CATEGORIES, CATEGORY_ICON, getRulesByCategory } from '../lib/rules'
import ChecklistItem from '../components/ChecklistItem'
import PhotoUploader from '../components/PhotoUploader'
import MilestoneBar from '../components/MilestoneBar'
import TaskNoteModal from '../components/TaskNoteModal'
import PersonalChallenges from '../components/PersonalChallenges'

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const START_DATE_KEY = '75fajr_start_date'

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getToday() {
  return localDate()
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return localDate(d)
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

export default function Dashboard({ user, onLogout, dark, onToggleDark }) {
  const [logs, setLogs] = useState({})
  const [weeklyLogs, setWeeklyLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [photoRule, setPhotoRule] = useState(null)
  const [noteRule, setNoteRule] = useState(null)
  const [celebrated, setCelebrated] = useState(false)

  const TODAY = getToday()
  const dayNumber = getDayNumber()
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const dailyCompleted = DAILY_RULES.filter(r => logs[r.id]?.completed).length
  const allDailyDone = dailyCompleted === DAILY_RULES.length
  const progress = DAILY_RULES.length > 0 ? dailyCompleted / DAILY_RULES.length : 0

  useEffect(() => { loadLogs() }, [user.id])

  async function loadLogs() {
    const [todayRes, weekRes] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('rule_id, completed, photo_url, note')
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
      todayMap[row.rule_id] = { completed: row.completed, photo_url: row.photo_url, note: row.note }
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

    if (!currentlyDone && rule.id === 'R12') {
      setNoteRule(rule)
      return
    }

    if (rule.type === 'weekly') {
      if (currentlyDone) return
      await upsertLog(rule, true, null)
      return
    }

    await upsertLog(rule, !currentlyDone, null)
  }

  async function upsertLog(rule, completed, photoUrl, note = null) {
    const payload = {
      user_id: user.id,
      log_date: TODAY,
      rule_id: rule.id,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }
    if (photoUrl !== null) payload.photo_url = photoUrl
    if (note !== null) payload.note = note

    await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,log_date,rule_id' })

    setLogs(prev => ({
      ...prev,
      [rule.id]: {
        completed,
        photo_url: photoUrl ?? prev[rule.id]?.photo_url ?? null,
        note: note ?? prev[rule.id]?.note ?? null,
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

  async function handleNoteConfirm(note) {
    await upsertLog(noteRule, true, null, note || null)
    setNoteRule(null)
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
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="w-8 h-8 border-4 border-rim border-t-ink-2 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg pb-40">
      {/* Header */}
      <div className="bg-surface px-5 pt-14 pb-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black text-ink leading-none">{dayNumber}</span>
              <span className="text-xl text-ink-3 font-light">/ 75</span>
            </div>
            <p className="text-sm text-ink-2 mt-1 capitalize truncate">{dateLabel}</p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" width="80" height="80" className="-rotate-90">
                <circle
                  cx="50" cy="50" r={RADIUS}
                  fill="none"
                  strokeWidth="9"
                  style={{ stroke: 'rgb(var(--rim))' }}
                />
                <circle
                  cx="50" cy="50" r={RADIUS}
                  fill="none"
                  stroke={allDailyDone ? '#22c55e' : user.avatar_color}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-ink leading-none">{dailyCompleted}</span>
                <span className="text-[10px] text-ink-3 leading-none mt-0.5">/{DAILY_RULES.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-2 text-ink-2 active:scale-90 transition-transform"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            <button
              onClick={onLogout}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              style={{ backgroundColor: user.avatar_color }}
            >
              <span className="text-white font-bold text-base">{user.name[0]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Milestone bar */}
      <div className="bg-surface mt-3 mx-4 rounded-2xl shadow-sm">
        <MilestoneBar dayNumber={dayNumber} avatarColor={user.avatar_color} />
      </div>

      {/* Rules by category */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {CATEGORIES.map(category => {
          const rules = getRulesByCategory(category)
          const iconPath = CATEGORY_ICON[category]
          return (
            <div key={category} className="bg-surface rounded-2xl px-4 pt-3 pb-1 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-rim">
                {iconPath && (
                  <svg className="w-4 h-4 text-ink-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                )}
                <span className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                  {category}
                </span>
              </div>
              <div className="divide-y divide-rim">
                {rules.map(rule => (
                  <ChecklistItem
                    key={rule.id}
                    rule={rule}
                    checked={logs[rule.id]?.completed ?? false}
                    weeklyCount={weeklyLogs[rule.id] ?? 0}
                    note={logs[rule.id]?.note ?? null}
                    onToggle={() => handleToggle(rule)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Personal challenges */}
        <PersonalChallenges userId={user.id} avatarColor={user.avatar_color} />
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 pt-8 bg-gradient-to-t from-app-bg via-app-bg/95 to-transparent">
        <button
          onClick={handleDayComplete}
          disabled={!allDailyDone}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
            allDailyDone && !celebrated
              ? 'bg-ink text-surface shadow-lg active:scale-[0.98]'
              : allDailyDone && celebrated
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-surface-2 text-ink-3 cursor-not-allowed'
          }`}
        >
          {celebrated
            ? 'Journée validée — Barakallah'
            : allDailyDone
            ? 'Valider ma journée'
            : `${dailyCompleted} / ${DAILY_RULES.length} règles complétées`}
        </button>
      </div>

      {photoRule && (
        <PhotoUploader
          rule={photoRule}
          user={user}
          date={TODAY}
          onComplete={handlePhotoComplete}
          onCancel={() => setPhotoRule(null)}
        />
      )}

      {noteRule && (
        <TaskNoteModal
          rule={noteRule}
          existingNote={logs[noteRule.id]?.note ?? ''}
          onConfirm={handleNoteConfirm}
          onCancel={() => setNoteRule(null)}
        />
      )}
    </div>
  )
}
