const { EmbedBuilder, Colors, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "antiraid",
    description: "Sunucuyu ani saldırılardan koruyacak ayarları yapılandırır",
    options: [
        {
            name: "durum",
            description: "Anti-Raid koruma sisteminin durumunu ayarlar",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Aktif", value: "active" },
                { name: "Pasif", value: "passive" }
            ]
        },
        {
            name: "eşik",
            description: "Kaç saniye içinde kaç yeni üye gelirse raid olarak algılanacak",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 3,
            max_value: 50
        },
        {
            name: "süre",
            description: "Algılama için kontrol edilecek süre (saniye)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 5,
            max_value: 120
        },
        {
            name: "eylem",
            description: "Raid tespit edildiğinde ne yapılsın?",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Kick", value: "kick" },
                { name: "Ban", value: "ban" },
                { name: "Timeout", value: "timeout" },
                { name: "Rol Ver", value: "addrole" },
                { name: "Sadece Bildir", value: "notify" }
            ]
        },
        {
            name: "rol",
            description: "Eylem 'Rol Ver' seçildiğinde yeni gelenlere verilecek rol",
            type: ApplicationCommandOptionType.Role,
            required: false
        },
        {
            name: "logkanal",
            description: "Anti-raid bildirimlerinin gönderileceği kanal",
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    
    run: async (client, interaction) => {
        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: "❌ Bu komutu kullanabilmek için **Yönetici** yetkisine sahip olmalısın!", 
                ephemeral: true 
            });
        }

        await interaction.deferReply();
        
        const durum = interaction.options.getString("durum");
        const threshold = interaction.options.getInteger("eşik") || 10; // Varsayılan: 10 üye
        const duration = interaction.options.getInteger("süre") || 30; // Varsayılan: 30 saniye
        const action = interaction.options.getString("eylem") || "notify"; // Varsayılan: Sadece bildir
        const role = interaction.options.getRole("rol");
        const logChannel = interaction.options.getChannel("logkanal");
        
        // Rol Ver seçildiğinde rol verilmesi gerekli
        if (action === "addrole" && !role) {
            return interaction.editReply({
                content: "❌ 'Rol Ver' eylemini seçtiyseniz, bir rol belirtmelisiniz!",
                ephemeral: true
            });
        }
        
        if (durum === "active") {
            let existingLogChannel = null;
            if (!logChannel) {
                existingLogChannel = interaction.guild.channels.cache.find(
                    channel => channel.name.includes("log") && channel.type === 0
                );
            }
            
            db.set(`antiraid_${interaction.guild.id}`, {
                active: true,
                threshold,
                duration,
                action,
                roleId: role ? role.id : null,
                logChannelId: logChannel ? logChannel.id : existingLogChannel ? existingLogChannel.id : null,
                lastUpdated: Date.now(),
                updatedBy: interaction.user.id
            });
            
            // Kullanıcıya bilgi ver
            const successEmbed = new EmbedBuilder()
                .setTitle("🛡️ Anti-Raid Sistemi Aktifleştirildi")
                .setDescription(`Sunucunuz artık ani saldırılara karşı korunuyor!`)
                .setColor(Colors.Green)
                .addFields(
                    { name: "Algılama Eşiği", value: `${threshold} üye / ${duration} saniye`, inline: true },
                    { name: "Eylem", value: getActionName(action), inline: true },
                    { name: "Bildirim Kanalı", value: logChannel ? `<#${logChannel.id}>` : existingLogChannel ? `<#${existingLogChannel.id}>` : "Ayarlanmadı", inline: true }
                )
                .setFooter({ text: `${interaction.user.tag} tarafından ayarlandı`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            
            if (action === "addrole" && role) {
                successEmbed.addFields({ name: "Verilecek Rol", value: `<@&${role.id}>`, inline: true });
            }
            
            interaction.editReply({ embeds: [successEmbed] });
            
            // Log kanalına bilgi gönder
            const targetLogChannel = logChannel || existingLogChannel;
            if (targetLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("⚙️ Anti-Raid Sistemi Yapılandırıldı")
                    .setDescription(`Anti-Raid sistemi ${interaction.user} tarafından aktifleştirildi.`)
                    .setColor(Colors.Blue)
                    .addFields(
                        { name: "Algılama Eşiği", value: `${threshold} üye / ${duration} saniye`, inline: true },
                        { name: "Eylem", value: getActionName(action), inline: true }
                    )
                    .setTimestamp();
                
                if (action === "addrole" && role) {
                    logEmbed.addFields({ name: "Verilecek Rol", value: `<@&${role.id}>`, inline: true });
                }
                
                targetLogChannel.send({ embeds: [logEmbed] }).catch(() => {
                    interaction.followUp({ 
                        content: "⚠️ Log kanalına mesaj gönderilemedi. Botun kanala yazma yetkisi olduğundan emin olun.", 
                        ephemeral: true 
                    });
                });
            }
        } else {
            // Sistemi kapat
            db.delete(`antiraid_${interaction.guild.id}`);
            
            const disabledEmbed = new EmbedBuilder()
                .setTitle("🔓 Anti-Raid Sistemi Devre Dışı")
                .setDescription(`Anti-Raid koruma sistemi başarıyla devre dışı bırakıldı.`)
                .setColor(Colors.Red)
                .setFooter({ text: `${interaction.user.tag} tarafından devre dışı bırakıldı`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            
            interaction.editReply({ embeds: [disabledEmbed] });
            
            // Log kanalına bilgi gönder
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("⚙️ Anti-Raid Sistemi Devre Dışı")
                    .setDescription(`Anti-Raid sistemi ${interaction.user} tarafından devre dışı bırakıldı.`)
                    .setColor(Colors.Red)
                    .setTimestamp();
                
                logChannel.send({ embeds: [logEmbed] }).catch(() => {});
            }
        }
    }
};

// Eylemlerin Türkçe karşılıklarını döndürür
function getActionName(action) {
    switch (action) {
        case "kick": return "Sunucudan At";
        case "ban": return "Yasakla";
        case "timeout": return "Zaman Aşımı";
        case "addrole": return "Rol Ver";
        case "notify": return "Sadece Bildir";
        default: return "Bilinmiyor";
    }
} 