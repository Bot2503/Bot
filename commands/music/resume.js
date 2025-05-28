const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused music'),

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

        if (!queue.node.isPaused()) {
            return interaction.reply({
                embeds: [createErrorEmbed('Music is not paused!')],
                ephemeral: true
            });
        }

        try {
            queue.node.resume();
            await interaction.reply({
                embeds: [createSuccessEmbed('▶️ Music resumed!')]
            });
        } catch (error) {
            console.error('Resume command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to resume music!', error.message)],
                ephemeral: true
            });
        }
    }
};
