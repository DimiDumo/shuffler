import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlaylistTracks } from '@/lib/spotify'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const tracks = await getPlaylistTracks(session.accessToken, id)
    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Failed to fetch tracks:', error)
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}