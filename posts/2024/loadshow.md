---
id: miyanaga
date: 2024-09-08 21:17:00
title: ページの読み込みを動画化するOSSツールを公開
---

Webページの読み込み過程を動画化し、比較できるツールをオープンソースで公開した。

![ページスピードの比較動画](/posts/2024/loadshow/compare.webp)

## 感覚的にページスピードを比較したい

Webページのスピードの評価にはLCP、Speed Indexなどさまざまな指標があるが、専門家以外には直観的ではない。

実際に端末でページを読み込んでみて感覚的に比較したいところでだが、それでは曖昧な記憶を頼りにした比較になってしまう。

そこで開発したのが、ページの読み込み過程を簡単に動画にするツール **loadshow** である。

[loadshow - GitHub](https://github.com/ideamans/loadshow/)

もちろんロードショー(roadshow)をもじっている。

ライセンスはコア技術となる[puppeteer](https://github.com/puppeteer/puppeteer)に倣い、Apache 2.0とした。気兼ねなく利用、改変、ならびにコントリビューションをいただきたい。

## 基本的な使い方

### 必要なソフトウェア

以下のソフトウェアが事前に必要となる。

- **Node.js** 20以上
- **Google Chrome**
- **ffmpeg**

MacOS、Windows、Linux(Ubuntu 22.04)で簡単に動作確認した。

### インストール

npmなどで`loadshow`をインストールする。

```bash
npm i -g loadshow
```

### ページ読み込み過程の動画化

次のコマンドで、米アップル社と米マイクロソフト社のトップページを動画化したファイル`apple.com.mp4`と`microsoft.com.mp4`を作成できる。

```bash
loadshow record https://apple.com/ ./apple.com.mp4
loadshow record https://www.microsoft.com/en-US/ ./microsoft.com.mp4
```

![apple.com](/posts/2024/loadshow/apple.com.webp)

![microsoft.com](/posts/2024/loadshow/microsoft.com.webp)

:::info ファイル形式
上記の動画は記事での表示を想定し、mp4からwebpに変換してある。
:::

### 比較動画の生成

他のツールでも可能だが、loadshowには動画を左右に並べて比較動画を作成する機能も実装してある。

```bash
loadshow juxtapose -o ./compare.mp4 ./apple.com.mp4 ./microsoft.com.mp4
```

これで冒頭で紹介した比較動画 `compare.mp4` を生成できる。

![ページスピードの比較動画](/posts/2024/loadshow/compare.webp)

## 開発の経緯

弊社ではフロントエンドのページスピード改善を支援している。

改善案のエビデンスとして[lighthouse](https://github.com/GoogleChrome/lighthouse)による各指標の計測を行うが、専門家以外の人にも成果を直観的に把握いただけるよう、社内的にこのような動画化ツールを開発していた。

作り込みが続いて中身がごちゃごちゃしてきたので、リメイクがてらオープンソース化した。

ページスピード改善への関心を高めるきっかけになれば幸いである。
