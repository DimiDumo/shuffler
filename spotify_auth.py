import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv

load_dotenv()

class SpotifyAuthenticator:
    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8080/callback')
        
        
        if not self.client_id or not self.client_secret:
            raise ValueError("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env file")
            
        if self.client_id == 'your_client_id_here' or self.client_secret == 'your_client_secret_here':
            raise ValueError("Please replace placeholder values in .env file with your actual Spotify app credentials")
        
        self.scope = "playlist-read-private playlist-modify-public playlist-modify-private"
        
    def get_spotify_client(self):
        """Create and return an authenticated Spotify client"""
        auth_manager = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope,
            cache_path=".cache"
        )
        
        return spotipy.Spotify(auth_manager=auth_manager)
    
    def get_user_info(self, sp):
        """Get current user's information"""
        try:
            user = sp.current_user()
            return {
                'id': user['id'],
                'display_name': user.get('display_name', 'Unknown'),
                'followers': user['followers']['total']
            }
        except Exception as e:
            print(f"Error getting user info: {e}")
            return None