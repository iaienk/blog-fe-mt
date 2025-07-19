#!/usr/bin/env bash
set -euo pipefail

cd /usr/local/repos/blog-fe-mt || exit 1
BRANCH="${1:-main}"

# 1) Sincronizza con il remoto
git fetch origin
git reset --hard origin/"$BRANCH"

# 2) Controlla che l’artifact ci sia in /tmp
if [[ ! -f /tmp/package.tar.gz ]]; then
  echo "❌ /tmp/package.tar.gz non trovato!"
  exit 2
fi

# 3) Ricrea dist da zero
rm -rf dist
mkdir dist

# 4) Estrai l’archivio nella nuova dist
tar -xzf /tmp/package.tar.gz -C dist

# 5) Elimina l’archivio temporaneo
rm /tmp/package.tar.gz

echo "✅ Deploy completato. Ecco dist/assets:"
ls -la dist/assets
