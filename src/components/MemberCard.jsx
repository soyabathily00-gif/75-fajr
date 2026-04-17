export default function MemberCard({ member, todayCount, totalDaily, streak, isAfterNoon, onClick }) {
  const isComplete = todayCount === totalDaily
  const inProgress = todayCount > 0 && !isComplete
  const isLate     = todayCount === 0 && isAfterNoon
  const pct        = totalDaily > 0 ? todayCount / totalDaily : 0

  const cardCls = isComplete
    ? 'bg-green-50 border-green-100'
    : inProgress
    ? 'bg-amber-50 border-amber-100'
    : isLate
    ? 'bg-red-50 border-red-100'
    : 'bg-white border-gray-100'

  const countCls = isComplete ? 'text-green-600'
    : inProgress ? 'text-amber-600'
    : isLate ? 'text-red-400'
    : 'text-gray-400'

  const barCls = isComplete ? 'bg-green-500'
    : inProgress ? 'bg-amber-400'
    : isLate ? 'bg-red-300'
    : 'bg-gray-200'

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border shadow-sm active:scale-95 transition-all duration-150 w-full ${cardCls}`}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm"
        style={{ backgroundColor: member.avatar_color }}
      >
        {member.name[0]}
      </div>

      <div className="text-center">
        <p className="font-semibold text-[#111] text-sm leading-tight">{member.name}</p>
        <p className={`text-xs font-medium mt-0.5 ${countCls}`}>{todayCount}/{totalDaily}</p>
      </div>

      <div className="w-full h-1 bg-black/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barCls}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1 text-xs">
        {streak > 0 ? (
          <>
            <svg className="w-3 h-3 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0C17 7.5 12 2 12 2Z" />
            </svg>
            <span className="font-semibold text-gray-600">{streak}j</span>
          </>
        ) : (
          <span className="text-gray-300">0j</span>
        )}
      </div>
    </button>
  )
}
