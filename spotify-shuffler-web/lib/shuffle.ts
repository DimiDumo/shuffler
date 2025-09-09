import { getPlaylistTracks, spotifyReorderTracks } from './spotify'

export function fisherYatesShuffle<T>(items: T[]): number[] {
  const shuffled = Array.from({ length: items.length }, (_, i) => i)
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export async function reorderPlaylist(
  accessToken: string,
  playlistId: string,
  shuffleFunction: (items: any[]) => number[]
) {
  // Get current tracks
  const tracks = await getPlaylistTracks(accessToken, playlistId)
  
  if (tracks.length < 2) {
    throw new Error('Playlist needs at least 2 tracks to shuffle')
  }
  
  // Generate shuffled order
  const shuffledIndices = shuffleFunction(tracks)
  
  // Apply reordering via Spotify API
  const currentPositions = Array.from({ length: tracks.length }, (_, i) => i)
  
  for (let targetPos = shuffledIndices.length - 1; targetPos >= 0; targetPos--) {
    const desiredOriginalIndex = shuffledIndices[targetPos]
    const currentPos = currentPositions.indexOf(desiredOriginalIndex)
    
    if (currentPos !== targetPos) {
      await spotifyReorderTracks(
        accessToken,
        playlistId,
        currentPos,
        targetPos > currentPos ? targetPos + 1 : targetPos
      )
      
      // Update position tracking
      const movedItem = currentPositions.splice(currentPos, 1)[0]
      currentPositions.splice(targetPos, 0, movedItem)
    }
  }
  
  return { message: 'Playlist shuffled successfully', trackCount: tracks.length }
}