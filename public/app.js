// spiral-os-prototype/public/app.js

// Place the terminal as a HUD overlay (translucent, top-left)
const term = new window.Terminal({
  theme: { background: "#111a", foreground: "#39ff14" },
  rows: 12,
  cols: 50,
  fontSize: 14,
  fontFamily: "'Fira Mono', 'Consolas', monospace"
});

let socket;
let commandBuffer = "";

// Attach terminal to HUD overlay
document.addEventListener("DOMContentLoaded", () => {
  // Create overlay div if not present
  let hud = document.getElementById("terminal-container");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "terminal-container";
    // Style for HUD (top-left)
    hud.style.position = "absolute";
    hud.style.top = "18px";
    hud.style.left = "18px";
    hud.style.zIndex = "10";
    hud.style.background = "rgba(17,17,17,0.85)";
    hud.style.borderRadius = "8px";
    hud.style.padding = "0.5em";
    hud.style.width = "600px";
    document.body.appendChild(hud);
  }
  term.open(hud);

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
      // Support server's {type: ...} protocol
      if (msg.type === "spawn" && msg.object) {
        spawnAFRAMEObject(msg.object);
        term.writeln(`[Spawned ${msg.object}]`);
      } else if (msg.type === "help") {
        term.writeln("Available commands:");
        term.writeln("  spawn box");
        term.writeln("  spawn sphere");
        term.writeln("  help");
      } else if (msg.type === "error" && msg.message) {
        term.writeln("[Error] " + msg.message);
      }
    } catch (e) {
      term.writeln("[Server]: " + event.data);
    }
  };
  socket.onclose = () => {
    term.writeln("[Disconnected. Refresh to reconnect.]");
  };
}

function spawnAFRAMEObject(type) {
  const scene = document.querySelector("a-scene");
  if (!scene) return;
  let el = document.createElement("a-entity");
  if (type === "box") {
    el.setAttribute("geometry", "primitive: box");
    el.setAttribute("material", `color: #FFD700`);
    el.setAttribute("position", `${Math.random() * 2 - 1} 1.1 -2`);
  } else if (type === "sphere") {
    el.setAttribute("geometry", "primitive: sphere; radius: 0.25");
    el.setAttribute("material", `color: #39ff14`);
    el.setAttribute("position", `${Math.random() * 2 - 1} 1.2 -2.1`);
  } else {
    term.writeln(`[Unknown object: ${type}]`);
    return;
  }
  scene.appendChild(el);
}
