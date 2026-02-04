---
title: VPSでお安く自分専用のDifyを持つ方法
id: miyanaga
date: 2024-10-04 07:25:00
categories:
  - ai
  - infrastructure
ogp: /ogp/2024/my-own-dify.jpg
---

LLMアプリ開発が楽しいDifyだが、無料だとできることが限られ、有料プランは個人にはちと高い。3アカウントも手に余る。

- [Dify AI · Plans and Pricing](https://dify.ai/pricing)

そこでオープンソース版をVPSにセルフホストしてみた。これなら月額1500円程度から、自分だけのDifyを持つことができる。

その手順を紹介したい。

[[toc]]

---

## 下準備

### VPSを起動してLinuxをインストール

VPS事業者はどこでもよいが、ファイアウォール機能を備えたところにしよう。もちろんAmazon EC2などでも構わない。

公式の案内に、最小限のスペックとして[CPU >= 2 Core、RAM >= 4GB](https://github.com/langgenius/dify?tab=readme-ov-file#quick-start)とある。

例えば安価なVPSであるWebARENA Indigoなら、1ヶ月税込1,630円からDifyを利用できる。

- [WebARENA Indigo（VPS）の料金（Linux） | VPS（仮想専用サーバー）はWebARENA Indigo](https://web.arena.ne.jp/indigo/price/)

まずはなんらかのVPSインスタンスを契約し、`Ubuntu 24.04`をインストールする。

:::info OSについて
Docker Composeを使って進めるので、OSはLinuxならなんでもよい。Ubuntu以外の場合は`apt`のあたりを読み替えてほしい。
:::

### ドメイン名を用意

後ほどLet's EncryptoによるSSLの設定も行うので、**VPSのIPアドレスはなんらかのドメイン名で参照できるように**しておく。

自前のドメイン名がなければ、以下のようなサービスでもよい。

- [FreeDNS](https://freedns.afraid.org/) - 無料で使えるDNSサーバー

VPSでデフォルトのドメイン名を提供しているケースもある。

動作確認用ではFreeDNSを使い、`my-dify.mooo.com`ドメインを取得してみた。

:::info FreeDNSの注意点
FreeDNSは反映に時間がかかった。`host ドメイン名`などで、正引きできるまでじっくり待とう。

また、[sslip.io](https://sslip.io/)のような加工したIPアドレスを事前登録なしにドメイン名にできるサービスもあるが、ドメインからのリクエストが多すぎるとしてLet's Encryptに弾かれてしまった。
:::

### ファイアウォールを設定

ファイアウォールは次のTCPポートを解放する。

- `22` - SSH
- `80` - HTTP
- `443` - HTTPS

### GitとDockerをインストール

SSHでログインしてシェルから下準備を続ける。

GitとDockerを使うのでこれらを準備する。ついでにファイル編集用のエディタ`nano`も入れておく。

```bash
sudo apt install -y git docker.io docker-compose-v2 nano
# ユーザーがdockerを使用できるようにする(rootで操作する場合は不要)
sudo usermod -G docker ubuntu
```

## Difyをセットアップ

いよいよDifyをセットアップする。

### プロジェクトをgit clone

Difyのオープンソースプロジェクトを`git clone`する。

Docker関連はプロジェクトの`docker`ディレクトリにあるので、そこに移動する。

```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
```

### 環境変数.envを用意

`.env.example`から`.env`を作成する。

```bash
cp .env.example .env
```

### 初期パスワードとシークレットキー

一応シークレットキーをデフォルトから変えておく。

```bash
echo sk-$(openssl rand -base64 42)

# 出力(例)
sk-CAv/mnUJ90kmw8C0KE0rGhvkNJaCVhErCkHDSS5F4UYJbXIPJnsbOD/2
```

`.env`を編集し、以下の値を変更する。

```bash
SECRET_KEY=作成されたシークレットキー
INIT_PASSWORD=管理者初期化パスワード
```

管理者初期化パスワードは、管理者作成の前に入力する仮パスワードのようなものだ。

## DifyのSSL化

この段階でもうDifyを起動はできるが、SSLには対応していない。

もしロードバランサーなど、SSLゲートウェイを別に用意する場合は、この工程はスキップしてもよい。

### 証明書の取得

DifyのDocker Composeプロジェクトには、ご丁寧にLet's Encryptの`certbot`も含まれている。

詳しくは、[dify/docker/certbot/README.md at main · langgenius/dify](https://github.com/langgenius/dify/blob/main/docker/certbot/README.md)に解説があり、それを使ってSSL対応を進める。

まずは`.env`ファイルを開いて、次の行を変更する。

```bash
# 以下はデフォルト値から書き換える(こうしないとnginxの設定と一致しないっぽい)
NGINX_SSL_CERT_FILENAME=fullchain.pem
NGINX_SSL_CERT_KEY_FILENAME=privkey.pem

# ACMEチャレンジを有効にする
NGINX_ENABLE_CERTBOT_CHALLENGE=true

# 以下はみなさんの状況に合わせて指定する
CERTBOT_DOMAIN=作成したドメイン名 # 筆者の場合は my-dify.mooo.com
CERTBOT_EMAIL=あなたのメールアドレス # 筆者の場合は miyanaga@ideamans.com
```

変更したら、`certbot`も含めてDocker Composeを起動する。

```bash
docker compose --profile certbot up --force-recreate -d
```

`certbot`コンテナが起動したら次のコマンドでSSL証明書を取得する。

```bash
docker compose exec -it certbot /bin/sh /update-cert.sh
```

### nginxを再起動して証明書を適用する

再び`.env`を編集し、次の行を編集する。

```bash
NGINX_HTTPS_ENABLED=true
```

nginxを再起動する。

```bash
docker compose --profile certbot up -d --no-deps --force-recreate nginx
```

コンテナが再起動したらいよいよDifyにアクセスしてみよう。

- <https://設定したドメイン名>

ログイン画面が出た！

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/login-screen_1.png" alt="ログイン画面" width="1600" height="905" />

## 管理者アカウントの登録

`管理者アカウントの設定`から最初のアカウントを作成する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/login-screen.png" alt="ログイン画面" width="1600" height="1464" />

ここで先ほど設定した管理者初期化パスワードを尋ねられる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/kanri-syoki-ka-password-nyuryoku-gamen.png" alt="管理者初期化パスワード入力画面" width="1600" height="905" />

:::info 管理者初期化パスワード
これがないと起動直後は誰でも管理者アカウントを作成できてしまう無防備な状態になってしまう。
:::

メールアドレス、ユーザ名、パスワードを入力して管理者アカウントを作成する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/kanri-sha-account-no-settei.png" alt="管理者アカウントの設定" width="1600" height="1464" />

管理者アカウントでログインすると…

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/community-ni-sanka-suru.png" alt="コミュニティに参加する" width="1600" height="927" />

ついに自分専用のDifyが手に入った！

### Firecrawlのセルフホストと設定

DifyではWebクローラーと連携して簡単にRAGを実装できる。

ぜひ使いたい機能であるが、それには[Jina Reader](https://jina.ai/reader/)か、[Firecrawl](https://www.firecrawl.dev/)のAPIキーが必要だ。

しかしFirecrawlにはオープンソース版があり、これもセルフホストできる。

長くなったので別の記事にする。

[自分専用FirecrawlでDifyを便利にする](./my-own-firecrawl-for-dify)に続く！
