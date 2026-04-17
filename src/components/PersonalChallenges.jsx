import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PersonalChallenges({ userId, avatarColor }) {
  const [challenges, setChallenges] = useState([])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => { load() }, [userId])

  async function load() {
    const { data } = await supabase
      .from('personal_challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setChallenges(data ?? [])
  }

  async function addChallenge() {
    const title = draft.trim()
    if (!title) return
    const { data } = await supabase
      .from('personal_challenges')
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (data) setChallenges(prev => [...prev, data])
    setDraft('')
    setAdding(false)
  }

  async function toggleChallenge(ch) {
    const completed = !ch.completed
    setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, completed } : c))
    await supabase
      .from('personal_challenges')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', ch.id)
  }

  async function deleteChallenge(id) {
    setChallenges(prev => prev.filter(c => c.id !== id))
    await supabase.from('personal_challenges').delete().eq('id', id)
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-rim">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
          Défis personnels
        </span>
      </div>

      {challenges.length === 0 && !adding && (
        <p className="px-4 py-4 text-sm text-ink-3 italic">Aucun défi pour l'instant.</p>
      )}

      <div className="divide-y divide-rim">
        {challenges.map(ch => (
          <div key={ch.id} className="flex items-center gap-3 px-4 py-3 animate-fade-in">
            <button
              onClick={() => toggleChallenge(ch)}
              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                ch.completed ? 'bg-green-500 border-green-500' : 'border-rim'
              }`}
            >
              {ch.completed && (
                <svg className="w-3 h-3 text-white animate-check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm leading-snug transition-colors ${
              ch.completed ? 'line-through text-ink-3' : 'text-ink'
            }`}>
              {ch.title}
            </span>
            <button
              onClick={() => deleteChallenge(ch.id)}
              className="w-6 h-6 flex items-center justify-center text-ink-3 hover:text-ink-2 active:scale-90 transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="px-4 py-3 flex items-center gap-2 border-t border-rim animate-slide-up">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addChallenge(); if (e.key === 'Escape') { setAdding(false); setDraft('') } }}
            placeholder="Nom du défi..."
            className="flex-1 text-sm text-ink placeholder-ink-3 bg-surface-2 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rim"
          />
          <button
            onClick={addChallenge}
            disabled={!draft.trim()}
            className="px-3 py-2 rounded-xl bg-ink text-surface text-xs font-semibold disabled:opacity-30 active:scale-95 transition-transform"
          >
            Ajouter
          </button>
          <button
            onClick={() => { setAdding(false); setDraft('') }}
            className="px-2 py-2 rounded-xl text-ink-2 text-xs active:scale-95 transition-transform"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-4 py-3 border-t border-rim text-sm text-ink-2 active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Ajouter un défi</span>
        </button>
      )}
    </div>
  )
}
