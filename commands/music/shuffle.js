const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the music queue'),

    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.reply({
                embeds: [createErrorEmbed('No music is currently playing!')],
                ephemeral: true
            });
        }

        if (queue.tracks.size < 2) {
            return interaction.reply({
                embeds: [createErrorEmbed('Need at least 2 tracks in queue to shuffle!')],
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
            queue.tracks.shuffle();

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '🔀 Queue shuffled!',
                    `Shuffled ${queue.tracks.size} tracks`
                )]
            });
        } catch (error) {
            console.error('Shuffle command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to shuffle queue!', error.message)],
                ephemeral: true
            });
        }
    }
};
