#!/usr/bin/env python3

import os
import webbrowser
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

def manual_spotify_auth():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET') 
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
    
    print("🎵 Manual Spotify Authentication")
    print("=" * 50)
    
    # Create auth manager
    scope = "playlist-read-private playlist-modify-public playlist-modify-private"
    auth_manager = SpotifyOAuth(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
        scope=scope,
        cache_path=".cache-manual"
    )
    
    # Get authorization URL
    auth_url = auth_manager.get_authorize_url()
    
    print(f"📋 Step 1: Copy this URL into any browser:")
    print(f"🔗 {auth_url}")
    print()
    print(f"📋 Step 2: After authorizing, you'll be redirected to:")
    print(f"   {redirect_uri}?code=...")
    print()
    print(f"📋 Step 3: Copy the ENTIRE callback URL and paste it below")
    print()
    
    # Get callback URL from user
    callback_url = input("Paste the full callback URL here: ").strip()
    
    try:
        # Extract the authorization code
        if '?code=' in callback_url:
            auth_code = callback_url.split('?code=')[1].split('&')[0]
            print(f"✅ Found authorization code: {auth_code[:20]}...")
            
            # Exchange code for token
            token_info = auth_manager.get_access_token(auth_code, as_dict=True)
            
            if token_info:
                print("✅ Successfully obtained access token!")
                
                # Test the token
                sp = spotipy.Spotify(auth_manager=auth_manager)
                user = sp.current_user()
                
                print(f"👤 Logged in as: {user['display_name']} (@{user['id']})")
                print(f"👥 Followers: {user['followers']['total']}")
                
                # Test listing playlists
                playlists = sp.current_user_playlists(limit=5)
                print(f"\n📋 Your first 5 playlists:")
                for i, playlist in enumerate(playlists['items'], 1):
                    print(f"  {i}. {playlist['name']} ({playlist['tracks']['total']} tracks)")
                
                print(f"\n✅ Authentication successful! Token cached in .cache-manual")
                return True
            else:
                print("❌ Failed to get access token")
                return False
        else:
            print("❌ No authorization code found in URL")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    manual_spotify_auth()