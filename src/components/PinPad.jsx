import { useState, useEffect } from 'react'

const KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  null, '0', '⌫',
]

export default function PinPad({ user, onComplete, onBack, error, shaking }) {
  const [pin, setPin] = useState('')

  // reset pin whenever a new user is shown
  useEffect(() => { setPin('') }, [user])

  useEffect(() => {
    if (pin.length === 4) {
      onComplete(pin)
      setPin('')
    }
  }, [pin, onComplete])

  function handleKey(key) {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
    } else if (key && pin.length < 4) {
      setPin(p => p + key)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xs mx-auto px-4">

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md"
          style={{ backgroundColor: user.avatar_color }}
        >
          {user.name[0]}
        </div>
        <p className="text-ink font-semibold text-base">{user.name}</p>
      </div>

      {/* PIN dots */}
      <div className={shaking ? 'animate-shake' : ''}>
        <div className="flex gap-5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? 'bg-ink border-ink scale-110'
                  : 'bg-transparent border-rim'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error message */}
      <p
        className={`-mt-4 text-sm font-medium text-red-500 h-5 transition-opacity duration-150 ${
          error ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {error || '\u00A0'}
      </p>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {KEYS.map((key, i) =>
          key === null ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onPointerDown={e => { e.preventDefault(); handleKey(key) }}
              className={`
                flex items-center justify-center rounded-2xl
                text-xl font-medium select-none
                bg-surface shadow-sm text-ink
                active:scale-90 active:shadow-none
                transition-transform duration-75
                ${key === '⌫' ? 'text-ink-2' : ''}
              `}
              style={{ aspectRatio: '1' }}
            >
              {key === '⌫' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4H6a2 2 0 00-1.664.897L2 9l2.336 4.103A2 2 0 006 14h6m0-10l4 5-4 5m4-5H9" />
                </svg>
              ) : key}
            </button>
          )
        )}
      </div>

      {/* Back */}
      <button
        onClick={onBack}
        className="text-sm text-ink-2 transition-colors"
      >
        ← Back
      </button>
    </div>
  )
}
