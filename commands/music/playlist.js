const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Play a playlist from YouTube or Spotify')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Playlist URL or name')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('shuffle')
                .setDescription('Shuffle the playlist before adding to queue')
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const player = useMainPlayer();
        const playlistQuery = interaction.options.getString('url');
        const shouldShuffle = interaction.options.getBoolean('shuffle') || false;
        const channel = interaction.member.voice.channel;

        // Check if user is in a voice channel
        if (!channel) {
            return interaction.editReply({
                embeds: [createErrorEmbed('You need to join a voice channel first!')]
            });
        }

        // Check bot permissions
        const permissions = channel.permissionsFor(interaction.client.user);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.editReply({
                embeds: [createErrorEmbed('I need permission to join and speak in your voice channel!')]
            });
        }

        try {
            const searchResult = await player.search(playlistQuery, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply({
                    embeds: [createErrorEmbed('No playlist found!')]
                });
            }

            if (!searchResult.playlist) {
                return interaction.editReply({
                    embeds: [createErrorEmbed('The provided URL is not a playlist!')]
                });
            }

            // Create or get existing queue
            const queue = player.nodes.create(interaction.guild, {
                metadata: {
                    channel: interaction.channel,
                    client: interaction.guild.members.me,
                    requestedBy: interaction.user
                },
                selfDeaf: true,
                volume: 50,
                leaveOnEmpty: true,
                leaveOnEmptyDelay: 300000,
                leaveOnEnd: true,
                leaveOnEndDelay: 300000
            });

            // Connect to voice channel if not connected
            if (!queue.connection) {
                await queue.connect(channel);
            }

            // Shuffle tracks if requested
            let tracks = searchResult.tracks;
            if (shouldShuffle) {
                tracks = shuffleArray([...tracks]);
            }

            // Add tracks to queue
            queue.addTrack(tracks);

            const embed = {
                color: 0x00ff00,
                title: '📋 Playlist Added to Queue!',
                description: `**${searchResult.playlist.title}**`,
                fields: [
                    {
                        name: 'Tracks Added',
                        value: `${tracks.length}`,
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: searchResult.playlist.estimatedDuration || 'Unknown',
                        inline: true
                    },
                    {
                        name: 'Shuffled',
                        value: shouldShuffle ? 'Yes' : 'No',
                        inline: true
                    }
                ],
                thumbnail: {
                    url: searchResult.playlist.thumbnail || tracks[0]?.thumbnail
                },
                footer: {
                    text: `Requested by ${interaction.user.tag}`,
                    icon_url: interaction.user.displayAvatarURL()
                },
                timestamp: new Date()
            };

            await interaction.editReply({ embeds: [embed] });

            // Start playing if not already playing
            if (!queue.node.isPlaying()) {
                await queue.node.play();
            }

        } catch (error) {
            console.error('Playlist command error:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed(
                    'Failed to load playlist!',
                    error.message
                )]
            });
        }
    }
};

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
