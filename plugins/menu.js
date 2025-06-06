module.exports = (client, prefix) => {
    const menuImage = 'https://files.catbox.moe/oqy437.jpeg'; // Remplacez par mon crazy URL
    
    client.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.remoteJid.includes('@s.whatsapp.net')) return;

        const body = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || '';
        
        if (body.toLowerCase().trim() === `${prefix}menu`) {
            try {
                await client.sendMessage(msg.key.remoteJid, {
                    image: { url: menuImage },
                    caption: `📱 *Menu Crazy v4* (Prefix: ${prefix})\n\n` +
                            `🔸 ${prefix}ping - Test\n` +
                            `🔸 ${prefix}help - Aide\n` +
                            `🔸 ${prefix}admin - Contact\n\n` +
                            `_Envoyé à ${new Date().toLocaleTimeString()}_`,
                    mimetype: 'image/jpeg'
                });
            } catch (e) {
                console.error('Erreur .menu:', e);
            }
        }
    });
};
