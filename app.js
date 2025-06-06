require('dotenv').config();
const TelegramBot = require('./telegram');
const { initWhatsApp } = require('./whatsapp');

console.log('🚀 Crazy v4 Bot Starting...');

// CRAZY IS YOUR FATHER
TelegramBot.init();
initWhatsApp();
