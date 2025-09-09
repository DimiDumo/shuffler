import random
from spotify_auth import SpotifyAuthenticator

class SpotifyPlaylistManager:
    def __init__(self):
        self.auth = SpotifyAuthenticator()
        self.sp = self.auth.get_spotify_client()
        
    def get_user_playlists(self):
        """Get all playlists for the current user"""
        try:
            playlists = []
            results = self.sp.current_user_playlists(limit=50)
            
            while results:
                for playlist in results['items']:
                    playlists.append({
                        'id': playlist['id'],
                        'name': playlist['name'],
                        'track_count': playlist['tracks']['total'],
                        'owner': playlist['owner']['display_name']
                    })
                
                if results['next']:
                    results = self.sp.next(results)
                else:
                    break
            
            return playlists
        except Exception as e:
            print(f"Error fetching playlists: {e}")
            return []
    
    def get_playlist_tracks(self, playlist_id):
        """Get all tracks from a specific playlist"""
        try:
            tracks = []
            results = self.sp.playlist_tracks(playlist_id, limit=100)
            
            while results:
                for item in results['items']:
                    if item['track'] and item['track']['type'] == 'track':
                        track = item['track']
                        artists = ', '.join([artist['name'] for artist in track['artists']])
                        tracks.append({
                            'id': track['id'],
                            'name': track['name'],
                            'artists': artists,
                            'album': track['album']['name'],
                            'duration_ms': track['duration_ms'],
                            'added_at': item['added_at']
                        })
                
                if results['next']:
                    results = self.sp.next(results)
                else:
                    break
            
            return tracks
        except Exception as e:
            print(f"Error fetching playlist tracks: {e}")
            return []
    
    def display_playlist_tracks(self, playlist_id, playlist_name):
        """Display all tracks in a playlist"""
        print(f"\n🎵 Tracks in '{playlist_name}':")
        print("-" * 80)
        
        tracks = self.get_playlist_tracks(playlist_id)
        
        if not tracks:
            print("No tracks found or error occurred.")
            return
        
        for i, track in enumerate(tracks, 1):
            duration_min = track['duration_ms'] // 60000
            duration_sec = (track['duration_ms'] % 60000) // 1000
            print(f"{i:3d}. {track['name']} - {track['artists']}")
            print(f"     Album: {track['album']} | Duration: {duration_min}:{duration_sec:02d}")
            print(f"     Added: {track['added_at'][:10]}")
            print()
        
        print(f"Total tracks: {len(tracks)}")
    
    def get_user_info(self):
        """Get current user information"""
        return self.auth.get_user_info(self.sp)
    
    def find_playlist_by_name(self, playlist_name):
        """Find a playlist by name (case insensitive)"""
        playlists = self.get_user_playlists()
        for playlist in playlists:
            if playlist['name'].lower() == playlist_name.lower():
                return playlist
        return None
    
    def fisher_yates_shuffle(self, items):
        """Fisher-Yates shuffle algorithm"""
        shuffled = list(range(len(items)))
        for i in range(len(shuffled) - 1, 0, -1):
            j = random.randint(0, i)
            shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
        return shuffled
    
    def shuffle_playlist(self, playlist_name):
        """Shuffle a playlist using Fisher-Yates algorithm while preserving added_at dates"""
        print(f"🔍 Looking for playlist: {playlist_name}")
        
        playlist = self.find_playlist_by_name(playlist_name)
        if not playlist:
            print(f"❌ Playlist '{playlist_name}' not found")
            return False
            
        playlist_id = playlist['id']
        print(f"✅ Found playlist: {playlist['name']} ({playlist['track_count']} tracks)")
        
        # Get current tracks
        tracks = self.get_playlist_tracks(playlist_id)
        if len(tracks) < 2:
            print("❌ Playlist needs at least 2 tracks to shuffle")
            return False
            
        print(f"\n🎲 Shuffling {len(tracks)} tracks...")
        
        # Show original order (first few tracks)
        print("\n📋 Original order (first 5 tracks):")
        for i, track in enumerate(tracks[:5]):
            print(f"  {i+1}. {track['name']} - {track['artists']}")
        if len(tracks) > 5:
            print(f"  ... and {len(tracks) - 5} more tracks")
            
        # Generate shuffled order using Fisher-Yates
        shuffled_indices = self.fisher_yates_shuffle(tracks)
        
        # Apply the shuffle using Spotify's reorder API
        try:
            # Simple approach: move each track to its final position
            # We work backwards to avoid position shifting issues
            current_positions = list(range(len(tracks)))
            
            for target_pos in range(len(shuffled_indices) - 1, -1, -1):
                desired_original_index = shuffled_indices[target_pos]
                current_pos = current_positions.index(desired_original_index)
                
                if current_pos != target_pos:
                    # Move track from current_pos to target_pos
                    self.sp.playlist_reorder_items(
                        playlist_id=playlist_id,
                        range_start=current_pos,
                        insert_before=target_pos + (1 if target_pos > current_pos else 0)
                    )
                    # Update our tracking of positions
                    moved_item = current_positions.pop(current_pos)
                    current_positions.insert(target_pos, moved_item)
                    
            print("✅ Playlist shuffled successfully!")
            
            # Show new order (first few tracks)
            new_tracks = self.get_playlist_tracks(playlist_id)
            print("\n📋 New order (first 5 tracks):")
            for i, track in enumerate(new_tracks[:5]):
                print(f"  {i+1}. {track['name']} - {track['artists']}")
            if len(new_tracks) > 5:
                print(f"  ... and {len(new_tracks) - 5} more tracks")
                
            print(f"\n💡 The 'added at' dates have been preserved!")
            return True
            
        except Exception as e:
            print(f"❌ Error shuffling playlist: {e}")
            return False