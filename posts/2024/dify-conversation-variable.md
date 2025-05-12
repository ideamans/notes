---
title: Dify会話変数でcanvasのような共同作業を実現
id: miyanaga
date: 2024-10-18 07:18:00
categories:
  - ai
  - development
  - technology
  - automation

---

[ChatGPT with canvas](https://openai.com/index/introducing-canvas/)をご存知だろうか。AIとともに、ソースコードや文章を編集できる機能だ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/go-code.png" alt="Go言語のコード" width="1285" height="801" />

[GitHub CoPilot](https://www.programai.co/)もそうだと言えるし、これまでも近いことはできた。しかし**「共通の作業対象」**がインターフェースや出力として明確になった点が新しい。

このような共同作業を、Difyのチャットでも実現する方法を解説したい。

[[toc]]

---

## 会話変数

Difyのチャットには**会話変数**という機能がある。ワークフローの各ブロックにも入出力変数があるが、それとは別に会話全体を通して保持されるグローバル変数のようなものだ。

この会話変数に共同作業の成果物を格納することで、ChatGPT with canvasのようなチャットを実現できる。

:::info メモリと会話変数
過去の会話の内容を記憶して回答に役立てる**メモリ**もある。しかし指示代名詞(あれ、それ)を用いるのは会話と同様、正確さを欠く恐れがある。会話変数の方が確実である。
:::

## 俳句を共同で作るチャット

ここではAIと一緒に俳句を作るチャットシステムを作ってみよう。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/aki-no-yoru-ni-tsuki-no-hikari-ga-yasashiku-terasu.png" alt="秋の夜に月の光が優しく照らされる" width="402" height="996" />

### 会話変数

ワークフローの右上に会話変数アイコンがある。アイコンを押して表示される右サイドパネルで変数を追加および編集できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/kaiwa_hennsuu.png" alt="会話変数" width="677" height="527" />

ここで、これまで考えた俳句の成果物を保持する`haiku`という変数を作成した。

### ワークフロー全体

次のようなワークフローを構成した。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/llm-haiku-generation-flow.png" alt="LLMを用いた俳句生成フロー" width="1230" height="260" />

`パラメータ抽出`と`変数代入`ブロックがポイントとなる。

### LLMブロック

LLMには次のようなシステムプロンプトを与えた。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/llm-and-parameter-settings.png" alt="LLMとパラメータ設定" width="772" height="518" />

```
あなたは私と一緒に俳句を考えるアシスタントです。ユーザーの発言と、これまで考えた俳句「{{#conversation.haiku#}}」を踏まえて俳句をひとつ出力してください。
出力は、JSON形式にて、
- `haiku` 考えた俳句
- `comment` 変更を加えた点とその意図
を出力してください。
```

ユーザーの発言とこれまで考えた俳句(初回は空)から、俳句をひとつ考えるように指示する。

そして考えた俳句自体と、それに対するコメントをJSON形式で構造化するように指示している。

:::info 構造化の形式
構造化の形式はXML形式などでもよいだろう。ただ、XML形式だとタグが不可視となってデバッグしにくかったので、ここではJSONとした。
:::

### パラメータ抽出ブロック

LLMブロックの出力は素のテキストである。次にパラメータ抽出ブロックにて、先ほどの構造化された回答を正確に解釈する。

次のような設定を与えて、出力変数`haiku`と`comment`に俳句自体とコメントを格納するようにした。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/parameter-extraction-node.png" alt="パラメーターを抽出するノード" width="773" height="531" />

:::info JSONの解釈
LLMブロックでJSON出力を指示しているので、例えばコードブロックでJSONをデコードして`haiku`と`comment`を抜き出す方法もあるだろう。

しかしチャットLLMが正確に解読可能なJSONを出力する保証はない。同じくLLMで曖昧に解釈できるパラメータ抽出ブロックで、`Function/Tool Caliing`推論した方が安心できる。
:::

### 変数代入ブロック

変数代入ブロックで、ワークフロー上のブロック出力変数を会話変数に格納できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/hensuu-nyuryoku-screen.png" alt="変数入力の画面" width="773" height="351" />

ここではLLMの出力からパラメータ抽出した`haiku`を、会話変数`haiku`に格納している。

これで最後に考えた俳句成果物が会話変数`haiku`に保持され、次回の会話にて共同作業の対象を正確に引き継ぐ仕組みとしている。

### 回答ブロック

最後に回答ブロックだ。考えらた俳句とその根拠となるコメントを表示する。ついでにLLMが出力した構造化された情報もデバッグ出力している。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/node-and-arrow-flowchart.png" alt="ノードと矢印で構成されたフローチャート" width="773" height="360" />

## まとめ

このように会話変数をうまく利用することで、AIとの共同作業チャットを実装できた。

実際の業務では例えば、問い合わせへの回答文を、過去のテンプレートや顧客情報を与えながらユーザー好みの文面に仕上げていくようなアプリケーションが作れるだろう。

現在のDifyには、チャット画面に会話変数を表示したり、編集する領域はなさそうだ。ChatGPT with canvasのようなGUIを実現するには、APIを使って独自に実装する必要がある。

しかし、ChatGPT with canvasを意識して、今後そのような機能が追加されるだろうと予想している。
