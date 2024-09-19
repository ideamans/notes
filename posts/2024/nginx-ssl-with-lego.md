---
id: miyanaga
title: legoとnginxでSSLゲートウェイをサクッと立てる
date: 2024-09-18 17:12:00
---

VPSでWebサービスを公開するとき、SSLをどうするかという問題がある。

弊社では、Amazon Route 53、nginx、lego (Go言語製のLet's Encryptクライアント)を使って汎用的なSSLゲートウェイを立てている。

そのノウハウを紹介したい。一度慣れておくとWebサービスの公開が気楽になる。

---

## VPSが好きだ

Webアプリを公開する方法はたくさんある。今やちょっと古い考えではあると思うが、VPSが好みだ。

- **安くて費用は固定** 月500円くらいから利用でき、急に費用が跳ね上がる心配もない。
- **開発言語を選ばない** 当然、自由にアレンジできる。
- **ロックインされない** サービス停止で慌てることもない。
- **インフラの勉強になる** 安く抑えようと工夫すると勉強になるし、何より楽しい。

## SSLどうする問題

VPSだと、マネージドサービスなら当たり前のSSLも自分で用意する必要がある。

いろいろ試した末に、Amazon Route 53、nginx、legoを使って窓口となるWebサーバを立てる方法に落ち着いた。

ユーザ - nginx(SSL) - 任意のWebアプリ

という経路である。

<https://github.com/ideamans/nginx-with-lego-ssl>

## 使い方

### Amazon Route 53を操作するIAMユーザを用意

次のポリシーを参考に、IAMユーザーを作成する。

`<INSERT_YOUR_HOSTED_ZONE_ID_HERE>`は対象ドメインのホストゾーンIDに置換いただく。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "route53:GetChange",
        "route53:ListHostedZonesByName",
        "route53:ListResourceRecordSets"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets"
      ],
      "Resource": [
        "arn:aws:route53:::hostedzone/<INSERT_YOUR_HOSTED_ZONE_ID_HERE>"
      ]
    }
  ]
}
```

### .envに認証情報

`example.env`を`.env`としてコピーし、設定を記述する。必要なのは以下の4点だ。

```ini
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID= # IAMユーザのアクセスキーID
AWS_SECRET_ACCESS_KEY= # IAMユーザのシークレットアクセスキー
LEGO_EMAIL=you@exmple.com # メールアドレスを記述
LEGO_DOMAIN=*.example.com # SSL証明書を取得するドメインを記述(ワイルドカード化)
```

### nginxの設定変更

`nginx/default.conf`のドメイン`nginx.ideamans.com`と`_.ideamans.com`を、利用するドメインに変更する。

ワイルドカード`*`を用いた場合、証明書のパスは`_`に置換する。

例えば、ドメインは`www.example.com`、証明書は`*.example.com`で取得した場合、

```conf
    server_name nginx.ideamans.com;
    ssl_certificate /var/lib/lego/certificates/_.ideamans.com.crt;
    ssl_certificate_key /var/lib/lego/certificates/_.ideamans.com.key;
    ↓
    server_name www.example.com;
    ssl_certificate /var/lib/lego/certificates/_.example.com.crt;
    ssl_certificate_key /var/lib/lego/certificates/_.example.com.key;
```

```conf
    server_name nginx.ideamans.com;
    ↓
    server_name www.example.com;
```

上記のように書き換える。

### Webアプリを記述

`compose.yml`の`app`サービスを任意のWebサービスに変更する。

```yaml
  app: # ダミーアプリケーション
    image: httpd:2.4
```

### 起動

docker-composeで起動する。

```bash
docker compose up --build
# または docker-compose up --build
```

初回はLet's EncryptでSSL証明書を取得するため数分かかる。

サーバにアクセスし、このように表示されればOKである。

<img src="https://assets.ideamans.com/miyanaga/images/2024/09/it-works.png" alt="ブラウザの画面に、It works!と表示されている" width="600" />

## 仕組み

基本的にnginxのコンテナイメージをそのまま使うが、直接nginxを起動するのではなく、`Dockerfile`とシェルスクリプト`/entrypoint.sh`で少し動作を改変する。

### Dockerfile

マルチステージビルドでlegoをインストールする。legoはGo言語製なのでファイルをひとつ持ってくるだけでよい。

そして`/entrypoint.sh`を起動の起点にする。

```dockerfile
FROM nginx:latest

# legoをインストール
COPY --from=goacme/lego:v4.17 /lego /usr/bin/lego

# entrypoint.shでnginxを改造
ADD ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
```

### entrypoint.sh
