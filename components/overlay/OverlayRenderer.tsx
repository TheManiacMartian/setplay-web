'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Overlay, MatchState } from '@/lib/types'

interface Props {
  overlay: Overlay
  initialMatchState: MatchState
}

export default function OverlayRenderer({ overlay, initialMatchState }: Props) {
  const [match, setMatch] = useState<MatchState>(initialMatchState)
  const supabase = createClient()

  const { layout_config: layout } = overlay

  useEffect(() => {
    const channel = supabase
      .channel(`match_state:${overlay.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match_state',
          filter: `overlay_id=eq.${overlay.id}`,
        },
        (payload) => {
          setMatch(payload.new as MatchState)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [overlay.id, supabase])

  return (
    <div
      className="w-full h-screen overflow-hidden relative flex flex-col items-center justify-end pb-8"
      style={{
        fontFamily: layout.fontFamily,
        backgroundColor: 'transparent',
      }}
    >
      {/* Scoreboard bar */}
      <div
        className="flex items-center rounded-xl overflow-hidden shadow-xl text-white"
        style={{
          backgroundColor: layout.secondaryColor,
          minWidth: '700px',
        }}
      >
        {/* Player 1 */}
        <div
          className="flex items-center gap-3 px-5 py-3 flex-1"
          style={{ backgroundColor: layout.primaryColor }}
        >
          <span className="font-bold text-xl truncate max-w-[180px]">
            {match.player1_name || 'Player 1'}
          </span>
          {match.player1_character && (
            <span className="text-sm opacity-80">{match.player1_character}</span>
          )}
        </div>

        {/* Scores */}
        <div
          className="flex items-center gap-4 px-6 py-3 text-2xl font-black"
          style={{ backgroundColor: layout.secondaryColor }}
        >
          <span>{match.player1_score}</span>
          <span className="opacity-40 text-lg">—</span>
          <span>{match.player2_score}</span>
        </div>

        {/* Player 2 */}
        <div
          className="flex items-center gap-3 px-5 py-3 flex-1 justify-end"
          style={{ backgroundColor: layout.primaryColor }}
        >
          {match.player2_character && (
            <span className="text-sm opacity-80">{match.player2_character}</span>
          )}
          <span className="font-bold text-xl truncate max-w-[180px]">
            {match.player2_name || 'Player 2'}
          </span>
        </div>
      </div>

      {/* Round label */}
      {match.round && (
        <div
          className="mt-2 px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: layout.secondaryColor, color: '#fff' }}
        >
          {match.round}
        </div>
      )}

      {/* Logo */}
      {overlay.logo_url && (
        <img
          src={overlay.logo_url}
          alt="Event logo"
          className="absolute bottom-6 left-6 h-25 object-contain"
        />
      )}
    </div>
  )
}
