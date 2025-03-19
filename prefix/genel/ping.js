const { EmbedBuilder, Colors } = require("discord.js");

exports.run = async (client, message, args) => {
    const msg = await message.reply("Ping ölçülüyor...");
    
    const botLatency = Math.floor(msg.createdTimestamp - message.createdTimestamp);
    const apiLatency = Math.round(client.ws.ping);
    
    const getLatencyColor = (ms) => {
        if (ms < 100) return Colors.Green;
        if (ms < 200) return Colors.Yellow;
        return Colors.Red;
    };
    
    const getLatencyEmoji = (ms) => {
        if (ms < 100) return "🟢";
        if (ms < 200) return "🟡";
        return "🔴";
    };
    
    const botEmoji = getLatencyEmoji(botLatency);
    const apiEmoji = getLatencyEmoji(apiLatency);
    
    const embed = new EmbedBuilder()
        .setTitle("🏓 Pong!")
        .setColor(getLatencyColor(botLatency))
        .addFields(
            { name: `${botEmoji} Bot Gecikmesi`, value: `${botLatency}ms`, inline: true },
            { name: `${apiEmoji} API Gecikmesi`, value: `${apiLatency}ms`, inline: true }
        )
        .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
        
    await msg.edit({ content: null, embeds: [embed] });
};

exports.conf = {
    aliases: ["ms", "gecikme", "latency"]
};

exports.help = {
    name: "ping"
}; 