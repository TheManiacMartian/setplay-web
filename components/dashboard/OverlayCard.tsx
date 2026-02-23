import Link from 'next/link'
import type { Overlay } from '@/lib/types'

export default function OverlayCard({ overlay }: { overlay: Overlay }) {
  const overlayUrl = `/overlay/${overlay.slug}`

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <h2 className="font-semibold truncate">{overlay.name}</h2>
      </div>

      <p className="text-xs text-gray-400 font-mono truncate">/overlay/{overlay.slug}</p>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/dashboard/overlays/${overlay.id}`}
          className="flex-1 text-center text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Edit
        </Link>
        <a
          href={overlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Preview
        </a>
      </div>
    </div>
  )
}
