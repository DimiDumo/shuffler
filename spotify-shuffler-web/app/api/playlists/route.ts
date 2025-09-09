import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPlaylists } from '@/lib/spotify'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const playlists = await getUserPlaylists(session.accessToken)
    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Failed to fetch playlists:', error)
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}