import { CATEGORIES, CATEGORY_ICON, DAILY_RULES, getRulesByCategory } from '../lib/rules'

export default function MemberDetailSheet({ member, logs, weeklyLogs, onClose }) {
  const dailyDone = DAILY_RULES.filter(r => logs[r.id]?.completed).length
  const photos = ['R01', 'R13'].map(id => logs[id]?.photo_url).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-surface rounded-t-3xl max-h-[88vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-rim rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-rim flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm"
            style={{ backgroundColor: member.avatar_color }}
          >
            {member.name[0]}
          </div>
          <div>
            <p className="font-bold text-ink">{member.name}</p>
            <p className="text-sm text-ink-2">
              {dailyDone}/{DAILY_RULES.length} règles quotidiennes
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-ink-2 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-3 pb-8">
          {/* Walk photos */}
          {photos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 px-1">
                Photos de marche
              </p>
              <div className={`grid gap-2 ${photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-full h-44 object-cover rounded-2xl"
                    alt="photo de marche"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rules by category */}
          {CATEGORIES.map(category => {
            const rules = getRulesByCategory(category)
            return (
              <div key={category} className="bg-surface-2 rounded-2xl px-4 pt-3 pb-1">
                <div className="flex items-center gap-2 pb-2 border-b border-rim">
                  {CATEGORY_ICON[category] && (
                    <svg className="w-4 h-4 text-ink-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICON[category]} />
                    </svg>
                  )}
                  <span className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                    {category}
                  </span>
                </div>
                <div className="divide-y divide-rim">
                  {rules.map(rule => {
                    const weekCount = weeklyLogs[rule.id] ?? 0
                    const isWeeklyDone = rule.type === 'weekly' && !rule.inverse && weekCount >= rule.target
                    const isInverseExceeded = rule.inverse && weekCount > rule.target
                    const isDone = rule.type === 'daily'
                      ? (logs[rule.id]?.completed ?? false)
                      : isWeeklyDone

                    return (
                      <div key={rule.id} className="flex items-center gap-3 py-2.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isDone ? 'bg-green-500 border-green-500'
                            : isInverseExceeded ? 'bg-red-400 border-red-400'
                            : 'border-rim'
                          }`}
                        >
                          {isDone && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isInverseExceeded && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`flex-1 text-sm leading-snug ${
                          isDone ? 'line-through text-ink-3'
                          : isInverseExceeded ? 'line-through text-red-400'
                          : 'text-ink'
                        }`}>
                          {rule.label}
                        </span>
                        {rule.type === 'weekly' && !rule.inverse && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isWeeklyDone
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-surface text-ink-2'
                          }`}>
                            {weekCount}/{rule.target}
                          </span>
                        )}
                        {rule.inverse && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            weekCount === 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : weekCount < rule.target ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {weekCount}/{rule.target}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
