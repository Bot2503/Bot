module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const queue = client.player.nodes.get(oldState.guild.id);
        
        if (!queue || !queue.connection) return;

        // Check if bot was disconnected
        if (oldState.id === client.user.id && !newState.channelId) {
            queue.delete();
            return;
        }

        // Check if bot's voice channel is now empty
        if (oldState.channelId === queue.connection.joinConfig.channelId) {
            const voiceChannel = oldState.guild.channels.cache.get(oldState.channelId);
            
            if (voiceChannel && voiceChannel.members.filter(member => !member.user.bot).size === 0) {
                // Channel is empty of real users
                const config = require('../config');
                
                if (config.leaveOnEmpty) {
                    setTimeout(() => {
                        const currentQueue = client.player.nodes.get(oldState.guild.id);
                        if (currentQueue && currentQueue.connection) {
                            const currentChannel = oldState.guild.channels.cache.get(oldState.channelId);
                            if (currentChannel && currentChannel.members.filter(member => !member.user.bot).size === 0) {
                                currentQueue.delete();
                                
                                // Send leave message if metadata channel exists
                                if (currentQueue.metadata && currentQueue.metadata.channel) {
                                    const { createWarningEmbed } = require('../utils/embeds');
                                    currentQueue.metadata.channel.send({
                                        embeds: [createWarningEmbed(
                                            'Left voice channel due to inactivity',
                                            'Voice channel was empty for 5 minutes'
                                        )]
                                    });
                                }
                            }
                        }
                    }, config.leaveOnEmptyDelay);
                }
            }
        }
    }
};
