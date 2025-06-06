const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { bot } = require('./telegram');
const { PREFIX } = require('./config');

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

const activeClients = {};

// Fonction améliorée de chargement des plugins
async function loadPlugins(client, phoneNumber) {
    try {
        const pluginsDir = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        for (const file of pluginFiles) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                plugin(client, PREFIX);
                console.log(`[${phoneNumber}] Plugin chargé: ${file}`);
            } catch (e) {
                console.error(`[${phoneNumber}] Erreur dans ${file}:`, e);
            }
        }
    } catch (error) {
        console.error('Erreur loadPlugins:', error);
    }
}

async function connectWhatsApp(phoneNumber, chatId) {
    const sessionPath = path.join(sessionsDir, phoneNumber.replace('+', ''));
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const client = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: { level: 'warn' }
    });

    client.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            try {
                const pairingCode = await client.requestPairingCode(phoneNumber);
                await bot.sendMessage(
                    chatId,
                    `🔢 *Pairing Code* pour ${phoneNumber} :\n\n` +
                    `\`\`\`${pairingCode}\`\`\`\n` +
                    `⚠️ Valable 20 secondes | WhatsApp > Appareils liés`,
                    { parse_mode: 'Markdown' }
                );
                
                // Charge les plugins APRÈS la connexion
                await loadPlugins(client, phoneNumber);
                activeClients[phoneNumber] = client;

            } catch (error) {
                await bot.sendMessage(chatId, `❌ Erreur: ${error.message}`);
            }
        }
    });

    client.ev.on('creds.update', saveCreds);
    return client;
}

module.exports = {
    connectWhatsApp,
    activeClients
};
