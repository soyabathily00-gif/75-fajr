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
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">📸 Photo requise</h3>
          <p className="text-sm text-gray-500 mt-1">{rule.label}</p>
        </div>

        {preview ? (
          <div className="relative">
            <img src={preview} className="w-full h-52 object-cover rounded-2xl" alt="preview" />
            <label className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer">
              Changer
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-gray-300 transition-colors bg-gray-50">
            <span className="text-4xl">📷</span>
            <span className="text-sm text-gray-400 mt-2">Appuyer pour ajouter une photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          </label>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium active:scale-95 transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-medium disabled:opacity-30 active:scale-95 transition-transform"
          >
            {uploading ? 'Upload...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
