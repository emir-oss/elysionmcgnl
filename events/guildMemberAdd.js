const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../index.js");
const db = require("croxydb");

// Yeni üye girişlerini izlemek için bu Map kullanılacak
const recentJoins = new Map();

client.on("guildMemberAdd", async (member) => {
    // Bot girişlerini izleme
    if (member.user.bot) return;

    // Sunucuya katılan üyelerin verilerini kaydet
    const guild = member.guild;
    const now = Date.now();
    
    // Yeni üye girişleri izleme
    if (!recentJoins.has(guild.id)) {
        recentJoins.set(guild.id, []);
    }
    
    const guildJoins = recentJoins.get(guild.id);
    guildJoins.push({
        userId: member.id,
        timestamp: now
    });
    
    // Son 2 dakikadan eski girişleri temizle
    const twoMinutesAgo = now - 120000;
    const filteredJoins = guildJoins.filter(join => join.timestamp > twoMinutesAgo);
    recentJoins.set(guild.id, filteredJoins);
    
    // Anti-raid sistemi aktif mi kontrol et
    const antiraidSettings = db.get(`antiraid_${guild.id}`);
    if (antiraidSettings && antiraidSettings.active) {
        // Belirlenen süre içindeki girişleri hesapla
        const duration = antiraidSettings.duration * 1000; // ms cinsinden
        const threshold = antiraidSettings.threshold;
        const timeWindow = now - duration;
        
        const recentMembers = filteredJoins.filter(join => join.timestamp > timeWindow);
        
        // Belirlenen eşiği geçti mi kontrol et
        if (recentMembers.length >= threshold) {
            // Raid tespit edildi!
            handleRaidDetection(guild, member, recentMembers, antiraidSettings);
        }
    }
    
    // Hoşgeldin mesajı sistemi
    const welcomeSettings = db.get(`welcome_${guild.id}`);
    if (welcomeSettings && welcomeSettings.enabled && welcomeSettings.channelId) {
        try {
            const welcomeChannel = guild.channels.cache.get(welcomeSettings.channelId);
            if (welcomeChannel) {
                // Hoşgeldin mesajı gönder
                let welcomeMessage = welcomeSettings.message || `Hoşgeldin {member}! Sunucumuza katıldın, seninle birlikte {memberCount} kişiyiz!`;
                
                // Mesajdaki değişkenleri değiştir
                welcomeMessage = welcomeMessage
                    .replace(/{member}/g, `<@${member.id}>`)
                    .replace(/{memberCount}/g, guild.memberCount)
                    .replace(/{server}/g, guild.name)
                    .replace(/{username}/g, member.user.username);
                
                const embed = new EmbedBuilder()
                    .setTitle(`${guild.name} Sunucusuna Hoşgeldin!`)
                    .setDescription(welcomeMessage)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
                
                welcomeChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error("Hoşgeldin mesajı gönderilirken hata:", error);
        }
    }
    
    // Otorol sistemi
    const autoRoleSettings = db.get(`autorole_${guild.id}`);
    if (autoRoleSettings && autoRoleSettings.enabled && autoRoleSettings.roleId) {
        try {
            const role = guild.roles.cache.get(autoRoleSettings.roleId);
            if (role) {
                await member.roles.add(role).catch(console.error);
                
                // Otorol log kanalı varsa bildirim gönder
                if (autoRoleSettings.logChannelId) {
                    const logChannel = guild.channels.cache.get(autoRoleSettings.logChannelId);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle("🔄 Otorol")
                            .setDescription(`${member} kullanıcısına <@&${role.id}> rolü otomatik olarak verildi.`)
                            .setColor(Colors.Blue)
                            .setTimestamp();
                        
                        logChannel.send({ embeds: [embed] }).catch(console.error);
                    }
                }
            }
        } catch (error) {
            console.error("Otorol verilirken hata:", error);
        }
    }
});

// Raid tespit edildiğinde yapılacak işlem
async function handleRaidDetection(guild, triggerMember, recentMembers, settings) {
    // Log kanalı ayarı varsa
    const logChannelId = settings.logChannelId;
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;
    
    // Raid tespiti bildirimi
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle("⚠️ Raid Tespit Edildi!")
            .setDescription(`Son ${settings.duration} saniye içinde ${recentMembers.length} yeni üye katıldı!\nOtomatik koruma harekete geçirildi.`)
            .setColor(Colors.Red)
            .addFields(
                { name: "Tetikleyen Üye", value: `<@${triggerMember.id}> (${triggerMember.user.tag})`, inline: true },
                { name: "Uygulanan Eylem", value: getActionName(settings.action), inline: true },
                { name: "Tespit Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setTimestamp();
        
        logChannel.send({ embeds: [embed] }).catch(console.error);
    }
    
    // Anti-raid eylemini uygula
    switch (settings.action) {
        case "kick":
            // Son katılanları kickle
            for (const joinInfo of recentMembers) {
                const member = await guild.members.fetch(joinInfo.userId).catch(() => null);
                if (member) {
                    member.kick("Anti-raid sistemi tarafından tespit edildi").catch(console.error);
                }
            }
            break;
            
        case "ban":
            // Son katılanları banla
            for (const joinInfo of recentMembers) {
                const member = await guild.members.fetch(joinInfo.userId).catch(() => null);
                if (member) {
                    member.ban({ reason: "Anti-raid sistemi tarafından tespit edildi" }).catch(console.error);
                }
            }
            break;
            
        case "timeout":
            // Son katılanlara timeout ver (1 gün)
            for (const joinInfo of recentMembers) {
                const member = await guild.members.fetch(joinInfo.userId).catch(() => null);
                if (member) {
                    member.timeout(86400000, "Anti-raid sistemi tarafından tespit edildi").catch(console.error);
                }
            }
            break;
            
        case "addrole":
            // Son katılanlara belirlenen rolü ver
            if (settings.roleId) {
                const role = guild.roles.cache.get(settings.roleId);
                if (role) {
                    for (const joinInfo of recentMembers) {
                        const member = await guild.members.fetch(joinInfo.userId).catch(() => null);
                        if (member) {
                            member.roles.add(role, "Anti-raid sistemi tarafından tespit edildi").catch(console.error);
                        }
                    }
                }
            }
            break;
            
        case "notify":
        default:
            // Sadece bildirim gönder, özel işlem yok
            break;
    }
    
    // Ayrıca sunucu yöneticilerine DM ile bildirim gönder
    if (settings.notifyAdmins) {
        try {
            const adminMembers = guild.members.cache.filter(member => 
                member.permissions.has("ADMINISTRATOR") && !member.user.bot
            );
            
            for (const [, adminMember] of adminMembers) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`⚠️ ${guild.name} Sunucusunda Raid Tespit Edildi!`)
                    .setDescription(`Son ${settings.duration} saniye içinde ${recentMembers.length} yeni üye katıldı ve otomatik koruma harekete geçti.`)
                    .setColor(Colors.Red)
                    .addFields(
                        { name: "Uygulanan Eylem", value: getActionName(settings.action), inline: true },
                        { name: "Tespit Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();
                
                adminMember.send({ embeds: [dmEmbed] }).catch(() => {});
            }
        } catch (error) {
            console.error("Yöneticilere bildirim gönderilirken hata:", error);
        }
    }
}

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