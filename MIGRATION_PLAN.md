# 🎵 Spotify Playlist Shuffler - Web Migration Plan

## Project Overview

This document outlines the complete migration strategy for converting the existing Python CLI Spotify playlist shuffler into a modern, web-based Next.js application. The goal is to maintain all existing functionality while providing a user-friendly browser interface.

## Current Python Application Analysis

### Architecture
- **Framework**: CLI-based using Click for command structure
- **Authentication**: OAuth 2.0 via spotipy library with local callback server
- **Core Features**:
  - User authentication and profile display
  - Playlist enumeration and selection
  - Track listing with metadata
  - Fisher-Yates shuffle algorithm implementation
  - Playlist reordering via Spotify Web API

### Key Files Structure
```
Current Python App/
├── main.py              # CLI interface with Click commands
├── spotify_client.py    # Playlist management and shuffle logic
├── spotify_auth.py      # OAuth authentication handler
├── requirements.txt     # Python dependencies
└── .env.example         # Environment configuration template
```

### Dependencies
- `spotipy==2.24.0` - Spotify Web API wrapper
- `python-dotenv==1.0.1` - Environment variable management
- `click==8.1.7` - CLI framework

## Proposed Next.js Web Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: NextAuth.js with Spotify provider
- **Spotify API**: spotify-web-api-node or direct fetch calls
- **Deployment**: Vercel (recommended) or similar platform

### Project Structure
```
spotify-shuffler-web/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth configuration
│   │   ├── playlists/
│   │   │   ├── route.ts              # GET user playlists
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET playlist tracks
│   │   └── shuffle/
│   │       └── route.ts              # POST shuffle playlist
│   ├── dashboard/
│   │   ├── page.tsx                  # Main application interface
│   │   └── loading.tsx               # Loading UI
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx              # Custom sign-in page
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Select.tsx
│   │   └── Toast.tsx
│   ├── PlaylistSelector.tsx          # Playlist selection interface
│   ├── TrackList.tsx                 # Virtualized track display
│   ├── ShuffleButton.tsx             # Shuffle action component
│   ├── UserProfile.tsx               # User information display
│   └── Navbar.tsx                    # Navigation component
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── spotify.ts                    # Spotify API client
│   ├── shuffle.ts                    # Shuffle algorithms
│   └── utils.ts                      # Utility functions
├── types/
│   ├── spotify.ts                    # Spotify API types
│   └── auth.ts                       # Authentication types
├── hooks/
│   ├── useSpotify.ts                 # Spotify API hook
│   └── useToast.ts                   # Toast notifications hook
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

## Implementation Details

### 1. Authentication System

#### NextAuth.js Configuration
```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

const scopes = [
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ')

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { scope: scopes }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    }
  }
}
```

#### Environment Variables
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 2. API Routes Implementation

#### Playlists Endpoint
```typescript
// app/api/playlists/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { spotifyApi } from '@/lib/spotify'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const playlists = await spotifyApi.getUserPlaylists(session.accessToken)
    return Response.json(playlists)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}
```

#### Shuffle Endpoint
```typescript
// app/api/shuffle/route.ts
import { fisherYatesShuffle } from '@/lib/shuffle'
import { reorderPlaylist } from '@/lib/spotify'

export async function POST(request: Request) {
  const { playlistId } = await request.json()
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const result = await reorderPlaylist(
      session.accessToken,
      playlistId,
      fisherYatesShuffle
    )
    return Response.json({ success: true, ...result })
  } catch (error) {
    return Response.json({ error: 'Shuffle failed' }, { status: 500 })
  }
}
```

### 3. Frontend Components

#### Main Dashboard
```typescript
// app/dashboard/page.tsx
'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import PlaylistSelector from '@/components/PlaylistSelector'
import TrackList from '@/components/TrackList'
import ShuffleButton from '@/components/ShuffleButton'

export default function Dashboard() {
  const { data: session } = useSession()
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  
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
              onSuccess={() => {/* refresh track list */}}
            />
          )}
        </div>
        
        <div>
          {selectedPlaylist && (
            <TrackList playlistId={selectedPlaylist.id} />
          )}
        </div>
      </div>
    </div>
  )
}
```

#### Playlist Selector Component
```typescript
// components/PlaylistSelector.tsx
'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface Playlist {
  id: string
  name: string
  track_count: number
  owner: string
  images: Array<{ url: string }>
}

export default function PlaylistSelector({ onSelect, selected }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPlaylists()
  }, [])
  
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Loading playlists...</div>
  
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
```

### 4. Shuffle Algorithm Implementation

#### Fisher-Yates Shuffle Port
```typescript
// lib/shuffle.ts
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
```

### 5. Spotify API Integration

#### API Client
```typescript
// lib/spotify.ts
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function spotifyFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`)
  }
  
  return response.json()
}

export async function getUserPlaylists(accessToken: string) {
  let allPlaylists = []
  let nextUrl = '/me/playlists?limit=50'
  
  while (nextUrl) {
    const data = await spotifyFetch(nextUrl, accessToken)
    allPlaylists.push(...data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      track_count: playlist.tracks.total,
      owner: playlist.owner.display_name,
      images: playlist.images
    })))
    
    nextUrl = data.next ? data.next.replace(SPOTIFY_API_BASE, '') : null
  }
  
  return allPlaylists
}

export async function getPlaylistTracks(accessToken: string, playlistId: string) {
  let allTracks = []
  let nextUrl = `/playlists/${playlistId}/tracks?limit=100`
  
  while (nextUrl) {
    const data = await spotifyFetch(nextUrl, accessToken)
    const tracks = data.items
      .filter(item => item.track && item.track.type === 'track')
      .map(item => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        duration_ms: item.track.duration_ms,
        added_at: item.added_at
      }))
    
    allTracks.push(...tracks)
    nextUrl = data.next ? data.next.replace(SPOTIFY_API_BASE, '') : null
  }
  
  return allTracks
}
```

## Migration Steps

### Phase 1: Project Setup
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest spotify-shuffler-web --typescript --tailwind --app
   cd spotify-shuffler-web
   ```

2. **Install Dependencies**
   ```bash
   npm install next-auth @auth/spotify-provider
   npm install @types/node @types/react @types/react-dom
   npm install lucide-react # for icons
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Update Spotify app settings with new redirect URI: `http://localhost:3000/api/auth/callback/spotify`

### Phase 2: Authentication Implementation
1. Set up NextAuth.js configuration
2. Create authentication pages and middleware
3. Test OAuth flow with Spotify
4. Implement session management and token refresh

### Phase 3: API Development
1. Create API routes for playlists, tracks, and shuffle operations
2. Port Spotify API integration from Python
3. Implement error handling and validation
4. Test all endpoints with authenticated requests

### Phase 4: Frontend Development
1. Build core UI components (PlaylistSelector, TrackList, ShuffleButton)
2. Implement main dashboard page
3. Add loading states and error boundaries
4. Integrate API calls with React hooks
5. Implement responsive design

### Phase 5: Algorithm Implementation
1. Port Fisher-Yates shuffle algorithm to TypeScript
2. Implement playlist reordering logic
3. Add shuffle progress tracking
4. Test with various playlist sizes

### Phase 6: Enhancement & Polish
1. Add toast notifications for user feedback
2. Implement dark/light theme toggle
3. Add shuffle history and undo functionality
4. Optimize performance for large playlists
5. Add accessibility features (ARIA labels, keyboard navigation)

### Phase 7: Testing & Deployment
1. Test with multiple Spotify accounts and playlist types
2. Test error scenarios (network failures, token expiration)
3. Deploy to Vercel or preferred platform
4. Update Spotify app redirect URI for production
5. Test production deployment thoroughly

## Additional Features (Future Enhancements)

### Advanced Shuffle Options
- **Weighted Shuffle**: Favor recently added or frequently played tracks
- **Artist Separation**: Prevent consecutive tracks from same artist
- **Genre Mixing**: Distribute genres evenly throughout playlist
- **Tempo-based Shuffle**: Order by BPM for workout playlists

### Social Features
- **Share Shuffles**: Generate shareable links for shuffle patterns
- **Collaborative Shuffling**: Let multiple users vote on track order
- **Shuffle History**: Track and replay previous shuffle configurations

### Playlist Management
- **Batch Operations**: Shuffle multiple playlists at once
- **Backup & Restore**: Save playlist state before shuffling
- **Duplicate Detection**: Identify and handle duplicate tracks
- **Export Options**: Create new playlists from shuffled order

### Analytics & Insights
- **Shuffle Statistics**: Track shuffle frequency and patterns
- **Listening Analytics**: Integration with Spotify listening data
- **Playlist Health**: Analyze track diversity and balance

## Technology Alternatives

### Authentication Alternatives
- **Auth0**: More comprehensive auth solution
- **Firebase Auth**: Google's authentication service
- **Custom JWT**: Roll your own authentication

### State Management Options
- **Zustand**: Lightweight state management
- **Redux Toolkit**: Full-featured state management
- **React Query**: Server state management

### Styling Alternatives
- **Styled Components**: CSS-in-JS solution
- **Emotion**: Another CSS-in-JS option
- **Chakra UI**: Component library with built-in themes

### Deployment Options
- **Vercel**: Optimal for Next.js (recommended)
- **Netlify**: JAMstack-focused platform
- **Railway**: Full-stack deployment platform
- **AWS Amplify**: Amazon's full-stack platform

## Performance Considerations

### Optimization Strategies
- **Server-Side Rendering**: Pre-render static content
- **API Route Caching**: Cache playlist data temporarily
- **Virtual Scrolling**: Handle large track lists efficiently
- **Image Optimization**: Use Next.js Image component for playlist covers
- **Bundle Splitting**: Load components on demand

### Monitoring & Analytics
- **Error Tracking**: Implement Sentry or similar
- **Performance Monitoring**: Use Vercel Analytics or Google Analytics
- **User Feedback**: Add feedback collection mechanisms

## Conclusion

This migration plan transforms the Python CLI application into a modern, user-friendly web application while preserving all core functionality. The Next.js architecture provides scalability, performance, and excellent developer experience. The modular design allows for easy feature additions and maintenance.

The plan prioritizes user experience with responsive design, real-time feedback, and intuitive interfaces while maintaining the robust shuffle algorithms from the original implementation.