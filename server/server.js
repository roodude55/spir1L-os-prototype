// Path: server/server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../public')));

wss.on('connection', ws => {
  ws.on('message', msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) { return; }
    if (data.cmd) {
      const cmd = data.cmd.trim();
      if (cmd.startsWith('spawn ')) {
        const obj = cmd.split(' ')[1];
        ws.send(JSON.stringify({type: 'echo', message: `Spawning ${obj}...`}));
        ws.send(JSON.stringify({type: 'spawn', object: obj}));
      } else {
        ws.send(JSON.stringify({type: 'echo', message: `Unknown command: ${cmd}`}));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Spiral-OS prototype server running: http://localhost:${PORT}`);
});
