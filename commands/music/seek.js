const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a specific time in the current track')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time to seek to (e.g., 1:30, 90, 2m30s)')
                .setRequired(true)
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

        const timeInput = interaction.options.getString('time');
        
        // Parse time input
        const milliseconds = parseTimeToMs(timeInput);
        
        if (milliseconds === null) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    'Invalid time format!',
                    'Use formats like: `1:30`, `90`, `2m30s`, `1h30m`'
                )],
                ephemeral: true
            });
        }

        const currentTrack = queue.currentTrack;
        const trackDurationMs = currentTrack.durationMS;

        if (milliseconds > trackDurationMs) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    'Seek time is longer than track duration!',
                    `Track duration: ${currentTrack.duration}`
                )],
                ephemeral: true
            });
        }

        try {
            await queue.node.seek(milliseconds);
            
            const seekTime = formatTime(Math.floor(milliseconds / 1000));
            
            await interaction.reply({
                embeds: [createSuccessEmbed(
                    '⏩ Seeked successfully!',
                    `Seeked to: **${seekTime}** in **${currentTrack.title}**`
                )]
            });
        } catch (error) {
            console.error('Seek command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to seek!', error.message)],
                ephemeral: true
            });
        }
    }
};

function parseTimeToMs(timeStr) {
    // Remove spaces
    timeStr = timeStr.replace(/\s/g, '');
    
    // Check for various formats
    if (/^\d+$/.test(timeStr)) {
        // Pure seconds: "90"
        return parseInt(timeStr) * 1000;
    }
    
    if (/^\d+:\d+$/.test(timeStr)) {
        // Minutes:seconds: "1:30"
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return (minutes * 60 + seconds) * 1000;
    }
    
    if (/^\d+:\d+:\d+$/.test(timeStr)) {
        // Hours:minutes:seconds: "1:30:45"
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }
    
    // Complex format: "1h30m45s"
    const complexMatch = timeStr.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (complexMatch) {
        const hours = parseInt(complexMatch[1]) || 0;
        const minutes = parseInt(complexMatch[2]) || 0;
        const seconds = parseInt(complexMatch[3]) || 0;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }
    
    return null;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
