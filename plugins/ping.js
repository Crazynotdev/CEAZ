module.exports = (client) => {
  client.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;

    const text = msg.message.conversation || '';
    if (text.toLowerCase() === '!ping') {
      await client.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
    }
  });
};
