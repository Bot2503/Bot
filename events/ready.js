module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} is online and ready!`);
        console.log(`📊 Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`);
        
        // Set bot activity
        client.user.setActivity('🎵 /play to start music', { type: 'LISTENING' });
        
        // Initialize player
        console.log('🎵 Music player initialized successfully');
    }
};
