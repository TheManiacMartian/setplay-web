'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchState } from '@/lib/types'

const SSBU_CHARACTERS = [
  'Mario', 'Donkey Kong', 'Link', 'Samus', 'Dark Samus', 'Yoshi', 'Kirby',
  'Fox', 'Pikachu', 'Luigi', 'Ness', 'Captain Falcon', 'Jigglypuff',
  'Peach', 'Daisy', 'Bowser', 'Ice Climbers', 'Sheik', 'Zelda',
  'Dr. Mario', 'Pichu', 'Falco', 'Marth', 'Lucina', 'Young Link',
  'Ganondorf', 'Mewtwo', 'Roy', 'Chrom', 'Mr. Game & Watch', 'Meta Knight',
  'Pit', 'Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake', 'Ike',
  'Pokémon Trainer', 'Diddy Kong', 'Lucas', 'Sonic', 'King Dedede',
  'Olimar', 'Lucario', 'R.O.B.', 'Toon Link', 'Wolf', 'Villager',
  'Mega Man', 'Wii Fit Trainer', 'Rosalina & Luma', 'Little Mac', 'Greninja',
  'Mii Brawler', 'Mii Swordfighter', 'Mii Gunner', 'Palutena', 'Pac-Man',
  'Robin', 'Shulk', 'Bowser Jr.', 'Duck Hunt', 'Ryu', 'Ken', 'Cloud',
  'Corrin', 'Bayonetta', 'Inkling', 'Ridley', 'Simon', 'Richter',
  'King K. Rool', 'Isabelle', 'Incineroar', 'Piranha Plant', 'Joker',
  'Hero', 'Banjo & Kazooie', 'Terry', 'Byleth', 'Min Min', 'Steve',
  'Sephiroth', 'Pyra/Mythra', 'Kazuya', 'Sora',
].sort()

interface Props {
  overlayId: string
  initialState: MatchState
}

export default function MatchControlPanel({ overlayId, initialState }: Props) {
  const supabase = createClient()

  const [state, setState] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof MatchState>(key: K, value: MatchState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase
      .from('match_state')
      .update({
        player1_name: state.player1_name,
        player1_character: state.player1_character,
        player1_score: state.player1_score,
        player2_name: state.player2_name,
        player2_character: state.player2_character,
        player2_score: state.player2_score,
        round: state.round,
      })
      .eq('overlay_id', overlayId)
    setSaving(false)
    setSaved(true)
  }

  function resetScores() {
    setState((prev) => ({ ...prev, player1_score: 0, player2_score: 0 }))
    setSaved(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Match Control</h2>
        <button
          type="button"
          onClick={resetScores}
          className="text-xs border rounded px-3 py-1.5 hover:bg-gray-50 text-gray-500"
        >
          Reset Scores
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Round / Set</label>
        <input
          type="text"
          value={state.round}
          onChange={(e) => update('round', e.target.value)}
          placeholder="e.g. Winners Finals, Grand Finals"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Player 1 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Player 1</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={state.player1_name}
              onChange={(e) => update('player1_name', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Character</label>
            <select
              value={state.player1_character}
              onChange={(e) => update('player1_character', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">— Select —</option>
              {SSBU_CHARACTERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Score</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update('player1_score', Math.max(0, state.player1_score - 1))}
                className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{state.player1_score}</span>
              <button
                type="button"
                onClick={() => update('player1_score', state.player1_score + 1)}
                className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Player 2</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={state.player2_name}
              onChange={(e) => update('player2_name', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Character</label>
            <select
              value={state.player2_character}
              onChange={(e) => update('player2_character', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">— Select —</option>
              {SSBU_CHARACTERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Score</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update('player2_score', Math.max(0, state.player2_score - 1))}
                className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{state.player2_score}</span>
              <button
                type="button"
                onClick={() => update('player2_score', state.player2_score + 1)}
                className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Overlay'}
        </button>
        {saved && <span className="text-sm text-green-600">Overlay updated!</span>}
      </div>
    </form>
  )
}
