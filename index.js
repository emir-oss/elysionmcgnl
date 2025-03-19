const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const config = require("./config.js");
const db = require("./croxydb/croxydb.json");

const client = new Client({
  partials: [
    Partials.Message, 
    Partials.Channel, 
    Partials.GuildMember,
    Partials.Reaction, 
    Partials.GuildScheduledEvent, 
    Partials.User, 
    Partials.ThreadMember, 
  ],
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites, 
    GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions, 
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent, 
  ],
  failIfNotExists: false,
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: false
  }
});

process.on('unhandledRejection', (error, promise) => {
  console.error('Yakalanamayan Promise Reddi:');
  console.error(`Promise: ${promise}`);
  console.error(`Hata: ${error}`);
  console.error(error.stack || error);
  
  if (client.isReady() && config.logChannelId) {
    const logChannel = client.channels.cache.get(config.logChannelId);
    if (logChannel) {
      logChannel.send({
        content: `⚠️ **Kritik Hata Bilgisi**\n\`\`\`js\n${error.stack || error}\n\`\`\`\nTarih: ${new Date().toLocaleString('tr-TR')}`
      }).catch(console.error);
    }
  }
});

process.on('uncaughtException', (error) => {
  console.error('Yakalanamayan İstisna:');
  console.error(`Hata: ${error}`);
  console.error(error.stack || error);
  
  if (client.isReady() && config.logChannelId) {
    const logChannel = client.channels.cache.get(config.logChannelId);
    if (logChannel) {
      logChannel.send({
        content: `⚠️ **Kritik Hata Bilgisi**\n\`\`\`js\n${error.stack || error}\n\`\`\`\nTarih: ${new Date().toLocaleString('tr-TR')}`
      }).catch(console.error);
    }
  }
});

process.on('SIGINT', () => {
  console.log('Bot Kapanıyor...');
  client.destroy();
  process.exit(0);
});

module.exports = client;

const fs = require("fs");
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  require("./events/"+file);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
➤ | ${file} Eventi yüklendi!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

client.login(config.token).catch(e => {
  console.log(`──────────────────────────────────────────
✕ | Geçersiz Bot Tokeni! Hata: ${e.message}
──────────────────────────────────────────`)
})

