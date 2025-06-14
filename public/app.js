// Path: public/app.js

// --- WebSocket & Terminal Setup ---
const term = new Terminal();
const xtermDiv = document.getElementById('xterm-container');
term.open(xtermDiv);
term.write('Spiral-OS VR Terminal\r\n$ ');

let ws;
function connectWS() {
  ws = new WebSocket(`ws://${window.location.host}`);
  ws.onopen = () => term.write('\r\n[connected to server]\r\n$ ');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'echo') {
      term.write(data.message + '\r\n$ ');
    }
    if (data.type === 'spawn') {
      spawnObject(data.object);
    }
  };
  ws.onclose = () => setTimeout(connectWS, 1000);
}
connectWS();

// --- Terminal Input Handling ---
let cmd = '';
term.onKey(e => {
  const {key, domEvent} = e;
  if (domEvent.key === 'Enter') {
    term.write('\r\n');
    if (cmd.trim()) {
      ws.send(JSON.stringify({cmd}));
    }
    cmd = '';
  } else if (domEvent.key === 'Backspace') {
    if (cmd.length > 0) {
      term.write('\b \b');
      cmd = cmd.slice(0, -1);
    }
  } else if (!domEvent.ctrlKey && !domEvent.metaKey && domEvent.key.length === 1) {
    term.write(key);
    cmd += key;
  }
});

// --- VR Spawn Logic ---
function spawnObject(type) {
  const scene = document.querySelector('a-scene');
  const y = 1 + Math.random();
  const x = (Math.random() - 0.5) * 2;
  const z = -2 - Math.random();
  let el = document.createElement('a-entity');
  if (type === 'box') {
    el.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.5; depth: 0.5');
    el.setAttribute('material', 'color: #4CAF50');
  } else if (type === 'sphere') {
    el.setAttribute('geometry', 'primitive: sphere; radius: 0.3');
    el.setAttribute('material', 'color: #2196F3');
  } else {
    term.write('Unknown spawn type: ' + type + '\r\n$ ');
    return;
  }
  el.setAttribute('position', `${x} ${y} ${z}`);
  scene.appendChild(el);
}

// --- Draw Xterm into A-Frame plane using canvas ---
function renderTerminalToPlane() {
  const termCanvas = xtermDiv.querySelector('canvas');
  if (!termCanvas) return requestAnimationFrame(renderTerminalToPlane);
  const aframeEntity = document.getElementById('terminal-canvas');
  if (aframeEntity && termCanvas) {
    const tex = new THREE.Texture(termCanvas);
    tex.needsUpdate = true;
    aframeEntity.setAttribute('material', 'map', tex);
  }
}
renderTerminalToPlane();
