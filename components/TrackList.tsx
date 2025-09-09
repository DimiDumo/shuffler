'use client'
import { useState, useEffect } from 'react'
import { SpotifyTrack } from '@/types/spotify'
import { Play, Clock } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  if (!tracks.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No tracks found in this playlist</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tracks
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {tracks.length} songs
        </span>
      </div>

      {/* Track Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {tracks.map((track, index) => (
              <div 
                key={track.id} 
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  {/* Track Number */}
                  <div className="flex-shrink-0 w-6 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500 group-hover:hidden">
                      {index + 1}
                    </span>
                    <Play className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden group-hover:block" />
                  </div>

                  {/* Track Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-grow">
                        {/* Title and Artist */}
                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {track.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {track.artists}
                        </p>
                        
                        {/* Album and Duration */}
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-500 space-x-2">
                          <span className="truncate max-w-[200px]">{track.album}</span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(track.duration_ms)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary at bottom */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Total duration: {formatDuration(tracks.reduce((total, track) => total + track.duration_ms, 0))}
      </div>
    </div>
  )
}