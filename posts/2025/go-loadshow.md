---
id: miyanaga
title: ページ読み込みプロセスを動画化するCLIツール「Loadshow」をGo言語でリニューアル
date: 2025-12-27 14:26:00
categories:
  - sitespeed
  - development
  - technology
ogp: /ogp/2025/go-loadshow.jpg
ads:
  - id: pagespeed-rehearsal
---

PageSpeed InsightsやLighthouseでWebサイトの表示スピードを計測すると、スコアやLCP、Speed Indexなどの専門的な指標が数値で示される。しかし正直なところ、これらの数値だけを見て「このサイトは速い」「遅い」と直感的に理解できる人は少ないのではないだろうか。

そこで開発したのが、Webページの読み込みプロセスを動画として録画するCLIツール「Loadshow」だ。今回、Go言語で完全にリニューアルし、オープンソースとして公開した。

- [ideamans/go-loadshow: Records web page loading as scrolling video](https://github.com/ideamans/go-loadshow)

[[toc]]

---

## 体感時間を可視化する

読み込みスピードを比較したいとき、「実際にサイトを読み込んでみればいい」という意見があるかもしれない。しかし、それは意外と難しい。

たとえば最適化前後のサイトを比較しようとしても、両方を同時に並べて読み込むことはできない。時間的に前後する体験を記憶で比較するのは、人間の認知として限界がある。競合サイトとの比較も同様だ。

Loadshowは読み込みプロセスを録画し、MP4動画として出力する。以下は実際に録画したサンプルだ。

<video controls width="100%" style="max-width: 400px;">
  <source src="./go-loadshow/normal.mp4" type="video/mp4">
</video>

そして2つの動画を横に並べて1つの動画に合成する機能も備えている。

<video controls width="100%">
  <source src="./go-loadshow/compare.mp4" type="video/mp4">
</video>

上記は表示最適化を行う前と後を並べた比較動画だ。数値ではなく、視覚的・体感的にスピードの違いを実感できる。

## 使い方

コマンドは非常にシンプルだ。

```bash
# 読み込みプロセスを録画
loadshow record -o output.mp4 https://example.com

# 2つの動画を横に並べて比較
loadshow juxtapose -o compare.mp4 before.mp4 after.mp4
```

### オプション

デバイスのエミュレーションや動画レイアウトを細かく設定できる。

```bash
# デスクトップ端末でのエミュレーション（デフォルトはモバイル）
loadshow record -o output.mp4 --preset desktop https://example.com

# 動画の品質設定
loadshow record -o output.mp4 --quality high https://example.com

# レイアウト列数の変更
loadshow record -o output.mp4 --columns 2 https://example.com
```

詳しくは[README](https://github.com/ideamans/go-loadshow)を参照してほしい。

## なぜGo言語でリニューアルしたのか

以前からTypeScript（Node.js）版のLoadshowを公開していた。

- [ideamans/loadshow: Node.js版（旧版）](https://github.com/ideamans/loadshow)

しかしNode.js版には以下の問題があった。

1. **依存関係が多い** - Node.jsランタイム、FFmpeg、Chrome/Chromiumブラウザが事前に必要
2. **動作がもっさり** - Node.jsを経由した処理のオーバーヘッド

今回のGo言語版では、AIの力も借りながらこれらの課題を解決した。

- **単一バイナリ** - Windows/macOSではほぼ依存なしで動作
- **軽快な動作** - ネイティブバイナリによる高速な処理
- **ブラウザの自動調達** - Playwrightの機能を活用し、Chromeが未インストールでも自動でダウンロード

## 技術的な裏話：H.264と特許問題

最も苦労したのが動画フォーマットの選定だ。

デスクトップでプレビューしやすく、幅広いブラウザで再生できる動画フォーマットとしてはMP4が無難だ。特にH.264コーデックは互換性が高い。

しかしH.264には特許の問題がある。静的ライブラリとしてバインドして配布すると、GPLでの配布が求められ自由度が下がってしまう。

### OS機能の活用

幸いなことに、WindowsとmacOSにはH.264エンコードを支援するOS機能が備わっている。

- **Windows**: Media Foundation
- **macOS**: VideoToolbox

これらを活用することで、特許ライセンスの問題をクリアしつつH.264動画を出力できる。

### Linuxの課題

一方、Linuxにはこうした支援機能がない。LinuxでH.264を使うにはFFmpegが必要となる。ここは技術的な制約として残った。

### AV1によるフォールバック

もうひとつの選択肢として、AV1コーデックもサポートしている。libaomを静的にバインドすることで、外部依存なしにAV1動画を出力できる。

現時点ではAV1はmacOSのデスクトップですんなり再生できないなど、まだ互換性に課題がある。しかしフォールバック先としては十分機能する。

つまり動画出力の戦略は以下のようになっている。

1. OS支援機能（Media Foundation / VideoToolbox）が使えれば、それでH.264出力
2. 使えなければFFmpegを探す
3. FFmpegもなければAV1でフォールバック

### ブラウザの自動インストール

録画にはブラウザが必要だが、Playwrightにはブラウザの自動インストール機能がある。この機能を活用することで、Chromeがインストールされていない環境でも、初回実行時に自動でダウンロードされる。

`CHROME_PATH`環境変数やコマンドラインオプションで既存のブラウザを指定することも可能だ。

## インストール

各OSのパッケージマネージャーに対応している。

### macOS / Linux（クイックインストール）

```bash
curl -fsSL https://bin.ideamans.com/install/loadshow.sh | bash
```

### Windows（PowerShell）

```powershell
irm 'https://bin.ideamans.com/install/loadshow.ps1' | iex
```

### パッケージマネージャー

| OS | パッケージマネージャー | コマンド |
|---|---|---|
| Ubuntu/Debian | APT | `sudo apt install loadshow` |
| RHEL/CentOS/Fedora | YUM/DNF | `sudo yum install loadshow` |
| Windows | Chocolatey | `choco install loadshow` |

詳細は[インストールページ](https://bin.ideamans.com/pagespeed-quest/loadshow)を参照してほしい。

## まとめ

PageSpeed Insightsの数値がピンとこないとき、Loadshowは「もうひとつの選択肢」として使える。

- 読み込みプロセスを動画として録画
- 2つの動画を並べて視覚的に比較
- 単一バイナリで依存関係を最小化

表示高速化に取り組んでいる方は、ぜひ計測ツールのひとつとして活用してほしい。

- [ideamans/go-loadshow](https://github.com/ideamans/go-loadshow)
