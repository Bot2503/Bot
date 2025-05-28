const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing music'),

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

        if (queue.node.isPaused()) {
            return interaction.reply({
                embeds: [createErrorEmbed('Music is already paused!')],
                ephemeral: true
            });
        }

        try {
            queue.node.pause();
            await interaction.reply({
                embeds: [createSuccessEmbed('⏸️ Music paused!')]
            });
        } catch (error) {
            console.error('Pause command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to pause music!', error.message)],
                ephemeral: true
            });
        }
    }
};
