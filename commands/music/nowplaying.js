const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createNowPlayingEmbed } = require('../../utils/embeds');
const { createMusicControlButtons } = require('../../utils/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing track')
        .addBooleanOption(option =>
            option.setName('controls')
                .setDescription('Show music control buttons (default: true)')
        ),

    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.reply({
                embeds: [createErrorEmbed('No music is currently playing!')],
                ephemeral: true
            });
        }

        const showControls = interaction.options.getBoolean('controls') ?? true;
        const currentTrack = queue.currentTrack;

        try {
            const embed = createNowPlayingEmbed(currentTrack, queue);
            
            // Add additional queue information
            embed.fields.push(
                {
                    name: 'Volume',
                    value: `${queue.node.volume}%`,
                    inline: true
                },
                {
                    name: 'Loop Mode',
                    value: queue.repeatMode === 0 ? 'Off' : 
                           queue.repeatMode === 1 ? 'Track' : 'Queue',
                    inline: true
                },
                {
                    name: 'Filters',
                    value: queue.filters.ffmpeg.filters.length > 0 ? 
                           queue.filters.ffmpeg.filters.join(', ') : 'None',
                    inline: true
                }
            );

            const response = {
                embeds: [embed]
            };

            if (showControls) {
                response.components = [createMusicControlButtons()];
            }

            await interaction.reply(response);
        } catch (error) {
            console.error('Now playing command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to get current track information!', error.message)],
                ephemeral: true
            });
        }
    }
};
