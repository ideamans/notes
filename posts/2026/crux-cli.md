---
title: BigQueryとAPIに分かれたCrUXのデータをAIエージェントから引くためのOSS CLI crux-cli
description: 計測タグなしで、世界中のサイトの過去の実測値が分かるChrome UX Report（CrUX）。長期の傾向や競合比較をすぐ示せるが、使うにはBigQueryかAPIの操作が要る。AIエージェントが少ないコンテキストでそのデータに手が届くよう、両方を1つのCLIにまとめた。
id: miyanaga
date: 2026-09-23 09:00:00
categories:
  - sitespeed
  - ai
  - development
ogp: /ogp/2026/crux-cli.jpg
---

弊社ではページスピード改善について、主にフロントエンドの改善提案を行っている。そのなかで重宝しているのが、Chromeの実ユーザーの表示速度を集計した Chrome UX Report（CrUX）のデータである。

CrUXの便利なところは、計測タグをあらかじめ設置していなくても、過去の実測値がどうだったかを取得できることだ。しかも世界中のあらゆるサイトについて、それが取得できる。

おかげでサイトスピードの相談を受けたとき、速くなっているのか遅くなっているのかという長い期間の傾向を、すぐに調べられる。競合サイトと比べてどうかも同じように分かるので、説得力のある資料をその場で示せる。ここがCrUXの優れた点である。

ただ、そのデータを使うには、BigQueryかCrUX APIを操作する必要がある。長い期間の月ごとの推移はBigQuery、直近の傾向はAPIと入手先も2つに分かれていて、欲しいデータによって使い分けが要る。

AIエージェントにBigQueryやAPIを直接触らせることもできるが、クエリやリクエストの組み立てにコンテキストを多く使ってしまう。そこで、AIエージェントが少ないコンテキストでCrUXの情報に手が届くよう、CLIを作った。それが crux-cli（コマンド名は `crux`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/crux-cli](https://github.com/ideamans/crux-cli)

CrUXの数字がどこまで信じられるかは、以前に全ブラウザの計測と突き合わせて書いた。

- [CrUXはどのくらいあてになるか - Chrome限定の実測値を全ブラウザRUMと突き合わせてみた](/posts/2026/crux-vs-rum.html)

[[toc]]

---

## 2つの入手先の違い

crux-cli では、入手先ごとにコマンドを分けている。

| | BigQuery | CrUX API |
|---|---|---|
| コマンド | `crux device` | `crux history`（週ごとの推移）/ `crux record`（最新） |
| 単位 | オリジン | オリジン、または特定のページ（URL） |
| 期間 | 月ごと。長い期間をさかのぼれる | 28日間の移動集計。`history` は最大40週 |
| 費用 | クエリ料金が自分のGoogle Cloudプロジェクトにかかる | 無料（APIキーだけで使える） |
| 指標 | LCP・CLS・INP・FCP・TTFB・OnLoad・RTT・FID | LCP・CLS・INP・FCP・TTFB・RTT |

特定のページの数字を見たいときはAPIしかない。反対に、OnLoadのような指標はBigQueryにしかない。どちらを使うかは、何を知りたいかで決まる。

## どちらで引くかはAIが選ぶ

AIエージェント向けのリファレンスには、2つの入手先の違いと、どういうときにどちらを使うかの目安を書いてある。

| 知りたいこと | 使うもの |
|---|---|
| 特定のページの数字 | API（`history` か `record`） |
| APIキーしかなく、Google Cloudのプロジェクトがない | API（`history` か `record`） |
| 長い期間の月ごとの推移や、多数のオリジンをそろえた月次比較 | BigQuery（`device`） |
| OnLoadやFIDが要る | BigQuery（`device`）のみ |

具体例をみてみよう。AIに頼むときは、どちらで引くかを気にせず、知りたいことをそのまま伝えている。

```bash
# 「このサイトと競合2社の、スマホでの過去1年のLCPを比べて」
crux device -o https://example.com -o https://competitor-a.com -o https://competitor-b.com \
  -d phone --metrics lcp

# 「このページの最近の傾向を見て」
crux history -u https://example.com/products/ -d phone

# 「いまの状態だけ知りたい」
crux record -o https://example.com
```

出力は表・JSON・CSVを選べる。AIが結果を読むときはJSONを使う。

## BigQueryの料金を抑えるキャッシュ

`crux device` は、BigQueryのクエリ料金が自分のプロジェクトにかかる。そこで、オリジンと期間の組ごとに結果を手元にキャッシュし、キャッシュにないものだけBigQueryに問い合わせている。

CrUXは毎月中旬に新しい月のデータを公開する。crux-cli は最新の月を1日1回確かめ、新しい月が出ていれば取り直す。複数のオリジンを比べるときも、キャッシュにないオリジンだけを問い合わせる。

## 数字の読み違いを防ぐ

AIがCrUXの数字を読み違えないよう、JSON出力の意味もリファレンスに書いてある。

- 良好な体験の割合などは0から1の割合で表す。`0.83` は83%である
- 75パーセンタイルの値の単位は、指標ごとに決まっている
- 割合や75パーセンタイルが `0` のときは、たいていデータが足りないことを表す。これを「速い」と読まないよう書いてある

## AIエージェントから使うには

BigQueryを使うときは、Google Cloudの認証とプロジェクトの設定を一度しておく。

```bash
gcloud auth application-default login
crux auth set-project YOUR_GCP_PROJECT_ID
```

CrUX APIを使うときは、APIキーを登録するだけでよい。

```bash
crux auth set-api-key YOUR_CRUX_API_KEY
```

`crux llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。2つの入手先の違い、全コマンドとフラグ、指標ごとの良好の基準、JSON出力の意味が入っている。

```bash
crux llm                  # Markdown
crux llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install crux-cli@ideamans-plugins
```

入れておけば、`crux` が手元になくても「CrUXのデータを見たいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。crux-cli は、その記事でもファイル構成の具体例に使っている。

## まとめ

- CrUXは計測タグなしで世界中のサイトの過去の実測値が分かり、長期の傾向や競合比較をすぐ示せる
- ただしデータはBigQueryとCrUX APIの2系統に分かれ、使うにはどちらかの操作が要る
- 両方を1つのCLIにまとめ、AIエージェントが少ないコンテキストで引けるようにした。どちらで引くかの目安はAI向けのリファレンスに書いた
- BigQueryの料金を抑えるため、オリジンと期間ごとに結果をキャッシュしている
- 割合の表し方や、値が0のときの意味まで書いておき、AIが数字を読み違えないようにしている

- [ideamans/crux-cli](https://github.com/ideamans/crux-cli)
