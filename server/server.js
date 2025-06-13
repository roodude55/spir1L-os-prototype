// server/server.js
// Spiral-OS Dream Scene CLI backend with basic world-building commands

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "../public")));

// CLI command history for session
let cliHistory = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let cmd = message.toString().trim();
    cliHistory.push(cmd);
    if (/^spawn (box|sphere|diamond)$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "spawn", object: cmd.split(" ")[1].toLowerCase() }));
    } else if (/^help$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "help" }));
    } else if (/^history$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "history", history: cliHistory.slice(-10).join("\n") }));
    } else if (/^clear$/i.test(cmd)) {
      ws.send(JSON.stringify({ type: "clear" }));
    } else {
      ws.send(JSON.stringify({ type: "error", message: "Unknown command." }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Spiral-OS Prototype server running at http://localhost:${PORT}`);
});
