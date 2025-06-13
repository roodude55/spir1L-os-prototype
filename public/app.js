// public/app.js
// Spiral-OS VR CLI: Lighting, motion controls, persistent CLI history, and world-building commands

const cliForm = document.getElementById("cli-form");
const cliInput = document.getElementById("cli-input");
const scene = document.querySelector("a-scene");

// O-3 Pro math constants (to be imported from math-core in future)
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 360 * (1 - 1/PHI);
const OMEGA = 0.000437;
const FPS_IDEAL = 90;

// VR CLI message block config
const msgBlock = {
  width: 1.7,
  height: 0.22,
  gap: 0.035,
  baseY: 1.15,
  baseZ: -1.5,
};

let socket;
let vrMessages = [];
const maxVRMessages = 15;

// Color cycling for world objects (phiHue)
function phiHue(n) { return `hsl(${(n * GOLDEN_ANGLE) % 360}, 70%, 56%)`; }

// CLI log block
function addVRMessage(text, type = "system-msg") {
  if (vrMessages.length >= maxVRMessages) {
    const old = vrMessages.shift();
    if (old.entity) scene.removeChild(old.entity);
  }
  const idx = vrMessages.length;
  const y = msgBlock.baseY + (maxVRMessages - 1 - idx) * (msgBlock.height + msgBlock.gap);
  let color = "#222", textColor = "#39ff14";
  if (type === "user-msg")      { color = "#191927"; textColor = "#39ff14"; }
  else if (type === "error-msg"){ color = "#3d1a1a"; textColor = "#ff3b3b"; }
  else if (type === "spawn-msg"){ color = "#333"; textColor = "#ffd700"; }
  else if (type === "system-msg"){ color = "#233"; textColor = "#6ff"; }
  // Block entity
  const block = document.createElement("a-entity");
  block.setAttribute("geometry", { primitive: "plane", width: msgBlock.width, height: msgBlock.height });
  block.setAttribute("material", { color, opacity: 0.91, side: "double" });
  block.setAttribute("position", `0 ${y} ${msgBlock.baseZ}`);
  block.setAttribute("text", {
    value: text,
    align: "left",
    color: textColor,
    width: msgBlock.width * 1.1,
    wrapCount: 44,
    baseline: "center",
    shader: "msdf",
    font: "monoid",
    zOffset: 0.01
  });
  scene.appendChild(block);
  vrMessages.push({text, type, entity: block});
  // Restack all
  vrMessages.forEach((msg, idx2) => {
    const y2 = msgBlock.baseY + (maxVRMessages - 1 - idx2) * (msgBlock.height + msgBlock.gap);
    msg.entity.setAttribute("position", `0 ${y2} ${msgBlock.baseZ}`);
  });
}

// VR world object spawner
let objectCount = 0;
function spawnObject(type) {
  objectCount++;
  let el = document.createElement("a-entity");
  const color = phiHue(objectCount);
  // Random in front of camera, but spread out a bit
  const pos = `${(Math.random() * 3 - 1.5).toFixed(2)} 1.1 ${(Math.random() * -2.5 - 1.5).toFixed(2)}`;
  if (type === "box") {
    el.setAttribute("geometry", "primitive: box; depth: 0.5; height: 0.5; width: 0.5");
    el.setAttribute("material", `color: ${color}`);
    el.setAttribute("position", pos);
    el.setAttribute("shadow", "cast: true");
  } else if (type === "sphere") {
    el.setAttribute("geometry", "primitive: sphere; radius: 0.3");
    el.setAttribute("material", `color: ${color}`);
    el.setAttribute("position", pos);
    el.setAttribute("shadow", "cast: true");
  } else if (type === "diamond") {
    el.setAttribute("geometry", "primitive: octahedron; radius: 0.27");
    el.setAttribute("material", `color: ${color}; metalness: 0.7; roughness: 0.2`);
    el.setAttribute("position", pos);
    el.setAttribute("shadow", "cast: true");
  }
  scene.appendChild(el);
}

function connectWebSocket() {
  socket = new WebSocket(`ws://${window.location.host}`);
  socket.onopen = () => addVRMessage("[Connected to Dream Scene Server]", "system-msg");
  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "spawn" && msg.object) {
        spawnObject(msg.object);
        addVRMessage(`[Spawned ${msg.object}]`, "spawn-msg");
      } else if (msg.type === "help") {
        addVRMessage(
          "Available commands:\n" +
          "  spawn box        – Add a box to the world\n" +
          "  spawn sphere     – Add a sphere to the world\n" +
          "  spawn diamond    – Add a diamond (octahedron)\n" +
          "  clear            – Remove all objects\n" +
          "  history          – Show CLI history\n" +
          "  help             – Show this help\n", "system-msg");
      } else if (msg.type === "history" && msg.history) {
        addVRMessage(msg.history, "system-msg");
      } else if (msg.type === "clear") {
        // Remove all world objects but keep chat blocks
        Array.from(scene.querySelectorAll("a-entity"))
          .filter(e => e.hasAttribute("geometry") && !e.hasAttribute("camera"))
          .forEach(e => { if (!vrMessages.find(m => m.entity === e)) scene.removeChild(e); });
        addVRMessage("[All objects cleared]", "system-msg");
      } else if (msg.type === "error" && msg.message) {
        addVRMessage(`[Error] ${msg.message}`, "error-msg");
      }
    } catch {
      addVRMessage(`[Server]: ${event.data}`, "system-msg");
    }
  };
  socket.onclose = () => addVRMessage("[Disconnected. Refresh to reconnect.]", "error-msg");
}

let cliHistory = [];
cliForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cmd = cliInput.value.trim();
  if (!cmd) return;
  cliHistory.push(cmd);
  addVRMessage(cmd, "user-msg");
  if (socket && socket.readyState === 1) {
    socket.send(cmd);
  } else {
    addVRMessage("[Error] Not connected to server.", "error-msg");
  }
  cliInput.value = "";
});

window.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  addVRMessage("Spiral-OS Dream Scene CLI [VR-native, O-3 Pro math ready]", "system-msg");
  addVRMessage("Type 'help' to see available commands.", "system-msg");
});
