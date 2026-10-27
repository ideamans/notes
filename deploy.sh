#!/bin/bash

set -e -x

# 手元から公開するときに使う（接続先は ~/.ssh/config の web-g6）。
# GitHub Actions はこのスクリプトを使わず、html/ にしか書けない専用鍵で dist だけを送る。
# ナレッジの zip を送るのはこのスクリプトだけ。
DEPLOY_HOST="${DEPLOY_HOST:-web-g6}"

# 一時的な通信の失敗に備えて、5回までやり直す
retry() {
  for i in 1 2 3 4 5; do
    "$@" && return 0
    sleep 5
  done
  return 1
}

yarn install
yarn build

retry rsync -av --delete .vitepress/dist/ "$DEPLOY_HOST:web/vhosts/notes.ideamans.com/html/"

# ナレッジパッケージ（検索・LLM向け）。knowledge.ideamans.com が検知して
# 順にインデックスする。rsync は一時ファイルへ書いてから rename するので
# 転送途中の zip を拾われない（--inplace は付けないこと）。
retry rsync -av knowledge/notes.zip "$DEPLOY_HOST:web/vhosts/knowledge.ideamans.com/incoming/notes.zip"
