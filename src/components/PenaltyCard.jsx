export default function PenaltyCard({ penalty, ran, onRun }) {
  const dateStr = new Date(penalty.penalty_date).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
  })

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 ${ran ? 'opacity-50' : ''}`}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
        style={{ backgroundColor: penalty.users?.avatar_color ?? '#999' }}
      >
        {penalty.users?.name?.[0] ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-gray-900 ${ran ? 'line-through' : ''}`}>
          {penalty.users?.name ?? '—'}
        </p>
        <p className="text-xs text-gray-400 capitalize">{dateStr}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {ran ? (
          <span className="text-sm font-bold text-green-500">✓ {penalty.km_owed} km</span>
        ) : (
          <>
            <span className="text-sm font-bold text-red-500">{penalty.km_owed} km</span>
            {onRun && (
              <button
                onClick={() => onRun(penalty)}
                className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
              >
                Couru ✓
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
