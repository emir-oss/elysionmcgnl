const { EmbedBuilder, Colors, ApplicationCommandOptionType } = require("discord.js");
const weather = require('weather-js');

module.exports = {
    name: "havadurumu",
    description: "Belirtilen bölgenin hava durumunu gösterir.",
    options: [
        {
            name: "şehir",
            description: "Hava durumunu görmek istediğiniz şehir",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "derece",
            description: "Derece tipi (C: Santigrat, F: Fahrenayt)",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Santigrat", value: "C" },
                { name: "Fahrenayt", value: "F" }
            ]
        }
    ],
    run: async (client, interaction) => {
        const şehir = interaction.options.getString("şehir");
        const derece = interaction.options.getString("derece") || "C";

        await interaction.deferReply();

        try {
            weather.find({ search: şehir, degreeType: derece }, function(err, result) {
                if (err) {
                    console.error(err);
                    return interaction.editReply({ content: "❌ Hava durumu bilgisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
                }
                
                if (!result || result.length === 0) {
                    return interaction.editReply({ content: "❓ Belirtilen şehir bulunamadı. Lütfen geçerli bir şehir adı girin." });
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
                
                interaction.editReply({ embeds: [weatherEmbed] });
            });
        } catch (error) {
            console.error("Hava durumu komutu hatası:", error);
            interaction.editReply({ content: "❌ Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        }
    }
} 