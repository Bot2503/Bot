const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createErrorEmbed, createQueueEmbed } = require('../../utils/embeds');
const { createQueueButtons } = require('../../utils/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the music queue')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to display')
                .setMinValue(1)
        ),

    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({
                embeds: [createErrorEmbed('No music queue found!')],
                ephemeral: true
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const tracksPerPage = 10;
        const totalPages = Math.ceil(queue.tracks.size / tracksPerPage);

        if (page > totalPages && totalPages > 0) {
            return interaction.reply({
                embeds: [createErrorEmbed(`Page ${page} doesn't exist! Maximum page: ${totalPages}`)],
                ephemeral: true
            });
        }

        try {
            const queueEmbed = createQueueEmbed(queue, page);
            const components = [];

            if (totalPages > 1) {
                components.push(createQueueButtons(page, totalPages));
            }

            await interaction.reply({
                embeds: [queueEmbed],
                components
            });
        } catch (error) {
            console.error('Queue command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to display queue!', error.message)],
                ephemeral: true
            });
        }
    }
};
