# 🌀 Spiral-OS Prototype: Static Scene CLI → VR (P&Q)

This is the Spiral-OS VR CLI prototype build.

## Audit Notice

**Note:** aframe@1.7.1 pulls in got@9.6.0 (moderate vulnerability). This is safe for prototype/local use; monitor for upstream fixes before production. P&Q!

## Quickstart

```bash
cd spiral-os-prototype
npm install
npm start
```

- Visit [http://localhost:8080](http://localhost:8080)
- Use the CLI to run: `spawn box`, `spawn sphere`, or `help`

## Structure

```
spiral-os-prototype/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server/
│   └── server.js
├── package.json
└── .gitignore
```

## Features

- A-Frame VR scene with Xterm.js CLI terminal.
- Spawn VR primitives (`box`, `sphere`) via terminal commands.
- WebSocket backend for real-time communication.

## P&Q

**Proceed and Quality assured!**
