import { useState } from 'react'

export default function TaskNoteModal({ rule, existingNote, onConfirm, onCancel }) {
  const [note, setNote] = useState(existingNote ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 flex flex-col gap-5 animate-slide-up pb-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Tâche prioritaire
          </p>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            Qu'as-tu accompli aujourd'hui ?
          </h3>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ex. : Finir le rapport Q2, appeler le client..."
          autoFocus
          rows={4}
          className="w-full text-sm text-gray-800 placeholder-gray-300 p-4 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium active:scale-95 transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            className="flex-1 py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
