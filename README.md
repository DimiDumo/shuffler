# Spotify Playlist Shuffler

A CLI tool to shuffle Spotify playlists using the Fisher-Yates algorithm while preserving the "date added" field. Perfect for refreshing long playlists without losing the original add dates.

## Features

- 🎲 **True Random Shuffle**: Uses Fisher-Yates algorithm for proper randomization
- 📅 **Preserves Date Added**: Shuffles tracks in-place without changing "date added" timestamps
- 🎵 **Any Playlist**: Works with any of your playlists, defaults to "shuffler"
- 🔐 **Secure Authentication**: OAuth 2.0 flow with Spotify
- 📋 **Track Management**: List playlists and view track details

## Setup

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create an App"**
3. Fill in the details:
   - **App name**: `Playlist Shuffler` (or any name you prefer)
   - **App description**: `CLI tool to shuffle playlists`
   - **Redirect URI**: `http://127.0.0.1:8080/callback` ⚠️ **Important: Use 127.0.0.1, not localhost**
4. Click **"Create"**
5. Note down your **Client ID** and **Client Secret**

### 2. Configure Environment

1. Clone/download this project
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your Spotify app credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/callback
   ```

### 3. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Authentication
First, test your authentication:
```bash
python main.py login
```

### List Your Playlists
```bash
python main.py playlists
```

### Shuffle a Playlist
```bash
# Shuffle the default "shuffler" playlist
python main.py shuffle

# Shuffle a specific playlist by name
python main.py shuffle "My Playlist Name"
```

### View Playlist Tracks
```bash
# Interactive playlist selection
python main.py show-tracks --interactive

# Show tracks from specific playlist ID
python main.py tracks <playlist_id>
```

## Important Notes

### Why 127.0.0.1 instead of localhost?

As of 2024, Spotify has security restrictions that block `localhost` in redirect URIs, but `127.0.0.1` (loopback IP) is still allowed. This is why the setup specifically requires:
- ✅ `http://127.0.0.1:8080/callback` - Works
- ❌ `http://localhost:8080/callback` - Blocked by Spotify

### How the Shuffle Works

1. **Fetches** all tracks from your playlist
2. **Generates** a random order using Fisher-Yates shuffle algorithm
3. **Reorders** tracks using Spotify's API without deleting/re-adding them
4. **Preserves** all original "date added" timestamps

The key is using Spotify's `playlist_reorder_items` endpoint instead of removing and re-adding tracks, which would update the "date added" field.

## Troubleshooting

### "INVALID_CLIENT" Error
- Verify your Client ID and Client Secret in `.env`
- Ensure redirect URI is exactly `http://127.0.0.1:8080/callback`
- Check that your Spotify app settings match your `.env` file

### "Playlist not found" Error
- Playlist names are case-sensitive (though search is case-insensitive)
- Check for extra spaces in playlist names
- Use `python main.py playlists` to see exact names

### Authentication Issues
- Try deleting the `.cache` file and re-authenticating
- Ensure you have proper scopes (handled automatically)
- Check that your Spotify app has the correct redirect URI

## Example Session

```bash
$ python main.py shuffle
🔍 Looking for playlist: shuffler
✅ Found playlist: shuffler (25 tracks)

🎲 Shuffling 25 tracks...

📋 Original order (first 5 tracks):
  1. Track A - Artist 1
  2. Track B - Artist 2
  3. Track C - Artist 3
  4. Track D - Artist 4
  5. Track E - Artist 5
  ... and 20 more tracks

✅ Playlist shuffled successfully!

📋 New order (first 5 tracks):
  1. Track C - Artist 3
  2. Track A - Artist 1
  3. Track E - Artist 5
  4. Track D - Artist 4
  5. Track B - Artist 2
  ... and 20 more tracks

💡 The 'added at' dates have been preserved!

🎉 Successfully shuffled 'shuffler' playlist!
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `login` | Test authentication and show user info |
| `playlists` | List all your playlists with details |
| `shuffle [name]` | Shuffle playlist (defaults to "shuffler") |
| `tracks <id>` | Show tracks from playlist by ID |
| `show-tracks -i` | Interactive playlist track viewer |

## Requirements

- Python 3.7+
- Spotify Premium account (recommended for full API access)
- Active internet connection
- Spotify Developer App credentials

## License

This project is for educational and personal use. Spotify's terms of service apply to all API usage.