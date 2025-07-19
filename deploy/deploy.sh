#!/usr/bin/env bash
set -e

# Cartella del progetto sul server
cd /usr/local/repos/blog-fe-mt || exit

# Branch di deploy (default a "main" se non lo passi)
BRANCH="${1:-main}"

# 1) Sincronizza forzatamente con il remoto, scartando ogni modifica locale
git fetch origin
git reset --hard origin/"$BRANCH"
git clean -fd

# 2) Pulisci eventuali build precedenti
rm -rf dist package.tar.gz

# 3) Estrai l’artifact (assicurati che il tuo workflow scp abbia copiato package.tar.gz qui)
tar -xzf package.tar.gz

# 4) Rimuovi l’archivio
rm package.tar.gz 