#!/usr/bin/env bash
set -euo pipefail

cd /usr/local/repos/blog-fe-mt || exit 1

BRANCH="${1:-main}"
echo "→ Checking out $BRANCH"
git fetch origin
git reset --hard origin/"$BRANCH"

echo "→ Cleaning old build"
rm -rf dist
mkdir dist

echo "→ Extracting new build into dist/"
tar -xzf package.tar.gz -C dist

echo "→ Removing archive"
rm package.tar.gz

echo "→ Final dist contents:"
ls -R dist

echo "✅ Deploy completo!"
