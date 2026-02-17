---
title: OGP画像を自動生成するプログラムをOSSで公開
id: miyanaga
date: 2024-09-23 11:16:00
categories:
  - development
  - technology
  - automation
ogp: /ogp/2024/banner-generator.jpg
ads:
  - id: ai-coaching
---

このブログでも、[はてなブログ](https://hatena.blog/)や[Qiita](https://qiita.com/)のようにタイトルなどからOGP画像(SNSシェア用のアイキャッチ画像)を自動生成するようにした。

そのためのバナー生成システムを独自に開発し、オープンソースとして公開した。

- [banner-generator](https://github.com/ideamans/banner-generator)

既視感のあるテーマだが、自分でも作ってみたいと以前から考えていた。その紹介をしたい。

[[toc]]

---

## OGP画像の自動生成

本記事をSNSでシェアいただくと、このようなOGP画像(アイキャッチ画像)が自動生成される。

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=ideaman%27s+Notes&amp;text0width=60%25&amp;text1=OGP%E7%94%BB%E5%83%8F%E3%82%92%E8%87%AA%E5%8B%95%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%82%92OSS%E3%81%A7%E5%85%AC%E9%96%8B&amp;texts%5B1%5D.fontSize=5%25&amp;texts%5B1%5D.minWidth=60%25&amp;texts%5B1%5D.maxWidth=90%25&amp;text2=2024-09-23+miyanaga&amp;text%5B2%5D.fontSize=3%25&amp;text%5B2%5D.minWidth=30%25&amp;text%5B2%5D.maxWidth=40%25" width="800">

画像URLのパラメータに、背景画像のURL、ブログ名、記事タイトル、メタデータを渡すとそれらをプログラムで合成する仕組みだ。

## OGP画像自動生成のアプローチ

このようなテンプレートライクな画像生成にはいくつかのアプローチがある。

メジャーなのはヘッドレスブラウザでHTMLとCSSをレンダリングし、スクリーンショットを撮る方法だろう。慣れたHTMLとCSSにより、ブラウザが備える高い表現力を活用できる。

例えば以下のようなライブラリで容易に開発できる。

- [node-html-to-image](https://www.npmjs.com/package/node-html-to-image)

同じく弊社がOSSで提供する、[Webページの読み込みプロセスを動画化するツール](/posts/2024/loadshow.html)でもその技術を使っている。

当初はその方向性で考えたが、このアプローチはブラウザを動かすのでとにかく重い。また、動作環境も日本語フォントもインストールする必要があるなどハードルが高い。

今回は低性能のサーバーで稼働させたかった事情もあって別のアプローチを選択した。

### 仕様の絞り込み

他のサイトの自動生成OGP画像を見ていて、以下の要件を満たせば自分には十分そうだと感じた。

1. 背景画像を自由に選べる
2. 3行のテキストを中央揃え、縦方向に均等に表示できる
3. テキストのサイズや配置を少しカスタマイズできる

これだけならヘッドレスブラウザを持ち出すまでもないと判断した。

### sharpとtext-to-svgによる実装

Node.js用に[sharp](https://www.npmjs.com/package/sharp)というグラフィックライブラリがある。sharpを使うと簡単に画像の合成ができる。

また、[text-to-svg](https://www.npmjs.com/package/node-html-to-image)を用いると、フォントファイルからテキストのSVGデータを作成できる。

これらを組み合わせて実現することにした。

その結果が以下の画像である。

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=ideaman%27s+Notes&amp;text0width=60%25&amp;text1=OGP%E7%94%BB%E5%83%8F%E3%82%92%E8%87%AA%E5%8B%95%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%82%92OSS%E3%81%A7%E5%85%AC%E9%96%8B&amp;texts%5B1%5D.fontSize=5%25&amp;texts%5B1%5D.minWidth=60%25&amp;texts%5B1%5D.maxWidth=90%25&amp;text2=2024-09-23+miyanaga&amp;text%5B2%5D.fontSize=3%25&amp;text%5B2%5D.minWidth=30%25&amp;text%5B2%5D.maxWidth=40%25" width="800">

デザインのエキスパートからすると文字の配置が甘かったりするかもしれないが、素人目には違和感はない。

テキストの輪郭も綺麗に合成されており、動作も軽快で満足している。

## 工夫した点

### テキストの行数による配置の調整

主な用途は3行テキストによるOGP画像の生成だが、ついでに1行と2行の場合のレイアウトも個別に実装した。

自分がプレゼンテーションスライドを作成するときに好んで使うレイアウトだ。

1行の場合はテキストが上下左右の中央に配置される。

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=ideaman%27s+Notes&amp;text0width=80%25" width="800">

2行の場合はメインタイトルとサブタイトルのような見た目になる。

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=ideaman%27s+Notes&amp;text0width=60%25&amp;text1=%E3%82%A2%E3%82%A4%E3%83%87%E3%82%A2%E3%83%9E%E3%83%B3%E3%82%BA%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%E3%81%AE%E7%A0%94%E7%A9%B6%E3%83%8E%E3%83%BC%E3%83%88&amp;text1width=60%25" width="800">

### フォントサイズの自動調整

記事タイトルなどを流し込むので文字数は一定ではない。フォントサイズが固定だと、テキストが小さくなりすぎたり、逆にはみ出る可能性がある。

そこでテキストの幅の最小値と最大値を指定できるようにした。その範囲を超えるとフォントサイズが自動調整される。

最小幅を50%、最大幅を90%とするとテキストの内容によって以下のようなレイアウトとなる。

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=%E7%9F%AD%E3%81%84%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88&amp;text%5B0%5D.minWidth=50%25&amp;text%5B0%5D.maxWidth=90%25" width="800">

<img src="https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&amp;text0=%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E9%95%B7%E3%81%84%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88&amp;texts%5B0%5D.minWidth=50%25&amp;texts%5B0%5D.maxWidth=90%25" width="800">

## 残課題

今回の要件は満たしたが、まだいろいろ改良したい点はある。

- 改行に対応
- ハッシュトークンのようなセキュリティ
- 上下余白を個別指定
- 背景画像の簡単な色味調整

MITライセンスなので、ぜひ気軽に利用あるいはフォークして改良してみていただきたい。
