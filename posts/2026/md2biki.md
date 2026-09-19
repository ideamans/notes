---
title: AIと一緒に書いたMarkdownを旧来のBacklog記法に変換するOSS CLI md2biki
description: AIエージェントと書く文章はMarkdownが基本だが、Backlogのワークスペースによっては旧来のBacklog記法での入力を求められる。Markdownで原稿を練り、Backlogに入れるときだけ機械的に変換するためのシンプルなCLIを作った。
id: miyanaga
date: 2026-09-25 09:00:00
categories:
  - content-management
  - development
ogp: /ogp/2026/md2biki.jpg
draft: true
---

案件によって、プロジェクト管理のBacklogに参加することがある。

- [Backlog](https://backlog.com/ja/)

Backlogも最近はMarkdownが主流になったが、ワークスペースによっては旧来のBacklog記法での入力を求められる。

AIエージェントの時代になって、文章はMarkdownで生成したり管理したりすることがほとんどになった。そうなると、Backlog記法はとても使いにくい。

そこで、AIエージェントにはMarkdownで書いてもらい、Backlogに入れるときだけ機械的にBacklog記法へ変換する、シンプルな変換ツールを作った。それが md2biki である。MITライセンスのオープンソースとして公開していて、npmから入れられる。

- [ideamans/md2biki](https://github.com/ideamans/md2biki)

[[toc]]

---

## AIと原稿を練ってから変換する

BacklogのチケットやWikiに書き込むときは、まずAIエージェントと一緒に原稿を考える。いったんMarkdownに書き出して、推敲する。

できあがったら、Backlog記法に変換してBacklogに貼る。この変換のところでmd2bikiを使う。

特に便利なのが、クリップボードからの読み込みとクリップボードへの書き出しだ。Markdownの原稿をコピーして次のコマンドを実行すると、変換した結果がクリップボードに入る。あとはBacklogに貼るだけでよい。

```bash
md2biki =
```

コマンドラインのツールでは、標準入出力を使うときに `-` を引数に渡すことが多い。md2bikiも `md2biki -` で標準入出力を扱う。クリップボードの場合は入力と出力の両方をクリップボードにするので、この `-` をアレンジして `=` という記号にした。

## 具体例

具体例をみてみよう。たとえば、次のようなMarkdownの原稿があるとする。

```markdown
## 対応方針

リニューアル後の**トップページ**で、表示が遅くなっている原因を調べました。

- 画像の大きさが指定されていない
- `analytics.js` が描画を止めている

| 項目 | 改修前 | 改修後 |
|---|---|---|
| LCP | 3.4秒 | 2.1秒 |

詳しくは[計測結果](https://example.com/report)を見てください。
```

md2bikiに通すと、次のようなBacklog記法になる。

```
** 対応方針
リニューアル後の''トップページ''で、表示が遅くなっている原因を調べました。
- 画像の大きさが指定されていない
- {code}analytics.js{/code} が描画を止めている
|項目|改修前|改修後|h
|LCP|3.4秒|2.1秒|
詳しくは[[計測結果>https://example.com/report]]を見てください。
```

見出しの `##` は `**` に、太字は `''` に、表の見出し行は末尾の `h` に置き換わっている。こうした書き換えを、手で覚えなくて済む。

## 変換の対応

主な変換は次のとおりである。

| Markdown | Backlog記法 |
|---|---|
| `# 見出し` | `* 見出し`（H1〜H6） |
| `**太字**` | `''太字''` |
| `*斜体*` | `'''斜体'''` |
| `~~取り消し~~` | `%%取り消し%%` |
| `` `コード` `` | `{code}コード{/code}` |
| `[リンク](url)` | `[[リンク>url]]` |
| `![画像](url)` | `#image(url)` |
| `1. 項目` | `+ 項目` |
| `> 引用` | `>引用`（複数行は `{quote}…{/quote}`） |
| 表 | `\|A\|B\|h` の形 |

入れ子のリストやコードブロック、特殊な文字のエスケープにも対応している。

## 使い方

npmから入れる。インストールせずに `npx` で動かしてもよい。

```bash
npm install -g md2biki
```

ファイルやディレクトリを渡すほか、標準入出力やクリップボードでも使える。

```bash
# ファイルを変換する（README.md.biki ができる）
md2biki README.md

# ディレクトリ内のMarkdownをまとめて変換する
md2biki ./docs -o ./wiki

# 標準入力から読んで標準出力へ書く
cat document.md | md2biki - > output.biki

# クリップボードから読んでクリップボードへ書く
md2biki =
```

空行を残して読みやすくしたいときは `-r`、進捗の表示を消したいときは `-q` を付ける。

## まとめ

- Backlogも最近はMarkdownが主流だが、ワークスペースによっては旧来のBacklog記法での入力を求められる
- AIエージェントと書く文章はMarkdownなので、Backlogに入れるときだけ変換する
- クリップボードから読んでクリップボードに返せるので、コピーして変換して貼るだけで済む

Markdownで書いた原稿をBacklog記法へ直す手間がつらい人には、おすすめできる。

- [ideamans/md2biki](https://github.com/ideamans/md2biki)
