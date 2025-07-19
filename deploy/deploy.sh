#!/usr/bin/env bash
set -euo pipefail

# 1) Vai nella cartella del progetto
cd /usr/local/repos/blog-fe-mt || exit 1

# 2) Determina il branch (default "main")
BRANCH="${1:-main}"

echo "→ Deploy: checkout e reset su origin/${BRANCH}"
git fetch origin
git reset --hard origin/"$BRANCH"

# 3) Controlla che l'artifact ci sia
[[ -f package.tar.gz ]] || { echo "❌ package.tar.gz non trovato!"; exit 2; }

# 4) Elimina la vecchia build e ricrea dist/
echo "→ Pulisco dist/ precedente"
rm -rf dist
mkdir dist

# 5) Estrai soltanto il contenuto di dist/ dentro la nuova cartella
echo "→ Estraggo package.tar.gz dentro dist/"
tar -xzf package.tar.gz -C dist --strip-components=1

# 6) Rimuovi l’archivio per non lasciare spazzatura
rm package.tar.gz

# 7) Stampa conferma e contenuto
echo "✅ Deploy completato. Contenuto di dist/:"
ls -la dist
