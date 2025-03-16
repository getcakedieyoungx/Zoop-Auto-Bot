const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const CONFIG = {
  authEndpoint: "https://tgapi.zoop.com/api/oauth/telegram",
  spinEndpoint: "https://tgapi.zoop.com/api/users/spin",
  queryPath: "./token.txt",
  proxyPath: "./proxies.txt",
  retryDelay: 5000, // 5 seconds between retries on failure
  spinDelayMin: 2000, // Minimum delay between spins (2 seconds)
  spinDelayMax: 5000, // Maximum delay between spins (5 seconds)
  checkInterval: 3600000, // Check every 1 hour if no spins available
  logFile: "./bot_log.txt",
  headers: {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"133\", \"Microsoft Edge WebView2\";v=\"133\", \"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "Referer": "https://tgapp.zoop.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
};

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

const BANNER = `${COLORS.bg.black}${COLORS.fg.cyan}

GETCAKE DIEYOUNG
ZOOP AUTO BOT 

                                                                     
TG: https://t.me/getcakedieyoungx
github.com/getcakedieyoungx

${COLORS.reset}`;

function logMessage(message, type = "info") {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  
  let prefix = "";
  let color = "";
  
  switch(type) {
    case "success":
      prefix = "✅ SUCCESS";
      color = COLORS.fg.green;
      break;
    case "error":
      prefix = "❌ ERROR";
      color = COLORS.fg.red;
      break;
    case "warning":
      prefix = "⚠️ WARNING";
      color = COLORS.fg.yellow;
      break;
    case "info":
    default:
      prefix = "ℹ️ INFO";
      color = COLORS.fg.blue;
      break;
  }
  
  const styledOutput = `${color}[${timestamp}] ${prefix}: ${message}${COLORS.reset}`;
  console.log(styledOutput);
  fs.appendFileSync(CONFIG.logFile, logEntry + "\n");
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getQueryId() {
  try {
    const queryId = fs.readFileSync(CONFIG.queryPath, 'utf8').trim();
    return queryId;
  } catch (error) {
    logMessage(`Error reading query file: ${error.message}`, "error");
    throw new Error("Failed to read query file. Make sure token.txt exists with a valid query ID.");
  }
}

function parseUserIdFromQuery(queryId) {
  try {
    const params = new URLSearchParams(queryId);
    const userData = params.get('user');
    if (!userData) throw new Error("No user data found in query ID");
    const user = JSON.parse(decodeURIComponent(userData));
    return user.id;
  } catch (error) {
    logMessage(`Error parsing userId from query: ${error.message}`, "error");
    throw error;
  }
}

function loadProxies() {
  try {
    if (!fs.existsSync(CONFIG.proxyPath)) {
      logMessage("No proxies.txt found. Running without proxy.", "warning");
      return null;
    }
    const proxies = fs.readFileSync(CONFIG.proxyPath, 'utf8').split('\n').map(line => line.trim()).filter(line => line);
    if (proxies.length === 0) {
      logMessage("proxies.txt is empty. Running without proxy.", "warning");
      return null;
    }
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    return parseProxy(proxy);
  } catch (error) {
    logMessage(`Error loading proxies: ${error.message}`, "error");
    return null;
  }
}

function parseProxy(proxyString) {
  let protocol = 'http';
  let host, port, username, password;

  if (proxyString.startsWith('http://') || proxyString.startsWith('socks4://') || proxyString.startsWith('socks5://')) {
    const [proto, rest] = proxyString.split('://');
    protocol = proto;
    const parts = rest.split(':');
    if (parts.length >= 2) {
      host = parts[0];
      port = parts[1];
      if (parts.length === 4) {
        username = parts[2];
        password = parts[3];
      }
    }
  } else {
    const parts = proxyString.split(':');
    if (parts.length >= 2) {
      host = parts[0];
      port = parts[1];
      if (parts.length === 4) {
        username = parts[2];
        password = parts[3];
      }
    }
  }

  if (!host || !port) {
    logMessage(`Invalid proxy format: ${proxyString}`, "error");
    return null;
  }

  const proxyUrl = username && password 
    ? `${protocol}://${username}:${password}@${host}:${port}`
    : `${protocol}://${host}:${port}`;
  
  logMessage(`Using proxy: ${proxyUrl}`);
  return new HttpsProxyAgent(proxyUrl);
}

async function getAccessTokenAndInfo(queryId, proxyAgent) {
  try {
    const payload = { initData: queryId };
    const config = proxyAgent ? { headers: CONFIG.headers, httpsAgent: proxyAgent } : { headers: CONFIG.headers };
    const response = await axios.post(CONFIG.authEndpoint, payload, config);
    const token = response.data.data.access_token;
    const info = response.data.data.information;
    logMessage(`Access token retrieved successfully`, "success");
    logMessage(`User: ${info.username} | 🔹 Points: ${info.point} | 🎯 Spins: ${info.spin} | 🛡️ IsCheat: ${info.isCheat}`, "info");
    return { token, info };
  } catch (error) {
    logMessage(`Error getting access token: ${error.response?.data?.message || error.message}`, "error");
    throw error;
  }
}

async function checkDailyInfo(token, userId, proxyAgent) {
  try {
    const headers = { ...CONFIG.headers, "authorization": `Bearer ${token}` };
    const taskEndpoint = `https://tgapi.zoop.com/api/tasks/${userId}`;
    const config = proxyAgent ? { headers, httpsAgent: proxyAgent } : { headers };
    const response = await axios.get(taskEndpoint, config);
    logMessage(`Daily task status checked: ${response.data.data.claimed ? "Already claimed" : "Available"}`, response.data.data.claimed ? "info" : "success");
    return {
      dailyClaimed: response.data.data.claimed,
      dayClaim: response.data.data.dayClaim
    };
  } catch (error) {
    logMessage(`Error checking daily info: ${error.response?.data?.message || error.message}`, "error");
    throw error;
  }
}

async function claimDailyTask(token, userId, proxyAgent, index = 1) {
  try {
    const headers = { ...CONFIG.headers, "authorization": `Bearer ${token}` };
    const dailyTaskEndpoint = `https://tgapi.zoop.com/api/tasks/rewardDaily/${userId}`;
    const payload = { index };
    const config = proxyAgent ? { headers, httpsAgent: proxyAgent } : { headers };
    logMessage(`Attempting to claim daily task for index ${index}...`);
    const response = await axios.post(dailyTaskEndpoint, payload, config);
    logMessage(`Daily task claimed successfully! 🎁 Reward: ${JSON.stringify(response.data.data)}`, "success");
    return response.data;
  } catch (error) {
    logMessage(`Error claiming daily task: ${error.response?.data?.message || error.message}`, "error");
    throw error;
  }
}

async function performSpin(token, userId, proxyAgent) {
  try {
    const headers = { ...CONFIG.headers, "authorization": `Bearer ${token}` };
    const currentDate = new Date().toISOString();
    const payload = { userId, date: currentDate };
    const config = proxyAgent ? { headers, httpsAgent: proxyAgent } : { headers };
    
    const delay = getRandomDelay(CONFIG.spinDelayMin, CONFIG.spinDelayMax);
    logMessage(`Waiting for ${delay/1000} seconds before spinning...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    logMessage("🎰 Performing spin...");
    const response = await axios.post(CONFIG.spinEndpoint, payload, config);
    
    const reward = response.data.data.circle.name || "Unknown";
    logMessage(`Spin completed successfully! 🏆 Reward: ${reward} points`, "success");
    return response.data;
  } catch (error) {
    logMessage(`Error performing spin: ${error.response?.data?.message || error.message}`, "error");
    throw error;
  }
}

async function executeWithRetry(fn, ...args) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      return await fn(...args);
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        logMessage(`Failed after ${maxAttempts} attempts. Giving up.`, "error");
        throw error;
      }
      logMessage(`Attempt ${attempts} failed. Retrying in ${CONFIG.retryDelay/1000} seconds...`, "warning");
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
    }
  }
}

async function runBot() {
  console.log(BANNER);
  
  try {
    logMessage("Bot initialized successfully! 🚀", "success");
    
    const queryId = getQueryId();
    const userId = parseUserIdFromQuery(queryId);
    logMessage(`User ID extracted: ${userId}`);
    
    const proxyAgent = loadProxies();
    
    const { token, info } = await executeWithRetry(getAccessTokenAndInfo, queryId, proxyAgent);
    let spinCount = info.spin; 
    
    while (true) {
      const dailyInfo = await executeWithRetry(checkDailyInfo, token, userId, proxyAgent);
      
      if (!dailyInfo.dailyClaimed) {
        await executeWithRetry(claimDailyTask, token, userId, proxyAgent);
        const refreshedInfo = await executeWithRetry(getAccessTokenAndInfo, queryId, proxyAgent);
        spinCount = refreshedInfo.info.spin;
      } else {
        logMessage("Daily task already claimed today", "info");
      }
      
      if (spinCount > 0) {
        await executeWithRetry(performSpin, token, userId, proxyAgent);
        spinCount--; 
        logMessage(`Remaining spins: ${spinCount} 🎟️`, "info");
      } else {
        const waitTimeHours = CONFIG.checkInterval / (1000 * 60 * 60);
        logMessage(`No spin tickets available. Waiting for ${waitTimeHours} hours before next check...`, "warning");
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
        const refreshedInfo = await executeWithRetry(getAccessTokenAndInfo, queryId, proxyAgent);
        spinCount = refreshedInfo.info.spin;
      }
    }
  } catch (error) {
    logMessage(`Bot encountered an error: ${error.message}`, "error");
  }
}

if (!fs.existsSync(CONFIG.logFile)) {
  fs.writeFileSync(CONFIG.logFile, "");
}

runBot();

process.on('SIGINT', () => {
  logMessage("Bot stopped by user. Goodbye! 👋", "info");
  process.exit(0);
});
