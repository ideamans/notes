---
title: App Store Connectへのアプリ申請をAIエージェントに任せるためのOSS CLI apple-app-store-connect-cli
description: 初めてのiOSアプリ「日本領収書スキャン」をApp Storeに出すにあたり、申請作業の前にApp Store Connect APIを操作するCLIを作った。入稿原稿をMarkdownで持ち、AIエージェントがCLIでApp Store Connectへ反映する流れを紹介する。
id: miyanaga
date: 2026-09-20 09:01:00
categories:
  - ai
  - automation
  - development
ogp: /ogp/2026/apple-app-store-connect-cli.jpg
draft: true
---

弊社では最近、「日本領収書スキャン」という初めてのiOSアプリを作った。領収書やレシートを撮影すると、AIが解析してExcelの一覧にまとめてくれるアプリである。

- [日本領収書スキャン](https://app.receipt-scan.jp/)

アプリ自体はできたのだが、App Storeに公開する作業がまた大変だった。手順が多いうえに申請のために入力する情報も複雑で、正直なところ圧倒されてしまった。

ただ、よく見るとApp Store ConnectにはAPIが用意されている。それならAPIで入力できる部分は、できるだけAIに任せたい。そう考えて、申請作業の前にAIエージェント向けのCLIを作ることにした。

それが apple-app-store-connect-cli（コマンド名は `asc`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/apple-app-store-connect-cli](https://github.com/ideamans/apple-app-store-connect-cli)

[[toc]]

---

## App Storeへの公開で待っていた作業

アプリのビルドができても、App Storeに並ぶまでにはApp Store Connectでかなりの入力が要る。今回実際にやった作業は次のとおりだ。

- アプリ名・サブタイトル・カテゴリ・年齢制限の設定
- 説明文・キーワード・プロモーションテキスト・各種URLの入力
- iPhone用とiPad用のスクリーンショットのアップロード
- 価格と配信地域の設定
- App内課金（AI解析チケット4商品）の作成と、商品ごとの価格・説明・審査用スクリーンショット
- 審査担当者向けの連絡先とメモ
- 審査への提出

これを管理画面で1つずつ埋めていくのは、考えるだけで気が重い。しかも審査で指摘が入れば、また画面を行き来して直すことになる。

スマホアプリは開発だけでも一苦労だ。そのうえ申請のためのメタ情報の登録が、OSの機能拡張やコンプライアンスの観点から年々増えている。これも地味にアプリ公開のハードルを上げている。

## 申請作業の前にCLIを用意した

まず用意したのは、認証とAPIの呼び出しを引き受ける土台である。

```bash
# App Store Connectで発行したAPIキー（.p8）を登録する
asc configure --issuer-id <ISSUER_ID> --key ~/Downloads/AuthKey_XXXXXXXXXX.p8

# 認証の確認を兼ねてアプリ一覧を取る
asc apps list

# 専用コマンドがないエンドポイントは汎用コマンドで叩く
asc api "/v1/apps?filter[bundleId]=com.example.app"
```

キーの管理はAWS CLIと同じプロファイル方式にした。複数のチームのキーを `--profile` で切り替えられる。

App Store Connect APIの全ドメインに専用のサブコマンドがあり、専用のものがない操作も汎用の `asc api` で呼び出せる。

## 入稿原稿はMarkdownで持つ

管理画面に直接書き込むのはやめて、入力する内容はすべてリポジトリ内のMarkdownに原稿として書くことにした。具体例をみてみよう。日本領収書スキャンのリポジトリには、次のような `app-store/` ディレクトリがある。

| ファイル | 内容 | App Store Connectの画面 |
|---|---|---|
| `app-info.md` | アプリ名・サブタイトル・カテゴリ・年齢制限 | App情報 / 年齢制限 |
| `listing.md` | プロモーションテキスト・説明文・キーワード・URL | バージョン情報 |
| `pricing.md` | 価格・配信地域・App内課金 | 価格および配信状況 / App内課金 |
| `privacy.md` | プライバシーポリシーURL・質問票の回答案 | Appのプライバシー |
| `review.md` | 審査向けメモ・デモ手順・連絡先 | App Review情報 |
| `screenshots/` | スクリーンショット | メディアマネージャ |

`README.md` には「この原稿を正として各画面に転記すること」と書き、AIエージェント向けの手順も添えてある。

```markdown
## 入力代行エージェントへの指示

1. 上の「未確定事項」が解消済みか確認する。未解消の項目に依存する画面はスキップし、報告に含める。
2. app-info.md → listing.md → pricing.md → privacy.md → review.md の順に入力する。
3. 文字数制限（各ファイルに明記）を超える場合は勝手に削らず、報告して指示を仰ぐ。
```

原稿はAIと相談しながら書き、できたら「App Store Connectに反映して」と頼む。審査で指摘が入っても、直すのは原稿の方でよい。反映はまたAIに頼めば済む。

面倒な管理画面での入力作業は、手元に用意した原稿をチェックするだけになった。入力のほとんどはAIエージェントが代行してくれる。

## 原稿を反映するコマンド

AIが原稿を反映するときに叩くのは、次のようなコマンドである。`--app` にはアプリIDとBundle IDのどちらも渡せる。

```bash
# App情報
asc appinfo localize --app <APP> --locale ja --name "..." --subtitle "..."
asc appinfo category --app <APP> --primary PRODUCTIVITY --secondary BUSINESS

# バージョンの説明文とキーワード
asc version create --app <APP> --version 1.0
asc version localize --app <APP> --locale ja --description @desc.txt --keywords "領収書,レシート,Excel"

# スクリーンショット
asc assets upload-screenshot --app <APP> --locale ja --display APP_IPHONE_67 \
  --file 01.png --file 02.png

# App内課金
asc iap localize --app <APP> --product credits100 --name "..." --description "..."
asc iap price --app <APP> --product credits100 --territory JPN --price 150

# 審査への提出
asc submit --app <APP>
```

書き込み系のコマンドはどれも `--dry-run` を持っており、送る前にリクエストの中身を確かめられる。

スクリーンショットのアップロードは、APIの上では「枠を予約する」「バイトを送る」「確定する」の3段階に分かれている。汎用の `asc api` ではこれを通せないので、専用のコマンドにまとめた。

## 細かい挙動はCLIが引き受ける

App Store Connect APIには、ドキュメントからは読み取りにくい挙動がいくつかある。こうしたものはCLIの側で面倒を見る。

| APIの挙動 | CLIがすること |
|---|---|
| スクリーンショットの確定が成功しても、あとからApple側の検証で失敗扱いになる | 検証が終わるまで状態を確認し、失敗ならエラーコード付きで終了する |
| App内課金の審査用スクリーンショットは古い端末のサイズ（1242×2208 など）しか受け付けない | 送る前に寸法を確かめ、`--auto-fit` で縦横比を保ったまま縮小して余白を足す |
| 初回バージョンでは「新機能」の欄が編集できない（409） | その項目だけ警告して飛ばし、他の項目は反映する |
| 配信地域は全地域を明示しないといけない | 約175の地域を自動で展開する |
| 無料アプリにも価格スケジュールが要る | `pricing set --free` を用意し、提出前に未設定を警告する |


## AIエージェントから使うには

`asc llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。認証の仕組みや上で挙げた挙動、全コマンドとフラグの一覧が入っている。

```bash
asc llm                  # Markdown
asc llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install apple-app-store-connect-cli@ideamans-plugins
```

入れておけば、`asc` が手元になくても「App Store Connectを操作したいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。

## 人間に残った仕事

Claude Codeと、各ストアのAPIがあったおかげで、初めてのiOSアプリ開発も人間のやることは次のくらいになった。

- 企画
- アーキテクチャの設計
- 進行の指揮
- 成果物の確認
- 申請作業の一部

OS固有の専門知識がなくても、使えるものができるようになった。

<!-- textlint-disable ja-technical-writing/no-doubled-joshi -->
実際、私はSwiftもKotlinも1行も書けない。
<!-- textlint-enable ja-technical-writing/no-doubled-joshi -->

## Google Play版も作った

同じ日本領収書スキャンのAndroid版を出すときに、Google Play用のCLIも作った。考え方は同じなので、あわせて読んでもらえるとうれしい。

- [Google Playへのアプリ公開をAIエージェントに任せるためのOSS CLI google-play-developer-publishing-cli](/posts/2026/google-play-developer-publishing-cli.html)

## まとめ

- 初めてのiOSアプリをApp Storeに出す作業が多すぎて、申請の前にApp Store Connect用のCLIを作った
- 入稿原稿はMarkdownで持ち、AIエージェントがCLIで反映する
- APIの細かい挙動はCLIが引き受ける

作っておかなければ、公開作業にかなり時間がかかっていたと思う。

- [ideamans/apple-app-store-connect-cli](https://github.com/ideamans/apple-app-store-connect-cli)
