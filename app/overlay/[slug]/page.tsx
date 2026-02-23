import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OverlayRenderer from '@/components/overlay/OverlayRenderer'
import type { Overlay, MatchState } from '@/lib/types'

export default async function OverlayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: overlay } = await supabase
    .from('overlays')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!overlay) notFound()

  const { data: matchState } = await supabase
    .from('match_state')
    .select('*')
    .eq('overlay_id', overlay.id)
    .single()

  if (!matchState) notFound()

  return (
    <OverlayRenderer
      overlay={overlay as Overlay}
      initialMatchState={matchState as MatchState}
    />
  )
}
