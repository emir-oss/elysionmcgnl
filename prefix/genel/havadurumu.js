const { EmbedBuilder, Colors } = require("discord.js");
const weather = require('weather-js');

exports.run = async (client, message, args) => {
    const şehir = args.join(" ");
    
    if (!şehir) {
        return message.reply("❌ Lütfen hava durumunu öğrenmek istediğiniz şehri belirtin! Örnek: `n.havadurumu Istanbul`");
    }
    
    const dereceSeçimi = args[args.length - 1];
    const derece = (dereceSeçimi === "F" || dereceSeçimi === "f") ? "F" : "C";
    
    if (dereceSeçimi === "F" || dereceSeçimi === "f") {
        args.pop();
    }
    
    const replyMsg = await message.reply("🔍 Hava durumu bilgisi aranıyor...");
    
    try {
        weather.find({ search: şehir, degreeType: derece }, function(err, result) {
            if (err) {
                console.error(err);
                return replyMsg.edit("❌ Hava durumu bilgisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }
            
            if (!result || result.length === 0) {
                return replyMsg.edit("❓ Belirtilen şehir bulunamadı. Lütfen geçerli bir şehir adı girin.");
            }
            
            const current = result[0].current;
            const location = result[0].location;
            
            const havaDurumu = {
                "Sunny": "Güneşli",
                "Clear": "Açık",
                "Mostly Sunny": "Çoğunlukla Güneşli",
                "Partly Sunny": "Kısmen Güneşli",
                "Partly Cloudy": "Parçalı Bulutlu",
                "Mostly Cloudy": "Çoğunlukla Bulutlu",
                "Cloudy": "Bulutlu",
                "Rain": "Yağmurlu",
                "Light Rain": "Hafif Yağmurlu",
                "Rain Showers": "Sağanak Yağışlı",
                "Thunderstorms": "Gök Gürültülü Fırtına",
                "Snow": "Karlı",
                "Light Snow": "Hafif Karlı",
                "Fog": "Sisli",
                "T-Storms": "Gök Gürültülü Fırtına",
                "Mostly Clear": "Çoğunlukla Açık"
            };
            
            const durumTR = havaDurumu[current.skytext] || current.skytext;
            
            const weatherEmbed = new EmbedBuilder()
                .setTitle(`🌡️ ${location.name} Hava Durumu`)
                .setColor(Colors.Blue)
                .setThumbnail(current.imageUrl)
                .addFields(
                    { name: '🌤️ Durum', value: `${durumTR}`, inline: true },
                    { name: '🌡️ Sıcaklık', value: `${current.temperature}° ${derece}`, inline: true },
                    { name: '🌬️ Hissedilen', value: `${current.feelslike}° ${derece}`, inline: true },
                    { name: '💨 Rüzgar', value: `${current.winddisplay}`, inline: true },
                    { name: '💧 Nem', value: `${current.humidity}%`, inline: true },
                    { name: '🌐 Zaman Dilimi', value: `UTC${location.timezone >= 0 ? '+' + location.timezone : location.timezone}`, inline: true }
                )
                .setFooter({ text: `Son güncelleme: ${current.observationtime} - ${current.observationpoint}` })
                .setTimestamp();
            
            replyMsg.edit({ content: null, embeds: [weatherEmbed] });
        });
    } catch (error) {
        console.error("Hava durumu komutu hatası:", error);
        replyMsg.edit("❌ Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

exports.conf = {
    aliases: ["hava", "weather", "hd"]
};

exports.help = {
    name: "havadurumu"
}; 