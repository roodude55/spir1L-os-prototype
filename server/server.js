// server/server.js
import express from 'express';
import fs from 'fs';
const app = express();
app.use(express.static('public'));
app.use(express.json());

app.post('/spritegen', async (req, res) => {
  // Placeholder: just return local fallback or echo URL
  const { name } = req.body;
  const path = `public/sprites/${name}.png`;
  if (fs.existsSync(path)) res.json({ url: `/sprites/${name}.png` });
  else res.json({ url: '/sprites/ground_1.png' });
});

app.listen(8080, () => console.log('Server running at http://localhost:8080'));
