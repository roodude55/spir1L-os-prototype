// public/app.js
import { phi, GOLDEN_ANGLE, isPrime } from '../server/math-core.js';

const term = new Terminal({ theme:{ background:'#181a20', foreground:'#00FF90' } });
term.open(document.getElementById('xterm'));
let cmd = '', scene = document.getElementById('scene'), levelRoot = document.getElementById('level-root');

let mode = 'pi1LoT'; // 'pi1LoT' (build) or 'play'
let spiralN = 0, autoSpiral = false, beatMs = 1000;
let grid = 1, cameraOrtho = true;
let currentScene = 'world-1';
let nkPrimeDoor = null;

const platformerSprites = {
  'ground_1': 'sprites/ground_1.png',
  'goomba':   'sprites/goomba.png',
  'player':   'sprites/player.png',
  // add more as needed
};

function echo(msg, color='#90FF00') {
  term.write(`\r\n\x1b[38;2;${parseInt(color.slice(1,3),16)};${parseInt(color.slice(3,5),16)};${parseInt(color.slice(5,7),16)}m${msg}\x1b[0m\r\n$ `);
}

function placeTile(sprite, x, y) {
  const tile = document.createElement('a-plane');
  tile.setAttribute('src', platformerSprites[sprite]||sprite);
  tile.setAttribute('width', 1);
  tile.setAttribute('height', 1);
  tile.setAttribute('position', `${x} ${y+0.5} 0`);
  levelRoot.appendChild(tile);
}

function spawnEnemy(type, x, y) {
  const enemy = document.createElement('a-plane');
  enemy.setAttribute('src', platformerSprites[type]||type);
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
    echo(`\u2728 NK-prime doorway revealed at x=${x}! Enter to transition.`, '#FFD700');
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

term.onKey(({key,domEvent})=>{
  if (domEvent.key === 'Enter') {
    term.write('\r\n');
    handleCmd(cmd.trim());
    cmd = '';
  } else if (domEvent.key === 'Backspace') {
    if (cmd.length) { term.write('\b \b'); cmd = cmd.slice(0,-1);}
  } else if (key.length === 1) {
    term.write(key);
    cmd += key;
  }
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
    document.getElementById('orthoCam').setAttribute('camera', 'active:true; projection:orthographic; zoom:140');
    echo('Camera set to orthographic.');
  }
  else if (cmd === 'cam.ortho off') {
    cameraOrtho = false;
    document.getElementById('orthoCam').setAttribute('camera', 'active:true; projection:perspective');
    echo('Camera set to perspective.');
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
    echo(`Platformer Creator Commands:
      scene.new <slug>
      cam.ortho on|off
      grid.snap <step>
      asset.add sprite <name> "<prompt>"
      tile.place <sprite> <x> <y>
      enemy.spawn <type> <x> <y>
      doorway.set nkprime <prime> <scene>
      test.play
      toggle auto_spiral
      set spiral_speed <s>
      help
    `,'#F0F090');
  }
  else echo('Unknown or not yet implemented command.', '#FFAAAA');
}

term.write('$ ');
echo("Spiral-OS Platformer Creator Ready. Type 'help' for commands.");
