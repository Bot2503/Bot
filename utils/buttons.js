const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

function createMusicControlButtons() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('music_previous')
                .setEmoji(config.emojis.previous)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_pause_resume')
                .setEmoji(config.emojis.pause)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('music_stop')
                .setEmoji(config.emojis.stop)
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setEmoji(config.emojis.skip)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_shuffle')
                .setEmoji(config.emojis.shuffle)
                .setStyle(ButtonStyle.Secondary)
        );

    return row;
}

function createVolumeButtons() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('volume_down')
                .setEmoji(config.emojis.volumeDown)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('volume_mute')
                .setEmoji(config.emojis.mute)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('volume_up')
                .setEmoji(config.emojis.volumeUp)
                .setStyle(ButtonStyle.Secondary)
        );

    return row;
}

function createQueueButtons(currentPage, totalPages) {
    const row = new ActionRowBuilder();

    if (currentPage > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_page_${currentPage - 1}`)
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('queue_refresh')
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Primary)
    );

    if (currentPage < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_page_${currentPage + 1}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    return row;
}

module.exports = {
    createMusicControlButtons,
    createVolumeButtons,
    createQueueButtons
};
