#!/usr/bin/env python3

import click
from spotify_client import SpotifyPlaylistManager

@click.group()
def cli():
    """Spotify Playlist Shuffler CLI Tool"""
    pass

@cli.command()
def login():
    """Test authentication and display user info"""
    try:
        manager = SpotifyPlaylistManager()
        user_info = manager.get_user_info()
        
        if user_info:
            print(f"✅ Successfully authenticated!")
            print(f"👤 User: {user_info['display_name']} (@{user_info['id']})")
            print(f"👥 Followers: {user_info['followers']}")
        else:
            print("❌ Authentication failed")
    except Exception as e:
        print(f"❌ Error: {e}")

@cli.command()
def playlists():
    """List all user playlists"""
    try:
        manager = SpotifyPlaylistManager()
        playlists = manager.get_user_playlists()
        
        if not playlists:
            print("No playlists found or error occurred.")
            return
        
        print(f"\n📋 Your Playlists ({len(playlists)} total):")
        print("-" * 80)
        
        for i, playlist in enumerate(playlists, 1):
            print(f"{i:3d}. {playlist['name']}")
            print(f"     👤 Owner: {playlist['owner']}")
            print(f"     🎵 Tracks: {playlist['track_count']}")
            print(f"     🆔 ID: {playlist['id']}")
            print()
    except Exception as e:
        print(f"❌ Error: {e}")

@cli.command()
@click.argument('playlist_id')
def tracks(playlist_id):
    """Display tracks from a specific playlist
    
    Usage: python main.py tracks <playlist_id>
    """
    try:
        manager = SpotifyPlaylistManager()
        
        # First get playlist info to show the name
        playlists = manager.get_user_playlists()
        playlist_name = "Unknown Playlist"
        
        for playlist in playlists:
            if playlist['id'] == playlist_id:
                playlist_name = playlist['name']
                break
        
        manager.display_playlist_tracks(playlist_id, playlist_name)
    except Exception as e:
        print(f"❌ Error: {e}")

@cli.command()
@click.option('--interactive', '-i', is_flag=True, help='Interactive playlist selection')
def show_tracks(interactive):
    """Show tracks from playlists (interactive mode available)"""
    try:
        manager = SpotifyPlaylistManager()
        
        if interactive:
            playlists = manager.get_user_playlists()
            
            if not playlists:
                print("No playlists found.")
                return
            
            print(f"\n📋 Select a playlist:")
            print("-" * 50)
            
            for i, playlist in enumerate(playlists, 1):
                print(f"{i:2d}. {playlist['name']} ({playlist['track_count']} tracks)")
            
            try:
                choice = int(input(f"\nEnter playlist number (1-{len(playlists)}): "))
                if 1 <= choice <= len(playlists):
                    selected_playlist = playlists[choice - 1]
                    manager.display_playlist_tracks(
                        selected_playlist['id'], 
                        selected_playlist['name']
                    )
                else:
                    print("Invalid selection.")
            except (ValueError, KeyboardInterrupt):
                print("Operation cancelled.")
        else:
            print("Use --interactive flag for interactive mode, or 'tracks <playlist_id>' for direct access.")
    except Exception as e:
        print(f"❌ Error: {e}")

@cli.command()
@click.argument('playlist_name', default='shuffler')
def shuffle(playlist_name):
    """Shuffle a playlist using Fisher-Yates algorithm while preserving added dates
    
    Usage: 
        python main.py shuffle              # Shuffles 'shuffler' playlist
        python main.py shuffle "My Playlist"  # Shuffles specified playlist
    """
    try:
        manager = SpotifyPlaylistManager()
        success = manager.shuffle_playlist(playlist_name)
        
        if success:
            print(f"\n🎉 Successfully shuffled '{playlist_name}' playlist!")
        else:
            print(f"\n❌ Failed to shuffle playlist '{playlist_name}'")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    cli()