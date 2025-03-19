const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, version } = require("discord.js");
const config = require("../../config.js");
const os = require("os");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: "bilgi",
    description: "Bot ve sunucu hakkında bilgi verir",
    options: [],
    
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            
            const uptime = moment.duration(client.uptime).format(" D [gün], H [saat], m [dakika], s [saniye]");
            
            // Bellek kullanımı hesaplama
            const memoryUsage = process.memoryUsage();
            const ramUsage = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
            const totalRamUsage = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
            const rssMemory = (memoryUsage.rss / 1024 / 1024).toFixed(2);
            
            // CPU bilgileri
            const cpuModel = os.cpus()[0].model;
            const cpuCores = os.cpus().length;
            const cpuUsage = process.cpuUsage();
            const cpuPercentage = ((cpuUsage.user + cpuUsage.system) / (os.totalmem() * 0.01)).toFixed(2);
            
            // İşletim sistemi bilgileri
            const osType = `${os.type()} ${os.release()}`;
            const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
            const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
            const usedMem = (totalMem - freeMem).toFixed(2);
            const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);
            
            const djsVersion = version;
            const nodeVersion = process.version;
            
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const channelCount = client.channels.cache.size;
            const commandCount = client.slashCommands.size + client.prefixCommands.size;
            
            const ping = client.ws.ping;
            
            const createProgressBar = (percent) => {
                const filledLength = Math.round(percent / 10);
                const emptyLength = 10 - filledLength;
                
                const filledBar = "█".repeat(filledLength);
                const emptyBar = "░".repeat(emptyLength);
                
                return `${filledBar}${emptyBar} ${percent}%`;
            };
            
            const memBar = createProgressBar(memUsagePercent);
            const pingStatus = ping < 100 ? "🟢 Mükemmel" : ping < 200 ? "🟡 İyi" : "🔴 Yüksek";
            
            const botUpSince = new Date(Date.now() - client.uptime);
            
            const embed = new EmbedBuilder()
                .setColor(config.embedColor || "#5865F2")
                .setTitle(`${client.user.username} | Detaylı Bot Bilgileri`)
                .setDescription(`Bot hakkında gelişmiş bilgiler aşağıda listelenmiştir.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addFields(
                    {
                        name: "🤖 Bot Bilgileri",
                        value: `
                            **Bot Adı:** ${client.user.tag}
                            **Bot ID:** ${client.user.id}
                            **Prefix:** ${config.prefix}
                            **Toplam Komut:** ${commandCount}
                            **Bot Sahibi:** <@${config.ownerID}>
                            **Oluşturulma Tarihi:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>
                            **Çalışma Süresi:** ${uptime}
                            **En Son Başlatılma:** <t:${Math.floor(botUpSince.getTime() / 1000)}:F>
                        `,
                        inline: false
                    },
                    {
                        name: "📊 İstatistikler",
                        value: `
                            **Sunucu Sayısı:** ${serverCount}
                            **Kullanıcı Sayısı:** ${userCount}
                            **Kanal Sayısı:** ${channelCount}
                            **Ping:** ${ping}ms ${pingStatus}
                        `,
                        inline: true
                    },
                    {
                        name: "💾 Bellek Kullanımı",
                        value: `
                            **Kullanılan RAM:** ${ramUsage} MB
                            **Toplam Tahsis:** ${totalRamUsage} MB
                            **RSS Bellek:** ${rssMemory} MB
                            **Sistem RAM:** ${usedMem}/${totalMem} GB
                            **Kullanım Oranı:** ${memBar}
                        `,
                        inline: true
                    },
                    {
                        name: "💻 Sistem Bilgileri",
                        value: `
                            **İşletim Sistemi:** ${osType}
                            **CPU Modeli:** ${cpuModel}
                            **CPU Çekirdekleri:** ${cpuCores}
                            **CPU Kullanımı:** ${cpuPercentage}%
                            **Platform:** ${process.platform}
                            **Mimari:** ${process.arch}
                        `,
                        inline: false
                    },
                    {
                        name: "🛠️ Versiyon Bilgileri",
                        value: `
                            **Node.js:** ${nodeVersion}
                            **Discord.js:** v${djsVersion}
                            **Bot Versiyonu:** v${require('../../package.json').version}
                        `,
                        inline: false
                    }
                )
                .setFooter({ text: `${interaction.user.tag} tarafından istendi • ${new Date().toLocaleDateString('tr-TR')}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Davet Et")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
                    new ButtonBuilder()
                        .setLabel("Destek Sunucusu")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("💬")
                        .setURL("https://discord.gg/t7nmBvMx2V"),
                    new ButtonBuilder()
                        .setLabel("Web Sitesi")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("🌐")
                        .setURL(config.website || "https://oktaydev.online"),
                    new ButtonBuilder()
                        .setLabel("GitHub")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("📂")
                        .setURL("https://github.com/oktayyavuz")
                );
            
            await interaction.editReply({ embeds: [embed], components: [row] });
            
        } catch (error) {
            console.error("Bilgi komutu hatası:", error);
            await interaction.editReply({
                content: "❌ Bilgiler gösterilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                ephemeral: true
            });
        }
    }
}; 