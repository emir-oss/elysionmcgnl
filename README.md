# 🌟 Naofumi Discord.js v14 MultiPurpose Bot 🌟

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Weeb.dev Discord" />
  </a>
</p>

🤖 **Slahslı ve prefixli discord botu** 🤖

[🇬🇧 Click here for the English version of this README](READMEENG.md)

---

## 📋 İçerik Tablosu

- [🔧 Gereksinimler](#gereksinimler)
- [🚀 Başlarken](#başlarken)
- [👤 Yazar](#yazar)
- [💾 Kurulum](#kurulum)
- [✨ Yeni Özellikler v1.1.0](#yeni-özellikler-v100)

---

## 🔧 Gereksinimler

- [Node.js](https://nodejs.org/en/) v21 veya üzeri
- Discord.js v14

## 🚀 Başlarken

Öncelikle yerel makinenizde gerekli tüm araçların kurulu olduğundan emin olun ve ardından bu adımlara devam edin.

## ✨ Yeni Özellikler v1.1.0

- **🌡️ Hava Durumu Komutu**: `/havadurumu [şehir]` ve `n.havadurumu [şehir]` ile dünya genelinde hava durumu bilgisi alabilirsiniz.
- **🎰 Slot Makinesi**: `n.slot [miktar]` komutu ile ekonomi sistemi üzerinden şansınızı test edin.
- **💰 Çalma Komutu**: `n.rob @kullanıcı` ile diğer kullanıcılardan para çalmayı deneyin.
- **🛡️ Anti-Raid Sistemi**: `/antiraid` komutu ile sunucunuzu ani saldırılardan koruyun.
- **📊 Geliştirilmiş Bot Bilgi Komutu**: `/bilgi` ve `n.bilgi` ile bot hakkında detaylı bilgilere erişin.
- **🏓 Ping Komutu**: `/ping` ve `n.ping` ile bot ve API gecikmesini ölçün.
- **⚙️ Daha Kararlı ve Optimize Edilmiş Performans**: Hata yönetimi güçlendirildi, daha az sorun yaşayacaksınız.

## 💾 Kurulum

* [💻 VDS Kurulum](#vds)

### 💻 VDS

```bash
# 📂 Repoyu klonla
git clone https://github.com/oktayyavuz/naofumi

# 📁 Dizine girin
cd naofumi/

# 📦 Gerekli paketleri yükleyin
npm install

# ⚙️ Kişisel ayarlar
# config.js dosyasındaki gereksinimleri doldur
```

### 🛠️ Gerekli İzinler

Botunuzda, [geliştirici portalındaki](https://discord.com/developers/applications/) "OAuth2" sekmesi altında bulunabilecek "applications.commands" uygulama kapsamının etkinleştirildiğinden emin olun.

[Geliştirici portalında](https://discord.com/developers/applications/) "Bot" sekmesi altında bulunabilecek "Server_Member Intents" ve "Message Intents"nı etkinleştirin.

### ⚙️ Yapılandırma

Projeyi klonladıktan ve tüm bağımlılıkları yükledikten sonra Discord API tokeninizi 'config.token' dosyasına eklemeniz gerekir.

### 🔄 Durumu Değiştirme

`/events/ready.js` dosyasındaki `activities` değişkenlerini düzenleyerek discord botunuzun durumunu değiştirebilirsiniz. `ActivityType.Watching` kısmını değiştirerek `İzliyor`, `Oynuyor` gibi şeyler yapabilirsiniz.

### 🚀 Uygulamanın Başlatılması

```bash
node index.js
```
veya

```bash
npm run start
```
veya

```bash
# 🖥️ run.bat dosyasını çalıştırın.
```

## 👤 Yazar

[Oktay Yavuz](https://oktaydev.com.tr/)

## 📄 Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır - ayrıntılar için [LICENSE.md](LICENSE) dosyasına bakın.


