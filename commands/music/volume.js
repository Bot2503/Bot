const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');
const { createVolumeButtons } = require('../../utils/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set or view the current volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setMinValue(0)
                .setMaxValue(100)
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

        const volume = interaction.options.getInteger('level');

        // If no volume specified, show current volume
        if (volume === null) {
            const currentVolume = queue.node.volume;
            const volumeBar = '█'.repeat(Math.floor(currentVolume / 10)) + '░'.repeat(10 - Math.floor(currentVolume / 10));
            
            await interaction.reply({
                embeds: [{
                    color: 0x5865F2,
                    title: '🔊 Current Volume',
                    description: `Volume: **${currentVolume}%**\n\`${volumeBar}\``,
                    timestamp: new Date()
                }],
                components: [createVolumeButtons()]
            });
            return;
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
            queue.node.setVolume(volume);
            
            const volumeEmoji = volume === 0 ? '🔇' : volume < 30 ? '🔉' : '🔊';
            const volumeBar = '█'.repeat(Math.floor(volume / 10)) + '░'.repeat(10 - Math.floor(volume / 10));

            await interaction.reply({
                embeds: [createSuccessEmbed(
                    `${volumeEmoji} Volume set to ${volume}%`,
                    `\`${volumeBar}\``
                )]
            });
        } catch (error) {
            console.error('Volume command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to set volume!', error.message)],
                ephemeral: true
            });
        }
    }
};
