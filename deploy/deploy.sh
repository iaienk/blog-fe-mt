#!/usr/bin/env bash
set -euo pipefail

cd /usr/local/repos/blog-fe-mt || exit 1
BRANCH="${1:-main}"

# 1) Porta il repo all’ultimo commit su origin/$BRANCH
git fetch origin
git reset --hard origin/"$BRANCH"

# 2) Controlla l’artifact
[[ -f package.tar.gz ]] || { echo "❌ package.tar.gz non trovato!"; exit 2; }

# 3) Pulisci la vecchia dist
rm -rf dist
mkdir dist

# 4) Estrai TUTTO dentro la nuova dist/
tar -xzf package.tar.gz -C dist

# 5) Pulisci l’archivio
rm package.tar.gz

echo "✅ Deploy completato. Contenuto di dist/:"
ls -la dist 