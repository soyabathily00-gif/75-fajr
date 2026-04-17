export default function ChecklistItem({ rule, checked, weeklyCount, note, onToggle }) {
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
      className="w-full flex items-start gap-3 py-3 text-left active:opacity-70 transition-opacity duration-150"
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isDone
              ? 'bg-green-500 border-green-500'
              : isInverseExceeded
              ? 'bg-red-400 border-red-400'
              : 'border-gray-200'
          }`}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white animate-check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isInverseExceeded && (
            <svg className="w-3 h-3 text-white animate-check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Label + note preview */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm leading-snug transition-colors block ${
          isDone ? 'line-through text-gray-400'
          : isInverseExceeded ? 'line-through text-red-400'
          : 'text-gray-800'
        }`}>
          {rule.label}
        </span>
        {rule.id === 'R12' && note && (
          <span className="text-xs text-gray-400 truncate block mt-0.5 not-italic">{note}</span>
        )}
      </div>

      {/* Badges */}
      {rule.type === 'weekly' && !rule.inverse && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
          isWeeklyDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {weeklyCount}/{rule.target}
        </span>
      )}
      {rule.inverse && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${inverseBadgeStyle()}`}>
          {weeklyCount}/{rule.target}
        </span>
      )}
      {rule.needsPhoto && !checked && (
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
        </svg>
      )}
      {rule.id === 'R12' && !checked && (
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
      )}
    </button>
  )
}
