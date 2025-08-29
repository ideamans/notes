---
title: Gemini CLIで寝ている間に仕事してくれる「小人のくつ屋さん」を手軽に実現する
---

AI に退屈な作業をまかせ、自分の時間を確保する自動化は個人的に大きなテーマだ。以前、こちらの記事に多くの反響をいただいた。

- [AI エージェント × MCP × スプレッドシートで寝ている間に仕事をしてくれる「小人のくつ屋さん」を実現する | ideaman's Notes](https://notes.ideamans.com/posts/2025/agent-mcp-batch.html)
- Qiita 版 [AI エージェント × MCP × スプレッドシートで寝ている間に仕事をしてくれる「小人のくつ屋さん」を実現する #spreadsheet - Qiita](https://qiita.com/miyanaga/items/89c241f9c9b5558626cc)

あれから Claude Code や Gemini CLI などの AI コーディング CLI が続々と登場し、状況はまた大きく変わった。

前回は [Mastra](https://mastra.ai/) を用いて作業の自動化を図ったが、今回は AI コーディング CLI を活用し、もっと手軽にあなたが **「寝ている間に仕事をしてくれる小人のくつ屋さん」** を実現する方法を紹介する。

[[toc]]

---

## 人間のように試行錯誤する AI コーディング CLI

すでにバリバリ使っている人には周知の通り、AI コーディング CLI は本当に賢い。

最終成果物はプログラムコードであるが、その生成過程において、

- 経緯の記憶と理解
- 豊富な知識と論理的な推論
- ファイルの読み書きやツールの自律的活用
- フィードバックからの試行錯誤

こういった人間のような振る舞いを見せる。これにはいまだ驚きを禁じ得ない。

## Gemini CLI に退屈な単純作業を依頼する

これだけ賢いなら他の作業もできるのではないかと考えた。

そこで AI コーディング CLI である [Gemini CLI](https://cloud.google.com/blog/ja/topics/developers-practitioners/introducing-gemini-cli) に、コーディングではなく単純作業を頼んでみよう。今回は Gemini CLI を題材とするが、[Claude Code](https://docs.anthropic.com/ja/docs/claude-code/overview) や [OpenAI Codex](https://openai.com/codex/) でも同様のことはできるはずだ。

### 公開リポジトリ

これから紹介するプロジェクトは以下のリポジトリでソースコードを公開した。興味のある方は合わせて参考いただきたい。

- [ideamans/gemini-cli-common-work](https://github.com/ideamans/gemini-cli-common-work)

### 題材: 新聞系ニュースサイトの「アクセスランキング」横断調査

題材は、「多数の新聞系ニュースサイトでアクセスランキングが採用されているかを調べる」にする。

以下のタブ区切りの表を コーディング AI に完成させてもらう。

```tsv tasks.tsv
新聞サイト名	ステータス	URL	アクセスランキングの有無	アクセスランキングの名称
読売新聞	完了	https://www.yomiuri.co.jp/	有り	アクセスランキング
朝日新聞
毎日新聞
日経新聞
産経新聞
サンスポ
ジャパンタイムズ
スポーツ報知
日刊工業新聞
日刊スポーツ
スポニチ
東スポ
水産経済新聞
東京新聞
日本農業新聞
共同通信
```

::: info
もちろん CSV でもよいのだが、筆者は表計算ソフトにそのまま貼り付けられ、エスケープを考慮する機会が少ないタブ区切りを好むので TSV としている。
:::

アクセスランキングは、サイトによって「人気ランキング」や「人気記事」など名称の揺れがある。また、JavaScript により動的に生成されている場合もある。人間とブラウザでなら自然とできるところだが、単純なスクレイピングやテキスト検索では検知力が落ちる。そこで AI を活かす。

### お助けツール: MCP サーバー

AI にブラウザを使わせたり、Web 検索を行わせるために **MCP サーバー** を利用する。MCP サーバーは AI エージェントの能力を拡張するお助けツールで、これも AI の急速な進化のインパクトを受け、相互に目覚ましく発展している分野だ。

今回はブラウザを操作する `playwright` と、Web 検索を行う `brave-search` の MCP サーバーを利用する。

```json .gemini/settings.json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
      // Brave SearchにはAPIキーが必要。export BRAVE_API_KEY="" で別途指定する
    }
  }
}
```

::: info
Gemini CLI は Google 製ということもあり、Web 検索機能を備えている。しかし今回、結果がいつまでも返ってこないことが何度かあり、Brave Search の方が安定した。
:::

Brave Search API は API キーが必要となる。以下のサイトに登録し、事前に取得いただきたい。

- [Brave サーチ API | Brave](https://brave.com/ja/search/api/)

### 指示書: GEMINI.md

人間であればまずサイトを Web 検索し、実際にサイトを表示する。そしてアクセスランキングがあるかを確認し、その結果を読売新聞の例を参考に表に書く。この作業を繰り返すだろう。

それをそのまま、作業指示書にあたる `GEMINI.md` に以下のインストラクションとして記載した。

```markdown
あなたは、@tasks.tsv の空欄を 1 行ずつ埋めて完成に導くエージェントです。

# 目的

新聞ニュースサイトのトップページに「アクセスランキング」があるかを調査します。

# ツール

- Web 検索には brave-search を使用してください。
- ページを開く時はブラウザとして playwright を使用してください。

# 手順

1. すでに「ステータス」の欄に記入があれば、その行はスキップしてください。
2. 「${サイト名} ニュースサイト」を Web 検索して、ブラウザで新聞ニュースサイトにアクセスします。それが本当にニュースサイトかを確認します。もしニュースサイトではないと判断したら、検索結果の別のページを試してください。
3. 「URL」 の列に、ニュースサイトと特定したページの URL を記入してください。
4. 「アクセスランキング」というセクションがあるかを確認します。「アクセスランキングの有無」の列には「有り」または「無し」と記入してください。
5. アクセスランキングがある場合は、そのセクションの見出しや名称を確認します。「アクセスランキングの名称」の列には、その名称を記入してください。
6. サイトについて一連の処理が完了したら、「ステータス」の列に「完了」と記入してください。
7. ステータスを記入したら、次の行に進んでください。すべての行について処理が完了したら、エージェントを終了してください。

# 注意

- 新聞サイトのトップページは多数のニュース記事へのリンクがあることがポイントです。たまに新聞サイトではなく、コーポレートサイトや採用サイトに当たることもあります。新聞ニュースサイトではないと判断したら、検索結果に戻って別のページを試してください。
- アクセスランキングは人気記事、人気ランキングなどと表現されることもあり、アクセス数などの実績に基づき、ランキング形式の記事リストが表示されているセクションです。リストに 1, 2, 3,...と順位が付けられていることがポイントです。
```

### 動作確認とデバッグ

ここで一度、`gemini`コマンドを起動して動作確認を行ってみよう。

```bash
export BRAVE_API_KEY="(APIキーをここに指定)"
gemini -y -m gemini-2.5-flash
```

::: info
モデルとして　 Gemini 2.5 Flash(`gemini-2.5-flash`) を指定している。これは今回のタスクが比較的シンプルな文脈理解で事足りるからで、挙動を安定させる意図がある。Gemini 2.5 Pro は高価であるし、無料版で使うとすぐに割り当てが枯渇して結局、Flash を使うことになる。初めから Flash を使うのが賢明だろう。
:::

そして次のプロンプトを入力する。

```text
@GEMINI.md に従い tasks.tsv を完成に導いてください。
```

時間はかかるが、`tasks.tsv`が自動で更新されていく様を見ることができるだろう。

### スクリプト: 完了まで繰り返す

これで一応の目的を達成したが、AI コーディング CLI は 100%安定動作するとは限らない。割り当ての枯渇などもあるが、API の不調などで止まることを前提にしておいた方がよい。

そこで次のスクリプトを用意し、`tasks.tsv`に未処理のタスク(ステータスが空欄の行)がある限り、Gemini CLI に作業を繰り返してもらう。

```bash
#!/bin/bash

cd "$(dirname "$0")" || exit 1

# .envファイルが必要
if [ -f ".env" ]; then
    set -a
    source ".env"
    set +a
else
    echo "エラー: .envファイルが見つかりません" >&2
    exit 1
fi

# 残作業があるか判定する関数
has_backlog() {
    if [ ! -f "tasks.tsv" ]; then
        echo "エラー: tasks.tsvが見つかりません" >&2
        return 1
    fi

    # タブ区切りで2列目(ステータス)が空の行があるかチェック
    while IFS=$'\t' read -r col1 col2 rest; do
        # 空行をスキップ
        [ -z "$col1" ] && continue
        # 2列目が空の場合、真(0)を返す
        if [ -z "$col2" ]; then
            return 0
        fi
    done < tasks.tsv

    # 2列目が空の行が見つからない場合、偽(1)を返す
    return 1
}

# メインループ
while true; do
    # 処理するタスクがあるかチェック
    if ! has_backlog; then
        echo "処理するタスクがありません。終了します。"
        exit 0
    fi

    echo "タスクを処理しています..."
    gemini -y -m gemini-2.5-flash -p "@GEMINI.md に従い @tasks.tsv を完成に導いてください。"
    gemini_exit_code=$?

    # 処理後もタスクが残っているかチェック
    if has_backlog; then
        if [ $gemini_exit_code -eq 0 ]; then
            echo "残りタスクがあります。10秒後に再実行します..."
            sleep 10
        else
            echo "エラーが発生しました。10分後に再実行します..."
            sleep 600
        fi
    else
        echo "すべてのタスクが完了しました。終了します。"
        exit 0
    fi
done
```

`gemini`コマンドがエラーで終了したときは割り当てを使い尽くしたり、API の不調である可能性がある。そこで 10 分のインターバルを置く。

こうしておけば、夜中寝ているときに Gemini CLI がコケても作業を再開し、朝にはすっかり完了しているという寸法だ。

### デモ

実際に手元で動かしてみた動画がこちら(60 倍速)。

<iframe width="560" height="315" src="https://www.youtube.com/embed/ovPyi44V1sE?si=1tGWGFa6pfK2Fopg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

16 サイトの調査に 20 分ほどかかった。これはプロンプトやスクリプトの問題かもしれない。あるいは並列化を検討するのもよいだろう。

### 結果のレビュー

結果を見てみると、

```tsv
新聞サイト名	ステータス	URL	アクセスランキングの有無	アクセスランキングの名称
読売新聞	完了	https://www.yomiuri.co.jp/	有り	アクセスランキング
朝日新聞	完了	https://www.asahi.com/	有り	アクセスランキング
毎日新聞	完了	https://mainichi.jp/	有り	アクセスランキング
日経新聞	完了	https://www.nikkei.com/	有り	アクセスランキング
産経新聞	完了	https://www.sankei.com/	有り	ランキング
サンスポ	完了	https://www.sanspo.com/	有り	ランキング
ジャパンタイムズ	完了	https://www.japantimes.co.jp/	無し
スポーツ報知	完了	https://hochi.news/	有り	ランキング
日刊工業新聞	完了	https://www.nikkan.co.jp/	有り	閲覧ランキング
日刊スポーツ	完了	https://www.nikkansports.com/	有り	ニュースランキング
スポニチ	完了	https://www.sponichi.co.jp	有り	人気ランキング（総合）
東スポ	完了	https://www.tokyo-sports.co.jp	有り	アクセスランキング
水産経済新聞	完了	https://www.suikei.co.jp	有り	週間ランキング
東京新聞	完了	https://www.tokyo-np.co.jp	有り	ニュースランキング
日本農業新聞	完了	https://www.agrinews.co.jp/	有り	週間アクセスランキング
共同通信	完了	https://www.kyodonews.jp/news/	有り	最新ニュース
```

アクセスランキングの表記揺れ「ランキング」「閲覧ランキング」にも対応できてる。例えば日刊工業新聞では確かに「閲覧ランキング」となっている。

<img src="https://assets.ideamans.com/miyanaga/images/2025/08/news-ranking.png" alt="ニュースサイトの閲覧ランキング" width="1600" height="887" />

また、英字新聞の [ジャパンタイムズ](https://www.japantimes.co.jp/) には確かにアクセスランキングが見当たらない。日本人のランキング好きが伺える。

残念なのが共同通信についての作業結果だ。ニュースサイトとしては [https://www.kyodo.co.jp/](https://www.kyodo.co.jp/) を検知してほしかった。これもプロンプトの改善余地がある。

## まとめ

このように AI コーディング CLI は、本来のプログラム開発以外にも手軽な AI エージェントとして活用できる。

仕事の中には一定の手順で作業を繰り返し、表を埋めていくという単純作業がままある。

ちょっとしたコツで、ノンプログラマーでも退屈な作業を AI で自動化できる可能性を感じてもらえたら幸いだ。

### テキスト等価仮説

人間にとって JavaScript を書くことはプログラミングだが、作業しながら CSV ファイルの空欄を埋めるのは比較的単純作業で、両者はまったく異質に思える。

しかし **LLM ベースの AI にとっては、コードもデータも確率の高いテキストを紡ぐ点において等価** なのかもしれない。

<img src="https://assets.ideamans.com/miyanaga/images/2025/08/js-csv-file-process-by-human-and-ai.png" alt="JSとCSVのファイルを人とAIが処理する様子" width="600" />

アインシュタインは重力と慣性力を等価と看破した。それに倣い、人間の主観を疑ってコンピューターや AI の視点に立ってみると、もっと面白い活用法が見えてくるかもしれない。
