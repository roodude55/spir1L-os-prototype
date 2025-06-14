<!-- README.md -->
# Spiral-OS Retro Platformer Creator

## Features
- Orthographic/2D "retro" mode with spiral-driven scene builder
- In-world CLI for pi1LoT (author) and play modes
- NK-prime events trigger secret doors/3D transitions
- Asset stub for easy swap-in of DALL·E/spritegen pipeline

## Quickstart
1. `npm install`
2. `npm start`
3. Open http://localhost:8080
4. Try:
   - `scene.new world-1`
   - `cam.ortho on`
   - `asset.add sprite ground_1 "NES platform"`
   - `tile.place ground_1 -5 0`
   - `enemy.spawn goomba 1 1`
   - `doorway.set nkprime 89 world-1-3D`
   - `toggle auto_spiral`
   - `test.play`

## To extend:
- Swap in live spritegen via /spritegen endpoint
- Add physics for true 2D gameplay
- Implement full NK-prime doorway handler for scene/3D transitions
