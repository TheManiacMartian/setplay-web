export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Overlay {
  id: string
  user_id: string
  name: string
  slug: string
  logo_url: string | null
  layout_config: LayoutConfig
  created_at: string
  updated_at: string
}

export interface LayoutConfig {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

export interface MatchState {
  id: string
  overlay_id: string
  player1_name: string
  player1_character: string
  player1_score: number
  player2_name: string
  player2_character: string
  player2_score: number
  round: string
  updated_at: string
}
