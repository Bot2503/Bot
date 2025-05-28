const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel'),

    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                embeds: [createErrorEmbed('You need to join a voice channel first!')],
                ephemeral: true
            });
        }

        // Check bot permissions
        const permissions = channel.permissionsFor(interaction.client.user);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.reply({
                embeds: [createErrorEmbed('I need permission to join and speak in your voice channel!')],
                ephemeral: true
            });
        }

        // Check if bot is already in a voice channel in this guild
        const existingQueue = player.nodes.get(interaction.guildId);
        if (existingQueue && existingQueue.connection) {
            const botChannel = interaction.guild.members.me.voice.channel;
            if (botChannel && botChannel.id === channel.id) {
                return interaction.reply({
                    embeds: [createErrorEmbed('I\'m already in your voice channel!')],
                    ephemeral: true
                });
            } else if (botChannel) {
                return interaction.reply({
                    embeds: [createErrorEmbed(`I'm already connected to <#${botChannel.id}>!`)],
                    ephemeral: true
                });
            }
        }

        try {
            // Create queue if it doesn't exist
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

            await queue.connect(channel);

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '🎵 Joined voice channel!',
                    `Connected to **${channel.name}**`
                )]
            });
        } catch (error) {
            console.error('Join command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to join voice channel!', error.message)],
                ephemeral: true
            });
        }
    }
};
