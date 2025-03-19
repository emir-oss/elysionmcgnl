# 🌟 Naofumi Discord.js v14 MultiPurpose Bot 🌟

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Weeb.dev Discord" />
  </a>
</p>

🤖 **Slash and prefix Discord bot** 🤖

[🇹🇷 Türkçe sürümü okumak için buraya tıklayın](README.md)

---

## 📋 Table of Contents

- [🔧 Requirements](#requirements)
- [🚀 Getting Started](#getting-started)
- [👤 Author](#author)
- [💾 Installation](#installation)
- [✨ New Features v1.1.0](#new-features-v100)

---

## 🔧 Requirements

- [Node.js](https://nodejs.org/en/) v21 or higher
- Discord.js v14

## 🚀 Getting Started

First, make sure all the necessary tools are installed on your local machine, and then continue with these steps.

## ✨ New Features v1.1.0

- **🌡️ Weather Command**: Use `/weather [city]` and `n.weather [city]` to get weather information from around the world.
- **🎰 Slot Machine**: Test your luck with the `n.slot [amount]` command through the economy system.
- **💰 Rob Command**: Try to steal money from other users with `n.rob @user`.
- **🛡️ Anti-Raid System**: Protect your server from sudden attacks with the `/antiraid` command.
- **📊 Enhanced Bot Info Command**: Access detailed information about the bot with `/info` and `n.info`.
- **🏓 Ping Command**: Measure bot and API latency with `/ping` and `n.ping`.
- **⚙️ More Stable and Optimized Performance**: Enhanced error handling, you'll experience fewer issues.

## 💾 Installation

* [💻 VDS Installation](#vds)

### 💻 VDS

```bash
# 📂 Clone the repository
git clone https://github.com/oktayyavuz/naofumi

# 📁 Enter the directory
cd naofumi/

# 📦 Install necessary packages
npm install

# ⚙️ Personal settings
# Fill in the requirements in the config.js file
```

### 🛠️ Required Permissions

Make sure the "applications.commands" application scope is enabled under the "OAuth2" tab in the [developer portal](https://discord.com/developers/applications/).

Enable "Server Member Intents" and "Message Intents" found under the "Bot" tab in the [developer portal](https://discord.com/developers/applications/).

### ⚙️ Configuration

After cloning the project and installing all dependencies, you need to add your Discord API token to the 'config.token' file.

### 🔄 Changing Status

You can change the status of your Discord bot by editing the `activities` variables in the `/events/ready.js` file. By modifying the `ActivityType.Watching` section, you can set it to `Watching`, `Playing`, etc.

### 🚀 Running the Application

```bash
node index.js
```
or

```bash
npm run start
```
or

```bash
# 🖥️ Run the run.bat file
```

## 👤 Author

[Oktay Yavuz](https://oktaydev.com.tr/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details. 