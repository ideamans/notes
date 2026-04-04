#!/bin/bash

set -e -x

yarn install
yarn build

rsync -av --delete .vitepress/dist/ web-g6:web/vhosts/notes.ideamans.com/html/