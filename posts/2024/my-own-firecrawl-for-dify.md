---
title: わたし専用のDifyにわたし専用のFirecrawlを連携
id: miyanaga
date: 2024-10-04 10:00:00
---

楽しいDifyだが、無料だとできることが限られ、有料プランは個人にはちと高い。3アカウントも手に余る。

- [Dify AI · Plans and Pricing](https://dify.ai/pricing)

そこでオープンソース版をVPSにセルフホストしてみたので、手順を紹介したい。

公式の案内に最小限のスペックとして、[CPU >= 2 Core、RAM >= 4GB](https://github.com/langgenius/dify?tab=readme-ov-file#quick-start)とある。

例えば安価なVPSとして弊社でも使っているWebARENA Indigoなら、1ヶ月税込1,630円から自分だけのDifyを持てる計算になる。

- [WebARENA Indigo（VPS）の料金（Linux） | VPS（仮想専用サーバー）はWebARENA Indigo](https://web.arena.ne.jp/indigo/price/)

ぜひチャレンジしていただきたい。

[[toc]]

---

## VPSインスタンスと下準備

### Ubuntu 24.04をインストール

VPS事業者は慣れているところならどこでもよいが、ファイアウォール機能を備えたところにしよう。

CPU 2 Core以上、メモリ4GB以上のインスタンスを契約し、`Ubuntu 24.04`をインストールする。

:::info OSについて
Docker Composeを前提に進めるのでOSはなんでもよい。Ubuntu以外の場合、パッケージマネージャを読み替えられたい。
:::

### ドメイン名を登録

後ほどSSLの設定も行うので、VPSのIPアドレスにはなんらかのドメイン名を割り当てておく。

自前のドメイン名がなければ、以下のようなサービスでもよい。

- [FreeDNS](https://freedns.afraid.org/) 無料サブドメインが使えるDNS

今回、動作確認用に`my-dify.mooo.com`ドメインを取得した。

:::info FreeDNSの注意点
DNSの反映に時間がかかる。`host ドメイン名`コマンドなどで、応答が得られるまでじっくり待とう。

また、[sslip.io](https://sslip.io/)のような加工したIPアドレスを登録なしにドメイン名にできるサービスでも可であるが、多数のリクエストがあるドメインなのでLet's Encryptに弾かれる可能性がある。
:::

:::info
当然ながらこの動作確認用のサーバーはすでに解体してあるので、上記ドメインにアクセスしても何もない。
:::

### ファイアウォールを設定

ファイアウォールは次のTCPポートを許可する。

- `22` SSH
- `80` HTTP
- `443` HTTPS

SSHでログインできたら次へ進もう。

### GitとDockerをインストール

GitとDockerを使うので準備する。ついでにファイル編集用にエディタ`nano`も入れておく。

```bash
sudo apt install -y git docker.io docker-compose-v2 nano
# ユーザーがdockerを使用できるようにする(rootで操作する場合は不要)
sudo usermod -G docker ubuntu
```

## Firecrawlをセットアップ

Difyでは[Firecrawl](https://www.firecrawl.dev/)をWebクローラーとして、Webサイトの情報をRAGに活用できる。

Firecrawlもオープンソースでセルフホストできる。

便利な機能であまり手間もかからないのでついでに設定する。

### プロジェクトをgit clone

FirecrawlのオープンソースプロジェクトをGit Cloneする。

:::info バージョン v1.0.0を使う
執筆時点で`main`ブランチをCloneしたところ、正常に動作しなかった。そこで`v1.0.0`を使うことにする。

記事を読まれた時点の安定版についてはタグなどを確認されたい。
:::

```bash
git clone https://github.com/mendableai/firecrawl.git -b v1.0.0
cd firecrawl
```

### Firecrawlの.envを用意

環境変数の雛形`apps/api/.env.example`を元に`.env`を用意する。

```bash
cp apps/api/.env.example .env
```

`.env`を編集し、次の2点だけ変更する。

```bash
nano .env
```

```
USE_DB_AUTHENTICATION=false
TEST_API_KEY=fc-my-firecrawl
```

`TEST_API_KEY`は後ほどDifyで指定するAPIキーである。複雑なものを指定してもよいが、`fc-`という接頭辞は必須らしい。

### Firecrawlを起動

Docker ComposeでFirecrawlを起動する。

```bash
docker compose up -d --build
```

初回のビルドに筆者の環境では5分ほどかかった。気長に待とう。

起動が完了し、少し待ってから次のようにテストレスポンスが得られたら起動は成功である。

```bash
curl -X GET http://localhost:3002/test
# 出力
Hello, world!
```

### Firecrawlのアドレスを取得

後ほどDifyからFirecrawlのAPIを指定する。

そのためにFirecrawlのIPアドレスを取得しておく。

```bash
docker inspect firecrawl-api-1 | grep IPAddress
# 出力
            "SecondaryIPAddresses": null,
            "IPAddress": "",
                    "IPAddress": "172.18.0.4",
```

筆者の環境では`172.18.0.4`となった。

:::info Docker Composeプロジェクト間アクセス
FirecrawlとDifyは別々のDocker Composeプロジェクトで起動する。Dify → Firecrawlにプロジェクトの壁を超えてアクセスする必要があるのでIPアドレスを取得した。

もっとよいやり方があったら教えていただきたい。
:::

## Difyをセットアップ

次はいよいよDifyをセットアップする。

### プロジェクトをgit clone

DifyのオープンソースプロジェクトをGit cloneする。

Docker関連はプロジェクトの`docker`ディレクトリにあるので、そこに移動する。

```bash
cd .. # firecrawlから戻る
git clone https://github.com/langgenius/dify.git
cd dify/docker
```

### 環境変数.envを用意

`.env.example`から`.env`を作成する。

```bash
cp .env.example .env
```

### 試験起動と管理者アカウント作成

ここで一度起動させて動作確認兼、管理者アカウントの作成を行う。

```bash
docker compose up -d --build
```

コンテナが起動したら、ブラウザからサーバーにHTTPプロトコルでアクセスしてみよう。

- http://<設定したドメイン名>

ログイン画面が表示されるはずだ。ここで`管理者アカウントの設定`を選択する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/login-screen.png" alt="ログイン画面" width="1600" height="1464" />

メールアドレス、ユーザ名、仮パスワードを入力してセットアップする。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/kanri-sha-account-no-settei.png" alt="管理者アカウントの設定" width="1600" height="1464" />

一度サインインができるか試す。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/community-ni-sanka-suru.png" alt="コミュニティに参加する" width="1600" height="927" />

自分のDifyが手に入った！

:::warning 安全なインストールのために
この工程はあまり安全と言えない。誰でも管理者アカウントを作成できるし、暗号化されていないHTTPで仮パスワードを設定している。

気になった人は例えばHTTPはいったんファイアウォールを閉じておき、SSHトンネルを掘って操作するなど、工夫いただきたい。
:::

## DifyのSSL化

ここまででDifyはインストールできたが、このままHTTPでは利用できない。

しかしDifyのDocker Composeプロジェクトには、ご丁寧にLet's Encryptのcertbotも含まれている。

詳しくは、[dify/docker/certbot/README.md at main · langgenius/dify](https://github.com/langgenius/dify/blob/main/docker/certbot/README.md)に解説があるが、それを使ってSSL化を行っていく。

### 証明書の取得

`.env`ファイルを開いて、次の行を変更する。

```bash
# 以下はデフォルト値から書き換える
NGINX_SSL_CERT_FILENAME=fullchain.pem
NGINX_SSL_CERT_KEY_FILENAME=privkey.pem
NGINX_ENABLE_CERTBOT_CHALLENGE=true

# 以下はあなたの状況に合わせる
CERTBOT_DOMAIN=作成したドメイン名 # 筆者の場合は www-45-32-14-78.sslip.io
CERTBOT_EMAIL=あなたのメールアドレス # 筆者の場合は miyanaga@ideamans.com
```

Let's EncryptのためのACMEチャレンジを用意する。

```bash
docker compose --profile certbot up --force-recreate -d
```

`certbot`コンテナが起動したら次のコマンドで証明書を取得する。

```bash
docker compose exec -it certbot /bin/sh /update-cert.sh
```

### nginxを再起動して証明書を適用する

特にエラーがでなければSSLを有効にする。再び`.env`を編集し、次の行を編集する。

```bash
NGINX_HTTPS_ENABLED=true
```

nginxを再起動する。

```bash
docker compose --profile certbot up -d --no-deps --force-recreate nginx
```

ついにSSLでもアクセスできた！

- <https://設定したドメイン名>

## Firecrawlを登録する

あともう一息、さきほど立ち上げたFirecrawlをDifyに登録しよう。

### docker-compose.ymlの変更

まず、FirecrawlのDocker Composeプロジェクトにアクセスするため、`docker-compose.yml`を少し変更する。

`api`と`worker`サービスの`networks`に`firecrawl_backend`を追加する。**2箇所変更する。**

```yaml{20,41}
services:
  # API service
  api:
    image: langgenius/dify-api:0.9.1
    restart: always
    environment:
      # Use the shared environment variables.
      <<: *shared-api-worker-env
      # Startup mode, 'api' starts the API server.
      MODE: api
    depends_on:
      - db
      - redis
    volumes:
      # Mount the storage directory to the container, for storing user files.
      - ./volumes/app/storage:/app/api/storage
    networks:
      - ssrf_proxy_network
      - default
      - firecrawl_backend # この行を追加！

  # worker service
  # The Celery worker for processing the queue.
  worker:
    image: langgenius/dify-api:0.9.1
    restart: always
    environment:
      # Use the shared environment variables.
      <<: *shared-api-worker-env
      # Startup mode, 'worker' starts the Celery worker for processing the queue.
      MODE: worker
    depends_on:
      - db
      - redis
    volumes:
      # Mount the storage directory to the container, for storing user files.
      - ./volumes/app/storage:/app/api/storage
    networks:
      - ssrf_proxy_network
      - default
      - firecrawl_backend # この行を追加！
```

末尾付近の`networks`に`firecrawl_backend`を追加する。

```yaml{12-13}
networks:
  # create a network between sandbox, api and ssrf_proxy, and can not access outside.
  ssrf_proxy_network:
    driver: bridge
    internal: true
  milvus:
    driver: bridge
  opensearch-net:
    driver: bridge
    internal: true
  firecrawl_backend: # この行を追加！
    external: true # この行を追加！
```

`docker-compose.yaml`を変更したら、Docker Composeを再起動する。

```bash
docker compose --profile certbot down
docker compose --profile certbot up -d
```

再起動すると、しばらくWeb画面にはローディングアイコンが表示されるようになる。数分、気長に待ってみよう。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/white-background-blue-dots.png" alt="白い背景に青い点がいくつかある" width="1600" height="927" />

### Firecrawlの設定

DifyにFirecrawlを設定する。右上のメニューを開き`設定`を開く。

設定メニューから`データソース`を開く。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/database-addition.png" alt="データベースの追加" width="1600" height="927" />

Firecrawlについて`設定`ボタンを押して、`API Key`と`Base URL`を指定する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/settings-screen.png" alt="設定画面" width="1600" height="927" />

`Base URL`は、先に調べたFirecrawlのIPアドレスを用い、`http://<IPアドレス>:3002`というように指定する。

保存ボタンを押して、Firecrawlが`アクティブ`になれば連携は成功だ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/active-archive.png" alt="アクティブなアーカイブ" width="1600" height="913" />

ウェブサイトをクロールしてナレッジを構築できるようになった。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/data-source-selection.png" alt="データソースの選択" width="1600" height="913" />

root@dify2:~/dify/docker# docker network connect --link firecrawl-api-1:firecrawl firecrawl_backend docker-api-1
root@dify2:~/dify/docker# docker network connect --link firecrawl-api-1:firecrawl firecrawl_backend docker-worker-1
