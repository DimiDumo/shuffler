'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { SpotifyPlaylist } from '@/types/spotify'
import SearchBar from './SearchBar'
import FilterChips from './FilterChips'
import { Play, Users, Clock } from 'lucide-react'

interface PlaylistSelectorProps {
  onSelect: (playlist: SpotifyPlaylist) => void
  selected: SpotifyPlaylist | null
}

export default function PlaylistSelector({ onSelect, selected }: PlaylistSelectorProps) {
  const [allPlaylists, setAllPlaylists] = useState<SpotifyPlaylist[]>([])
  const [displayedPlaylists, setDisplayedPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const playlistRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  useEffect(() => {
    fetchPlaylists()
  }, [])
  
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAllPlaylists(data)
      setDisplayedPlaylists(data)
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter playlists based on search query
  const searchFilteredPlaylists = useMemo(() => {
    if (!searchQuery) return displayedPlaylists
    
    return displayedPlaylists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.owner.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [displayedPlaylists, searchQuery])

  // Sort playlists based on selected sort option
  const sortedPlaylists = useMemo(() => {
    const sorted = [...searchFilteredPlaylists]
    
    switch (sortBy) {
      case 'tracks':
        return sorted.sort((a, b) => b.track_count - a.track_count)
      case 'recent':
        // Sort by name since added_at is not available for playlists
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [searchFilteredPlaylists, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filteredPlaylists: SpotifyPlaylist[]) => {
    setDisplayedPlaylists(filteredPlaylists)
  }

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption)
  }

  // Auto-scroll to selected playlist
  const scrollToPlaylist = useCallback((playlistId: string) => {
    const element = playlistRefs.current[playlistId]
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }, [])

  // Handle playlist selection with auto-scroll
  const handlePlaylistSelect = useCallback((playlist: SpotifyPlaylist) => {
    onSelect(playlist)
    // Small delay to ensure the UI has updated before scrolling
    setTimeout(() => {
      scrollToPlaylist(playlist.id)
    }, 100)
  }, [onSelect, scrollToPlaylist])

  const formatPlaylistMeta = (playlist: SpotifyPlaylist) => {
    const parts = []
    parts.push(`${playlist.track_count} tracks`)
    if (playlist.owner !== 'You') parts.push(`by ${playlist.owner}`)
    return parts.join(' • ')
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Playlist</h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder="Search playlists by name or owner..." />
        </div>

        {/* Filter Chips */}
        <FilterChips 
          playlists={allPlaylists}
          onFilter={handleFilter}
          onSort={handleSort}
        />
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedPlaylists.length} of {allPlaylists.length} playlists
        </p>
        {selected && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
            <Play className="w-4 h-4 mr-1" />
            {selected.name} selected
          </div>
        )}
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto px-2 py-2 custom-scrollbar">
        {sortedPlaylists.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? `No playlists found matching "${searchQuery}"` : 'No playlists found'}
          </div>
        ) : (
          sortedPlaylists.map(playlist => (
            <div
              key={playlist.id}
              ref={(el) => {
                playlistRefs.current[playlist.id] = el
              }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group ${
                  selected?.id === playlist.id 
                    ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handlePlaylistSelect(playlist)}
              >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {formatPlaylistMeta(playlist)}
                    </p>
                    
                    {/* Additional metadata */}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400 dark:text-gray-500">
                      {playlist.isOwned !== true && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          <span>Shared</span>
                        </div>
                      )}
                      {playlist.track_count > 100 && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Large</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}