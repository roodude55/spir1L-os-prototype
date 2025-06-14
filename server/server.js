// Path: server/server.js
import express from 'express';
import fs      from 'fs';
import crypto  from 'crypto';
import { execSync } from 'child_process';
import fetch   from 'node-fetch';

const app = express(); app.use(express.json()); app.use(express.static('public'));
const CACHE = 'assets/cache'; if(!fs.existsSync(CACHE)) fs.mkdirSync(CACHE,{recursive:true});

function sha(p){ return crypto.createHash('sha256').update(p).digest('hex').slice(0,16); }

app.post('/imggen', async (req,res)=>{
  const {prompt}=req.body || {}; const id=sha(prompt);
  const file=`${CACHE}/${id}.png`;
  if(!fs.existsSync(file)){
    // TODO: replace with real DALL·E/SDXL call
    const tmp = await fetch('https://placehold.co/256x256/2222FF/EEE?text=AI+Art').then(r=>r.buffer());
    fs.writeFileSync(file,tmp);
    fs.appendFileSync(`${CACHE}/assets-log.md`,`- ${new Date().toISOString()} | ${prompt} -> ${file}\n`);
    try { execSync(`git add ${file} ${CACHE}/assets-log.md && git commit -m "chore(asset): ${id}" && git push`,{stdio:'ignore'}); }catch{}
  }
  res.json({url:`/${file}`});
});

app.listen(8080,()=>console.log('Spiral-OS dev server http://localhost:8080'));
