import { SpotifyApiPlaylist, SpotifyApiTrack, SpotifyPlaylist, SpotifyTrack } from '@/types/spotify'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function spotifyFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`)
  }
  
  return response.json()
}

export async function getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const allPlaylists: SpotifyPlaylist[] = []
  let nextUrl = '/me/playlists?limit=50'
  
  while (nextUrl) {
    const data = await spotifyFetch(nextUrl, accessToken)
    allPlaylists.push(...data.items.map((playlist: SpotifyApiPlaylist) => ({
      id: playlist.id,
      name: playlist.name,
      track_count: playlist.tracks.total,
      owner: playlist.owner.display_name,
      images: playlist.images
    })))
    
    nextUrl = data.next ? data.next.replace(SPOTIFY_API_BASE, '') : null
  }
  
  return allPlaylists
}

export async function getPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]> {
  const allTracks: SpotifyTrack[] = []
  let nextUrl = `/playlists/${playlistId}/tracks?limit=100`
  
  while (nextUrl) {
    const data = await spotifyFetch(nextUrl, accessToken)
    const tracks = data.items
      .filter((item: SpotifyApiTrack) => item.track && item.track.type === 'track')
      .map((item: SpotifyApiTrack) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        duration_ms: item.track.duration_ms,
        added_at: item.added_at
      }))
    
    allTracks.push(...tracks)
    nextUrl = data.next ? data.next.replace(SPOTIFY_API_BASE, '') : null
  }
  
  return allTracks
}

export async function spotifyReorderTracks(
  accessToken: string,
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
  rangeLength: number = 1
) {
  await spotifyFetch(`/playlists/${playlistId}/tracks`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({
      range_start: rangeStart,
      insert_before: insertBefore,
      range_length: rangeLength
    })
  })
}