'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Shuffle } from 'lucide-react'
import { SpotifyPlaylist } from '@/types/spotify'

interface ShuffleButtonProps {
  playlist: SpotifyPlaylist
  onSuccess: () => void
}

export default function ShuffleButton({ playlist, onSuccess }: ShuffleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const handleShuffle = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: playlist.id })
      })
      
      if (!response.ok) throw new Error('Shuffle failed')
      
      const result = await response.json()
      setMessage(`Successfully shuffled ${result.trackCount} tracks!`)
      onSuccess()
    } catch (error) {
      console.error('Shuffle error:', error)
      setMessage('Failed to shuffle playlist')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="mt-6 space-y-4">
      <Button
        variant="primary"
        size="lg"
        onClick={handleShuffle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2"
      >
        <Shuffle className="w-5 h-5" />
        {loading ? 'Shuffling...' : 'Shuffle Playlist'}
      </Button>
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('Successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}