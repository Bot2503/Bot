const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position of the track to remove (1-based)')
                .setRequired(true)
                .setMinValue(1)
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

        // Check if user is in the same voice channel
        const memberChannel = interaction.member.voice.channel;
        const botChannel = interaction.guild.members.me.voice.channel;

        if (!memberChannel || memberChannel.id !== botChannel?.id) {
            return interaction.reply({
                embeds: [createErrorEmbed('You need to be in the same voice channel as the bot!')],
                ephemeral: true
            });
        }

        const position = interaction.options.getInteger('position');

        if (position > queue.tracks.size) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    'Invalid position!',
                    `Queue only has ${queue.tracks.size} tracks`
                )],
                ephemeral: true
            });
        }

        try {
            // Get the track before removing it
            const trackToRemove = queue.tracks.toArray()[position - 1];
            
            // Remove the track (position is 1-based, but array is 0-based)
            queue.removeTrack(position - 1);

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '🗑️ Track removed from queue!',
                    `Removed: **${trackToRemove.title}** by ${trackToRemove.author}`
                )]
            });
        } catch (error) {
            console.error('Remove command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to remove track!', error.message)],
                ephemeral: true
            });
        }
    }
};
