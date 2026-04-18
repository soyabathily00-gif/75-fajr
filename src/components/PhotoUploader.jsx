import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PhotoUploader({ rule, user, date, onComplete, onCancel }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    // walk-photos bucket must be public in Supabase Storage settings
    const path = `${user.id}/${date}-${rule.id}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('walk-photos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError("Échec de l'upload. Réessaie.")
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('walk-photos').getPublicUrl(path)
    onComplete(data.publicUrl)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4 pb-8">
      <div className="bg-surface rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div>
          <h3 className="font-bold text-ink text-lg">Photo requise</h3>
          <p className="text-sm text-ink-2 mt-1">{rule.label}</p>
        </div>

        {preview ? (
          <div className="relative">
            <img src={preview} className="w-full h-52 object-cover rounded-2xl" alt="preview" />
            <label className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer">
              Changer
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-rim rounded-2xl cursor-pointer bg-surface-2">
            <svg className="w-10 h-10 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <span className="text-sm text-ink-2 mt-2">Appuyer pour ajouter une photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-rim text-ink-2 text-sm font-medium active:scale-95 transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-3.5 rounded-2xl bg-ink text-surface text-sm font-medium disabled:opacity-30 active:scale-95 transition-transform"
          >
            {uploading ? 'Upload...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
