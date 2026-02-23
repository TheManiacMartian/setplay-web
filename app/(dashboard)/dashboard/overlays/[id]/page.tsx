import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OverlayForm from '@/components/dashboard/OverlayForm'
import MatchControlPanel from '@/components/dashboard/MatchControlPanel'
import type { Overlay, MatchState } from '@/lib/types'

export default async function EditOverlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: overlay } = await supabase
    .from('overlays')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!overlay) notFound()

  const { data: matchState } = await supabase
    .from('match_state')
    .select('*')
    .eq('overlay_id', id)
    .single()

  const overlayUrl = `/overlay/${overlay.slug}`

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{overlay.name}</h1>
          <p className="text-sm text-gray-400 font-mono mt-1">{overlayUrl}</p>
        </div>
        <a
          href={overlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm border rounded px-4 py-2 hover:bg-gray-50"
        >
          Open Overlay ↗
        </a>
      </div>

      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Overlay Settings</h2>
        <OverlayForm overlay={overlay as Overlay} />
      </section>

      {matchState && (
        <section className="border rounded-lg p-6">
          <MatchControlPanel
            overlayId={overlay.id}
            initialState={matchState as MatchState}
          />
        </section>
      )}
    </main>
  )
}
