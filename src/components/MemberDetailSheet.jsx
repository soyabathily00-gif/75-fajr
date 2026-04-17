import { CATEGORIES, CATEGORY_EMOJI, DAILY_RULES, getRulesByCategory } from '../lib/rules'

export default function MemberDetailSheet({ member, logs, weeklyLogs, onClose }) {
  const dailyDone = DAILY_RULES.filter(r => logs[r.id]?.completed).length
  const photos = ['R01', 'R13'].map(id => logs[id]?.photo_url).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm"
            style={{ backgroundColor: member.avatar_color }}
          >
            {member.name[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-400">
              {dailyDone}/{DAILY_RULES.length} règles quotidiennes
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-3 pb-8">
          {/* Walk photos */}
          {photos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                📸 Photos de marche
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
              <div key={category} className="bg-gray-50 rounded-2xl px-4 pt-3 pb-1">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <span className="text-base">{CATEGORY_EMOJI[category]}</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
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
                            : 'border-gray-300'
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
                          isDone ? 'line-through text-gray-400'
                          : isInverseExceeded ? 'line-through text-red-400'
                          : 'text-gray-700'
                        }`}>
                          {rule.label}
                        </span>
                        {rule.type === 'weekly' && !rule.inverse && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isWeeklyDone ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {weekCount}/{rule.target}
                          </span>
                        )}
                        {rule.inverse && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            weekCount === 0 ? 'bg-green-50 text-green-600'
                            : weekCount < rule.target ? 'bg-amber-100 text-amber-600'
                            : 'bg-red-100 text-red-500'
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
