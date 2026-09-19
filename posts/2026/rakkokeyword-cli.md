---
title: SEOの素人がAIエージェントとキーワード調査をするためのラッコキーワード用OSS CLI rakkokeyword-cli
description: SEOに詳しくないと、キーワード調査ツールの画面を見ても何をどう調べればいいかわからない。ラッコキーワードのAPIをCLIで包み、知りたいことを伝えればAIエージェントが機能を選んで調べ、レポートや計画にまとめるようにした。
id: miyanaga
date: 2026-09-24 09:00:00
categories:
  - ai
  - business
  - automation
ogp: /ogp/2026/rakkokeyword-cli.jpg
draft: true
---

ラッコキーワードは、SEOや広告のためのキーワード調査ツールである。

- [ラッコキーワード](https://related-keywords.com/)

正直に言うと、私はSEOにほとんど詳しくない。ラッコキーワードの画面を見ても使い方のコツがわからず、圧倒されてしまう。どういうニーズに対してどういう情報を集めればいいのかわからないし、そのためにどんな操作をすればいいのかもわからない。

ところがAIエージェントとAPIがあれば話が変わる。「こういうことを知りたい」「こういう存在感を出したい」というニーズを伝えるだけで、AIエージェントが適切な機能を選び、レポートや計画を作ってくれる。

ラッコキーワードには公式のMCPもあるが、個人的にはCLIの方が好みだ。そこでAPIをCLIで包んだ。それが rakkokeyword-cli（コマンド名は `rakkokeyword`）である。MITライセンスのオープンソースとして公開している。

- [ideamans/rakkokeyword-cli](https://github.com/ideamans/rakkokeyword-cli)

[[toc]]

---

## 知りたいことから使う機能を選ぶ

ラッコキーワードのAPIには、たくさんの機能がある。サジェスト、関連キーワード、質問の形のキーワード、検索ボリューム、検索順位、競合、上位ページの見出しや語彙などだ。素人には、このなかからどれを使えばいいのかがわからない。

そこでAIエージェント向けのリファレンスに、「ユーザーが知りたいこと」から使うコマンドを引ける表を入れてある。一部を抜き出すと、こんな具合だ。

| 知りたいこと | コマンド | クレジット |
|---|---|---|
| 広く関連するキーワード、実際のサジェスト | `suggest-keywords` | 1.5 |
| FAQやAI検索向けの質問の形 | `question-search` | 3 |
| 検索意図が同じキーワードの群れ | `ranking-keywords` | 4.5 |
| リストの正確で最新の検索ボリュームと難易度 | `search-volume register --wait` | 最低15 |
| あるサイトの現在の順位 | `search-rank register --wait` | 1キーワード0.9〜 |
| サイト（や競合）が獲得しているキーワード | `influx-keywords` | 4.5 |
| SEO上の競合は誰か | `competitive` | 4.5 |
| 上位記事に必要な見出し | `headline` | 3 |
| 上位記事に必要な語彙 | `co-occurrence` | 3 |

AIエージェントは、こちらのニーズを聞いてこの表から機能を選ぶ。使い方のコツを知らなくても、何を知りたいかさえ伝えればよい。

## 具体例

具体例をみてみよう。「ラッコについての記事を書きたい。どんな構成にすればいいか調べて」と頼むと、AIエージェントはおおむね次の順で調べる。

```bash
# 1. 需要をつかむ（1.5クレジット）
rakkokeyword suggest-keywords ラッコ --increase-keyword --filter searchVolume.min=100 -f json > suggest.json

# 2. 絞り込んだ候補の検索ボリュームを確かめる（最低15クレジット）
rakkokeyword search-volume register --keywords-file shortlist.txt --wait -f json > volume.json

# 3. 上位のページが何を書いているかを見る（3＋3クレジット）
rakkokeyword headline ラッコ -f json > headlines.json
rakkokeyword co-occurrence ラッコ --details=false -f json > vocabulary.json

# 4. 読者が実際に抱く疑問を集める（3クレジット）
rakkokeyword question-search ラッコ -n 50 -f json > questions.json
```

集めた結果は、AIエージェントが記事の構成案やレポートにまとめてくれる。結果はJSONやCSVでファイルに残るので、あとから見返したり、別の調査に使い回したりもしやすい。

## クレジットを使いすぎない

APIの呼び出しは、1回ごとにラッコキーワードのクレジットを消費する。安いものは1.5クレジットだが、`other-keywords` のように1回で22.5クレジットかかるものもある。

少ない予算で使いたいので、クレジットの消費は見えるようにしてある。

- 各コマンドの `--help` に、1回あたりのコストを書いてある
- 実行すると、消費したクレジットを表示する
- `--dry-run` を付ければ、リクエストを送らずにコストだけを確かめられる

```bash
rakkokeyword other-keywords ラッコ --dry-run
```

AI向けのリファレンスにも、最初の鉄則として、どの呼び出しもユーザーのお金を消費するので実行前にコストを伝えるよう書いてある。

あわせて、数字の読み違いも防いでいる。SEO難易度が `null` のときや、順位の結果が `null` のときは、どちらも「不明」や「範囲内に見つからなかった」という意味だ。これを0として報告しないよう、リファレンスに書いてある。

## 専門家に相談するほどではないとき

もちろん、専門家に相談する方が正確で、よい提案をもらえるだろう。しかし、少ない予算で素人の域を脱する程度が目的なら、これで十分だと思っている。

## AIエージェントから使うには

APIキーは、ラッコキーワードのSTANDARDプラン以上で発行できる。環境変数に入れておけば使える。

```bash
export RAKKOKEYWORD_API_KEY=your-key
rakkokeyword auth status
```

`rakkokeyword llm` を実行すると、AIエージェント向けのリファレンスがまとめて出てくる。上で挙げた「知りたいこと」とコマンドの対応表や、調べ方の実例、各指標の意味が入っている。

```bash
rakkokeyword llm                  # Markdown
rakkokeyword llm --format json    # 章ごとのJSON配列
```

Claude Codeならプラグインとして入れられる。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install rakkokeyword-cli@ideamans-plugins
```

入れておけば、`rakkokeyword` が手元になくても「ラッコキーワードで調べたいのでCLIを入れて」と頼むだけで導入まで進む。この仕組みは [go-llm-cli-kit の記事](/posts/2026/go-llm-cli-kit.html) に書いた。

## まとめ

- SEOに詳しくないと、キーワード調査ツールの画面を見ても何をどう調べればいいかわからない
- ラッコキーワードのAPIをCLIで包み、ニーズを伝えればAIエージェントが機能を選んで調べるようにした
- 「知りたいこと」から使うコマンドを引ける表を、AI向けのリファレンスに入れてある
- クレジットの消費は `--help` と実行結果と `--dry-run` で見えるようにしてある
- 専門家ほどではないが、少ない予算で素人の域を脱するには十分である

- [ideamans/rakkokeyword-cli](https://github.com/ideamans/rakkokeyword-cli)
