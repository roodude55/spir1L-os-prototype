// Path: scripts/get-or-create-asset.js
#!/usr/bin/env node
import fs from 'fs'; import fetch from 'node-fetch'; import { execSync } from 'child_process';
const [,,type,...promptArr]=process.argv;
const prompt = promptArr.join(' ');
const hash   = require('crypto').createHash('sha256').update(prompt).digest('hex').slice(0,16);
const file   = `assets/cache/${hash}.${type==='texture'?'png':'glb'}`;

if(fs.existsSync(file)){ console.log(file); process.exit(0); }

// Call local AI endpoint
const res = await fetch('http://localhost:8080/imggen',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({prompt})});
const {url}=await res.json(); console.log('Created:',url);
