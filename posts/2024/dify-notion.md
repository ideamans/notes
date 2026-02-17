---
title: セルフホストしたDifyとNotionを接続する方法
id: miyanaga
date: 2024-10-07 12:25:00
categories:
  - ai
  - content-management
ogp: /ogp/2024/dify-notion.jpg
ads:
  - id: ai-coaching
---

セルフホストしたDifyから[Notion](https://www.notion.so/ja)に接続するには少し工夫が必要だった。

Difyのセルフホスティングについては、[手順をまとめた記事](./my-own-dify.md)を参照のこと。

その内容に沿って接続の手順を解説する。

[[toc]]

---

## Notion側の操作

Notion側では、**コネクト**を作成して、次の情報を取得する。

- インテグレーションID
- 内部インテグレーションシークレット

まずはワークスペースの設定を開き、`コネクト`メニューから`インテグレーションを作成または管理する`を選択する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/notion-integrated-apps-list.png" alt="Notionの統合アプリ一覧" width="1600" height="1059" />

別タブにインテグレーションの管理画面が表示される。ここで`新しいインテグレーション`をクリックする。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/new-integration.png" alt="新しいインテグレーション" width="1600" height="1059" />

任意のインテグレーション名を入力し、関連ワークスペースを選択して保存ボタンを押す。

わかりにくいが、`インテグレーション名を追加`と表示される部分はテキストフィールドになっている。種類は内部のままでよい。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/diffy-.png" alt="Diffyへの接続" width="1600" height="1059" />

続いてインテグレーションの設定画面に進む。

まずここで`内部インテグレーションシークレット`を表示し、内容を控えておく。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/diffy-no-setsuzoku.png" alt="ディフィーへの接続" width="1600" height="1059" />

続いてページの下部に機能セクションがある。`コンテンツを読み取る`は必須だが、コメントやユーザー情報については、それらもナレッジに必要かどうかで判断されたい。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/settings-save-button_1.png" alt="設定画面の保存ボタン" width="1600" height="1059" />

最後に保存ボタンを押す。

### インテグレーションIDの取得

イングレーションIDは画面上を探しても見当たらなかった。

ブラウザのアドレスバーから`/internal/`に続くUUIDがインテグレーションIDなので、これも控えておく。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/diffy-no-setsuzoku_1.png" alt="Diffyへの接続" width="1600" height="596" />

### Difyに共有するドキュメントを指定

Difyに共有するドキュメントは、Notion側でも明示的に指定する必要がある。

ドキュメントの右上のアイコンからメニューを開き、`コネクト` - `接続先` - 作成したDifyへのインテグレーションを選択する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/diffy-no-setsuzoku_2.png" alt="Diffyへの接続" width="1600" height="1099" />

## Dify側の操作

Dify側に先ほど取得したインテグレーションの情報を設定していく。

これは環境変数で行う。`docker/.env`ファイルを開き、次の項目を変更する。

```bash
NOTION_INTEGRATION_TYPE=internal # publicではなくinternalを指定
NOTION_CLIENT_SECRET= # 空欄のままでよい
NOTION_CLIENT_ID=インテグレーションID # あなたの環境における値
NOTION_INTERNAL_SECRET=内部インテグレーションシークレット # あなたの環境における値
```

そしてDifyを再起動する。

```bash
docker compose --profile certbot down
docker compose --profile certbot up -d
```

これでDifyのナレッジ作成時に、`Notionからの同期`を利用できるようになった。

Notion側でDifyに接続したドキュメントを選択できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/notion-kara-data-wo-shutoku-suru-gamen.png" alt="Notionからデータを取得する画面" width="1600" height="807" />

### 再同期

Notion側の更新だが、自動でDifyに反映されるわけではなさそうだ。

同期の方法のひとつは、ナレッジのドキュメント一覧から、アクションメニューを開き`同期`を選択する方法だ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/file-list-screen.png" alt="ファイル一覧の画面" width="1600" height="807" />

もうひとつは、設定ポップアップの`データソース` - `ノーション`からメニューを開き、`同期`を選ぶ方法だ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/database-settings-screen.png" alt="データベースの設定画面" width="1600" height="807" />

ナレッジを同期するAPIも見当たらなかった。当面は手動で行うほかなさそうである。

## 代替案

Notionのインテグレーションには、一般的なOAuthクライアントを作成する方法もある。

クラウド版のDifyはそちらを採用している。

インテグレーションの種類として`公開`(`public`)を選択すればその方法で進められると思われるが、設定項目が多い。内部インテグレーションとして接続する方が楽であった。
