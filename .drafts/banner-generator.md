---
title: OGP画像を自動生成するバナー生成システムを開発
id: miyanaga
date: 2024-09-22 16:07:00
---

このブログでも[はてなブログ](https://hatena.blog/)や[Qiita](https://qiita.com/)のように、タイトルなどからアイキャッチ画像(SNSシェア用のOGP画像)を自動生成するようにした。

既視感のあるテーマだが、独自にバナー生成システムを開発し、オープンソースとして公開したのでその紹介をしたい。

---

## アイキャッチ画像の自動生成

本記事をSNSでシェアいただくと、このようなアイキャッチ画像(OGP画像)が表示される。

こういった画像は昔であれば個別に制作する必要があったが、案外面倒くさい。

というわけで、決まったテンプレートに記事のタイトルなどを流し込んで自動生成するサイトがここ数年で増えた。個人的には[はてなブログ](https://hatena.blog/)や[Qiita](https://qiita.com/)、[Zenn](https://zenn.dev/)のアイキャッチがお馴染みである。

個人的にも興味のあるテーマだったので、ひとつ自分の使いやすいものを開発してみようと決めた。

オープンソースで公開したので、興味のある方は覗いてみてほしい。

- [GitHub](https://github.com/ideamans/banner-generator)
- [dockerhub](https://hub.docker.com/r/ideamans/banner-generator)

## バナー画像自動生成のアプローチ

このようなテンプレートライクなバナー画像自動生成にはいくつかのアプローチがある。

なかでもヘッドレスブラウザでHTML+CSSによるテンプレートからレンダリングする方法は、ブラウザが備える表現力を使えて柔軟性も高い。

例えば以下のようなライブラリで容易に開発できる。

- [node-html-to-image](https://www.npmjs.com/package/node-html-to-image)

しかし、画像1枚を書き出すためにブラウザを動かすのでとにかく重い。

動作環境も日本語フォントもインストールする必要があるなど、ハードルが高い。

今回はピュアなNode.jsだけで、もっと軽快に動作する方法を採用したかった。

## 仕様の絞り込み

他のサイトのアイキャッチ画像を見ていて、以下の要件を満たせば

1. 背景画像を自由に選べる
2. 3行のテキストをメリハリつけて均等に表示できる
3. 背景画像に合わせて配置を少しカスタマイズできる