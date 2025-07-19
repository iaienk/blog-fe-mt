#!/usr/bin/env bash
set -e

cd /usr/local/repos/blog-fe-mt || exit

BRANCH="${1:-main}"

# 1) Sincronizza con il remoto, scartando ogni modifica
git fetch origin
git reset --hard origin/"$BRANCH"

# 2) Rimuovi la vecchia dist
rm -rf dist

# 3) Estrai l’artifact compresso (package.tar.gz dev’essere ancora presente)
tar -xzf package.tar.gz

# 4) Pulisci l’archivio
rm package.tar.gz