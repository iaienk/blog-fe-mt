#!/bin/bash
cd /usr/local/repos/blog-fe-mt || exit

# Step 1: Git
git fetch
git checkout "$1"
git pull

# Step 2: Reset dist
rm -rf dist && mkdir dist

# Step 3: Estrai
tar -xzvf package.tar.gz -C dist

# Step 4: Se esiste dist/dist, sposta i contenuti e rimuovi quella interna
if [ -d dist/dist ]; then
  echo "Fix: dist/dist rilevata. Spostamento file..."
  mv dist/dist/* dist/
  rm -rf dist/dist
fi

# Step 5: Pulizia archivio
rm package.tar.gz

echo "✅ Deploy completato"