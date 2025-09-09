import { NextAuthOptions } from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

const scopes = [
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ')

// Debug logging for environment variables
console.log('[AUTH DEBUG] Environment variables:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? '✓ Set' : '✗ Missing',
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing'
})

export const authOptions: NextAuthOptions = {
  debug: true, // Enable NextAuth debug logging
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { 
          scope: scopes
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      console.log('[AUTH DEBUG] JWT callback:', { 
        hasAccount: !!account, 
        accountProvider: account?.provider,
        tokenKeys: Object.keys(token || {})
      })
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      console.log('[AUTH DEBUG] Session callback:', {
        sessionUser: session.user?.email,
        hasAccessToken: !!token.accessToken
      })
      session.accessToken = token.accessToken as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      console.log('[AUTH DEBUG] Sign in event:', { 
        userId: user.id, 
        provider: account?.provider,
        profileId: (profile as { id?: string })?.id 
      })
    },
    signOut: async () => {
      console.log('[AUTH DEBUG] Sign out event')
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}