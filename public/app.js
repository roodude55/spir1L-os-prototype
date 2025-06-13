// spiral-os-prototype/public/app.js
const term = new window.Terminal({
  theme: { background: "#111", foreground: "#39ff14" },
  rows: 15,
  cols: 80,
  fontSize: 16,
  fontFamily: "'Fira Mono', 'Consolas', monospace"
});

let socket;
let commandBuffer = "";

// Place terminal in DOM
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("terminal-container");
  if (container) term.open(container);
  term.write("Spiral-OS Dream Scene CLI\n$ ");
  connectWebSocket();

  term.onData(handleTerminalInput);
});

function handleTerminalInput(data) {
  if (data === "\r") {
    term.write("\r\n");
    if (commandBuffer.trim()) {
      socket.send(commandBuffer.trim());
    }
    commandBuffer = "";
    term.write("$ ");
  } else if (data === "\u007F") {
    // Handle backspace
    if (commandBuffer.length > 0) {
      commandBuffer = commandBuffer.slice(0, -1);
      term.write("\b \b");
    }
  } else {
    commandBuffer += data;
    term.write(data);
  }
}

function connectWebSocket() {
  socket = new WebSocket(`ws://${window.location.host}`);
  socket.onopen = () => {
    term.writeln("[Connected to Dream Scene Server]");
  };
  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.echo) term.writeln(msg.echo);
      if (msg.spawn) spawnAFRAMEObject(msg.spawn);
    } catch (e) {
      term.writeln("[Server]: " + event.data);
    }
  };
  socket.onclose = () => {
    term.writeln("[Disconnected. Refresh to reconnect.]");
  };
}

function spawnAFRAMEObject({ type, color, pos }) {
  const scene = document.querySelector("a-scene");
  if (!scene) return;
  let el = document.createElement("a-entity");
  if (type === "box") {
    el.setAttribute("geometry", "primitive: box");
    el.setAttribute("material", `color: ${color || "#FFD700"}`);
    el.setAttribute("position", pos || `${Math.random() * 2 - 1} 1.1 -2`);
  } else if (type === "sphere") {
    el.setAttribute("geometry", "primitive: sphere; radius: 0.25");
    el.setAttribute("material", `color: ${color || "#39ff14"}`);
    el.setAttribute("position", pos || `${Math.random() * 2 - 1} 1.2 -2.1`);
  } else {
    term.writeln(`[Unknown object: ${type}]`);
    return;
  }
  scene.appendChild(el);
}
