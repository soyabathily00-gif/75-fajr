export default function ChecklistItem({ rule, checked, weeklyCount, onToggle }) {
  const isWeeklyDone = rule.type === 'weekly' && !rule.inverse && weeklyCount >= rule.target
  const isInverseExceeded = rule.inverse && weeklyCount > rule.target
  const isDone = rule.type === 'daily' ? checked : isWeeklyDone

  function inverseBadgeStyle() {
    if (weeklyCount === 0) return 'bg-green-50 text-green-600'
    if (weeklyCount < rule.target) return 'bg-amber-100 text-amber-600'
    return 'bg-red-100 text-red-500'
  }

  return (
    <button
      className="w-full flex items-center gap-3 py-3 text-left active:opacity-60 transition-opacity"
      onClick={onToggle}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          isDone ? 'bg-green-500 border-green-500'
          : isInverseExceeded ? 'bg-red-400 border-red-400'
          : 'border-gray-300'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isInverseExceeded && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <span
        className={`flex-1 text-sm leading-snug transition-colors ${
          isDone ? 'line-through text-gray-400'
          : isInverseExceeded ? 'line-through text-red-400'
          : 'text-gray-700'
        }`}
      >
        {rule.label}
      </span>

      {rule.type === 'weekly' && !rule.inverse && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            isWeeklyDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {weeklyCount}/{rule.target}
        </span>
      )}

      {rule.inverse && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${inverseBadgeStyle()}`}>
          {weeklyCount}/{rule.target}
        </span>
      )}

      {rule.needsPhoto && !checked && (
        <span className="text-base flex-shrink-0">📸</span>
      )}
    </button>
  )
}
