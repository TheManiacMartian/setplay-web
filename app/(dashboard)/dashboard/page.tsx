import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OverlayCard from '@/components/dashboard/OverlayCard'
import type { Overlay } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: overlays } = await supabase
    .from('overlays')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Overlays</h1>
        <Link
          href="/dashboard/overlays/new"
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-gray-800"
        >
          + New Overlay
        </Link>
      </div>

      {overlays && overlays.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overlays.map((overlay: Overlay) => (
            <OverlayCard key={overlay.id} overlay={overlay} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No overlays yet.</p>
          <p className="text-sm mt-1">Create one to get started.</p>
        </div>
      )}
    </main>
  )
}
