#!/usr/bin/env python3

import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

def debug_spotify_auth():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
    
    print("🔧 Debug Authentication Setup:")
    print(f"   Client ID: {client_id}")
    print(f"   Client Secret: {client_secret[:8]}...")
    print(f"   Redirect URI: {redirect_uri}")
    print()
    
    # Test different redirect URIs to see which one works
    test_uris = [
        redirect_uri,
        "http://localhost:8080/callback",
        "http://localhost:8888/callback",
        "http://127.0.0.1:8080/callback"
    ]
    
    for uri in test_uris:
        print(f"🧪 Testing redirect URI: {uri}")
        try:
            auth_manager = SpotifyOAuth(
                client_id=client_id,
                client_secret=client_secret,
                redirect_uri=uri,
                scope="playlist-read-private",
                cache_path=f".cache-{uri.split('/')[-2]}"  # Different cache for each URI
            )
            
            # Get the authorization URL
            auth_url = auth_manager.get_authorize_url()
            print(f"✅ Auth URL generated successfully")
            print(f"   URL: {auth_url[:80]}...")
            print(f"   Try this URL: {auth_url}")
            print()
            break
            
        except Exception as e:
            print(f"❌ Failed: {e}")
            print()
            continue
    
    print("\n📋 Next Steps:")
    print("1. Make sure your Spotify App settings at https://developer.spotify.com/dashboard have:")
    print(f"   - Redirect URI: {redirect_uri}")
    print("2. Copy and paste the working auth URL above into your browser")
    print("3. After authorizing, copy the full callback URL from your browser")
    print("4. The callback URL should look like: http://localhost:8080/callback?code=...")

if __name__ == '__main__':
    debug_spotify_auth()