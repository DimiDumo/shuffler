'use client'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Music } from 'lucide-react'

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-green-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Music className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Spotify Playlist Shuffler
          </h1>
          <p className="text-gray-600">
            Truly randomize your Spotify playlists with Fisher-Yates shuffle
          </p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
          className="w-full"
        >
          Sign in with Spotify
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to let this app manage your Spotify playlists
        </p>
      </div>
    </div>
  )
}