const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Botun gecikme süresini ve API yanıt süresini gösterir",
    options: [],
    run: async (client, interaction) => {
        await interaction.deferReply();
        
        const startTime = Date.now();
        const message = await interaction.editReply("Ping ölçülüyor...");
        const endTime = Date.now();
        
        const botLatency = endTime - startTime;
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
            .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
            
        await interaction.editReply({ content: null, embeds: [embed] });
    }
}; 