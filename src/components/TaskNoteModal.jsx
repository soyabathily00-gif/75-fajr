import { useState } from 'react'

export default function TaskNoteModal({ rule, existingNote, onConfirm, onCancel }) {
  const [note, setNote] = useState(existingNote ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-surface rounded-t-3xl w-full max-w-lg p-6 flex flex-col gap-5 animate-slide-up pb-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 mb-1">
            Tâche prioritaire
          </p>
          <h3 className="font-bold text-ink text-lg leading-tight">
            Qu'as-tu accompli aujourd'hui ?
          </h3>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ex. : Finir le rapport Q2, appeler le client..."
          autoFocus
          rows={4}
          className="w-full text-sm text-ink placeholder-ink-3 p-4 bg-surface-2 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rim transition-all"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-rim text-ink-2 text-sm font-medium active:scale-95 transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            className="flex-1 py-3.5 rounded-2xl bg-ink text-surface text-sm font-semibold active:scale-95 transition-transform"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
