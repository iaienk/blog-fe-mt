#!/usr/bin/env bash
set -euo pipefail

cd /usr/local/repos/blog-fe-mt || exit

BRANCH="${1:-main}"

# allineo esattamente al remoto
git fetch origin
git reset --hard origin/"$BRANCH"

# pulisco la vecchia build
rm -rf dist

# estraggo l’artifact (che contiene già dist/)
tar -xzf package.tar.gz

# cancello l’archivio
rm package.tar.gz

echo "✅ Deploy completato. Contenuto di dist/:"
ls -la dist