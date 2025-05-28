const config = require('../config');

function createNowPlayingEmbed(track, queue = null) {
    const embed = {
        color: config.colors.primary,
        title: `${config.emojis.music} Now Playing`,
        description: `**[${track.title}](${track.url})**`,
        fields: [
            {
                name: 'Artist',
                value: track.author || 'Unknown',
                inline: true
            },
            {
                name: 'Duration',
                value: track.duration || 'Unknown',
                inline: true
            },
            {
                name: 'Requested by',
                value: track.requestedBy ? `<@${track.requestedBy.id}>` : 'Unknown',
                inline: true
            }
        ],
        thumbnail: {
            url: track.thumbnail || null
        },
        timestamp: new Date(),
        footer: {
            text: queue ? `Queue: ${queue.tracks.size} tracks` : 'Music Bot'
        }
    };

    if (queue && queue.node.isPlaying()) {
        embed.fields.push({
            name: 'Progress',
            value: createProgressBar(queue.node.getTimestamp()),
            inline: false
        });
    }

    return embed;
}

function createQueueEmbed(queue, page = 1) {
    const tracksPerPage = 10;
    const start = (page - 1) * tracksPerPage;
    const end = start + tracksPerPage;
    const tracks = queue.tracks.toArray().slice(start, end);

    const embed = {
        color: config.colors.info,
        title: `${config.emojis.music} Music Queue`,
        description: queue.currentTrack ? `**Now Playing:** [${queue.currentTrack.title}](${queue.currentTrack.url})` : 'No track currently playing',
        fields: [],
        footer: {
            text: `Page ${page} • ${queue.tracks.size} tracks in queue • ${queue.estimatedDuration} total duration`
        },
        timestamp: new Date()
    };

    if (tracks.length === 0) {
        embed.fields.push({
            name: 'Queue Empty',
            value: 'No tracks in queue. Use `/play` to add music!',
            inline: false
        });
    } else {
        tracks.forEach((track, index) => {
            embed.fields.push({
                name: `${start + index + 1}. ${track.title}`,
                value: `By ${track.author} • ${track.duration} • Requested by <@${track.requestedBy.id}>`,
                inline: false
            });
        });
    }

    return embed;
}

function createErrorEmbed(message, details = null) {
    const embed = {
        color: config.colors.error,
        title: `${config.emojis.error} Error`,
        description: message,
        timestamp: new Date()
    };

    if (details) {
        embed.fields = [{
            name: 'Details',
            value: details,
            inline: false
        }];
    }

    return embed;
}

function createSuccessEmbed(message, details = null) {
    const embed = {
        color: config.colors.success,
        title: `${config.emojis.success} Success`,
        description: message,
        timestamp: new Date()
    };

    if (details) {
        embed.fields = [{
            name: 'Details',
            value: details,
            inline: false
        }];
    }

    return embed;
}

function createWarningEmbed(message, details = null) {
    const embed = {
        color: config.colors.warning,
        title: `${config.emojis.warning} Warning`,
        description: message,
        timestamp: new Date()
    };

    if (details) {
        embed.fields = [{
            name: 'Details',
            value: details,
            inline: false
        }];
    }

    return embed;
}

function createProgressBar(timestamp) {
    if (!timestamp || !timestamp.current || !timestamp.total) {
        return 'No progress available';
    }

    const current = timestamp.current.value;
    const total = timestamp.total.value;
    const progress = Math.round((current / total) * 20);
    
    const progressBar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(20 - progress);
    
    return `${timestamp.current.label} ${progressBar} ${timestamp.total.label}`;
}

module.exports = {
    createNowPlayingEmbed,
    createQueueEmbed,
    createErrorEmbed,
    createSuccessEmbed,
    createWarningEmbed,
    createProgressBar
};
