const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.js");

/**
 * Çekiliş butonları işleyicisi
 * @param {Client} client Discord.js istemcisi
 * @param {ButtonInteraction} interaction Buton etkileşimi
 * @param {Array<string>} params Buton parametreleri
 */
module.exports = async (client, interaction, params) => {
    try {
        if (!params || params.length === 0) return;
        
        const action = params[0];
        const giveawayId = params[1];
        
        if (!giveawayId) {
            return interaction.reply({
                content: "Çekiliş ID'si bulunamadı!",
                ephemeral: true
            });
        }
        
        const giveawayData = db.get(`giveaway_${giveawayId}`);
        if (!giveawayData) {
            return interaction.reply({
                content: "Bu çekiliş artık mevcut değil!",
                ephemeral: true
            });
        }
        
        switch (action) {
            case "join":
                // Çekilişe katılma
                if (giveawayData.ended) {
                    return interaction.reply({
                        content: "Bu çekiliş sona erdi!",
                        ephemeral: true
                    });
                }
                
                // Kullanıcı zaten katılmış mı kontrol et
                if (giveawayData.participants.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: "Bu çekilişe zaten katıldınız!",
                        ephemeral: true
                    });
                }
                
                // Kullanıcıyı katılımcılara ekle
                giveawayData.participants.push(interaction.user.id);
                db.set(`giveaway_${giveawayId}`, giveawayData);
                
                return interaction.reply({
                    content: `🎉 **${giveawayData.prize}** çekilişine başarıyla katıldınız!`,
                    ephemeral: true
                });
                
            case "leave":
                // Çekilişten ayrılma
                if (giveawayData.ended) {
                    return interaction.reply({
                        content: "Bu çekiliş sona erdi!",
                        ephemeral: true
                    });
                }
                
                // Kullanıcı çekilişe katılmış mı kontrol et
                if (!giveawayData.participants.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: "Bu çekilişe zaten katılmadınız!",
                        ephemeral: true
                    });
                }
                
                // Kullanıcıyı katılımcılardan çıkar
                giveawayData.participants = giveawayData.participants.filter(id => id !== interaction.user.id);
                db.set(`giveaway_${giveawayId}`, giveawayData);
                
                return interaction.reply({
                    content: `❌ **${giveawayData.prize}** çekilişinden ayrıldınız.`,
                    ephemeral: true
                });
                
            case "info":
                // Çekiliş bilgilerini göster
                const now = Date.now();
                const startTime = giveawayData.startTime;
                const duration = giveawayData.duration;
                const endTime = startTime + duration;
                
                let timeRemaining;
                if (now < endTime) {
                    timeRemaining = `<t:${Math.floor(endTime / 1000)}:R>`;
                } else {
                    timeRemaining = "Çekiliş sona erdi";
                }
                
                const infoEmbed = new EmbedBuilder()
                    .setColor(config.embedColor || "#5865F2")
                    .setTitle(`🎁 ${giveawayData.prize}`)
                    .setDescription(`
                        **Ödül:** ${giveawayData.prize}
                        **Kazanan Sayısı:** ${giveawayData.winnerCount}
                        **Oluşturan:** <@${giveawayData.hosterId}>
                        **Katılımcı Sayısı:** ${giveawayData.participants.length}
                        **Katılım Durumunuz:** ${giveawayData.participants.includes(interaction.user.id) ? "✅ Katıldınız" : "❌ Katılmadınız"}
                        **Başlangıç:** <t:${Math.floor(startTime / 1000)}:F>
                        **Bitiş:** <t:${Math.floor(endTime / 1000)}:F>
                        **Kalan Süre:** ${timeRemaining}
                    `)
                    .setFooter({ text: `Çekiliş ID: ${giveawayId}` })
                    .setTimestamp();
                
                return interaction.reply({
                    embeds: [infoEmbed],
                    ephemeral: true
                });
                
            case "reroll":
                // Yalnızca çekilişi oluşturan kişi veya yetkili yeniden çekilebilir
                if (interaction.user.id !== giveawayData.hosterId && !interaction.member.permissions.has("ManageGuild")) {
                    return interaction.reply({
                        content: "Bu çekilişi yeniden çekme yetkiniz yok!",
                        ephemeral: true
                    });
                }
                
                // Çekiliş bitmemiş mi kontrol et
                if (!giveawayData.ended) {
                    return interaction.reply({
                        content: "Bu çekiliş henüz bitmedi!",
                        ephemeral: true
                    });
                }
                
                // Katılımcı var mı kontrol et
                if (giveawayData.participants.length === 0) {
                    return interaction.reply({
                        content: "Bu çekilişe katılan kimse yok!",
                        ephemeral: true
                    });
                }
                
                // Yeni kazanan seç
                const winnerId = giveawayData.participants[Math.floor(Math.random() * giveawayData.participants.length)];
                
                const rerollEmbed = new EmbedBuilder()
                    .setColor(config.embedSuccessColor || "#57F287")
                    .setTitle("🎉 Çekiliş Yeniden Çekildi!")
                    .setDescription(`
                        **Ödül:** ${giveawayData.prize}
                        **Yeni Kazanan:** <@${winnerId}>
                        **Çekilişi Yeniden Çeken:** ${interaction.user}
                    `)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [rerollEmbed] });
                
                try {
                    // Kazananı DM ile bilgilendir
                    const winner = await client.users.fetch(winnerId);
                    const dmEmbed = new EmbedBuilder()
                        .setColor(config.embedSuccessColor || "#57F287")
                        .setTitle("🎉 Tebrikler! Bir Çekiliş Kazandın!")
                        .setDescription(`
                            **${giveawayData.prize}** ödüllü çekilişi kazandın!
                            
                            Çekiliş **${interaction.guild.name}** sunucusunda yeniden çekildi ve sen kazanan olarak seçildin!
                            
                            [Çekilişe Git](https://discord.com/channels/${interaction.guild.id}/${giveawayData.channelId}/${giveawayData.messageId})
                        `)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp();
                    
                    await winner.send({ embeds: [dmEmbed] }).catch(() => {});
                } catch (error) {
                    console.error("Kazanana DM gönderme hatası:", error);
                }
                
                break;
                
            default:
                await interaction.reply({
                    content: "Tanımlanmamış bir çekiliş işlemi istendi!",
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error("Çekiliş buton işleme hatası:", error);
        await interaction.reply({
            content: "Çekiliş işlemi sırasında bir hata oluştu!",
            ephemeral: true
        }).catch(() => {});
    }
}; 