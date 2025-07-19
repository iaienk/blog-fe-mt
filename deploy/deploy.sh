#!/usr/bin/env bash
set -e

cd /usr/local/repos/blog-fe-mt || exit

# Branch di deploy (default main)
BRANCH="${1:-main}"

# Sincronizza forzatamente con il remoto
git fetch origin
git reset --hard origin/"$BRANCH"
git clean -fd

# 1) Rimuovi solo la vecchia dist, NON il .tar.gz
rm -rf dist

# 2) Estrai l’artifact compresso (che contiene già dist/)
tar -xzf package.tar.gz

# 3) Pulisci l’archivio
rm package.tar.gz