// public/app.js

// -- math-core.js shim (browser safe) --
const phi = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 360 * (1 - 1/phi);
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6)
    if (n % i === 0 || n % (i+2) === 0) return false;
  return true;
}
// END shim

const cliLog = document.getElementById('cli-log');
const cliInput = document.getElementById('cli-input');
const cliForm = document.getElementById('cli-chatbox');

let cmd = '', scene = document.getElementById('scene'), levelRoot = document.getElementById('level-root');

let mode = 'pi1LoT'; // 'pi1LoT' (build) or 'play'
let spiralN = 0, autoSpiral = false, beatMs = 1000;
let grid = 1, cameraOrtho = true;
let currentScene = 'world-1';
let nkPrimeDoor = null;

// Provide fallback sprites that always resolve to a valid file (avoid src="1" bugs)
const platformerSprites = {
  'ground_1': 'sprites/ground_1.png',
  'goomba':   'sprites/goomba.png',
  'player':   'sprites/player.png',
  // add more as needed
};

// Helper: return a valid sprite path for any key (never "1")
function getSpritePath(name, fallback) {
  // If key exists, return value; else return fallback
  if (platformerSprites[name]) return platformerSprites[name];
  // If the name looks like a valid PNG path, use it; else fallback
  if (typeof name === 'string' && name.endsWith('.png')) return name;
  return fallback;
}

function echo(msg, color='#90FF00') {
  // ALLOW HTML output for help, etc.
  const span = `<div class="cli-echo" style="color:${color};margin-bottom:2px;">${msg}</div>`;
  cliLog.insertAdjacentHTML('beforeend', span);
  cliLog.scrollTop = cliLog.scrollHeight;
}

function placeTile(sprite, x, y) {
  // Always resolve to a valid PNG
  const spritePath = getSpritePath(sprite, 'sprites/ground_1.png');
  const tile = document.createElement('a-plane');
  tile.setAttribute('src', spritePath);
  tile.setAttribute('width', 1);
  tile.setAttribute('height', 1);
  tile.setAttribute('position', `${x} ${y+0.5} 0`);
  levelRoot.appendChild(tile);
}

function spawnEnemy(type, x, y) {
  // Always resolve to a valid PNG
  const spritePath = getSpritePath(type, 'sprites/goomba.png');
  const enemy = document.createElement('a-plane');
  enemy.setAttribute('src', spritePath);
  enemy.setAttribute('width', 1);
  enemy.setAttribute('height', 1);
  enemy.setAttribute('position', `${x} ${y+1} 0.02`);
  enemy.setAttribute('color', '#ff5050');
  levelRoot.appendChild(enemy);
}

function showDoorway(x, y, targetScene) {
  const door = document.getElementById('doorway');
  door.setAttribute('visible', true);
  door.setAttribute('geometry', 'primitive:plane; width:1; height:2');
  door.setAttribute('position', `${x} ${y+1} 0.03`);
  door.setAttribute('material', 'color:#FFD700; opacity:0.88');
  door.setAttribute('data-door-target', targetScene);
}

function nkPrimeCheck(n, x, y, targetScene) {
  if (isPrime(n)) {
    showDoorway(x, y, targetScene);
    echo(`✨ NK-prime doorway revealed at x=${x}! Enter to transition.`, '#FFD700');
  }
}

// Auto-spiral builder for platform tiles/enemies
async function autoSpiralBuild() {
  if (!autoSpiral) return;
  spiralN++;
  // Place tile or enemy every step
  if (spiralN % 5 === 0) placeTile('ground_1', spiralN%12-6, 0);
  if (spiralN % 11 === 0) spawnEnemy('goomba', spiralN%12-6, 1);

  // Reveal NK-prime doorway at spiralN == 89 for demo
  if (spiralN === 89) nkPrimeCheck(spiralN, 5, 0, "world-1-3D");
  setTimeout(autoSpiralBuild, beatMs);
}

// Player controls for test mode (basic WASD/jump)
function enablePlayerControls() {
  // In full build, inject 2D platformer controls here
  echo('Player controls enabled (stub)', '#00AFFF');
}

// CLI handling
cliForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = cliInput.value.trim();
  if (!input) return;
  echo(`$ ${input}`, '#aaf0e0');
  handleCmd(input);
  cliInput.value = '';
});

function handleCmd(cmd) {
  // SCENE/AUTHOR
  if (cmd.startsWith('scene.new ')) {
    currentScene = cmd.split(' ')[1];
    echo(`New scene: ${currentScene}`);
    // stub: create YAML in scenes/
  }
  else if (cmd === 'cam.ortho on') {
    cameraOrtho = true;
    // Remove projection:orthographic from attribute (A-Frame warning fix)
    document.getElementById('orthoCam').setAttribute('camera', 'active:true; zoom:140');
    echo('Camera set to orthographic (visual only; projection attribute not used).');
  }
  else if (cmd === 'cam.ortho off') {
    cameraOrtho = false;
    // Remove projection:perspective from attribute (A-Frame warning fix)
    document.getElementById('orthoCam').setAttribute('camera', 'active:true; zoom:140');
    echo('Camera set to perspective (visual only; projection attribute not used).');
  }
  else if (cmd.startsWith('grid.snap ')) {
    grid = parseFloat(cmd.split(' ')[1]) || 1;
    echo(`Grid snap set to ${grid}`);
  }
  else if (cmd.startsWith('asset.add sprite ')) {
    const [_,__,___,name,...prompt] = cmd.split(' ');
    platformerSprites[name] = `sprites/${name}.png`;
    echo(`Sprite '${name}' registered.`);
    // Stub: add DALL·E gen for sprite
  }
  else if (cmd.startsWith('tile.place ')) {
    const [_,__,name,x,y] = cmd.split(' ');
    placeTile(name, Number(x), Number(y));
    echo(`Tile '${name}' placed at (${x},${y}).`);
  }
  else if (cmd.startsWith('enemy.spawn ')) {
    const [_,__,name,x,y] = cmd.split(' ');
    spawnEnemy(name, Number(x), Number(y));
    echo(`Enemy '${name}' spawned at (${x},${y}).`);
  }
  else if (cmd.startsWith('doorway.set nkprime ')) {
    const [_,__,___,primeNum,target] = cmd.split(' ');
    nkPrimeDoor = {prime: parseInt(primeNum), target};
    echo(`NK-prime doorway set for Φ=${primeNum} to ${target}`);
  }
  else if (cmd === 'test.play') {
    mode = 'play';
    enablePlayerControls();
    echo('Switched to PLAYER mode.', '#00AFFF');
  }
  else if (cmd === 'toggle auto_spiral') {
    autoSpiral = !autoSpiral;
    echo(`[auto_spiral ${autoSpiral?'ON':'OFF'}]`);
    if (autoSpiral) autoSpiralBuild();
  }
  else if (cmd.startsWith('set spiral_speed ')) {
    beatMs = Math.max(50, Math.abs(parseFloat(cmd.split(' ')[2])*1000));
    echo(`Spiral beat = ${beatMs} ms`);
  }
  else if (cmd === 'help') {
    echo(`<b>Platformer Creator Commands:</b><br>
      <span style="color:#b8e7c7">scene.new &lt;slug&gt;</span><br>
      <span style="color:#b8e7c7">cam.ortho on|off</span><br>
      <span style="color:#b8e7c7">grid.snap &lt;step&gt;</span><br>
      <span style="color:#b8e7c7">asset.add sprite &lt;name&gt; "&lt;prompt&gt;"</span><br>
      <span style="color:#b8e7c7">tile.place &lt;sprite&gt; &lt;x&gt; &lt;y&gt;</span><br>
      <span style="color:#b8e7c7">enemy.spawn &lt;type&gt; &lt;x&gt; &lt;y&gt;</span><br>
      <span style="color:#b8e7c7">doorway.set nkprime &lt;prime&gt; &lt;scene&gt;</span><br>
      <span style="color:#b8e7c7">test.play</span><br>
      <span style="color:#b8e7c7">toggle auto_spiral</span><br>
      <span style="color:#b8e7c7">set spiral_speed &lt;s&gt;</span><br>
      <span style="color:#b8e7c7">help</span>`);
  }
  else echo('Unknown or not yet implemented command.', '#FFAAAA');
}

// Initial message
echo("<b>Spiral-OS Platformer Creator Ready.</b> Type <b>help</b> for commands.", "#ccffcc");
