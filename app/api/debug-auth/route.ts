import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())
  
  // Get the detected URL that NextAuth would use
  const host = headers['host'] || ''
  const protocol = headers['x-forwarded-proto'] || 'https'
  const detectedUrl = `${protocol}://${host}`
  
  const debugInfo = {
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? '✓ Set' : '✗ Missing',
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
    },
    detection: {
      requestUrl: request.url,
      detectedUrl,
      expectedCallbackUrl: `${process.env.NEXTAUTH_URL || detectedUrl}/api/auth/callback/spotify`,
    },
    headers: {
      host: headers['host'],
      'x-forwarded-proto': headers['x-forwarded-proto'],
      'x-forwarded-host': headers['x-forwarded-host'],
      'x-vercel-deployment-url': headers['x-vercel-deployment-url'],
      'user-agent': headers['user-agent']?.substring(0, 50) + '...',
    },
    vercel: {
      deploymentUrl: headers['x-vercel-deployment-url'],
      region: headers['x-vercel-region'],
    }
  }
  
  return NextResponse.json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}