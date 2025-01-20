const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('croxydb'); 
const config = require('../../config.js');
const client = require('../../index.js');

exports.run = async (client, message, args) => {
    if (message.author.id !== config.ownerID) {
        return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
    }

    // Buton oluşturma
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('openModal')
                .setLabel('Duyuru Gönder')
                .setStyle(ButtonStyle.Primary)
        );

    await message.reply({ content: 'Duyuru göndermek için aşağıdaki butona tıklayın.', components: [row] });
};

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'openModal') {
            // Modal oluşturma
            const modal = new ModalBuilder()
                .setCustomId('reklamModal')
                .setTitle('Duyuru Mesajı Gönder');

            const mesajInput = new TextInputBuilder()
                .setCustomId('duyuruMesaj')
                .setLabel('Göndermek istediğiniz duyuru mesajını girin:')
                .setStyle(TextInputStyle.Paragraph);

            const row = new ActionRowBuilder().addComponents(mesajInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'reklamModal') {
            const duyuruMesaj = interaction.fields.getTextInputValue('duyuruMesaj');

            // Tüm verileri diziye çevirme ve uygun kullanıcıları filtreleme
            const allUsers = Object.entries(db.all()); 
            const eligibleUsers = allUsers.filter(([key, value]) => key.startsWith('economy_') && value.firstMessageBonusReceived);

            await interaction.reply(`Duyuru mesajı gönderiliyor, bu işlem biraz zaman alabilir...`);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Özel Duyuru')
                .setDescription(duyuruMesaj)
                .setFooter({ text: 'Bu mesaj otomatik olarak gönderilmiştir.' })
                .setTimestamp();

            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Botu Davet Et')
                        .setURL('https://discord.com/oauth2/authorize?client_id=1273281690722369599&permissions=8&integration_type=0&scope=bot+applications.commands') 
                        .setStyle(ButtonStyle.Link)
                );

            for (const [key, user] of eligibleUsers) {
                const userId = key.split('_')[1];
                const userObject = await client.users.fetch(userId).catch(() => null);

                if (userObject) {
                    try {
                        await userObject.send({ embeds: [embed], components: [buttonRow] });
                    } catch (error) {
                    }

                    await new Promise(resolve => setTimeout(resolve, 4000)); 
                }
            }

            await interaction.followUp('Duyuru mesajları başarıyla gönderildi!');
        }
    }
});

exports.conf = {
    aliases: ['reklam', 'duyuru']
};

exports.help = {
    name: 'reklam'
};
