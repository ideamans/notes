---
title: Chart.jsのグラフをCLIで画像化するOSSツール「chartjs2img」を公開
id: miyanaga
date: 2026-04-07 11:00:00
description: Chart.jsの設定JSONをコマンド一発で画像化するCLIツール「chartjs2img」をOSSとして公開。AIエージェントによるレポート自動生成で役立つ、Chart.js 4.4と12プラグイン内蔵・セットアップ不要のグラフ画像生成ツール。
categories:
  - ai
  - development
ogp: /ogp/2026/chartjs2img.jpg
qiita_id: 4738d833aa00e23dd884
---

AIエージェントによるレポート自動生成が当たり前になりつつある今、「見栄えの良いグラフをサクッと画像にしたい」という場面が増えている。そこで、Chart.jsの設定JSONを渡すだけでグラフ画像を生成できるCLIツール **chartjs2img** をOSSとして公開した。

- GitHub: [ideamans/chartjs2img](https://github.com/ideamans/chartjs2img)

[[toc]]

---

## なぜ作ったのか

私自身、AIエージェントシステムを使ったレポート作成の中で、分析結果をグラフにして画像として埋め込みたいことが何度もあった。

以前は [QuickChart](https://quickchart.io/) というOSSサービスを使っていたのだが、2つの不満があった。

1. **表現力の限界** -- Chart.jsの最新版や豊富なプラグイン（Annotation、Datalabelsなど）に対応しきれていない
2. **Webサーバー前提** -- サーバーを別途用意して稼働させる必要がある

LLMやAIエージェントによる定期レポート作成がこれからどんどん増えていくことを考えると、**コマンドラインでサッと使えて、表現力も高いツール**が欲しい。そう思って作ったのがchartjs2imgである。

## 特徴

- **Chart.js 4.4 + 12プラグイン内蔵** -- Datalabels、Annotation、Treemap、Sankey、Wordcloudなど、豊富なプラグインがすぐに使える
- **CLIで即座に画像化** -- JSONファイルを渡すだけでPNG/JPEG/WebP画像を生成
- **LLM対応** -- `chartjs2img llm`コマンドでLLM向けのナレッジを出力。エージェントのコンテキストに渡せば、エージェント自身がグラフのJSONを書ける
- **Webサーバーモードも搭載** -- QuickChartのようにHTTP APIとしても使える
- **ゼロコンフィグ** -- Chromiumが未インストールなら自動でダウンロード。面倒なセットアップは不要
- **日本語対応** -- Dockerイメージには Noto Sans CJK フォントを同梱

## インストール

macOS / Linux / WSL なら、ワンライナーでインストールできる。

```bash
curl -fsSL 'https://bin.ideamans.com/install/chartjs2img.sh' | bash
```

Windows（PowerShell）の場合はこちら。

```powershell
irm 'https://bin.ideamans.com/install/chartjs2img.ps1' | iex
```

パッケージマネージャでもインストール可能だ。

```bash
# Ubuntu / Debian
curl -fsSL https://bin.ideamans.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/ideamans-oss.gpg
echo "deb [signed-by=/usr/share/keyrings/ideamans-oss.gpg] https://bin.ideamans.com/apt oss main" | sudo tee /etc/apt/sources.list.d/ideamans-oss.list
sudo apt update && sudo apt install chartjs2img

# Chocolatey (Windows)
choco install chartjs2img
```

詳細は [インストールページ](https://bin.ideamans.com/oss/chartjs2img) を参照してほしい。

## 基本的な使い方

### JSONファイルからグラフ画像を生成

Chart.jsの設定をJSONファイルとして用意し、`render`サブコマンドで画像化する。

```bash
chartjs2img render -i chart.json -o chart.png
```

たとえば、以下のようなシンプルなJSONで棒グラフが生成できる。

```json
{
  "type": "bar",
  "data": {
    "labels": ["January", "February", "March", "April", "May", "June"],
    "datasets": [{
      "label": "Revenue ($K)",
      "data": [12, 19, 3, 5, 2, 15],
      "backgroundColor": [
        "rgba(255, 99, 132, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(153, 102, 255, 0.7)",
        "rgba(255, 159, 64, 0.7)"
      ]
    }]
  }
}
```

出力されるグラフはこのようになる。

![棒グラフの出力例](/2026/chartjs2img/examples/01-bar-chart.png)

### 標準入力からの生成

パイプで渡すことも可能なので、LLMの出力をそのまま流し込むような使い方もできる。

```bash
echo '{"type":"bar","data":{"labels":["A","B","C"],"datasets":[{"data":[10,20,30]}]}}' | chartjs2img render -o output.png
```

### サイズやフォーマットの指定

```bash
chartjs2img render -i chart.json -o chart.png -w 1200 -h 400 -f png
chartjs2img render -i chart.json -o chart.webp -f webp -q 90
```

## 出力例

chartjs2imgで生成できるグラフの例を紹介する。いずれもJSONを渡すだけで生成したものだ。

### シンプルなグラフ

まずは基本的な例から。棒グラフと折れ線グラフを重ねた複合チャートや、日本語ラベルを使ったグラフも問題なく描画できる。

![複合チャート](/2026/chartjs2img/examples/11-mixed-chart-bar-line.png)

![日本語ラベルのグラフ](/2026/chartjs2img/examples/18-japanese-labels.png)

### 複雑なオプションを駆使したグラフ

chartjs2imgの真価は、Chart.jsの豊富なプラグインとオプションを組み合わせた高度な表現にある。Annotation、Datalabels、グラデーションなどを駆使すれば、以下のようなダッシュボード品質のグラフも生成できる。

年度業績ダッシュボード。積み上げ棒グラフ、利益率の折れ線、目標ライン、データラベルを1枚に集約した例だ。

![Company Performance Dashboard](/2026/chartjs2img/examples/complicated1.png)

Webプラットフォームの年間アナリティクス。複数指標の折れ線・棒グラフにアノテーションボックスやエリア塗りを組み合わせた例である。

![Web Platform Analytics](/2026/chartjs2img/examples/complicated2.png)

これらはすべてJSON設定だけで表現されている。Chart.js 4.4と12のプラグインの組み合わせにより、円グラフ、レーダーチャート、散布図、バブルチャート、ツリーマップなど多彩なグラフタイプにも対応している。

## LLMとの連携

chartjs2imgの大きな特徴の1つが、LLMとの親和性である。

```bash
chartjs2img llm
```

このコマンドを実行すると、Chart.jsのコア仕様、全12プラグインのオプション、JSONの書き方を網羅した約1,400行のMarkdownドキュメントが出力される。これをLLMのコンテキストウィンドウに渡せば、LLM自身が適切なChart.js設定JSONを生成できるようになる。

つまり、AIエージェントに「このデータをグラフにして」と頼むだけで、LLMがJSONを生成し、chartjs2imgが画像化するという流れが実現できるわけだ。

## Webサーバーモード

QuickChartのようにHTTP APIとしても使える。

```bash
chartjs2img serve --port 3000
```

ただし、QuickChartとは設計思想が異なる。QuickChartはURLパラメータにJSONを埋め込む方式だが、Chart.jsの豊富なプラグインを活用するとJSONが大きくなるため、chartjs2imgでは **POSTでJSONを送信し、キャッシュされた画像をダウンロードする** 方式を採用している。

```bash
# POSTでグラフを生成
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d @chart.json \
  -o chart.png

# キャッシュされた画像をハッシュで取得
curl http://localhost:3000/cache/{hash} -o chart.png
```

URLを貼るだけで表示する用途ではなく、**グラフを生成して画像としてローカルに保存し、レポートに埋め込む**という使い方を想定している。

## まとめ

chartjs2imgは、Chart.js 4.4と12のプラグインの表現力をそのままに、CLIでサッと画像化できるツールである。Chromiumの自動インストールによるゼロコンフィグ、LLM向けナレッジ出力、Webサーバーモードなど、AIエージェント時代のレポート作成に必要な機能を揃えた。

JSONを書くだけで見栄えの良いグラフ画像が手に入る。ぜひ試してみてほしい。

- GitHub: [ideamans/chartjs2img](https://github.com/ideamans/chartjs2img)
- インストール: [bin.ideamans.com/oss/chartjs2img](https://bin.ideamans.com/oss/chartjs2img)
