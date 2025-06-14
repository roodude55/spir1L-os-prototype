<!-- USER_STORIES.md (for reference) -->

### User Stories for Spiral-OS Platformer Creator CLI

#### 1. scene.new &lt;slug&gt;
As a level creator, I want to start a new level with a unique name (slug) so I can build and save distinct platformer scenes.
- Example: `scene.new world-1`

#### 2. cam.ortho on|off
As a user, I want to toggle between orthographic and perspective camera views to suit retro platformer or 3D navigation.
- Example: `cam.ortho on`

#### 3. grid.snap &lt;step&gt;
As a creator, I want to set the grid snapping step so that tiles and enemies align neatly and evenly.
- Example: `grid.snap 1`

#### 4. asset.add sprite &lt;name&gt; "&lt;prompt&gt;"
As a creator, I want to register or generate a new sprite asset (optionally with an AI prompt) for use in my levels.
- Example: `asset.add sprite coin "A golden coin sprite"`

#### 5. tile.place &lt;sprite&gt; &lt;x&gt; &lt;y&gt;
As a builder, I want to place a specific tile sprite at grid coordinates (x, y) in the level.
- Example: `tile.place ground_1 2 0`

#### 6. enemy.spawn &lt;type&gt; &lt;x&gt; &lt;y&gt;
As a builder, I want to spawn an enemy sprite/type at coordinates (x, y) for gameplay challenge.
- Example: `enemy.spawn goomba 3 1`

#### 7. doorway.set nkprime &lt;prime&gt; &lt;scene&gt;
As a designer, I want to create a special NK-prime doorway that appears at a prime number spiral and links to a target scene.
- Example: `doorway.set nkprime 89 world-1-3D`

#### 8. test.play
As a user, I want to switch from build mode to play mode to test the current level as a player.
- Example: `test.play`

#### 9. toggle auto_spiral
As a creator, I want to automatically grow the level along a spiral (placing tiles/enemies per phi-beat) so I can quickly seed a retro level.
- Example: `toggle auto_spiral`

#### 10. set spiral_speed &lt;s&gt;
As a creator, I want to set the speed (in seconds) for the spiral auto-building beat to control how fast the auto-spiral places items.
- Example: `set spiral_speed 0.5`

#### 11. help
As a user, I want to see all available commands and their usage examples.
- Example: `help`
