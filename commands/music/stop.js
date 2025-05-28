const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and clear the queue'),

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

        try {
            const tracksCount = queue.tracks.size;
            queue.delete();

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '⏹️ Stopped music and cleared queue!',
                    `Removed ${tracksCount} tracks from queue`
                )]
            });
        } catch (error) {
            console.error('Stop command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to stop music!', error.message)],
                ephemeral: true
            });
        }
    }
};
