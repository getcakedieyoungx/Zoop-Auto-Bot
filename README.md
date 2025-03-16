# Zoop Auto Bot

An automated bot for the Zoop Telegram Mini App that handles daily tasks and auto-spinning.

Register first: 
https://t.me/zoop_app_bot?start=9zqT0XYxU

## 🔥 Features

- Automatically claims daily rewards
- Performs spins with random delays to avoid detection
- Proxy support for enhanced security
- Detailed logging for monitoring activity
- Retries on failures with smart delay mechanism
- Color-coded console output for better readability

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- Active Zoop Telegram Mini App account
- Query ID from Zoop (instructions below)
- Register first: https://t.me/zoop_app_bot?start=9zqT0XYxU

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/getcakedieyoungx/Zoop-Auto-Bot.git
   cd Zoop-Auto-Bot
   ```

2. Install dependencies:
   ```bash
   npm install axios https-proxy-agent
   ```

3. Create required files:
   - Create `token.txt` with your query ID
   - (Optional) Create `proxies.txt` for proxy support
  
    ```bash
   nano token.txt
   ```

    -- Open tokens.txt format: queryid........

## 🔧 Configuration

### Getting Your Query ID

1. Open Telegram and find the Zoop Bot
2. Start the mini app
3. Open your browser's developer tools (F12)
4. Go to the Application tab
5. Look for requests to `tgapi.zoop.com`
6. Find the `querryid` parameter in the request
7. Copy the entire querryid value into `token.txt`

### Proxy Setup (Optional)

Create a `proxies.txt` file with your proxies in the following format:

```
host:port
host:port:username:password
http://host:port
http://username:password@host:port
socks5://host:port
```

The bot will randomly select a proxy from the list.

## 🚀 Usage

Start the bot:

```bash
node zoop.js
```

The bot will:
1. Read your query ID and extract user information
2. Check and claim daily rewards if available
3. Perform spins based on your available balance
4. Automatically wait and retry when needed

## 📝 Advanced Settings

Edit the CONFIG object in `zoop.js` to adjust:

- `retryDelay`: Time between retry attempts (in milliseconds)
- `spinDelayMin`/`spinDelayMax`: Random delay range between spins
- `checkInterval`: How often to check for new spins when none are available

## 📊 Logging

All bot activity is logged to the console and saved to `bot_log.txt` for later review.



## 🌟 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Join tg, I will post bots there too.
[Telegram](https://t.me/getcakedieyoungx)

### For donations:
EVM:
0xE065339713A8D9BF897d595ED89150da521a7d09

SOLANA:
CcBPMkpMbZ4TWE8HeUWyv9CkEVqPLJ5gYe163g5SR4Vf
