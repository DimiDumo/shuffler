import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fisherYatesShuffle, reorderPlaylist } from '@/lib/shuffle'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { playlistId } = await request.json()
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const result = await reorderPlaylist(
      session.accessToken,
      playlistId,
      fisherYatesShuffle
    )
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Shuffle failed:', error)
    return NextResponse.json({ error: 'Shuffle failed' }, { status: 500 })
  }
}