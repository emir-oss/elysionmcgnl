const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
    const economyEnabled = db.get("economyEnabled");

    if (!economyEnabled) {
        return message.reply("Ekonomi sistemi şu anda kapalı.");
    }

    const userData = db.get(`economy_${message.author.id}`) || { money: 0, level: 1, xp: 0 };
    
    // Kullanıcının ödemeyi nasıl gireceğini kontrol edin
    let betAmount = parseInt(args[0]);
    
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
        return message.reply("❌ Lütfen oynamak istediğiniz okane miktarını girin! Örnek: `n.slot 100`");
    }
    
    if (betAmount > userData.money) {
        return message.reply(`❌ Yeterli okane'ye sahip değilsiniz! Mevcut bakiyeniz: **${userData.money}** okane.`);
    }

    // Bahis oranları ve semboller
    const symbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "💎", "7️⃣"];
    const probabilities = [30, 25, 20, 15, 5, 3, 2]; // Toplam 100%
    const multipliers = {
        "🍒": 1.5,
        "🍋": 2,
        "🍊": 2.5,
        "🍇": 3,
        "🍉": 5,
        "💎": 10,
        "7️⃣": 20
    };
    
    // Çark sembolleri seçimi
    function selectSymbol() {
        const randomNumber = Math.floor(Math.random() * 100);
        let cumulativeProbability = 0;
        
        for (let i = 0; i < symbols.length; i++) {
            cumulativeProbability += probabilities[i];
            if (randomNumber < cumulativeProbability) {
                return symbols[i];
            }
        }
        
        return symbols[0]; // En yaygın sembolü varsayılan olarak seçin
    }
    
    // Slot makinesi çevirme
    const slots = [
        [selectSymbol(), selectSymbol(), selectSymbol()],
        [selectSymbol(), selectSymbol(), selectSymbol()],
        [selectSymbol(), selectSymbol(), selectSymbol()]
    ];
    
    // Kazanç hesaplama
    let winnings = 0;
    let resultMessages = [];
    
    // Yatay satırlar kontrolü
    for (let i = 0; i < 3; i++) {
        if (slots[i][0] === slots[i][1] && slots[i][1] === slots[i][2]) {
            const symbol = slots[i][0];
            const lineWin = betAmount * multipliers[symbol];
            winnings += lineWin;
            resultMessages.push(`${i+1}. Sıra: ${symbol} ${symbol} ${symbol} ➡️ **${lineWin}** okane kazandınız!`);
        }
    }
    
    // Dikey sütunlar kontrolü
    for (let j = 0; j < 3; j++) {
        if (slots[0][j] === slots[1][j] && slots[1][j] === slots[2][j]) {
            const symbol = slots[0][j];
            const lineWin = betAmount * multipliers[symbol] * 1.2; // Dikey satırlar için bonus
            winnings += lineWin;
            resultMessages.push(`${j+1}. Sütun: ${symbol} ${symbol} ${symbol} ➡️ **${lineWin}** okane kazandınız!`);
        }
    }
    
    // Çapraz kontrol
    if (slots[0][0] === slots[1][1] && slots[1][1] === slots[2][2]) {
        const symbol = slots[0][0];
        const lineWin = betAmount * multipliers[symbol] * 1.5; // Çapraz için bonus
        winnings += lineWin;
        resultMessages.push(`Sol çapraz: ${symbol} ${symbol} ${symbol} ➡️ **${lineWin}** okane kazandınız!`);
    }
    
    if (slots[0][2] === slots[1][1] && slots[1][1] === slots[2][0]) {
        const symbol = slots[0][2];
        const lineWin = betAmount * multipliers[symbol] * 1.5; // Çapraz için bonus
        winnings += lineWin;
        resultMessages.push(`Sağ çapraz: ${symbol} ${symbol} ${symbol} ➡️ **${lineWin}** okane kazandınız!`);
    }
    
    // Bahsi arayüzden düşürelim
    db.subtract(`economy_${message.author.id}.money`, betAmount);
    
    // Kazancı verelim (eğer varsa)
    if (winnings > 0) {
        db.add(`economy_${message.author.id}.money`, Math.floor(winnings));
    }
    
    // Net kazanç veya kayıp
    const netResult = Math.floor(winnings) - betAmount;
    const resultText = netResult >= 0 ? `kazandınız` : `kaybettiniz`;
    
    // Slot görüntüsü oluşturma
    const slotDisplay = slots.map(row => `| ${row.join(' | ')} |`).join('\n');
    
    // Embed oluşturma
    const resultEmbed = new EmbedBuilder()
        .setTitle(`🎰 ${message.author.username}'in Slot Makinesi`)
        .setDescription(`**Bahis:** ${betAmount} okane\n\n\`\`\`\n${slotDisplay}\n\`\`\``)
        .setColor(netResult >= 0 ? Colors.Green : Colors.Red)
        .setFooter({ text: `${message.guild.name} Casino`, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setTimestamp();
    
    if (resultMessages.length > 0) {
        resultEmbed.addFields({ name: `🏆 Kazançlar`, value: resultMessages.join('\n') });
    }
    
    resultEmbed.addFields({ 
        name: `💰 Sonuç`, 
        value: `${Math.abs(netResult)} okane ${resultText}!\nYeni bakiyeniz: **${userData.money + netResult}** okane` 
    });
    
    message.reply({ embeds: [resultEmbed] });
};

exports.conf = {
    aliases: ["s", "slots"]
};

exports.help = {
    name: "slot"
}; 