module.exports = {
    // Bot configuration
    prefix: '!',
    
    // Music configuration
    defaultVolume: 50,
    maxVolume: 100,
    maxQueueSize: 100,
    maxPlaylistSize: 50,
    
    // Voice configuration
    leaveOnEmpty: true,
    leaveOnEmptyDelay: 300000, // 5 minutes
    leaveOnEnd: true,
    leaveOnEndDelay: 300000, // 5 minutes
    
    // Colors for embeds
    colors: {
        primary: 0x5865F2,
        success: 0x00ff00,
        warning: 0xffff00,
        error: 0xff0000,
        info: 0x00ffff
    },
    
    // Emojis
    emojis: {
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',
        shuffle: '🔀',
        repeat: '🔁',
        repeatOne: '🔂',
        volumeUp: '🔊',
        volumeDown: '🔉',
        mute: '🔇',
        music: '🎵',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        loading: '⏳'
    }
};
