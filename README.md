# Discord Music Bot

A comprehensive Discord music bot built with Discord.js v14 and discord-player, featuring full music playback capabilities, queue management, and interactive controls.

## 🎵 Features

### Basic Commands
- `/play <query>` - Play music from YouTube, Spotify, and other sources
- `/pause` - Pause the current track
- `/resume` - Resume playback
- `/skip [amount]` - Skip current track or multiple tracks
- `/stop` - Stop music and clear queue
- `/nowplaying` - Show current track information with controls
- `/queue [page]` - Display the music queue
- `/join` - Join your voice channel
- `/leave` - Leave voice channel and stop music

### Advanced Features
- `/loop <mode>` - Set loop mode (off/track/queue)
- `/shuffle` - Shuffle the queue
- `/volume [level]` - Set or view volume (0-100)
- `/seek <time>` - Seek to specific time in track
- `/remove <position>` - Remove track from queue
- `/lyrics [song]` - Get lyrics for current or specified song
- `/playlist <url>` - Play entire playlists from YouTube/Spotify
- `/247 [enable]` - Toggle 24/7 mode (stays in voice channel)

### Interactive Controls
- Music control buttons (play/pause, skip, stop, shuffle)
- Volume control buttons
- Queue pagination
- Auto-complete for search queries
- Rich embeds with track information

### Smart Features
- Auto-join voice channel when playing music
- Auto-leave when channel is empty (configurable)
- Multiple audio format support
- Playlist support (YouTube, Spotify)
- Search suggestions and auto-complete
- Progress bars and timestamps
- Error handling and user feedback

## 🚀 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- Discord bot application

### Setup Steps

1. **Clone or download the bot files**
   ```bash
   # Extract all files to your project directory
   ```

2. **Install dependencies**
   ```bash
   npm install discord.js @discordjs/voice discord-player discord-player-youtubei dotenv
   npm install --save-optional @discordjs/opus
   npm install --save-optional ffmpeg-static
   ```

3. **Create your Discord bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token
   - Enable "Message Content Intent" in bot settings

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your values:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_server_id_for_testing
   ```

5. **Deploy slash commands**
   ```bash
   node deploy-commands.js
   ```

6. **Start the bot**
   ```bash
   node index.js
   ```

## 🔧 Configuration

### Bot Permissions
The bot needs these permissions:
- Send Messages
- Use Slash Commands
- Connect (voice)
- Speak (voice)
- Use Voice Activity

### Invite Link
Generate an invite link with these permissions:
