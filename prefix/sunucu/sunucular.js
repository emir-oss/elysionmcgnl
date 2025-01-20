const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../../config.js');
const client = require('../../index.js');

exports.run = async (client, message, args) => {
    if (message.author.id !== config.ownerID) {
        return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
    }

    const guilds = client.guilds.cache.map(guild => ({
        label: guild.name,
        description: `Üye sayısı: ${guild.memberCount}`,
        value: guild.id
    }));

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectGuild')
                .setPlaceholder('Bir sunucu seçin')
                .addOptions(guilds)
        );

    await message.reply({ content: 'Bilgilerini görmek istediğiniz sunucuyu seçin:', components: [row] });

    const filter = i => i.customId === 'selectGuild' && i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        await interaction.deferUpdate();
    
        const guildId = interaction.values[0];
        const guild = client.guilds.cache.get(guildId);
    
        if (guild) {
            const embed = new EmbedBuilder()
                .setTitle(`${guild.name} Sunucusu Bilgileri`)
                .setColor(0x00FF00)
                .addFields(
                    { name: "Sunucu ID", value: guild.id, inline: true },
                    { name: "Üye Sayısı", value: `${guild.memberCount}`, inline: true },
                    { name: "Sahibi", value: `${(await guild.fetchOwner()).user.tag}`, inline: true },
                    { name: "Kanal Sayısı", value: `${guild.channels.cache.size}`, inline: true },
                    { name: "Rol Sayısı", value: `${guild.roles.cache.size}`, inline: true },
                    { name: "Oluşturulma Tarihi", value: guild.createdAt.toLocaleDateString(), inline: true }
                )
                .setTimestamp();
    
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('generateTranscript')
                        .setLabel('Transcript Oluştur')
                        .setStyle(ButtonStyle.Primary)
                );
    
            await interaction.editReply({ embeds: [embed], components: [row] });
        } else {
            await interaction.editReply({ content: 'Sunucu bilgileri alınamadı.', components: [] });
        }
    });
    

    collector.on('end', collected => {
        if (collected.size === 0) {
            message.channel.send('Zaman aşımına uğradı, lütfen tekrar deneyin.');
        }
    });
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'generateTranscript') {
        const guildId = interaction.message.embeds[0].fields.find(field => field.name === 'Sunucu ID').value;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.reply('Sunucu bilgileri alınamadı.');
        }

        let transcript = `**${guild.name} Sunucusu Transcript**\n\n`;

        try {
            transcript += `Sunucu İsmi: ${guild.name}\n`;
            transcript += `Sunucu ID: ${guild.id}\n`;
            transcript += `Sunucu Sahibi: ${guild.ownerId}\n`;
            transcript += `Toplam Üye Sayısı: ${guild.memberCount}\n`;
            transcript += `Oluşturulma Tarihi: ${guild.createdAt.toLocaleDateString()}\n\n`;

            transcript += `**Kanallar**\n`;
            guild.channels.cache.forEach(channel => {
                transcript += `- ${channel.name} (${channel.type})\n`;
            });
            transcript += `\n`;

            transcript += `**Roller**\n`;
            guild.roles.cache.forEach(role => {
                transcript += `- ${role.name} (ID: ${role.id})\n`;
            });
            transcript += `\n`;

            transcript += `**Üyeler**\n`;
            const members = await guild.members.fetch();
            members.forEach(member => {
                transcript += `- ${member.user.tag} (ID: ${member.id})\n`;
            });
            transcript += `\n`;

            const transcriptFilePath = `./transcript_${guild.id}.txt`;
            fs.writeFileSync(transcriptFilePath, transcript, 'utf-8');

            const attachmentTXT = new AttachmentBuilder(transcriptFilePath);

            await interaction.reply({ content: 'Sunucu transcript\'i oluşturuldu!', files: [attachmentTXT] });

            // Delete the file after sending
            fs.unlinkSync(transcriptFilePath);

        } catch (error) {
            console.error("Transcript oluşturulurken bir hata oluştu:", error);
            await interaction.reply('Transcript oluşturulurken bir hata oluştu.');
        }
    }
});

exports.conf = {
    aliases: ['servers', 'serverinfoadmin']
};

exports.help = {
    name: 'sunucular'
};
