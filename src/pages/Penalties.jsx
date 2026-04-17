import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PenaltyCard from '../components/PenaltyCard'

const ORDER = ['Soya', 'Imran', 'Souleman']

export default function Penalties({ user }) {
  const [penalties, setPenalties] = useState([])
  const [myRuns, setMyRuns] = useState([])
  const [members, setMembers] = useState([])
  const [allRuns, setAllRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [user.id])

  async function loadData() {
    const [penaltiesRes, myRunsRes, membersRes, allRunsRes] = await Promise.all([
      supabase
        .from('penalties')
        .select('*, users!triggered_by(name, avatar_color)')
        .order('penalty_date', { ascending: false }),
      supabase.from('penalty_runs').select('*').eq('user_id', user.id),
      supabase.from('users').select('id, name, avatar_color'),
      supabase.from('penalty_runs').select('user_id, km_run'),
    ])
    setPenalties(penaltiesRes.data ?? [])
    setMyRuns(myRunsRes.data ?? [])
    setMembers((membersRes.data ?? []).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)))
    setAllRuns(allRunsRes.data ?? [])
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
    setAllRuns(prev => [...prev, data])
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action_type: 'km_run',
      meta: { penalty_id: penalty.id, km_run: penalty.km_owed },
    })
  }

  const ranIds = new Set(myRuns.map(r => r.penalty_id))
  const myPenalties = penalties.filter(p => p.triggered_by === user.id)
  const totalOwed = myPenalties.reduce((s, p) => s + p.km_owed, 0)
  const totalRun  = myRuns.reduce((s, r) => s + r.km_run, 0)
  const remaining = Math.max(0, totalOwed - totalRun)

  const kmRunByUser  = {}
  const kmOwedByUser = {}
  for (const r of allRuns) kmRunByUser[r.user_id] = (kmRunByUser[r.user_id] ?? 0) + r.km_run
  for (const p of penalties) {
    if (p.triggered_by) kmOwedByUser[p.triggered_by] = (kmOwedByUser[p.triggered_by] ?? 0) + p.km_owed
  }

  const pending = penalties.filter(p => !ranIds.has(p.id))
  const done    = penalties.filter(p =>  ranIds.has(p.id))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-[#111]">Pénalités</h1>
        <p className="text-sm text-gray-400">
          {remaining > 0 ? `${remaining} km restants` : 'Tout est rattrapé'}
        </p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {totalOwed > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Ma progression</span>
              <span className="text-xs font-bold text-[#111]">{totalRun}/{totalOwed} km</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totalOwed > 0 ? (totalRun / totalOwed) * 100 : 100)}%` }}
              />
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-red-400 uppercase tracking-widest px-1 mb-2">
              À courir
            </p>
            <div className="flex flex-col gap-2">
              {pending.map(p => <PenaltyCard key={p.id} penalty={p} ran={false} onRun={logRun} />)}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Rattrapées
            </p>
            <div className="flex flex-col gap-2">
              {done.map(p => <PenaltyCard key={p.id} penalty={p} ran />)}
            </div>
          </div>
        )}

        {penalties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-700 font-semibold text-lg">Aucune pénalité</p>
            <p className="text-gray-400 text-sm mt-1">Continuez comme ça</p>
          </div>
        )}

        {members.length > 0 && penalties.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Classement groupe
              </span>
            </div>
            {members.map((m, i) => {
              const owed = kmOwedByUser[m.id] ?? 0
              const run  = kmRunByUser[m.id]  ?? 0
              const left = Math.max(0, owed - run)
              const pct  = owed > 0 ? Math.min(100, (run / owed) * 100) : 100
              return (
                <div key={m.id} className={`px-4 py-3 flex items-center gap-3 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: m.avatar_color }}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-[#111]">{m.name}</p>
                      <p className="text-xs text-gray-400">{run}/{owed} km</p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: left === 0 ? '#22c55e' : m.avatar_color }} />
                    </div>
                  </div>
                  {left === 0 && owed > 0 && <span className="text-green-500 text-xs font-bold flex-shrink-0">✓</span>}
                  {left > 0 && <span className="text-red-400 text-xs font-bold flex-shrink-0">{left}km</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
