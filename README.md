# Zoop-Auto-Bot

An automated bot for the Zoop Telegram Mini App that handles daily tasks and auto-spinning.

🔥 Features

Automatically claims daily rewards
Performs spins with random delays to avoid detection
Proxy support for enhanced security
Detailed logging for monitoring activity
Retries on failures with smart delay mechanism
Color-coded console output for better readability

📋 Prerequisites

Node.js (v14 or higher)
Active Zoop Telegram Mini App account
Query ID from Zoop (instructions below)

📦 Installation

Clone the repository:
bashCopygit clone https://github.com/getcakedieyoungx/zoopbot.git
cd zoopbot

Install dependencies:
bashCopynpm install

Create required files:

Create token.txt with your query ID
(Optional) Create proxies.txt for proxy support



🔧 Configuration
Getting Your Query ID

Open Telegram and find the Zoop Bot
Start the mini app
Open your browser's developer tools (F12)
Go to the Network tab
Look for requests to tgapi.zoop.com
Find the initData parameter in the request
Copy the entire initData value into token.txt

Proxy Setup (Optional)
Create a proxies.txt file with your proxies in the following format:
Copyhost:port
host:port:username:password
http://host:port
http://username:password@host:port
socks5://host:port
The bot will randomly select a proxy from the list.
🚀 Usage
Start the bot:
bashCopynode zoop.js
The bot will:

Read your query ID and extract user information
Check and claim daily rewards if available
Perform spins based on your available balance
Automatically wait and retry when needed

📝 Advanced Settings
Edit the CONFIG object in zoop.js to adjust:

retryDelay: Time between retry attempts (in milliseconds)
spinDelayMin/spinDelayMax: Random delay range between spins
checkInterval: How often to check for new spins when none are available

📊 Logging
All bot activity is logged to the console and saved to bot_log.txt for later review.
⚠️ Disclaimer
This bot is for educational purposes only. Use at your own risk. The creators are not responsible for any account restrictions or bans resulting from the use of this bot.
📱 Contact & Support

Telegram: https://t.me/getcakedieyoungx
GitHub: https://github.com/getcakedieyoungx

🌟 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
