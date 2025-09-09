'use client'
import { useState } from 'react'
import { SpotifyPlaylist } from '@/types/spotify'

interface FilterChipsProps {
  playlists: SpotifyPlaylist[]
  onFilter: (filteredPlaylists: SpotifyPlaylist[]) => void
  onSort: (sortBy: string) => void
}

interface FilterOption {
  id: string
  label: string
  count?: number
}

export default function FilterChips({ playlists, onFilter, onSort }: FilterChipsProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSortBy, setActiveSortBy] = useState('name')

  // Calculate filter options with counts
  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Playlists', count: playlists.length },
    { 
      id: 'owned', 
      label: 'My Playlists', 
      count: playlists.filter(p => p.isOwned === true).length 
    },
    { 
      id: 'others', 
      label: 'Other Users', 
      count: playlists.filter(p => p.isOwned !== true).length 
    },
    { 
      id: 'large', 
      label: '50+ Tracks', 
      count: playlists.filter(p => p.track_count >= 50).length 
    }
  ]

  const sortOptions = [
    { id: 'name', label: 'Name' },
    { id: 'tracks', label: 'Track Count' },
    { id: 'recent', label: 'Recently Added' }
  ]

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    
    let filtered = [...playlists]
    
    switch (filterId) {
      case 'owned':
        filtered = playlists.filter(p => p.isOwned === true)
        break
      case 'others':
        filtered = playlists.filter(p => p.isOwned !== true)
        break
      case 'large':
        filtered = playlists.filter(p => p.track_count >= 50)
        break
      default:
        filtered = playlists
    }
    
    onFilter(filtered)
  }

  const handleSortChange = (sortBy: string) => {
    setActiveSortBy(sortBy)
    onSort(sortBy)
  }

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleFilterChange(option.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === option.id
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {option.label} {option.count !== undefined && `(${option.count})`}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
        <div className="flex gap-1">
          {sortOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                activeSortBy === option.id
                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}