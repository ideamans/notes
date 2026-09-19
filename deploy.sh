#!/bin/bash

set -e -x

# 接続先。手元では ~/.ssh/config の web-g6 を使う。
# GitHub Actions からは DEPLOY_HOST（root@web-g6.ideamans.com）と、
# 鍵を指定した RSYNC_RSH を渡して、このスクリプトをそのまま呼ぶ。
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
