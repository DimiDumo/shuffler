'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import PlaylistSelector from '@/components/PlaylistSelector'
import TrackList from '@/components/TrackList'
import FloatingShuffleButton from '@/components/FloatingShuffleButton'
import { SpotifyPlaylist } from '@/types/spotify'
import { Music } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [refreshTracks, setRefreshTracks] = useState(0)
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Spotify Playlist Shuffler
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome back, {session.user?.name}
                  </p>
                </div>
              </div>
              
              {selectedPlaylist && (
                <div className="hidden md:block bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Ready to shuffle &ldquo;{selectedPlaylist.name}&rdquo;
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {selectedPlaylist.track_count} tracks • Use the floating button to shuffle
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Playlist Selection - Takes 2 columns on XL screens */}
            <div className="xl:col-span-2">
              <PlaylistSelector 
                onSelect={setSelectedPlaylist}
                selected={selectedPlaylist}
              />
            </div>
            
            {/* Track List - Takes 1 column on XL screens */}
            <div className="xl:col-span-1">
              {selectedPlaylist ? (
                <div className="sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tracks in &ldquo;{selectedPlaylist.name}&rdquo;
                  </h3>
                  <TrackList key={refreshTracks} playlistId={selectedPlaylist.id} />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Playlist
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Choose a playlist from the left to view its tracks and shuffle them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Shuffle Button */}
      <FloatingShuffleButton 
        playlist={selectedPlaylist}
        onSuccess={() => setRefreshTracks(prev => prev + 1)}
      />
    </>
  )
}