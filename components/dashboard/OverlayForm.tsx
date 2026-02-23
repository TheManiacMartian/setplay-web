'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Overlay, LayoutConfig } from '@/lib/types'

interface Props {
  overlay?: Overlay
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function OverlayForm({ overlay }: Props) {
  const supabase = createClient()
  const router = useRouter()

  const [name, setName] = useState(overlay?.name ?? '')
  const [slug, setSlug] = useState(overlay?.slug ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [layout, setLayout] = useState<LayoutConfig>(
    overlay?.layout_config ?? {
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      fontFamily: 'sans-serif',
    }
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    let logo_url = overlay?.logo_url ?? null

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${slug}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      logo_url = publicUrl
    }

    if (overlay) {
      const { error } = await supabase
        .from('overlays')
        .update({ name, slug, logo_url, layout_config: layout })
        .eq('id', overlay.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase
        .from('overlays')
        .insert({ name, slug, logo_url, layout_config: layout, user_id: user.id })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Overlay Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (!overlay) setSlug(slugify(e.target.value))
          }}
          required
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          URL Slug <span className="text-gray-400 font-normal">(/overlay/...)</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          required
          className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Event Logo</label>
        {overlay?.logo_url && !logoFile && (
          <img src={overlay.logo_url} alt="Current logo" className="h-12 mb-2 object-contain" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>

      <fieldset className="border rounded p-4 space-y-4">
        <legend className="text-sm font-medium px-1">Layout</legend>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
            <input
              type="color"
              value={layout.primaryColor}
              onChange={(e) => setLayout({ ...layout, primaryColor: e.target.value })}
              className="w-full h-9 rounded cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
            <input
              type="color"
              value={layout.secondaryColor}
              onChange={(e) => setLayout({ ...layout, secondaryColor: e.target.value })}
              className="w-full h-9 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Font</label>
          <select
            value={layout.fontFamily}
            onChange={(e) => setLayout({ ...layout, fontFamily: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="'Oswald', sans-serif">Oswald</option>
          </select>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Saving...' : overlay ? 'Save Changes' : 'Create Overlay'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border rounded px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
