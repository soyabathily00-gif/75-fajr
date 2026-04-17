export default function MemberCard({ member, todayCount, totalDaily, streak, isAfterNoon, onClick }) {
  const isComplete = todayCount === totalDaily
  const inProgress = todayCount > 0 && !isComplete
  const isLate = todayCount === 0 && isAfterNoon

  const cardCls = isComplete
    ? 'bg-green-50 border-green-200'
    : inProgress
    ? 'bg-amber-50 border-amber-200'
    : isLate
    ? 'bg-red-50 border-red-200'
    : 'bg-white border-gray-100'

  const countCls = isComplete
    ? 'text-green-600'
    : inProgress
    ? 'text-amber-600'
    : isLate
    ? 'text-red-500'
    : 'text-gray-400'

  const pct = totalDaily > 0 ? todayCount / totalDaily : 0

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border shadow-sm active:scale-95 transition-transform duration-100 w-full ${cardCls}`}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm"
        style={{ backgroundColor: member.avatar_color }}
      >
        {member.name[0]}
      </div>

      {/* Name + count */}
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{member.name}</p>
        <p className={`text-xs font-medium mt-0.5 ${countCls}`}>
          {todayCount}/{totalDaily} auj.
        </p>
      </div>

      {/* Mini progress bar */}
      <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : inProgress ? 'bg-amber-400' : isLate ? 'bg-red-400' : 'bg-gray-200'
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {/* Streak */}
      <div className="text-xs flex items-center gap-1">
        {streak > 0 ? (
          <>
            <span>🔥</span>
            <span className="font-semibold text-gray-600">{streak}j</span>
          </>
        ) : (
          <span className="text-gray-300">— 0j</span>
        )}
      </div>
    </button>
  )
}
