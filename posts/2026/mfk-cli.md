---
title: マネーフォワードケッサイの請求業務をAIエージェントに任せるためのOSS CLI mfk-cli
description: 請求から売掛金の回収までを引き受ける決済代行サービス、マネーフォワードケッサイのAPIをラップしたCLIを作った。請求書PDFの書き出しや毎月の請求データの準備はAIエージェントが行い、お金が絡む部分は人間が目で確かめている。
id: miyanaga
date: 2026-09-22 09:00:00
categories:
  - business
  - automation
  - ai
ogp: /ogp/2026/mfk-cli.jpg
draft: true
---

マネーフォワードケッサイは、いわゆる決済代行サービスである。請求書の発行から入金の確認まで、売掛金を回収する手間を引き受けてくれる。

- [マネーフォワードケッサイ](https://mfkessai.co.jp/)

取引先の与信審査もしてくれるし、ファクタリングのようなサービスもある。弊社は幸いお客様に恵まれているので、そちらは使ったことがない。

営業事務のいない会社には心強い味方で、弊社でもありがたく使わせてもらっている。正直なところ、AIエージェントが出てきてからは、APIの使える銀行に乗り換えて内製する道も考えている。とはいえ今のところは、こちらのお世話になっている。

マネーフォワードケッサイにもAPIが揃っているので、CLIでラップしてAIエージェントに作業させている。それが mfk-cli（コマンド名は `mfk`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/mfk-cli](https://github.com/ideamans/mfk-cli)

[[toc]]

---

## 請求書のPDFを期間でまとめて取る

いちばんよく頼むのは、経理に情報を渡すための請求書PDFの書き出しである。以前は管理画面から書き出していたが、マネーフォワードケッサイの管理画面では1枚ずつしか書き出せず、これが面倒くさかった。

いまは「8月に発行した請求書のPDFを全部ダウンロードしておいて」と頼んでいる。AIはまず対象の請求を一覧する。

```bash
# 現行（インボイス制度対応）の請求を全件取る
mfk billings qualified --page-all

# 特定の取引先の請求だけ見る
mfk billings qualified --customer-id cust_xxx --page-all
```

一覧から対象を選び、1件ずつPDFのダウンロード用URLを発行してダウンロードしていく。請求書のIDは、請求の `invoice_ids` に入っている。

```bash
# 請求書PDFのダウンロード用URLを発行して保存する
curl -sSo invoice.pdf "$(mfk billings download-signed-url <billing_id> <invoice_id> | jq -r '.items[0].signed_url')"
```

この繰り返しを自分で手作業するのは面倒だが、AIに頼めば済む。

なおマネーフォワードケッサイでは、インボイス制度が始まった2023年10月を境に、請求を取るエンドポイントが2つに分かれている。現行の請求は `billings qualified` で、旧方式の請求は `billings list` で取る。この使い分けはAI向けのリファレンスに書いてある。

## CLIで扱えるもの

マネーフォワードケッサイ API v2 で操作できるものは、ひととおりサブコマンドにしてある。書式は `mfk <リソース> <メソッド>` である。

| コマンド | 対象 |
|---|---|
| `customers` | 取引先 |
| `destinations` | 請求先 |
| `transactions` | 取引 |
| `billings` | 請求 |
| `issues` | 発行済みの請求情報 |
| `customer-examinations` / `credit-facilities` | 与信枠の審査と与信枠 |
| `payouts` / `payout-transactions` / `payout-refunds` | 振込・振込明細・返金 |

出力はJSON・表・CSVを選べる。書き込み系は `--dry-run` で送る前に中身を確かめられる。

```bash
# 取引先を表で見る
mfk customers list --format table

# 取引の全件をjqで絞る
mfk transactions list --page-all | jq '.items[] | select(.status == "passed")'

# 取引先の登録を送らずに確かめる
mfk customers create --dry-run --name "テスト株式会社" --number "CUST-001"
```

## APIがあっても使えていなかった

マネーフォワードケッサイのAPIも、以前から充実していた。ただ、手でプログラムを書いていたころは手間がかかるので、本当に頻度の多い一部の操作にしか使ってこなかった。

AIエージェントがあれば話は別である。操作をひととおりCLIにしておけば、何をどう組み合わせるかはAIに任せられる。

見積書や請求書の作成はMisocaで行っていて、そちらもCLIにしてある。

- [見積書と請求書の作成をAIエージェントに任せるためのMisoca用OSS CLI misoca-cli](/posts/2026/misoca-cli.html)

## お金が絡む業務は一度は目を通す

マネーフォワードケッサイで扱うのは、どれもお金が絡む業務である。

毎月の請求事務はほぼ自動で回っているが、AIに丸投げはしていない。AIに請求データのCSVを用意してもらい、それを目で確かめてから、アップロードする作業をしている。

完全には自動化しきれていないし、当面は目を通すつもりだ。AIは十分にミスのない作業をしてくれる。それでも大きな金額が絡む業務では、どうしても一度は目視するプロセスを入れている。

## AIエージェントから使うには

環境変数 `MFK_API_KEY` にAPIキーを入れておけば使える。サンドボックス環境も `--sandbox` で切り替えられる。

`mfk llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。全コマンドと、請求の取り方の使い分けが入っている。

```bash
mfk llm                  # Markdown
mfk llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install mfk-cli@ideamans-plugins
```

入れておけば、`mfk` が手元になくても「マネーフォワードケッサイを操作したいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。

## まとめ

- マネーフォワードケッサイは、営業事務のいない会社には心強い決済代行サービスである
- 管理画面では1枚ずつしか書き出せない請求書PDFを、期間でまとめてAIにダウンロードさせている
- マネーフォワードケッサイ API v2 の操作をひととおりCLIにし、組み合わせはAIに任せている
- お金が絡む業務は、AIが用意したCSVを目で確かめてからアップロードしている

- [ideamans/mfk-cli](https://github.com/ideamans/mfk-cli)
