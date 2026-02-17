---
title: Go言語のローカライゼーションパッケージ go-l10nを公開
id: miyanaga
date: 2025-05-31 15:56:00
categories: ['development']
ogp: /ogp/2025/go-l10n.jpg
ads:
  - id: ai-coaching
---

Go言語用のローカライゼーション(自然言語メッセージ翻訳)のためのパッケージをOSSとして公開した。

- [ideamans/go\-l10n: A Go internationalization \(i18n\) library inspired by Movable Type's localization system\.](https://github.com/ideamans/go-l10n)

このローカライゼーションパッケージは、[Movable Type](https://www.sixapart.jp/movabletype/)のローカライゼーションにインスパイアされた仕様となっている。

[[toc]]

---

## 英語文をキーにした文字列マップによるシンプルな辞書

メッセージ翻訳辞書といえば、PO/POT形式やYAMLに記述する方法をよく目にする。また、Go言語でも標準的に`golang.org/x/text/message`が用意されている。

実はそこまで詳しくないので勘違いがあると恐縮だが、これらの方法はメッセージキーを別途用意する。JSONで例えるとこのような感じだ。

```yaml
greeting:
  en: Hello, %s
  ja: こんにちは、%sさん
```

プログラム上では`greeting`を用いて言語に応じたメッセージを参照する。

合理的ではあるのだが、自分には認知的負荷が高かった。例えば`%s`のようにプレースホルダを持っていても、実際のメッセージを見ないとわからない。

また、メッセージはそのときの判断でわかりやすいものに変更することも多い。するとその場では変更できないので、毎回辞書ファイルから該当箇所を探して修正し…と手間がかかる。

しかしMovable Typeのローカライゼーションは違った。英語のメッセージ自体をキーとし、プログラム上における文字列マップ(連想配列)で
辞書を表現する。

```go
jpDictionary := map[string]string{
  "Hello, %s": "こんにちは, %sさん"
}
```

シンプルすぎて弱点もある。

- キーが長いので照会が遅い
- 単数形/複数形など動的なローカライゼーションに対応できない

しかしこの仕組みにより、とりあえず英語メッセージでプログラムの実装を進め、UIのフィーリングを確認できる。

そしてメッセージキーと実メッセージの対応にも記憶領域を奪われることもない。それが心地よかった。

そこでGo言語に向けて自分でも用意したという経緯である。

## 使い方

以下のように`l10n.T`に英語メッセージをキーとして渡すことで可読性の高いコードを書ける。

翻訳は`init`において`l10n.Register`を通してマップを渡す。これでグローバルな日本語辞書に翻訳がマージされる。

```go
package main

import (
    "fmt"
    "github.com/ideamans/go-l10n"
)

func main() {
    fmt.Println(l10n.T("Hello, World!"))
}

func init() {
    l10n.Register("ja", l10n.LexiconMap{
        "Hello, World!":     "こんにちは、世界！",
    })
}
```

そのほか、環境変数から言語の自動判別、テスト時は英語に固定する機能、`fmt.Format`や`fmt.Error`のシュガーシンタックスなどがある。

詳しくは[README](https://github.com/ideamans/go-l10n)をご覧いただきたい。
