// server.js - Posterr-Jellyfin backend
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const CONFIG_PATH = path.join(__dirname, '../config/config.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/themes', express.static(path.join(__dirname, '../config/themes')));

// Load or initialize config
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    const data = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load config.json:', e);
    return {};
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

let config = loadConfig();

app.get('/api/nowplaying', async (req, res) => {
  if (!config.apiKey || !config.server || !config.userId) {
    return res.status(400).json({ error: 'Missing Jellyfin config.' });
  }

  const headers = { 'X-Emby-Token': config.apiKey };

  try {
    const sessionRes = await fetch(`${config.server}/Sessions`, { headers });
    const sessions = await sessionRes.json();
    const current = sessions.find(
      s => s.UserId === config.userId && s.NowPlayingItem
    );

    if (current) {
      return res.json({ type: 'nowplaying', item: current.NowPlayingItem });
    }

    const fallbackRes = await fetch(
      `${config.server}/Users/${config.userId}/Items/Latest?IncludeItemTypes=Movie&Limit=10`,
      { headers }
    );
    const fallback = await fallbackRes.json();
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    res.json({ type: 'fallback', item: pick });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to Jellyfin', details: err.message });
  }
});

app.get('/api/test-connection', async (req, res) => {
  if (!config.apiKey || !config.server || !config.userId) {
    return res.status(400).json({ error: 'Missing Jellyfin config.' });
  }
  try {
    const test = await fetch(`${config.server}/Users/${config.userId}`, {
      headers: { 'X-Emby-Token': config.apiKey },
    });
    if (test.status === 200) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/config', (req, res) => {
  const { apiKey, ...safeConfig } = config; // Don't expose API key
  res.json(safeConfig);
});

app.post('/api/config', (req, res) => {
  const { server, apiKey, userId, dimStart, dimEnd, enableGrain, theme } = req.body;
  config = {
    server,
    apiKey,
    userId,
    dimStart,
    dimEnd,
    enableGrain,
    theme
  };
  saveConfig(config);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Posterr-Jellyfin running at http://localhost:${PORT}`);
});
