const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.js");

module.exports = {
    name: "yardım",
    description: "Bot komutları hakkında bilgi verir",
    options: [
        {
            name: "komut",
            description: "Hakkında bilgi almak istediğiniz komut",
            type: 3,
            required: false
        }
    ],
    
    run: async (client, interaction) => {
        try {
            const commandName = interaction.options.getString("komut");
            
            // Belirli bir komut hakkında bilgi isteniyorsa
            if (commandName) {
                return await showCommandHelp(client, interaction, commandName);
            }
            
            // Kategoriye göre komutları göster
            await showCategoryMenu(client, interaction);
            
        } catch (error) {
            console.error("Yardım komutu hatası:", error);
            await interaction.reply({
                content: "Komut bilgilerini gösterirken bir hata oluştu.",
                ephemeral: true
            });
        }
    }
};

async function showCommandHelp(client, interaction, commandName) {
    // Slash komutları arasında arama
    const slashCommand = client.slashCommands.get(commandName);
    
    // Prefix komutları arasında arama
    const prefixCommand = client.prefixCommands.get(commandName) || 
                         client.prefixCommands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(commandName));
    
    if (!slashCommand && !prefixCommand) {
        return await interaction.reply({
            content: `❌ \`${commandName}\` adında bir komut bulunamadı.`,
            ephemeral: true
        });
    }
    
    const command = slashCommand || prefixCommand;
    const embed = new EmbedBuilder()
        .setColor(config.embedColor || "#5865F2")
        .setTitle(`${command.name || command.help.name} Komutu Hakkında`)
        .setDescription(command.description || command.help.description || "Açıklama bulunamadı.")
        .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
    
    // Parametre/seçenekleri ekle
    if (slashCommand && slashCommand.options && slashCommand.options.length > 0) {
        embed.addFields({
            name: "📝 Parametreler",
            value: slashCommand.options.map(option => {
                const required = option.required ? "✅" : "❌";
                return `\`${option.name}\` - ${option.description} (Gerekli: ${required})`;
            }).join("\n")
        });
    }
    
    // Prefix komut için alias'ları göster
    if (prefixCommand && prefixCommand.conf && prefixCommand.conf.aliases && prefixCommand.conf.aliases.length > 0) {
        embed.addFields({
            name: "🔄 Alternatif Kullanımlar",
            value: prefixCommand.conf.aliases.map(alias => `\`${config.prefix}${alias}\``).join(", ")
        });
    }
    
    // Örnek kullanım ekle
    if (slashCommand) {
        embed.addFields({
            name: "🔍 Kullanım",
            value: `\`/${slashCommand.name}\``
        });
    } else if (prefixCommand) {
        embed.addFields({
            name: "🔍 Kullanım",
            value: `\`${config.prefix}${prefixCommand.help.name}\``
        });
    }
    
    return await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showCategoryMenu(client, interaction) {
    // Kategorileri topla
    const categories = new Set();
    
    // Slash komut klasörleri
    fs.readdirSync("./slash").forEach(category => {
        categories.add(category);
    });
    
    // Prefix komut klasörleri
    fs.readdirSync("./prefix").forEach(category => {
        categories.add(category);
    });
    
    // Kategori menüsü oluştur
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help_category_select")
        .setPlaceholder("Bir kategori seçin")
        .setMaxValues(1)
        .setMinValues(1);
    
    // Kategori seçeneklerini ekle
    for (const category of categories) {
        let emoji;
        let name;
        
        switch (category) {
            case "genel":
                emoji = "🌍";
                name = "Genel Komutlar";
                break;
            case "moderasyon":
                emoji = "🛡️";
                name = "Moderasyon Komutları";
                break;
            case "sistemler":
                emoji = "⚙️";
                name = "Sistem Komutları";
                break;
            case "diğer":
                emoji = "🔮";
                name = "Diğer Komutlar";
                break;
            case "sunucu":
                emoji = "🏠";
                name = "Sunucu Komutları";
                break;
            case "okane":
                emoji = "💰";
                name = "Ekonomi Komutları";
                break;
            case "okane-eğlence":
                emoji = "🎮";
                name = "Ekonomi Eğlence Komutları";
                break;
            case "çekilş":
                emoji = "🎁";
                name = "Çekiliş Komutları";
                break;
            default:
                emoji = "📄";
                name = category.charAt(0).toUpperCase() + category.slice(1) + " Komutları";
        }
        
        selectMenu.addOptions({
            label: name,
            value: category,
            emoji: emoji
        });
    }
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    // Genel yardım embed'i
    const helpEmbed = new EmbedBuilder()
        .setColor(config.embedColor || "#5865F2")
        .setTitle("🤖 Bot Komutları")
        .setDescription(`
            Merhaba ${interaction.user}! Aşağıdaki menüden bir kategori seçerek o kategorideki komutları görüntüleyebilirsin.
            
            **Prefix:** \`${config.prefix}\`
            **Toplam Komut:** \`${client.slashCommands.size + client.prefixCommands.size}\`
            **Toplam Kategori:** \`${categories.size}\`
            
            Özel bilgi için: \`/yardım komut:<komut_adı>\`
        `)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
    
    const message = await interaction.reply({ embeds: [helpEmbed], components: [row], fetchReply: true, ephemeral: true });
    
    // Kategori seçimi kollektörü
    const filter = i => i.customId === "help_category_select" && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on("collect", async i => {
        const category = i.values[0];
        
        // Kategori komutlarını göster
        await showCategoryCommands(client, i, category);
    });
    
    collector.on("end", async (collected, reason) => {
        if (reason === "time") {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true)
            );
            
            await interaction.editReply({
                components: [disabledRow]
            }).catch(() => {});
        }
    });
}

async function showCategoryCommands(client, interaction, category) {
    try {
        // Kategori emojisi ve adı
        let emoji, name;
        
        switch (category) {
            case "genel": emoji = "🌍"; name = "Genel Komutlar"; break;
            case "moderasyon": emoji = "🛡️"; name = "Moderasyon Komutları"; break;
            case "sistemler": emoji = "⚙️"; name = "Sistem Komutları"; break;
            case "diğer": emoji = "🔮"; name = "Diğer Komutlar"; break;
            case "sunucu": emoji = "🏠"; name = "Sunucu Komutları"; break;
            case "okane": emoji = "💰"; name = "Ekonomi Komutları"; break;
            case "okane-eğlence": emoji = "🎮"; name = "Ekonomi Eğlence Komutları"; break;
            case "çekilş": emoji = "🎁"; name = "Çekiliş Komutları"; break;
            default: emoji = "📄"; name = category.charAt(0).toUpperCase() + category.slice(1) + " Komutları";
        }
        
        // Slash komutları
        const slashCommands = [];
        try {
            const slashPath = path.join("./slash", category);
            if (fs.existsSync(slashPath)) {
                fs.readdirSync(slashPath).filter(file => file.endsWith(".js")).forEach(file => {
                    const command = require(path.join("../../", slashPath, file));
                    slashCommands.push({
                        name: command.name,
                        description: command.description,
                        usage: `/${command.name}`
                    });
                });
            }
        } catch (error) {
            console.error(`Slash komutları yüklenirken hata (${category}):`, error);
        }
        
        // Prefix komutları
        const prefixCommands = [];
        try {
            const prefixPath = path.join("./prefix", category);
            if (fs.existsSync(prefixPath)) {
                fs.readdirSync(prefixPath).filter(file => file.endsWith(".js")).forEach(file => {
                    const command = require(path.join("../../", prefixPath, file));
                    prefixCommands.push({
                        name: command.help.name,
                        description: command.help.description,
                        usage: `${config.prefix}${command.help.name}`
                    });
                });
            }
        } catch (error) {
            console.error(`Prefix komutları yüklenirken hata (${category}):`, error);
        }
        
        // Embed oluştur
        const embed = new EmbedBuilder()
            .setColor(config.embedColor || "#5865F2")
            .setTitle(`${emoji} ${name}`)
            .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        
        // Slash komutlarını ekle
        if (slashCommands.length > 0) {
            embed.addFields({
                name: "🔹 Slash Komutları",
                value: slashCommands.map(cmd => `\`${cmd.usage}\` - ${cmd.description || "Açıklama yok"}`).join("\n")
            });
        }
        
        // Prefix komutlarını ekle
        if (prefixCommands.length > 0) {
            embed.addFields({
                name: "🔸 Prefix Komutları",
                value: prefixCommands.map(cmd => `\`${cmd.usage}\` - ${cmd.description || "Açıklama yok"}`).join("\n")
            });
        }
        
        // Komut yok ise
        if (slashCommands.length === 0 && prefixCommands.length === 0) {
            embed.setDescription(`Bu kategoride hiç komut bulunamadı!`);
        }
        
        await interaction.update({ embeds: [embed] });
        
    } catch (error) {
        console.error("Kategori komutları gösterilirken hata:", error);
        await interaction.update({ content: "Komutlar gösterilirken bir hata oluştu!", embeds: [] }).catch(() => {});
    }
} 