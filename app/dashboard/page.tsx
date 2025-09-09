'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import PlaylistSelector from '@/components/PlaylistSelector'
import TrackList from '@/components/TrackList'
import ShuffleButton from '@/components/ShuffleButton'
import { SpotifyPlaylist } from '@/types/spotify'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [refreshTracks, setRefreshTracks] = useState(0)
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Spotify Playlist Shuffler</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PlaylistSelector 
            onSelect={setSelectedPlaylist}
            selected={selectedPlaylist}
          />
          {selectedPlaylist && (
            <ShuffleButton 
              playlist={selectedPlaylist}
              onSuccess={() => setRefreshTracks(prev => prev + 1)}
            />
          )}
        </div>
        
        <div>
          {selectedPlaylist && (
            <TrackList key={refreshTracks} playlistId={selectedPlaylist.id} />
          )}
        </div>
      </div>
    </div>
  )
}