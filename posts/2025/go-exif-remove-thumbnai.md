---
title: JPEGのEXIFサムネイルを削除するGo言語パッケージを公開
id: miyanaga
date: 2025-06-03 09:40:00
categories: ['image-fitness', 'development']
ogp: /ogp/2025/go-exif-remove-thumbnai.jpg
ads:
  - id: lightfile-next
---

地味なツールだが、JPEGファイルのサムネイル(EXIF)を削除するGo言語のパッケージを公開した。

- [ideamans/go\-exif\-remove\-thumbnail: A Go tool and library to remove JPEG EXIF thumbnails, preserving other EXIF data\.](https://github.com/ideamans/go-exif-remove-thumbnail)

---

## JPEGファイルの軽量化とメタデータ

JPEGファイルの軽量化においてメタデータの削除は定石だが、むやみやたらに削除すると副作用がある。

- ICCプロファイルを削除すると色味が変わってしまう。
- EXIFのOrientationを削除すると画像の縦横の向きが変わってしまう。
- DPI情報が抜け落ちてしまう(Webではそこまで重要ではないが)。

数値やテキストのメタデータは通常、そこまで大きくはない。また、多くの画像は別途Web向けに最適化されて公開されており、メタデータが整理済みである。

そう考えるとメタデータは軽量化プロセスにおいては積極的に削らない方が無難である。

しかしメタデータの中でも極端に大きいデータがある。それがサムネイルデータだ。こればかりは積極的に削除した方がよい。

そこで開発したのが本ツールである。
