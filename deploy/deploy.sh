#!/bin/bash
set -e

cd /usr/local/repos/blog-fe-mt || exit

# 1) Aggiorna il codice se serve
git fetch
git checkout "$1"
git pull

# 2) Rimuovi la vecchia dist
rm -rf dist

# 3) Estrai il .tar.gz (che contiene già la cartella dist/)
tar -xzvf package.tar.gz

# 4) Pulisci l’archivio
rm package.tar.gz