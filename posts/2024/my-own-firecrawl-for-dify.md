---
title: 自分専用DifyにFirecrawlもセルフホスト
id: miyanaga
date: 2024-10-04 07:30:00
categories:
  - ai
  - infrastructure
---

この記事は[VPSでお安く自分専用のDifyを持つ方法](./my-own-dify)の続きだ。

Difyは、Webクローラーである[Jina Reader](https://jina.ai/reader/)または[Firecrawl](https://www.firecrawl.dev/)と連携することで簡単にRAGを実現できる。

Firecrawlもオープンソースでセルフホストできる。そこでDifyをインストールしたVPSにFirecrawlもインストールし、こちらもお安く実現してみた。

その手順を紹介する。

[[toc]]

---

## Firecrawlのセットアップ

### Firecrawlをgit clone

Firecrawlのオープンソースプロジェクトをgit cloneする。

:::info バージョン v1.0.0
執筆時点(2024年10月4日)で`main`ブランチをCloneしたところ、正常に動作しなかった。そこでタグ`v1.0.0`を使うことにする。

安定版については都度、確認されたい。
:::

```bash
git clone https://github.com/mendableai/firecrawl.git -b v1.0.0
cd firecrawl
```

### Firecrawlの.envを用意

環境変数ファイルの雛形`apps/api/.env.example`を元に`.env`ファイルを用意する。

```bash
cp apps/api/.env.example .env
```

`.env`を編集し、次の2点を変更する。

```bash
USE_DB_AUTHENTICATION=false
TEST_API_KEY=fc-my-firecrawl # 任意のキー(先頭のfc-は必須)
```

`USE_DB_AUTHENTICATION`は、詳しくわかっていないがユーザー管理をするSupabaseと連携するためのようだ。少なくとも今回は自分専用なので利用しない。

`TEST_API_KEY`は後ほどDifyで指定するAPIキーである。複雑なものを指定してもよいが、`fc-`という接頭辞は必須らしい。

### Firecrawlを起動

Docker ComposeでFirecrawlを起動する。

```bash
docker compose up -d --build
```

筆者の環境では初回のビルドに5分ほどかかった。気長に待とう。

起動が完了し、少し待ってから次のようにテストレスポンスが得られたら起動は成功である。

```bash
curl -X GET http://localhost:3002/test
# 出力
Hello, world!
```

## Firecrawlを登録する

### DifyとFirecrawlのネットワーク接続

DifyとFirecrawlは異なるDocker Composeプロジェクトで動作しているので、このままではスムーズに接続できない。

次のコマンドで両者をネットワーク接続し、Difyの`api`コンテナと`worker`コンテナからFirecrawlの`api`コンテナを`firecrawl`として参照可能にする。

```bash
docker network connect --link firecrawl-api-1:firecrawl firecrawl_backend docker-api-1
docker network connect --link firecrawl-api-1:firecrawl firecrawl_backend docker-worker-1
```

:::info 接続元について
Difyは多くのコンテナから構成されている。筆者の予想では`api`と`worker`からFirecrawlを参照できればよいと踏んで動作もしたが、もしかしたら過不足があるかもしれない。
:::

### Firecrawlの設定

DifyのWeb画面を開き、右上のメニューから`設定` - 設定メニューから`データソース` - Firecrawlについての`設定`ボタンを押す。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/data-sources-settings.png" alt="データソースの設定画面" width="1600" height="865" />

`API Key`と`Base URL`を指定し、`保存`ボタンを押す。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/firecrawl-settings.png" alt="Firecrawlの設定画面" width="1600" height="865" />

`API Key`は先ほど`.env`ファイルに指定した`fc-`から始まるキーだ。

`Base URL`は、`http://firecrawl:3002`とする。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/active-archive.png" alt="アクティブなアーカイブ" width="1600" height="913" />

Firecrawlが`アクティブ`になれば連携完了である。

ウェブサイトをクロールしてベクトルデータベースにコンテンツを格納し、RAGを実現できるようになった。
