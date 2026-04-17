import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Penalties({ user }) {
  const [penalties, setPenalties] = useState([])
  const [myRuns, setMyRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [user.id])

  async function loadData() {
    const [penaltiesRes, runsRes] = await Promise.all([
      supabase
        .from('penalties')
        .select('*, users!triggered_by(name, avatar_color)')
        .order('created_at', { ascending: false }),
      supabase
        .from('penalty_runs')
        .select('*')
        .eq('user_id', user.id),
    ])
    setPenalties(penaltiesRes.data ?? [])
    setMyRuns(runsRes.data ?? [])
    setLoading(false)
  }

  async function logRun(penalty) {
    const { data, error } = await supabase
      .from('penalty_runs')
      .insert({ user_id: user.id, penalty_id: penalty.id, km_run: penalty.km_owed })
      .select()
      .single()
    if (error || !data) return
    setMyRuns(prev => [...prev, data])
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action_type: 'km_run',
      meta: { penalty_id: penalty.id, km_run: penalty.km_owed },
    })
  }

  const ranIds = new Set(myRuns.map(r => r.penalty_id))
  const pending = penalties.filter(p => !ranIds.has(p.id))
  const done = penalties.filter(p => ranIds.has(p.id))

  const totalOwed = penalties.reduce((s, p) => s + p.km_owed, 0)
  const totalRun = myRuns.reduce((s, r) => s + r.km_run, 0)
  const remaining = Math.max(0, totalOwed - totalRun)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Pénalités</h1>
        <p className="text-sm text-gray-400">
          {remaining > 0 ? `${remaining} km restants à courir` : 'Tout est rattrapé 🎉'}
        </p>
      </div>

      {/* Summary bar */}
      {totalOwed > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Progression</span>
            <span className="text-xs font-bold text-gray-700">{totalRun}/{totalOwed} km</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalRun / totalOwed) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider px-1 mb-2">
              🚨 À courir
            </p>
            <div className="flex flex-col gap-2">
              {pending.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: p.users?.avatar_color ?? '#999' }}
                  >
                    {p.users?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{p.users?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.penalty_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-red-500">{p.km_owed} km</span>
                    <button
                      onClick={() => logRun(p)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                    >
                      ✅ Couru
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
              ✓ Rattrapées
            </p>
            <div className="flex flex-col gap-2">
              {done.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 opacity-50">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: p.users?.avatar_color ?? '#999' }}
                  >
                    {p.users?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-through">{p.users?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.penalty_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-500 flex-shrink-0">✓ {p.km_owed} km</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {penalties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-gray-700 font-semibold">Aucune pénalité</p>
            <p className="text-gray-400 text-sm mt-1">Continuez comme ça !</p>
          </div>
        )}
      </div>
    </div>
  )
}
