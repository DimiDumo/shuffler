'use client'
import { useState } from 'react'
import { Shuffle, Check, X } from 'lucide-react'
import { SpotifyPlaylist } from '@/types/spotify'

interface FloatingShuffleButtonProps {
  playlist: SpotifyPlaylist | null
  onSuccess: () => void
}

export default function FloatingShuffleButton({ playlist, onSuccess }: FloatingShuffleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)

  if (!playlist) return null

  const handleShuffle = async () => {
    setLoading(true)
    setMessage('')
    setShowMessage(false)
    
    try {
      const response = await fetch('/api/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: playlist.id })
      })
      
      if (!response.ok) throw new Error('Shuffle failed')
      
      const result = await response.json()
      setMessage(`Successfully shuffled ${result.trackCount} tracks!`)
      setShowMessage(true)
      onSuccess()
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowMessage(false)
      }, 3000)
    } catch (error) {
      console.error('Shuffle error:', error)
      setMessage('Failed to shuffle playlist')
      setShowMessage(true)
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setShowMessage(false)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleShuffle}
          disabled={loading}
          className={`
            group relative w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 hover:scale-110 active:scale-95'
            }
          `}
        >
          <div className="flex items-center justify-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shuffle className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
              Shuffle &ldquo;{playlist.name}&rdquo;
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Message Toast */}
      {showMessage && (
        <div className="fixed bottom-24 right-6 z-50 max-w-sm">
          <div className={`
            p-4 rounded-lg shadow-lg transition-all duration-300 transform
            ${message.includes('Successfully')
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.includes('Successfully') ? (
                  <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
              <button
                onClick={() => setShowMessage(false)}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}