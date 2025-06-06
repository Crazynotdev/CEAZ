const TelegramBot = require('node-telegram-bot-api');
const { connectWhatsApp } = require('./whatsapp');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

module.exports = {
  init: () => {
    bot.onText(/\/start/, (msg) => {
      bot.sendMessage(msg.chat.id, 
        `🤖 *Crazy v4 WhatsApp Bot*\n\n` +
        `🔢 Pour connecter: /connect +numéro\n` +
        `🚫 Pour déconnecter: /disconnect +numéro`,
        { parse_mode: 'Markdown' }
      );
    });

    bot.onText(/\/connect (\+\d+)/, async (msg, match) => {
      const phoneNumber = match[1];
      const chatId = msg.chat.id;
      
      try {
        await connectWhatsApp(phoneNumber, chatId);
        bot.sendMessage(chatId, `⏳ Génération du Pairing Code pour ${phoneNumber}...`);
      } catch (error) {
        bot.sendMessage(chatId, `❌ Erreur: ${error.message}`);
      }
    });

    bot.onText(/\/disconnect (\+\d+)/, (msg, match) => {
      // Implémente la déconnexion ici
    });
  },
  bot
};
