#!/bin/bash

set -e -x

yarn install
yarn build

rsync -av --delete .vitepress/dist/ web-g6:web/vhosts/notes.ideamans.com/html/

# ナレッジパッケージ（検索・LLM向け）。knowledge.ideamans.com が検知して
# 順にインデックスする。rsync は一時ファイルへ書いてから rename するので
# 転送途中の zip を拾われない（--inplace は付けないこと）。
rsync -av knowledge/notes.zip web-g6:web/vhosts/knowledge.ideamans.com/incoming/notes.zip