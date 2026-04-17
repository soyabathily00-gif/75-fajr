const MILESTONES = [
  { phase: 1, label: 'Fondation', end: 19, reward: 'Phase 1 accomplie. Offre-toi quelque chose.' },
  { phase: 2, label: 'Élan',      end: 38, reward: 'Mi-parcours. Tu mérites une vraie pause.' },
  { phase: 3, label: 'Maîtrise',  end: 57, reward: '57 jours — tu es devenu quelqu\'un d\'autre.' },
  { phase: 4, label: 'Victoire',  end: 75, reward: '75 jours. Légendaire. Sans compromis.' },
]

export default function MilestoneBar({ dayNumber, avatarColor }) {
  return (
    <div className="px-5 pt-4 pb-1">
      {/* Track */}
      <div className="relative flex gap-1 mb-2.5">
        {MILESTONES.map((m, i) => {
          const segStart = i === 0 ? 1 : MILESTONES[i - 1].end + 1
          const segEnd = m.end
          const segPct = ((segEnd - segStart + 1) / 75) * 100

          const segProgress = dayNumber < segStart
            ? 0
            : dayNumber >= segEnd
            ? 100
            : ((dayNumber - segStart) / (segEnd - segStart)) * 100

          const isUnlocked = dayNumber >= segEnd

          return (
            <div
              key={m.phase}
              className="relative h-1.5 rounded-full bg-surface-2 overflow-hidden"
              style={{ width: `${segPct}%` }}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isUnlocked ? 'animate-pulse-once' : ''}`}
                style={{
                  width: `${segProgress}%`,
                  backgroundColor: avatarColor,
                  opacity: isUnlocked ? 1 : 0.7,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex">
        {MILESTONES.map((m, i) => {
          const segStart = i === 0 ? 1 : MILESTONES[i - 1].end + 1
          const segEnd = m.end
          const segPct = ((segEnd - segStart + 1) / 75) * 100
          const isUnlocked = dayNumber >= segEnd
          const isCurrent = dayNumber >= segStart && dayNumber <= segEnd

          return (
            <div
              key={m.phase}
              className="flex flex-col"
              style={{ width: `${segPct}%` }}
            >
              <span className={`text-[9px] font-semibold uppercase tracking-wide truncate ${
                isCurrent
                  ? 'text-ink'
                  : isUnlocked
                  ? 'text-ink-2'
                  : 'text-ink-3'
              }`}>
                {m.label}
              </span>
              {isUnlocked && (
                <span className="text-[9px] font-medium tracking-wide" style={{ color: avatarColor }}>
                  Récompense
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Reward banner — shown on milestone crossing days */}
      {MILESTONES.find(m => m.end === dayNumber) && (
        <div
          className="mt-3 px-4 py-3 rounded-2xl animate-slide-up"
          style={{ backgroundColor: `${avatarColor}18` }}
        >
          <p className="text-xs font-semibold text-ink">
            {MILESTONES.find(m => m.end === dayNumber)?.reward}
          </p>
        </div>
      )}
    </div>
  )
}
