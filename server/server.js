// server/server.js
// Spiral-OS Dream Scene: WebSocket CLI backend

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from public/
app.use(express.static(path.join(__dirname, "../public")));

// Simple command handler
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let cmd = message.toString().trim();
    if (/^spawn (box|sphere)$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "spawn", object: cmd.split(" ")[1].toLowerCase() }));
    } else if (/^help$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "help" }));
    } else {
      ws.send(JSON.stringify({ type: "error", message: "Unknown command." }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Spiral-OS Prototype server running at http://localhost:${PORT}`);
});
