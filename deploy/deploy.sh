#!/bin/bash
set -e

# Configurazione
REMOTE_USER="ubuntu"
REMOTE_HOST="13.48.27.13"
REMOTE_APP_DIR="/usr/local/repos/blog-fe-mt"
SSH_KEY="$HOME/.ssh/id_ed25519"
BRANCH=${1:-main}

# 1. Build locale
echo "📦 Building React/Vite app…"
cd F:/blog-fe-mt
npm install
npm run build

# 2. Pulisci remote e sincronizza
echo "🗑️  Pulisco dist remoto…"
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST "rm -rf $REMOTE_APP_DIR/dist && mkdir -p $REMOTE_APP_DIR/dist"

echo "🔄 Sincronizzo nuovi file…"
rsync -avz -e "ssh -i $SSH_KEY" --delete dist/ \
    $REMOTE_USER@$REMOTE_HOST:$REMOTE_APP_DIR/dist/

# 3. Aggiorna git (opzionale, se serve lato server)
echo "🌿 Aggiorno branch '$BRANCH' su server…"
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST <<EOF
  cd $REMOTE_APP_DIR
  git fetch
  git checkout $BRANCH
  git pull
EOF

# 4. Ricarica Nginx
echo "💧 Ricarico Nginx…"
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST "sudo systemctl reload nginx"

echo "✅ Deploy completo!"
 