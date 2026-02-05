---
id: miyanaga
title: スピード指標の確率分布ユーティリティをNPMで公開
date: 2024-12-31 08:12:00
categories:
  - sitespeed
  - development
  - technology
  - research
ogp: /ogp/2024/npm-web-vitals-distribution.jpg

---

Core Web Vitals をはじめとする多くサイトスピード指標は対数正規分布に基づくとされている。

その計算についてこれまでプロジェクトに応じて実装していたが、共通して利用できるユーティリティライブラリを公開した。

- [web-vitals-distribution - npm](https://www.npmjs.com/package/web-vitals-distribution)

インストールや基本的な使い方は日本語の README を参照されたい。

- [web-vitals-distribution/README.ja.md at main · ideamans/web\-vitals\-distribution](https://github.com/ideamans/web-vitals-distribution/blob/main/README.ja.md)

[[toc]]

---

## サイトスピード指標と対数正規分布

先日、以下の記事を書いた。

- [サイトスピード指標の対数正規分布を確かめる | ideaman's Notes](https://notes.ideamans.com/posts/2024/web-vitals-distribution.html)

Core Web Vitals に代表されるサイトスピード指標は実際にはユーザーや PV によって大きくばらつきがあるが、多数のサンプルを集めると対数正規分布に近づくとされている。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/onload-time-histogram.png" alt="OnLoadにかかった時間(ms)のヒストグラム、対数正規分布の近似曲線、平均値、中央値" width="784" height="584" />

一方、Google は Chrome ユーザーから実際にサイトを閲覧したときのスピード指標を収集し、[Chrome UX Report](https://developer.chrome.com/docs/crux)として公開している。

その集計結果は[PageSpeed Insights](https://pagespeed.web.dev/)でも参照できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/lcp-3-4-seconds.png" alt="LCPが3.4秒であることを示すウェブページの読み込み速度の測定結果" width="350" />

### Chrome UX Report からの対数正規分布の推定

上記のように Chrome UX Report のデータは「良好な割合」「不良な割合」のように集計済みの概要のみであるが、これらの情報から対数正規分布を推定できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/graph-distribution-peak-1-178-median-2-034.png" alt="グラフは、ピークが1.1780353で、中央値が2.0337656である分布を示す。良好61%、要改善21%、不良18%と分類されている。" width="1400" height="539" />

その計算過程は以下の記事で述べたが、

- [Web サイトのスピードをもっと感覚的に想像する #高速化 - Qiita](https://qiita.com/miyanaga/items/ab9f50bfe72945b48152)

その手法をライブラリに落とし込んだものが、今回公開した NPM パッケージである。

- [web-vitals-distribution - npm](https://www.npmjs.com/package/web-vitals-distribution)

## 応用例

このライブラリを用いると、以下のいずれかの情報があれば簡単に対数正規分布モデルを作成できる。

- Web Vitals の種類と「良好な割合」「不良な割合」
- 実際に計測した値の平均値と中央値

そして次のような計算ができる。

- PDF(確率密度関数)の描画。実際に計測した値が対数正規分布にどのくらいフィットするか視覚化できる。
- 各種統計量の計算。期待値(平均)、中央値、最頻値、任意のパーセンタイル値など。
- CDF(累積分布関数)の計算。PageSpeed Insights で計測した値は何パーセンタイルに相当するかなど。

サイトスピードのばらつきをより具体的に理解するため、有用なライブラリにしたいと願っている。
