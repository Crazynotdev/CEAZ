const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { bot } = require('./telegram');

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

const activeClients = {};

async function connectWhatsApp(phoneNumber, chatId) {
  const sessionPath = path.join(sessionsDir, phoneNumber.replace('+', ''));
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const client = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: { level: 'silent' }
  });

  client.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
      try {
        const pairingCode = await client.requestPairingCode(phoneNumber);
        await bot.sendMessage(
          chatId,
          `🔢 *Pairing Code* pour ${phoneNumber} :\n\n` +
          `\`\`\`${pairingCode}\`\`\`\n` +
          `⚠️ Valable 20 secondes | Entrez-le dans WhatsApp > Appareils liés`,
          { parse_mode: 'Markdown' }
        );
        
        activeClients[phoneNumber] = client;
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Erreur de génération: ${error.message}`);
      }
    }
  });

  client.ev.on('creds.update', saveCreds);
  return client;
}

module.exports = {
  connectWhatsApp,
  initWhatsApp: () => console.log('WhatsApp Module Ready'),
  activeClients
};
