---
id: miyanaga
title: Difyでの自前APIとの連携方法と注意点
date: 2024-10-19 09:43:00
---

Difyには外部サービスと連携する**ツール**機能があり、カスタムツールとして自前のAPIを連携対象に追加できる。

この記事では「ふたつの数字の掛け算を行うという非常にシンプルな独自API」を例にして、カスタムツールの利用手順や注意点を紹介する。

[[toc]]

---

## 独自APIの用意

### APIの作成と公開

Node.jsとFastifyを使ってさくっとAPIサーバーを立ち上げる。

```bash
mkdir multiply-api
cd multiply-api
npm init -y
npm i fastify --add
```

`index.js`を作成する。

```js indx.js
const fastify = require("fastify")();

fastify.post("/multiply", async (request, reply) => {
    const { a, b } = request.body;
    const result = a * b;
    reply.send({ result });
});

fastify.listen({ port: 3000 });
```

APIサーバーを起動する。

```bash
node index.js
```

ngrokで外部公開する。

```bash
ngrok http 3000
```

`https://7217-*-*-*-*.ngrok-free.app`といった形式の外部公開URLが得られただろう。

### OpenAPI-Swaggerによるスキーマを用意

この簡易APIをDifyに登録するのだが、OpenAPI-Swagger仕様によるスキーマが必要となる。

:::info URLの変更
`servers[0].url`はngrokで公開されたURLを指定すること。
:::

```yaml
openapi: 3.0.0
info:
  title: 掛け算API
  version: 1.0.0
  description: このAPIはふたつの数字の掛け算をします。
servers:
  - url: https://7217-*-*-*-*.ngrok-free.app # あなたの環境に合わせて変更
    description: ngrokによる一時的な公開URL
paths:
  /multiply:
    post:
      summary: 掛け算を行う
      operationId: multiply
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                a:
                  type: number
                  description: かけられる数
                  example: 5
                b:
                  type: number
                  description: かける数
                  example: 3
              required:
                - a
                - b
      responses:
        "200":
          description: 掛け算の成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    type: number
                    description: かけ算の答え
                    example: 15
```

このカスタムツール作成だが、あらかじめOpenAPI-Swagger仕様のスキーマが備わったAPIならよいが、そうでないAPIが実際のところは多いだろう。

ひと手間かかって面倒な感じだが、DifyにおいてAIとAPIをスムーズに連携させるためのプロンプトの一種と考えて前向きに対処しよう。

APIフレームワークによっては、APIの実装と同期してスキーマも管理できるものがある。本格利用の段階ではそのような工夫も考えたい。

### Difyのカスタムツールに登録

Difyのメニューから、`ツール` - `カスタム` - `カスタムツールを作成する`を選ぶとポップアップが表示される。

ここにカスタムツールの名前と、先ほど用意したスキーマを登録しよう。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/kakezan-api.png" alt="掛け算を行うAPI" width="1600" height="773" />

`テスト`ボタンを押すとテストができる。`a`に2、`b`に3を入力し、テストボタンを押すと、`{"result":6}`という期待した結果が得られた。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/parameter-value-test-button.png" alt="パラメータと値を入力し、テストボタンを押す" width="1600" height="773" />

最後に保存ボタンを押すと、カスタムツールの登録は完了である。

## チャットフローでカスタムツールを使う

次はスタジオ機能に移動し、チャットフローでカスタムツールを試してみよう。

ここでは「掛け算チャット」を作る。「2かける3は？」などの自然言語を解釈してAPIにより掛け算を行うチャットボットだ。

:::info
もちろん簡単な掛け算はLLM単体で実行できるが、ここでは外部APIとの連携を実証するための作例である。
:::

### パラメータ抽出の追加

まずは`開始`ブロックに`パラメーター抽出`ブロックを接続する。

自然言語による入力から、掛け算APIに渡すべき値が何かを抽出する。

`ツールからインポート`ボタンを押して作成したカスタムツールの`multiply`APIを選択すると、スキーマに記述したパラメータ`a`と`b`が自動で展開される。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/parameter-output.png" alt="パラメーターを抽出" width="1600" height="790" />

### カスタムツールの追加

続いて`パラメーター抽出`ブロックから`カスタムツール` - `multiply`に接続する。

入力変数`a`は、`Variable` - `パラメーター抽出/a`を選択する。`b`についても同様に`Variable` - `パラメーター/b`を選択する。

これでユーザーの入力から掛け算の意図を汲み取り、APIに渡す処理を実現できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/calculate_product_of_two_numbers.png" alt="2つの数値の積を計算する" width="1600" height="790" />

### 回答

一旦ここで回答ブロックをつなげて動作確認をする。`a`、`b`、そしてカスタムツールの出力`text`を簡単に整形して表示するようにしてみた。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/2tsu_no_suuchi_o_kake_awaseru.png" alt="2つの数値を掛け合わせる" width="1600" height="790" />

プレビュー機能で **「二かける三は？」** と尋ねてみると、

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/node-connected.png" alt="ノードが2つ接続されている" width="1600" height="1046" />

```
2 * 3 = {"result": 6}
```

という回答が得られた。

出力フォーマットはさておき、ユーザーの自然言語をLLMで適切に解釈し、独自に用意した掛け算APIを実行する流れを実現できた。

## カスタムツールの注意点

カスタムツールの注意点は、出力スキーマは自動で解釈してくれないところである。入力スキーマはパラメーター抽出やツールブロックの入力に活用できるが、出力はフラットな文字列`text`としてしか扱うことができなかった。

:::info Difyのバージョン
Difyのバージョンは`0.8.2`で検証している。
:::

APIの結果から必要な要素を抜き出す場合は、コードブロックなどでJSONを解析する必要がある。

今後のバージョンで出力スキーマも解釈し、要素を個別に利用できるようになる可能性はある。しかし、もしかしたらLLMの入力としてはJSONやXMLなどの構造化データでもおおよそ問題ないので、設計思想としてこのままかもしれない。

### 代替案 - 出力スキーマをフラットテキストにする

構造化された出力は直接解析できないので、Dify向けのAPIの出力はそもそもシンプルなテキスト(`text/plain`)にするという手も考えられる。

OpenAPI-Swagger仕様のスキーマの、`responses`を以下のように変更して、APIの出力を`text/plain`にしても連携には問題がなかった。

```yaml
      responses:
        "200":
          description: 掛け算の成功
          content:
            plain/text:
              schema:
                type: string
                example: "15"
```

## APIの認証について

カスタムツールによるAPI連携では当然、アクセス認証も設定できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/ninsho-houhou-nyuryoku-gamen.png" alt="認証方法の入力画面" width="542" />

設定による挙動は以下のようになっている。

APIリクエストヘッダ`Authorization`(キーとして変更可能)に、指定した値を渡すシンプルな設定である。

- 認証タイプ
  - **なし** 特に認証情報は渡さない
  - **APIキー** `Authorization`ヘッダに指定の認証情報を渡す
    - **ベーシック** 値の前に`Basic`が付く
    - **ベアラー** 値の前に`Bearer`が付く
    - **カスタム** 値をそのまま渡す

### ベーシック

文字通りベーシック認証だ。もしAPIがベーシック認証で保護されているなら、次のようにユーザ名とパスワードをBase64エンコードした値を設定すればDifyと連携できる。

```bash
echo "user:password" | base64
```

値は特にBase64である必要はなかった。

### ベアラー

OAuth2などでアクセストークンを指定する場合にお馴染みの修飾子`Bearer`であるが、これもtoken68である必要はなかった。

もしOAuth2で認証・認可を行っているAPIがあって、アクセストークンの有効期限が十分に長ければ、そのアクセストークンを値に指定することですぐに連携できるだろう。

## まとめ

OpenAPI-Swaggerスキーマが必要という敷居はあるが、Difyと既存システムとのAPI連携は非常に夢が広がる機能である。

しかし、DifyからプリミティブなREST APIを呼び出すことは少ないと予想される。Dify側で複雑なプログラムロジックを組むのはあまり効率がよくないからだ。

おそらくもう少し複雑な処理を行うAI向け・Dify向けのAPIを新設することにはなる。だから既存のAPIにスキーマが用意されていなくても心配ない。それらの新設APIにのみ用意すれば実用上は問題ない。

また、エージェントアプリケーションで更新系のAPIとの連携も考えられる。ユーザーの自然言語入力に応じて既存システムに影響を及ぼすユースケースも今後は増えると思われる。

業務での本格的なAI利用に向けて、カスタムツールは避けて通れないテーマである。
