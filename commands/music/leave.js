const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel and stop music'),

    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.connection) {
            return interaction.reply({
                embeds: [createErrorEmbed('I\'m not connected to any voice channel!')],
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
            const channelName = botChannel.name;
            const tracksRemoved = queue.tracks.size;
            
            queue.delete();

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '👋 Left voice channel!',
                    `Disconnected from **${channelName}** and removed ${tracksRemoved} tracks from queue`
                )]
            });
        } catch (error) {
            console.error('Leave command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to leave voice channel!', error.message)],
                ephemeral: true
            });
        }
    }
};
