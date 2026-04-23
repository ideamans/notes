---
title: Mermaid風のテキストから図解を生成するGridgram
description: テキストDSL（.ggファイル）から関係図・概念図をSVG/PNGで生成するCLIツール「Gridgram」を開発した。グリッド配置による決定論的な出力と6000種類以上のTabler Iconsを組み合わせ、業務資料に馴染む図解をコードで管理できるオープンソースツールの概要を紹介する。
id: miyanaga
date: 2026-04-23 12:00:00
categories:
  - development
  - ai
  - ideas
ogp: /ogp/2026/gridgram-concept.jpg
---

業務では、物事の関係図や概念図——いわゆるポンチ絵——を作る場面がよくある。PowerPointやKeynoteでマウス操作でチクチク作ると、案外手間と時間がかかる。構造は数分で頭に浮かんでいても、それを絵にする作業だけで30分、1時間と溶けることは珍しくない。

AIがあらゆる文章やプログラムを生成できるようになった今でも、図の生成についてはまだ少し手間を感じる。コードやテキスト生成ではAI活用で生産性が上がっているものの、図作成についてはぴったりのソリューションがまだない、というのが現状の印象だ。

そこで、テキストDSL（`.gg`ファイル）からSVGとPNGを生成するCLIツール「**Gridgram**」を開発し、オープンソースで公開した。Gridgramを使うと、次のような図をテキストベースで生成できる。

<img src="/posts/2026/gridgram-concept/flow.png" alt="Gridgramで生成したフロー図：ユーザーとAIエージェントが.ggファイルを作成・編集し、ggコマンドがSVGとPNGを出力する利用フローを示す4列2行のグリッド配置図" width="1200" />

[[toc]]

---

## FaC（Figures as Code）への関心

### GraphVizからMermaid、そしてD2へ

FaC——IaC（Infrastructure as Code）をもじった造語で、Figures as Code の略——にはかねてから関心があった。コードで図解を記述するというアプローチだ。

最初に触れたのはGraphVizだった。その後[Mermaid](https://mermaid.js.org/)を試し、最近は[D2](https://d2lang.com/)を本格的に使っている。D2については[以前このブログにも書いた](/posts/2026/d2-and-freepik-agent-concept)。コンテナのネストやSVGアイコンの埋め込みができ、AIエージェントとの連携にも使いやすいツールだ。

画像生成系では[Nano Banana](https://nanobanana.ideamans.com/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=gridgram-concept)も活用している。Gemini 3から日本語テキストの扱いが安定したため、このnotesブログのOGP画像もNano Bananaで生成している。

### 既存ツールの課題

一方で、既存ツールには業務資料向けに使おうとすると気になる点がある。

**Mermaid・GraphViz・D2** のようなテキストDSL系は、グラフが横または縦に延々と伸びやすい。フローが長くなると画面からはみ出し、「このスペースに収める」という制御が難しい。プレゼン資料の1スライドや提案書の1枠に収まる図を作ろうとすると、試行錯誤が必要になる。また、見た目がテキスト出身で味気なく、提案資料で使うと **寂しい印象** になりがちだ。

**Nano Banana** のような画像生成系は逆に表現力が高く装飾も豊かだが、細かいレイアウト調整が難しく、再現性（決定論的な制御）も高くない。統一感を保つのが難しく、仕様書や提案資料に載せると **ドラマチックすぎて浮いてしまう** ことがある。

つまり、**決定論的に生成でき、かつ寂しすぎず、いい感じの見た目を両立するツール** がこれまでなかった。それがGridgramを作った背景だ。

## Gridgramのアプローチ

### まずグリッドに配置するという発想

Gridgramのアプローチは、**まずオブジェクトをグリッド（Excel風のマス目）上に配置する**ところから始まる。これがGridgramの出発点だ。

ユーザーは各ノード（アイコン）をA1・B2のようなセル座標で配置する。その上で、記述したいコネクタ（矢印）やラベルをテキストで定義すると、**グリッドの隙間を決定論的なアルゴリズムで埋めるように、互いの衝突を回避しながら自動配置**される。

このアプローチには大きな利点がある。**描画空間（アスペクト比）を事前に決められる**ことだ。たとえば「4列2行のグリッドに収める」と決めれば、2:1の画角で出力が得られる。Mermaid/D2のように「気付いたら横/縦に延びすぎていた」という事態が起こらない。

そのうえで、[Tabler Icons](https://tabler.io/icons)という6000種類以上のオープンソースアイコンライブラリを組み込んでいるため、テキストだけでなくアイコンで視覚的に装飾でき、**寂しくない見た目**を作れる。

### .ggファイルの文法

Gridgramの記法はMermaidに似ている。`.gg`拡張子のテキストファイルに記述する。

```
doc {
  cols: 4,
  theme: { primary: '#0369a1', secondary: '#0891b2', accent: '#f59e0b' },
}

region @A1:B2 "作成・編集"   color=accent/20
region @C1:C2 "変換"         color=secondary/20
region @D1:D2 "生成物"       color=primary/20

icon :user    @A1 tabler/user          "ユーザー"
icon :agent   @B1 tabler/robot         "AIエージェント"
icon :editor  @A2 tabler/pencil        "テキストエディタ"
icon :ggfile  @B2 tabler/file-code     ".ggファイル"
icon :ggcmd   @C1 tabler/terminal      "ggコマンド"
icon :svg     @D1 tabler/vector        "SVG"
icon :png     @D2 tabler/photo         "PNG"

user   --> agent   "依頼"
agent  --> ggfile  "生成"
editor --> ggfile  "直接編集"
ggfile --> ggcmd   "入力"
ggcmd  --> svg     "出力"
ggcmd  --> png     "出力"
```

`doc { cols: N }` でグリッドの列数を設定する。`icon` でノードをセル座標に配置し、`-->` でコネクタを引くと、矢印はグリッドの隙間を自動でルーティングされる。

### 実際に生成した図

上記の`.gg`ファイルを`gg`コマンドで生成すると、以下のような図が出力される。

```bash
gg flow.gg -o flow.svg
gg flow.gg -o flow.png --width 1200
```

<img src="/posts/2026/gridgram-concept/flow.png" alt="Gridgramで生成したフロー図：ユーザーとAIエージェントが.ggファイルを作成・編集し、ggコマンドがSVGとPNGを出力する利用フローを示す4列2行のグリッド配置図" width="1200" />

`cols: 4` を指定してあるので4列のグリッドに収まる。リージョンの色は `color=accent/20`（透明度20%のアクセントカラー）のように設定できる。

## インストールと使い方

### インストール

GitHubのリリースページからバイナリをダウンロードするか、Bunでインストールする。

```bash
# バイナリをダウンロード
# https://github.com/ideamans/gridgram/releases から OS / アーキテクチャに合わせて選ぶ

# または Bun でインストール（公開後）
bun install -g gridgram
```

### .ggファイルを書いてレンダリング

```bash
# SVG出力（デフォルト）
gg diagram.gg -o output.svg

# PNG出力（幅1200px）
gg diagram.gg -o output.png --width 1200

# 標準出力へ
gg diagram.gg --stdout
```

### アイコンを探す

6000種類以上のTabler Iconsの中から使いたいものを検索できる。

```bash
# キーワードで検索
gg icons --search database --limit 10

# タグで絞り込む
gg icons --tag cloud --limit 15
```

### LLM向けリファレンスを出力

AIエージェントに文法を教えたいときは`gg llm`が便利だ。

```bash
gg llm
gg llm --format json
```

## まとめと次の記事

Gridgramは「スペースを先に決めてから図を描く」という発想をテキストDSLで実現するツールだ。グリッドに収まる決定論的な出力、6000種類以上のアイコン、MermaidライクなシンプルなDSLを組み合わせた。

- 公式ドキュメント（日本語）: [https://gridgram.ideamans.com/ja/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=gridgram-concept](https://gridgram.ideamans.com/ja/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=gridgram-concept)
- GitHub: [https://github.com/ideamans/gridgram](https://github.com/ideamans/gridgram)

Gridgramでは、AIエージェントとの親和性を高めるためにいくつかの試みを行っている。Claude Codeプラグイン対応、`gh`コマンドのSkill Command対応、Context7へのドキュメント登録、`gg llm`サブコマンドやアイコン検索の設計など、コーディング系AIエージェントがGridgramを自律的に扱えるようにする工夫だ。詳細は次の記事で紹介する。

[GridgramをAIエージェントフレンドリーにする](/posts/2026/gridgram-ai-agent)
