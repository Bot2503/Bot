const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({
                    embeds: [createErrorEmbed('Command not found!')],
                    ephemeral: true
                });
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error('Command execution error:', error);
                
                const errorEmbed = createErrorEmbed(
                    'There was an error executing this command!',
                    error.message
                );

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }

        // Handle button interactions
        if (interaction.isButton()) {
            const queue = client.player.nodes.get(interaction.guildId);
            
            if (!queue) {
                return interaction.reply({
                    embeds: [createErrorEmbed('No music is currently playing!')],
                    ephemeral: true
                });
            }

            try {
                switch (interaction.customId) {
                    case 'music_pause_resume':
                        if (queue.node.isPaused()) {
                            queue.node.resume();
                            await interaction.reply({
                                content: '▶️ Resumed playback',
                                ephemeral: true
                            });
                        } else {
                            queue.node.pause();
                            await interaction.reply({
                                content: '⏸️ Paused playback',
                                ephemeral: true
                            });
                        }
                        break;

                    case 'music_skip':
                        queue.node.skip();
                        await interaction.reply({
                            content: '⏭️ Skipped current track',
                            ephemeral: true
                        });
                        break;

                    case 'music_stop':
                        queue.delete();
                        await interaction.reply({
                            content: '⏹️ Stopped playback and cleared queue',
                            ephemeral: true
                        });
                        break;

                    case 'music_shuffle':
                        queue.tracks.shuffle();
                        await interaction.reply({
                            content: '🔀 Shuffled the queue',
                            ephemeral: true
                        });
                        break;

                    case 'volume_up':
                        const newVolumeUp = Math.min(queue.node.volume + 10, 100);
                        queue.node.setVolume(newVolumeUp);
                        await interaction.reply({
                            content: `🔊 Volume set to ${newVolumeUp}%`,
                            ephemeral: true
                        });
                        break;

                    case 'volume_down':
                        const newVolumeDown = Math.max(queue.node.volume - 10, 0);
                        queue.node.setVolume(newVolumeDown);
                        await interaction.reply({
                            content: `🔉 Volume set to ${newVolumeDown}%`,
                            ephemeral: true
                        });
                        break;

                    case 'volume_mute':
                        if (queue.node.volume > 0) {
                            queue.node.setVolume(0);
                            await interaction.reply({
                                content: '🔇 Muted',
                                ephemeral: true
                            });
                        } else {
                            queue.node.setVolume(50);
                            await interaction.reply({
                                content: '🔊 Unmuted (50%)',
                                ephemeral: true
                            });
                        }
                        break;

                    default:
                        if (interaction.customId.startsWith('queue_page_')) {
                            const page = parseInt(interaction.customId.split('_')[2]);
                            // Handle queue pagination
                            const { createQueueEmbed } = require('../utils/embeds');
                            const { createQueueButtons } = require('../utils/buttons');
                            
                            const totalPages = Math.ceil(queue.tracks.size / 10);
                            const queueEmbed = createQueueEmbed(queue, page);
                            const queueButtons = createQueueButtons(page, totalPages);
                            
                            await interaction.update({
                                embeds: [queueEmbed],
                                components: totalPages > 1 ? [queueButtons] : []
                            });
                        }
                        break;
                }
            } catch (error) {
                console.error('Button interaction error:', error);
                await interaction.reply({
                    embeds: [createErrorEmbed('Failed to execute action', error.message)],
                    ephemeral: true
                });
            }
        }
    }
};
