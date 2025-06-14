# Path: scripts/sync-obsidian.sh
#!/usr/bin/env bash
set -e
rsync -av ~/ObsidianVault/spiral-os-narrative/ obsidian/
git add obsidian/
git commit -m "docs: sync Obsidian vault"
git push
