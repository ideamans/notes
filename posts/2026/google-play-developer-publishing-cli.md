---
title: Google Playへのアプリ公開をAIエージェントに任せるためのOSS CLI google-play-developer-publishing-cli
description: 日本領収書スキャンのAndroid版をGoogle Playに出すにあたり、App Store Connect用のCLIと同じ考え方でGoogle Play Developer Publishing APIを操作するCLIを作った。editという単位で変更をまとめて反映する仕組みや、リリースの操作を紹介する。
id: miyanaga
date: 2026-09-20 09:00:00
categories:
  - ai
  - automation
  - development
ogp: /ogp/2026/google-play-developer-publishing-cli.jpg
---

弊社の「日本領収書スキャン」は、まずiOS版をApp Storeで公開した。そのあとAndroid版もGoogle Playで公開した。

iOS版の申請では、App Store Connect APIを操作するCLIを先に作り、入力作業をAIエージェントに任せた。

- [App Store Connectへのアプリ申請をAIエージェントに任せるためのOSS CLI apple-app-store-connect-cli](/posts/2026/apple-app-store-connect-cli.html)

これがかなり楽だったので、Android版でも同じようにしたかった。Google PlayにもAPIが用意されているので、同じ考え方でCLIを作った。

それが google-play-developer-publishing-cli（コマンド名は `gplay`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/google-play-developer-publishing-cli](https://github.com/ideamans/google-play-developer-publishing-cli)

[[toc]]

---

## iOS版と同じ流れで進める

Android版の入稿原稿も、iOS版と同じくMarkdownで持っている。具体例をみてみよう。日本領収書スキャンのリポジトリの `google-play/` はこうなっている。

| ファイル | 内容 | Play Consoleの画面 |
|---|---|---|
| `app-info.md` | アプリ名・パッケージ名・カテゴリ・連絡先 | ストアの設定 |
| `listing.md` | アプリ名・簡単な説明・詳しい説明・リリースノート | メインのストア掲載情報 |
| `pricing.md` | 価格・配信国・アプリ内アイテム | 収益化 / 国と地域 |
| `data-safety.md` | データセーフティの回答案 | アプリのコンテンツ > データセーフティ |
| `content-rating.md` | コンテンツレーティングの回答案 | アプリのコンテンツ > コンテンツのレーティング |
| `review.md` | 審査向けメモ・テスト手順 | アプリのコンテンツ > アプリのアクセス権 |

`README.md` には、iOS版との違いもまとめてある。保存先がGoogleドライブになる、サインインがGoogleアカウントになる、審査の代わりにデータセーフティとコンテンツレーティングの申告が要る、といった違いに合わせて原稿を書き分けた。

原稿はAIと相談しながら書き、できたら「Google Playに反映して」と頼む。この流れはiOS版と変わらない。

## 最初の設定

認証にはGoogle Cloudのサービスアカウントを使う。キーの管理はiOS版と同じくAWS CLI風のプロファイル方式にした。

```bash
# サービスアカウントのJSONキーを登録する
gplay configure --key ~/Downloads/play-publisher-abc123.json --package com.example.app

# 認証と権限の確認を兼ねてアプリの詳細を取る
gplay details get
```

その前に、Web上で次の3つを済ませておく必要がある。

1. Google Cloud Consoleで Google Play Android Developer API を有効にする
2. サービスアカウントを作ってJSONキーを発行する
3. Play Consoleの「ユーザーと権限」でサービスアカウントを招待し、アプリへのアクセス権を付ける

## editという単位でまとめて反映する

App Store Connectとの大きな違いは、Google Playでは変更がeditというステージング領域を経由することだ。掲載情報や画像、バイナリのどれを変えても、editをcommitするまではGoogle Playに反映されない。

単発の操作であれば、CLIがeditの作成から変更、commitまでを自動で行う。いくつかの変更を1回にまとめたいときは、editを明示的に引き回す。

```bash
EDIT=$(gplay edits create)
gplay listings set --edit $EDIT --language ja --title "..." --full-description @desc-ja.txt
gplay images replace --edit $EDIT --language ja --type phoneScreenshots --file 01.png --file 02.png
gplay tracks set --edit $EDIT --track internal --version-code 42
gplay edits commit $EDIT
```

## リリースは1コマンドで

ビルドのアップロードからトラックへの割り当て、commitまでは1つのコマンドにまとめた。

```bash
# 内部テストへ出す
gplay release --track internal --aab app-release.aab

# 本番に10%で段階的に出す
gplay release --track production --aab app-release.aab --mapping mapping.txt \
  --user-fraction 0.1 --notes ja=@notes-ja.txt

# 段階的リリースの操作
gplay tracks rollout --track production --user-fraction 0.5
gplay tracks halt --track production
gplay tracks complete --track production
```

## アプリ内アイテムはスクリプトで作った

日本領収書スキャンのAI解析チケット4商品は、`gplay` を呼ぶシェルスクリプトで作った。商品ごとにJSONを組み立てて、次のように流している。

```bash
gplay one-time-products update --product "$sku" --allow-missing \
  --update-mask listings,purchaseOptions --from-json "@$WORK/$sku.json"
```

`--allow-missing` を付けると、商品がなければ作成し、あれば更新する。何度流しても同じ状態になるので、価格を変えたときも同じスクリプトを流し直すだけでよい。

## 細かい挙動はCLIが引き受ける

Google PlayのAPIにも、ドキュメントからは読み取りにくい挙動がいくつかある。こうしたものはCLIの側で面倒を見る。

| APIの挙動 | CLIがすること |
|---|---|
| アプリの一覧を返すエンドポイントがない | `gplay apps list` だけ別のReporting APIを使う |
| トラックの更新はリリース一覧の置き換えになる | 既存のリリースを残したいときは `--keep-existing` を付ける |
| 掲載情報に文字数制限がある（タイトル30・簡単な説明80・詳しい説明4000） | 送る前に検証する |
| 画像の寸法が厳密に決まっている | アップロード前に手元で検証し、どのファイルが原因かすぐ分かるようにする |
| `403 PERMISSION_DENIED` は、認証は通っていて権限が足りない状態を指す | エラーの説明にそのことを添える |
| ユーザー一覧の取得は `pageSize=-1` でないと受け付けない | CLI側で指定する |


## AIエージェントから使うには

`gplay llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。editの仕組みや上で挙げた挙動、全コマンドとフラグの一覧が入っている。

```bash
gplay llm                  # Markdown
gplay llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install google-play-developer-publishing-cli@ideamans-plugins
```

入れておけば、`gplay` が手元になくても「Google Playを操作したいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。

## まとめ

- iOS版と同じ考え方で、Google Play用のCLIも作った
- 入稿原稿はMarkdownで持ち、AIエージェントがCLIで反映する
- Google Playでは変更がeditを経由するので、まとめて反映するときはeditを引き回す
- APIの細かい挙動はCLIが引き受ける

iOSとAndroidの両方で、ストアの管理画面を開く回数はかなり減った。Kotlinを1行も書かないまま、Android版をGoogle Playで公開できている。

- [ideamans/google-play-developer-publishing-cli](https://github.com/ideamans/google-play-developer-publishing-cli)
