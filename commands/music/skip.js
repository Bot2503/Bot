const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of tracks to skip (default: 1)')
                .setMinValue(1)
                .setMaxValue(10)
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

        const skipAmount = interaction.options.getInteger('amount') || 1;

        if (skipAmount > queue.tracks.size + 1) {
            return interaction.reply({
                embeds: [createErrorEmbed(`Cannot skip ${skipAmount} tracks. Only ${queue.tracks.size + 1} tracks available.`)],
                ephemeral: true
            });
        }

        try {
            const currentTrack = queue.currentTrack;
            
            if (skipAmount === 1) {
                queue.node.skip();
                await interaction.reply({
                    embeds: [createSuccessEmbed(
                        '⏭️ Skipped track!',
                        `Skipped: **${currentTrack.title}**`
                    )]
                });
            } else {
                // Skip multiple tracks
                for (let i = 0; i < skipAmount - 1; i++) {
                    if (queue.tracks.size > 0) {
                        queue.node.skip();
                    }
                }
                queue.node.skip();
                
                await interaction.reply({
                    embeds: [createSuccessEmbed(
                        `⏭️ Skipped ${skipAmount} tracks!`,
                        `Starting from: **${currentTrack.title}**`
                    )]
                });
            }
        } catch (error) {
            console.error('Skip command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to skip track!', error.message)],
                ephemeral: true
            });
        }
    }
};
