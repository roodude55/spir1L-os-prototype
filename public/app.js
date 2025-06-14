// Path: public/app.js

// --- Terminal HUD: Focus/Blur Logic ---
const term = new Terminal();
const xtermDiv = document.getElementById('xterm-container');
const hudContainer = document.getElementById('hud-terminal-container');
let termIsFocused = true; // Start focused for demo (change to false if you want VR by default)
let autoOn = false;       // For auto-spiral demo

term.open(xtermDiv);
term.write('Spiral-OS VR Terminal\r\n$ ');

// --- Robust WebSocket Setup ---
let ws;
function connectWS() {
  ws = new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}`);
  ws.onopen = () => {
    term.write('\r\n[Connected]\r\n$ ');
    if (autoOn) ws.send(JSON.stringify({cmd:'toggle auto_spiral'}));
  };
  ws.onclose = () => {
    term.write('\r\n[Disconnected – retrying in 2s]\r\n');
    setTimeout(connectWS, 2000);
  };
  ws.onerror = () => ws.close();
  ws.onmessage = ({data}) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'echo')   term.write(`${msg.message}\r\n$ `);
      if (msg.type === 'spawn')  spawnObject(msg.object);
    } catch { /* fall through */ }
  };
}
connectWS();

// --- Terminal Input Handling (patched for blank lines) ---
let cmd = '';
term.onKey(({key, domEvent})=>{
  if(!termIsFocused) return;
  const k = domEvent.key;
  if(k==='Enter'){
    term.write('\r\n');
    if(cmd.trim()) ws.send(JSON.stringify({cmd}));
    cmd=''; term.write('$ ');
  } else if(k==='Backspace') {
    if(cmd.length) { term.write('\b \b'); cmd = cmd.slice(0,-1); }
  } else if(key && k.length===1 && !domEvent.ctrlKey && !domEvent.metaKey){
    term.write(key); cmd += key;
  }
});

// --- VR Object Spawn Logic ---
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

// --- HUD Focus/Blur Management ---
function setTerminalFocus(focus) {
  termIsFocused = focus;
  if (focus) {
    hudContainer.style.opacity = '1';
    xtermDiv.setAttribute('tabindex', '0');
    xtermDiv.focus();
    xtermDiv.style.outline = '2px solid #0f0';
  } else {
    xtermDiv.blur();
    xtermDiv.style.outline = 'none';
    // Dim HUD to suggest unfocused
    hudContainer.style.opacity = '0.55';
  }
}

// Toggle focus with `~` or Ctrl+Space, blur with Esc
window.addEventListener('keydown', e => {
  // Tilde (~) or Ctrl+Space to focus terminal
  if ((e.key === '`' || e.key === '~') || (e.ctrlKey && e.code === "Space")) {
    setTerminalFocus(true);
    e.preventDefault();
  }
  // Esc to blur terminal and give VR controls back
  if (e.key === 'Escape') {
    setTerminalFocus(false);
    e.preventDefault();
  }
});

// By default, start focused for easier dev/demo. For "VR-first", call setTerminalFocus(false) on load.
// setTerminalFocus(false);

setTerminalFocus(true);

// Optional: click on the terminal container also focuses
xtermDiv.addEventListener('mousedown', () => setTerminalFocus(true));
