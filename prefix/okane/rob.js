const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");
const ms = require("ms");

exports.run = async (client, message, args) => {
    // Ekonomi sistemi açık mı kontrol et
    const economyEnabled = db.get("economyEnabled");
    if (!economyEnabled) {
        return message.reply("Ekonomi sistemi şu anda kapalı.");
    }

    // Hedef kullanıcı belirleme
    const target = message.mentions.users.first();
    if (!target) {
        return message.reply("Kimden çalmak istediğinizi etiketlemelisiniz! Örnek: `n.rob @kullanıcı`");
    }

    // Hedef kullanıcı kontrolleri
    if (target.id === message.author.id) {
        return message.reply("❌ Kendinizden para çalamazsınız!");
    }

    if (target.bot) {
        return message.reply("❌ Botlardan para çalamaz mısın lütfen?");
    }

    // Kullanıcı ve hedef kullanıcı ekonomi verilerini al
    const userData = db.get(`economy_${message.author.id}`) || { money: 0, level: 1, xp: 0 };
    const targetData = db.get(`economy_${target.id}`) || { money: 0, level: 1, xp: 0 };

    // Hedefin parası var mı kontrol et
    if (targetData.money < 100) {
        return message.reply(`❌ ${target.username} çalmaya değecek paraya sahip değil! (minimum 100 okane)`);
    }

    // Cooldown kontrolü
    const cooldown = 3600000; // 1 saat
    const lastRob = db.get(`lastRob_${message.author.id}`);
    const timeNow = Date.now();

    if (lastRob && cooldown - (timeNow - lastRob) > 0) {
        const remainingTime = cooldown - (timeNow - lastRob);
        const timeString = ms(remainingTime, { long: true })
            .replace('hours', 'saat')
            .replace('hour', 'saat')
            .replace('minutes', 'dakika')
            .replace('minute', 'dakika')
            .replace('seconds', 'saniye')
            .replace('second', 'saniye');
            
        return message.reply(`⏰ Çok sık hırsızlık yapamazsın! Tekrar denemek için **${timeString}** beklemelisin.`);
    }

    // Başarı şansını hesapla (seviye faktörü ekledim)
    const levelDifference = targetData.level - userData.level;
    let successChance = 50 - (levelDifference * 5);
    
    // Şansı sınırla (minimum %10, maksimum %75)
    successChance = Math.min(75, Math.max(10, successChance));
    
    // Rastgele başarı/başarısızlık
    const isSuccessful = Math.random() * 100 < successChance;
    
    // Çalınacak/kaybedilecek miktar
    let amount = 0;
    
    if (isSuccessful) {
        // Başarılı hırsızlık durumunda, hedefin parasının %10-30'unu çal
        const minPercent = 10;
        const maxPercent = 30;
        const stealPercent = Math.floor(Math.random() * (maxPercent - minPercent + 1)) + minPercent;
        amount = Math.floor(targetData.money * (stealPercent / 100));
        
        // Maksimum çalınabilecek miktar sınırlaması
        amount = Math.min(amount, 5000);
        
        // Para transferi
        db.subtract(`economy_${target.id}.money`, amount);
        db.add(`economy_${message.author.id}.money`, amount);
        
        // XP kazanımı
        db.add(`economy_${message.author.id}.xp`, 25);
        
        // Başarılı hırsızlık mesajları
        const successMessages = [
            `🤫 ${target.username}'in cebinden **${amount}** okane çaldınız!`,
            `💰 ${target.username} uyurken **${amount}** okane çaldınız!`,
            `🔑 ${target.username}'in kasasını kırıp **${amount}** okane çaldınız!`,
            `👛 ${target.username}'in cüzdanından **${amount}** okane aşırdınız!`,
            `🕵️ Gizlice yaklaşıp ${target.username}'den **${amount}** okane çaldınız!`
        ];
        
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        
        const embed = new EmbedBuilder()
            .setTitle("🥷 Başarılı Hırsızlık!")
            .setDescription(randomMessage)
            .setColor(Colors.Green)
            .addFields(
                { name: "💵 Çalınan Miktar", value: `${amount} okane`, inline: true },
                { name: "👤 Mağdur", value: target.username, inline: true },
                { name: "💰 Yeni Bakiyeniz", value: `${userData.money + amount} okane`, inline: true }
            )
            .setFooter({ text: `${message.author.username} şimdi bir hırsız!`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    } else {
        // Başarısız hırsızlık durumunda, paranın %5-15'ini ceza olarak öde
        const minPercent = 5;
        const maxPercent = 15;
        const finePercent = Math.floor(Math.random() * (maxPercent - minPercent + 1)) + minPercent;
        amount = Math.floor(userData.money * (finePercent / 100));
        
        // Minimum ceza
        amount = Math.max(amount, 50);
        
        // Kullanıcının bu kadar parası yoksa, tüm parasını al
        if (amount > userData.money) {
            amount = userData.money;
        }
        
        // Para cezası uygula
        db.subtract(`economy_${message.author.id}.money`, amount);
        
        // Başarısız hırsızlık mesajları
        const failMessages = [
            `👮 Sizi polis yakaladı ve **${amount}** okane para cezası ödemelisiniz!`,
            `🚨 Alarm çaldı! Kaçarken **${amount}** okane düşürdünüz.`,
            `👁️ ${target.username} sizi fark etti ve muhafızları çağırdı. **${amount}** okane cezası aldınız!`,
            `🔒 Kasa beklenenden daha güvenliydi. Kırma girişimi başarısız oldu ve **${amount}** okane kaybettiniz!`,
            `🦮 ${target.username}'in koruma köpeği sizi ısırdı! Tedavi ücreti olarak **${amount}** okane ödediniz.`
        ];
        
        const randomMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
        
        const embed = new EmbedBuilder()
            .setTitle("❌ Başarısız Hırsızlık Girişimi!")
            .setDescription(randomMessage)
            .setColor(Colors.Red)
            .addFields(
                { name: "💸 Kaybedilen Miktar", value: `${amount} okane`, inline: true },
                { name: "🎯 Hedef", value: target.username, inline: true },
                { name: "💰 Kalan Bakiyeniz", value: `${userData.money - amount} okane`, inline: true }
            )
            .setFooter({ text: `${message.author.username} kötü bir hırsız!`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
    
    // Cooldown kaydet
    db.set(`lastRob_${message.author.id}`, timeNow);
};

exports.conf = {
    aliases: ["çal", "steal"]
};

exports.help = {
    name: "rob"
}; 