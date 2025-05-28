const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed } = require('../../utils/embeds');

// Store 24/7 mode status per guild
const guild247Status = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggle 24/7 mode - bot stays in voice channel permanently')
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('Enable or disable 24/7 mode')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const player = useMainPlayer();
        const enableOption = interaction.options.getBoolean('enable');
        const guildId = interaction.guildId;
        
        // Get current 24/7 status
        const current247Status = guild247Status.get(guildId) || false;
        
        // If no option provided, show current status
        if (enableOption === null) {
            const statusEmbed = {
                color: current247Status ? 0x00ff00 : 0xff0000,
                title: '🔄 24/7 Mode Status',
                description: `24/7 mode is currently **${current247Status ? 'enabled' : 'disabled'}**`,
                fields: [
                    {
                        name: 'What is 24/7 mode?',
                        value: 'When enabled, the bot will stay in the voice channel even when no music is playing or when the channel is empty.',
                        inline: false
                    }
                ],
                timestamp: new Date()
            };
            
            return interaction.reply({ embeds: [statusEmbed] });
        }

        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                embeds: [createErrorEmbed('You need the "Manage Channels" permission to use this command!')],
                ephemeral: true
            });
        }

        const channel = interaction.member.voice.channel;

        if (enableOption) {
            // Enable 24/7 mode
            if (!channel) {
                return interaction.reply({
                    embeds: [createErrorEmbed('You need to be in a voice channel to enable 24/7 mode!')],
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

            try {
                // Create or get existing queue
                let queue = player.nodes.get(guildId);
                
                if (!queue) {
                    queue = player.nodes.create(interaction.guild, {
                        metadata: {
                            channel: interaction.channel,
                            client: interaction.guild.members.me,
                            requestedBy: interaction.user
                        },
                        selfDeaf: true,
                        volume: 50,
                        leaveOnEmpty: false, // Disable auto-leave for 24/7 mode
                        leaveOnEnd: false
                    });
                } else {
                    // Update existing queue settings for 24/7 mode
                    queue.options.leaveOnEmpty = false;
                    queue.options.leaveOnEnd = false;
                }

                // Connect to voice channel if not connected
                if (!queue.connection) {
                    await queue.connect(channel);
                }

                guild247Status.set(guildId, true);

                await interaction.reply({
                    embeds: [createSuccessEmbed(
                        '🔄 24/7 Mode Enabled!',
                        `Bot will stay in **${channel.name}** permanently until disabled.`
                    )]
                });
            } catch (error) {
                console.error('247 enable error:', error);
                await interaction.reply({
                    embeds: [createErrorEmbed('Failed to enable 24/7 mode!', error.message)],
                    ephemeral: true
                });
            }
        } else {
            // Disable 24/7 mode
            try {
                guild247Status.set(guildId, false);
                
                const queue = player.nodes.get(guildId);
                if (queue) {
                    // Re-enable auto-leave settings
                    queue.options.leaveOnEmpty = true;
                    queue.options.leaveOnEnd = true;
                    queue.options.leaveOnEmptyDelay = 300000;
                    queue.options.leaveOnEndDelay = 300000;
                    
                    // If no music is playing and channel is empty, leave
                    const voiceChannel = interaction.guild.members.me.voice.channel;
                    if (voiceChannel && 
                        !queue.node.isPlaying() && 
                        voiceChannel.members.filter(member => !member.user.bot).size === 0) {
                        queue.delete();
                        
                        await interaction.reply({
                            embeds: [createSuccessEmbed(
                                '🔄 24/7 Mode Disabled!',
                                'Left voice channel since no music was playing and channel was empty.'
                            )]
                        });
                        return;
                    }
                }

                await interaction.reply({
                    embeds: [createSuccessEmbed(
                        '🔄 24/7 Mode Disabled!',
                        'Bot will now leave voice channel when idle or when music queue ends.'
                    )]
                });
            } catch (error) {
                console.error('247 disable error:', error);
                await interaction.reply({
                    embeds: [createErrorEmbed('Failed to disable 24/7 mode!', error.message)],
                    ephemeral: true
                });
            }
        }
    }
};

// Export the 247 status map for use in other files
module.exports.guild247Status = guild247Status;
