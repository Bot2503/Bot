const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the current track or search for a song')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song to search lyrics for (leave empty for current track)')
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);
        const songQuery = interaction.options.getString('song');

        let searchQuery;

        if (songQuery) {
            searchQuery = songQuery;
        } else if (queue && queue.currentTrack) {
            searchQuery = `${queue.currentTrack.author} ${queue.currentTrack.title}`;
        } else {
            return interaction.editReply({
                embeds: [createErrorEmbed('No song specified and no music is currently playing!')]
            });
        }

        try {
            // Use a lyrics API service
            const lyrics = await searchLyrics(searchQuery);
            
            if (!lyrics) {
                return interaction.editReply({
                    embeds: [createErrorEmbed(
                        'No lyrics found!',
                        `Could not find lyrics for: **${searchQuery}**`
                    )]
                });
            }

            // Split lyrics if too long for Discord embed
            const maxLength = 4096;
            if (lyrics.text.length <= maxLength) {
                const embed = {
                    color: 0x5865F2,
                    title: `🎵 Lyrics: ${lyrics.title}`,
                    description: lyrics.text,
                    footer: {
                        text: `Artist: ${lyrics.artist} | Source: ${lyrics.source || 'Unknown'}`
                    },
                    timestamp: new Date()
                };

                await interaction.editReply({ embeds: [embed] });
            } else {
                // Split into multiple embeds
                const chunks = splitText(lyrics.text, maxLength - 200); // Leave room for title and footer
                
                for (let i = 0; i < chunks.length; i++) {
                    const embed = {
                        color: 0x5865F2,
                        title: i === 0 ? `🎵 Lyrics: ${lyrics.title}` : `🎵 Lyrics: ${lyrics.title} (Part ${i + 1})`,
                        description: chunks[i],
                        footer: {
                            text: `Artist: ${lyrics.artist} | Part ${i + 1}/${chunks.length} | Source: ${lyrics.source || 'Unknown'}`
                        },
                        timestamp: new Date()
                    };

                    if (i === 0) {
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        await interaction.followUp({ embeds: [embed] });
                    }
                }
            }
        } catch (error) {
            console.error('Lyrics command error:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed(
                    'Failed to fetch lyrics!',
                    'There was an error searching for lyrics. Please try again later.'
                )]
            });
        }
    }
};

async function searchLyrics(query) {
    try {
        // Using Genius API (requires GENIUS_API_KEY environment variable)
        const geniusApiKey = process.env.GENIUS_API_KEY;
        
        if (!geniusApiKey) {
            // Fallback to a free lyrics API
            const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.lyrics) {
                return {
                    title: query,
                    artist: 'Unknown',
                    text: data.lyrics.trim(),
                    source: 'lyrics.ovh'
                };
            }
            return null;
        }

        // Use Genius API if available
        const searchResponse = await fetch(
            `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Authorization': `Bearer ${geniusApiKey}`
                }
            }
        );

        const searchData = await searchResponse.json();
        
        if (!searchData.response.hits.length) {
            return null;
        }

        const song = searchData.response.hits[0].result;
        
        // Note: Genius API doesn't provide lyrics directly due to licensing
        // You would need to scrape the lyrics from the song URL or use a different service
        return {
            title: song.title,
            artist: song.primary_artist.name,
            text: 'Lyrics scraping not implemented. Please visit: ' + song.url,
            source: 'Genius'
        };
        
    } catch (error) {
        console.error('Lyrics search error:', error);
        return null;
    }
}

function splitText(text, maxLength) {
    const chunks = [];
    let currentChunk = '';
    const lines = text.split('\n');

    for (const line of lines) {
        if (currentChunk.length + line.length + 1 <= maxLength) {
            currentChunk += (currentChunk ? '\n' : '') + line;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = line;
            } else {
                // Line itself is too long, split it
                chunks.push(line.substring(0, maxLength));
                currentChunk = line.substring(maxLength);
            }
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}
