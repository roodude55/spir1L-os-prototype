// Path: public/app.js
import { phi, GOLDEN_ANGLE } from 'https://unpkg.com/@spiral/math-core@latest/dist/index.js';

//////////////////////  CONSTANTS & GLOBALS  //////////////////////
const objectOrder = ['cell','dna','multicell','plant','flower',
                     'tree','fungus','creature','house','utility',
                     'school','library','cityhall','penguin'];
const poetic = [
  'A cell breathes life anew…','DNA spirals deeper into truth…',
  'Multicellular dreams awaken…','Plants whisper green secrets…',
  'Flowers bloom in golden ratios…','Trees reach towards infinity…',
  'Fungus quietly nurtures decay…','Creatures stir from cosmic slumber…',
  'Houses shelter evolving thought…','Utilities pulse with unseen rhythm…',
  'Schools whisper collective wisdom…','Libraries archive endless spirals…',
  'City halls govern harmonic order…'
];

let frame=0, phiN=0, autoOn=false, mode='phi43';   // modes: phi43 | phi5
let beatMs = 1300;                                 // default 1.3 s
let logBuf=[], synth, scene, group;

//////////////////////  HELPERS  //////////////////////
const hud   = ()=>document.getElementById('hud');
const cam   = ()=>document.querySelector('#cam');
const color = n => `hsl(${(GOLDEN_ANGLE*n)%360},90%,55%)`;
const pos   = n => {
  const r = 0.35*Math.pow(phi, n/12);
  const θ = n*GOLDEN_ANGLE*Math.PI/180;
  return [ r*Math.cos(θ), n*0.12, -r*Math.sin(θ) ];
};
const isPrime = n => { if(n<2) return false; for(let i=2;i<=Math.sqrt(n);i++) if(n%i===0) return false; return true; };

function log(msg){
  logBuf.push(msg); if(logBuf.length>40) logBuf.shift();
  hud().setAttribute('text','value',logBuf.join('\n'));
}
//////////////////////  AI ASSET FETCH  //////////////////////
async function getTexture(prompt){
  const res = await fetch('/imggen',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
  const {url} = await res.json();
  return url;     // stub returns placeholder on dev
}

async function spawn(n){
  if(!scene)  scene  = document.querySelector('a-scene');
  if(!group)  group  = document.getElementById('spiral-group');

  const type = objectOrder[n % objectOrder.length];
  const p    = pos(n);
  const tex  = await getTexture(`iridescent ${type} φ-spiral`);
  const ent  = document.createElement('a-entity');

  ent.setAttribute('geometry', `primitive:${type==='dodecahedron'?'dodecahedron':'sphere'}; radius:${0.1+0.03*(n%3)}`);
  ent.setAttribute('material', `color:${color(n)}; src:${tex}; metalness:0.4; roughness:0.15`);
  ent.setAttribute('position', p.join(' '));
  group.appendChild(ent);

  // NK prime epoch pivot
  if(isPrime(n)){
    group.object3D.rotation.y += Math.PI/2;
    group.object3D.scale.multiplyScalar(phi);
    log(`✨ NK-Prime pivot @ Φ${n}`);
  }

  // camera fly-to each 13th object
  if(n%13===0) cam().setAttribute('position',`${p[0]} ${p[1]+0.6} ${p[2]+2}`);
}

//////////////////////  AUDIO  //////////////////////
function initSound(){
  synth = new Tone.Synth({oscillator:{type:'sine'}}).toDestination();
  Tone.Transport.bpm.value = 161.8; Tone.Transport.start();
}
function blip(n,prime){
  if(!synth) initSound();
  const f = 220*Math.pow(phi,(n%12)/12);
  synth.triggerAttackRelease(f,'8n');
  if(prime) synth.triggerAttackRelease(f*4,'16n');
}

//////////////////////  AUTO-SPIRAL LOOP  //////////////////////
async function stepAuto(){
  if(!autoOn) return;
  phiN++;
  await spawn(phiN);
  blip(phiN,isPrime(phiN));
  log(`Φ${phiN}: ${poetic[phiN%poetic.length]}`);
  setTimeout(stepAuto, beatMs);
}

//////////////////////  CLI  //////////////////////
function startCLI(){
  const term = new Terminal({theme:{background:'#141414',foreground:'#0f0'}});
  term.open(document.getElementById('cli'));
  term.write('$ ');
  term.onData(raw=>{
    const cmd = raw.trim();
    const args = cmd.split(' ');
    if(cmd==='toggle auto_spiral'){ autoOn=!autoOn; term.write(`\r\n[${autoOn?'ON':'OFF'}] auto_spiral\r\n$ `); if(autoOn) stepAuto(); }
    else if(args[0]==='set' && args[1]==='spiral_speed'){ beatMs=Math.max(50,Math.abs(parseFloat(args[2]))*1000); term.write(`\r\nbeat=${beatMs}ms\r\n$ `); }
    else if(args[0]==='mode'){ mode=args[1]||'phi43'; term.write(`\r\nmode=${mode}\r\n$ `); }
    else term.write(`\r\n? cmd\r\n$ `);
  });
  log('Type "toggle auto_spiral" then "mode phi5" or "mode phi43".');
}

window.onload = startCLI;
