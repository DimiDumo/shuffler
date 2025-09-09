'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { SpotifyPlaylist } from '@/types/spotify'

interface PlaylistSelectorProps {
  onSelect: (playlist: SpotifyPlaylist) => void
  selected: SpotifyPlaylist | null
}

export default function PlaylistSelector({ onSelect, selected }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPlaylists()
  }, [])
  
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div className="text-gray-600">Loading playlists...</div>
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Playlist</h2>
      <div className="grid gap-4">
        {playlists.map(playlist => (
          <Card
            key={playlist.id}
            className={`cursor-pointer transition-all ${
              selected?.id === playlist.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => onSelect(playlist)}
          >
            <div className="flex items-center p-4">
              {playlist.images[0] && (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-12 h-12 rounded mr-4"
                />
              )}
              <div>
                <h3 className="font-medium">{playlist.name}</h3>
                <p className="text-sm text-gray-600">
                  {playlist.track_count} tracks • {playlist.owner}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}