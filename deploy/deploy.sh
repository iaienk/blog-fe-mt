#!/bin/bash
set -e

cd /usr/local/repos/blog-fe-mt || exit

# se non passo argomenti, uso 'main'
BRANCH="${1:-main}"

git fetch
git checkout "$BRANCH"
git pull

rm -rf dist
tar -xzvf package.tar.gz
rm package.tar.gz