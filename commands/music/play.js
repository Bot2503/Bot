const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube, Spotify, or other sources')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, artist, or URL')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        
        if (focusedValue.length < 2) {
            return interaction.respond([]);
        }

        try {
            const player = useMainPlayer();
            const results = await player.search(focusedValue, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            const choices = results.tracks.slice(0, 25).map(track => ({
                name: `${track.title} - ${track.author}`.substring(0, 100),
                value: track.url || track.title
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction, client) {
        await interaction.deferReply();

        const player = useMainPlayer();
        const query = interaction.options.getString('query');
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
            const searchResult = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply({
                    embeds: [createErrorEmbed('No results found for your search!')]
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

            // Add tracks to queue
            if (searchResult.playlist) {
                queue.addTrack(searchResult.tracks);
                await interaction.editReply({
                    embeds: [createSuccessEmbed(
                        `Added playlist to queue!`,
                        `**${searchResult.playlist.title}** with ${searchResult.tracks.length} tracks`
                    )]
                });
            } else {
                queue.addTrack(searchResult.tracks[0]);
                await interaction.editReply({
                    embeds: [createSuccessEmbed(
                        `Added to queue!`,
                        `**${searchResult.tracks[0].title}** by ${searchResult.tracks[0].author}`
                    )]
                });
            }

            // Start playing if not already playing
            if (!queue.node.isPlaying()) {
                await queue.node.play();
            }

        } catch (error) {
            console.error('Play command error:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed(
                    'Failed to play music!',
                    error.message
                )]
            });
        }
    }
};
