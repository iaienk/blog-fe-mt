#!/bin/bash
cd /usr/local/repos/blog-fe-mt || exit
git fetch
git checkout "$1"
git pull
rm -rf dist && mkdir dist
tar -xzvf package.tar.gz -C dist
rm package.tar.gz 