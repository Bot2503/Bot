const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueueRepeatMode } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode for the queue')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )
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

        const mode = interaction.options.getString('mode');
        let repeatMode;
        let modeText;

        switch (mode) {
            case 'off':
                repeatMode = QueueRepeatMode.OFF;
                modeText = 'Off';
                break;
            case 'track':
                repeatMode = QueueRepeatMode.TRACK;
                modeText = 'Track';
                break;
            case 'queue':
                repeatMode = QueueRepeatMode.QUEUE;
                modeText = 'Queue';
                break;
            default:
                return interaction.reply({
                    embeds: [createErrorEmbed('Invalid loop mode!')],
                    ephemeral: true
                });
        }

        try {
            queue.setRepeatMode(repeatMode);

            const emoji = repeatMode === QueueRepeatMode.OFF ? '🔁' : 
                         repeatMode === QueueRepeatMode.TRACK ? '🔂' : '🔁';

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    `${emoji} Loop mode set!`,
                    `Loop mode: **${modeText}**`
                )]
            });
        } catch (error) {
            console.error('Loop command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to set loop mode!', error.message)],
                ephemeral: true
            });
        }
    }
};
