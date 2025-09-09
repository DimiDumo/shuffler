export interface SpotifyPlaylist {
  id: string
  name: string
  track_count: number
  owner: string
  images: Array<{ url: string }>
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: string
  album: string
  duration_ms: number
  added_at: string
}

export interface SpotifyApiPlaylist {
  id: string
  name: string
  tracks: {
    total: number
  }
  owner: {
    display_name: string
  }
  images: Array<{ url: string }>
}

export interface SpotifyApiTrack {
  track: {
    id: string
    name: string
    type: string
    artists: Array<{ name: string }>
    album: {
      name: string
    }
    duration_ms: number
  }
  added_at: string
}