 {
  "name": "app-two",
  "version": "1.0.0",
  "description": "Test Node server for OMV multi-app setup",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dockerode": "^4.0.2"
  }
}
admin@srv-nas-pi:/pool0/storage/node-apps $ cat app-two/src/index.js 
const express = require('express');
const path = require('path');
const fs = require('fs');
const { DockerPuller } = require('./puller');

const app = express();
const puller = new DockerPuller();

// --- Static files ---
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

// --- Health check ---
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Explicit root route (never falls through to source files) ---
app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// --- SSE pull endpoint ---
app.get('/api/pull', async (req, res) => {
  const image = req.query.image || 'mariadb';
  const tag = req.query.tag || 'latest';

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  const send = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await puller.pull(image, tag, (event) => {
      send('progress', event);
    });
    send('done', { image, tag });
  } catch (err) {
    send('error', { message: err.message });
  } finally {
    res.end();
  }
});

// --- Start server (PORT defined first, single listen call) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on :${PORT}`);
  console.log(`Public dir: ${PUBLIC_DIR}`);
  console.log(`index.html exists: ${fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))}`);
});
