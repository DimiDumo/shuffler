'use client'
import { useState, useEffect } from 'react'
import { SpotifyTrack } from '@/types/spotify'

interface TrackListProps {
  playlistId: string
}

export default function TrackList({ playlistId }: TrackListProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (playlistId) {
      fetchTracks()
    }
  }, [playlistId])
  
  const fetchTracks = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/playlists/${playlistId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTracks(data)
    } catch (error) {
      console.error('Failed to fetch tracks:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  if (loading) return <div className="text-gray-600">Loading tracks...</div>
  if (!tracks.length) return null
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tracks ({tracks.length})</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
            <tr className="text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              <th className="p-4">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Artist</th>
              <th className="p-4">Album</th>
              <th className="p-4">Duration</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={track.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                <td className="p-4 font-medium">{track.name}</td>
                <td className="p-4 text-sm text-gray-600">{track.artists}</td>
                <td className="p-4 text-sm text-gray-600">{track.album}</td>
                <td className="p-4 text-sm text-gray-600">{formatDuration(track.duration_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}