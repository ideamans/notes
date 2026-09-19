---
title: 見積書と請求書の作成をAIエージェントに任せるためのMisoca用OSS CLI misoca-cli
description: 見積書や請求書の多くは過去の実例の焼き増しで、AIエージェントにうってつけの雑用である。Misoca APIをラップしたCLIを作った。見本を探して帳票を作り、PDFを書き出してGmailの下書きに添付するまでをAIエージェントが行う。
id: miyanaga
date: 2026-09-21 09:00:00
categories:
  - business
  - automation
  - ai
ogp: /ogp/2026/misoca-cli.jpg
draft: true
---

見積書や請求書は、かつてはExcelでコツコツ作るか、基幹システムの一機能として用意されたものを使うかのどちらかだった。Excelは柔軟だが、とにかく面倒くさい。基幹システムは簡単な反面、融通がきかない。

Misocaは、その中間のちょうどよいところに収まったサービスだと思う。弊社でも使わせてもらっている。

- [Misoca](https://www.misoca.jp/)

ところがAIエージェントに仕事を任せるようになると、Misocaの操作ですら億劫になってきた。人は楽を覚えると、水が低きに流れるように怠惰になる。

幸いMisocaはAPIが揃っている。そこでCLIでラップして、AIエージェントに作業させている。それが misoca-cli（コマンド名は `misoca`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/misoca-cli](https://github.com/ideamans/misoca-cli)

[[toc]]

---

## 帳票づくりの多くは焼き増し

見積書や請求書の多くは、過去の実例の焼き増しである。宛先や内訳の一部を変えて作る、という単純な作業がほとんどを占める。

最近のAIエージェントなら、具体的に指示すれば、まっさらな新規の帳票でもしっかり作ってくれる。とはいえ本当に頼みたいのは、アシスタントに任せるような、見本に基づく焼き増しの方だ。これはAIエージェントにうってつけの雑用である。

具体例をみてみよう。AIには「先月のA社宛ての請求書を見本に、今月分を作って」くらいの頼み方をしている。AIが叩くのは次のようなコマンドだ。

```bash
# 見本を探す
misoca invoice list --type untrashed --condition "A社" --per-page 10

# 見本の中身を取る
misoca invoice get <id>

# 日付や内訳を差し替えて作る
misoca invoice create --json '{
  "contact_id": 1234567,
  "subject": "開発費用",
  "issue_date": "2026/09/30",
  "payment_due_on": "2026/10/31",
  "items": [
    {
      "name": "Webアプリケーション開発",
      "unit_price": 500000,
      "quantity": 1,
      "unit_name": "式",
      "tax_type": "STANDARD_TAX_10"
    }
  ]
}'
```

見本を探すところから、差し替えた内容で作るところまで、AIがまとめてやってくれる。見積書も同じ要領で作れる。

## CLIで扱えるもの

Misoca APIで操作できるものは、ひととおりサブコマンドにしてある。

| コマンド | 対象 | 主な操作 |
|---|---|---|
| `invoice` | 請求書 | 一覧・取得・作成・PDF・送付済み/入金済みの切り替え・郵送依頼 |
| `estimate` | 見積書 | 一覧・取得・作成・PDF・メール送信 |
| `delivery-slip`（`ds`） | 納品書 | 一覧・取得・作成・PDF |
| `contact` | 送り先 | 一覧・取得・作成・表示の切り替え |
| `contact-group`（`cg`） | 取引先グループ | 一覧・取得・作成・表示の切り替え |
| `item` | 品目 | 一覧・取得・作成 |

請求書の一覧は、キーワード・入金状況・送付状況・請求日の範囲などで絞り込める。

```bash
# 未入金の請求書
misoca invoice list --type untrashed --payment-status unpaid

# 8月に発行した請求書
misoca invoice list --type untrashed --from 2026/08/01 --to 2026/08/31 --per-page 100
```

## PDFを添付してGmailの下書きまで

作るだけでなく、PDFを書き出してGmailの下書きを作り、ファイルを添付するところまで、一連の作業として頼んでいる。

Gmailの操作には、Google Workspace の GitHub 組織が公開している [`gws`](https://github.com/googleworkspace/cli) コマンドを使っている。PDFを添付したメールはAIが組み立て、下書きとして保存する。

```bash
# 請求書をPDFに書き出す
misoca invoice pdf <id> -o invoice.pdf

# PDFを添付したメールを下書きとして保存する（raw はAIが組み立てる）
gws gmail users drafts create --params '{"userId":"me"}' \
  --json '{"message":{"raw":"..."}}'
```

手でやっても数分のことだが、一度面倒くさいと思ってしまうと、なかなか腰が上がらない。これは私が極端にものぐさなせいかもしれない。

経理に情報を渡すために、帳票をまとめてPDFにする場面でも重宝している。期間で絞って一覧を取り、1件ずつPDFに書き出すという繰り返しも、AIに頼めば済む。

## APIがあっても使えていなかった

MisocaのAPIは、以前から充実していた。ただ、手でプログラムを書いていたころは手間がかかるので、本当に頻度の多い一部の操作にしか使ってこなかった。

AIエージェントがあれば話は別である。操作をひととおりCLIにしておけば、何をどう組み合わせるかはAIに任せられる。見本探しから作成、PDFの書き出し、メールの下書きまでをつなげられるのは、そのおかげだ。

## それでも目視確認は外さない

とはいえ、大きなお金が絡む作業では、まだ目視確認を外せない。「これで問題ないよな」と、送る前のPDFには一度目を通している。

AIエージェントに魂を売り払ったような仕事ぶりだが、ここには私に数少なく残された、昭和生まれの頑固さがある。

## AIエージェントから使うには

最初に一度だけ `misoca auth` を実行し、ブラウザでMisocaへのアクセスを許可する。トークンは手元に保存され、以降は自動で更新される。

`misoca llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。認証、出力形式、一覧の絞り込み、帳票ごとの操作の違いが入っている。

```bash
misoca llm                  # Markdown
misoca llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install misoca-cli@ideamans-plugins
```

入れておけば、`misoca` が手元になくても「Misocaを操作したいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。

## まとめ

- 見積書や請求書の多くは過去の実例の焼き増しで、AIエージェントにうってつけの雑用である
- Misoca APIをCLIでラップし、見本探しから作成までをAIに任せている
- PDFの書き出しと、`gws` を使ったGmailの下書きへの添付まで、一連の作業として頼んでいる
- お金が絡むので、送る前のPDFには目を通している

- [ideamans/misoca-cli](https://github.com/ideamans/misoca-cli)
